"""HTTP client for DevUtils SDK"""

from typing import Optional, Dict, Any, TypeVar, Generic
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry as UrllibRetry

from .error_handler import DevUtilsError

T = TypeVar("T")


class HttpClientConfig:
    """Configuration for HTTP client"""

    def __init__(
        self,
        base_url: str = "https://api.devutils.in",
        timeout: int = 30,
        max_retries: int = 3,
        api_key: Optional[str] = None,
    ):
        self.base_url = base_url
        self.timeout = timeout
        self.max_retries = max_retries
        self.api_key = api_key


class HttpResponse(Generic[T]):
    """HTTP response wrapper"""

    def __init__(self, status_code: int, data: T, headers: Dict[str, str]):
        self.status_code = status_code
        self.data = data
        self.headers = headers

    def is_success(self) -> bool:
        """Check if response is successful"""
        return 200 <= self.status_code < 300

    def is_error(self) -> bool:
        """Check if response is an error"""
        return self.status_code >= 400


class HttpClient:
    """HTTP client for making API requests"""

    def __init__(self, config: Optional[HttpClientConfig] = None):
        """
        Initialize HTTP client

        Args:
            config: HTTP client configuration
        """
        self.config = config or HttpClientConfig()
        self.session = requests.Session()

        # Configure retry strategy
        retry_strategy = UrllibRetry(
            total=self.config.max_retries,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["HEAD", "GET", "OPTIONS", "POST", "PUT", "DELETE"],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

    def _get_headers(self, custom_headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        """Build request headers"""
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "devutils-sdk-python/1.0.0",
        }

        if self.config.api_key:
            headers["Authorization"] = f"Bearer {self.config.api_key}"

        if custom_headers:
            headers.update(custom_headers)

        return headers

    def request(
        self,
        method: str,
        path: str,
        data: Optional[Dict[str, Any]] = None,
        options: Optional[Dict[str, Any]] = None,
    ) -> HttpResponse:
        """
        Make HTTP request

        Args:
            method: HTTP method (GET, POST, PUT, DELETE, PATCH)
            path: API path
            data: Request body data
            options: Additional options (headers, timeout, etc.)

        Returns:
            HttpResponse with status code and data

        Raises:
            DevUtilsError: If request fails
        """
        options = options or {}
        url = f"{self.config.base_url}{path}"
        headers = self._get_headers(options.get("headers"))
        timeout = options.get("timeout", self.config.timeout)

        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, timeout=timeout)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, timeout=timeout)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=headers, timeout=timeout)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers, timeout=timeout)
            elif method.upper() == "PATCH":
                response = self.session.patch(url, json=data, headers=headers, timeout=timeout)
            else:
                raise DevUtilsError("INVALID_METHOD", f"Unsupported HTTP method: {method}")

            response.raise_for_status()

            try:
                response_data = response.json()
            except ValueError:
                response_data = response.text

            return HttpResponse(response.status_code, response_data, dict(response.headers))

        except requests.exceptions.Timeout:
            raise DevUtilsError("TIMEOUT", "Request timeout")
        except requests.exceptions.ConnectionError as e:
            raise DevUtilsError("CONNECTION_ERROR", str(e))
        except requests.exceptions.HTTPError as e:
            status_code = e.response.status_code
            try:
                error_data = e.response.json()
                message = error_data.get("message", str(e))
            except ValueError:
                message = str(e)

            raise DevUtilsError(
                "HTTP_ERROR",
                message,
                status_code=status_code,
                original_error=e,
            )
        except Exception as e:
            raise DevUtilsError("REQUEST_FAILED", str(e), original_error=e)

    def get(
        self, path: str, options: Optional[Dict[str, Any]] = None
    ) -> HttpResponse:
        """Make GET request"""
        return self.request("GET", path, options=options)

    def post(
        self,
        path: str,
        data: Optional[Dict[str, Any]] = None,
        options: Optional[Dict[str, Any]] = None,
    ) -> HttpResponse:
        """Make POST request"""
        return self.request("POST", path, data=data, options=options)

    def put(
        self,
        path: str,
        data: Optional[Dict[str, Any]] = None,
        options: Optional[Dict[str, Any]] = None,
    ) -> HttpResponse:
        """Make PUT request"""
        return self.request("PUT", path, data=data, options=options)

    def delete(
        self, path: str, options: Optional[Dict[str, Any]] = None
    ) -> HttpResponse:
        """Make DELETE request"""
        return self.request("DELETE", path, options=options)

    def patch(
        self,
        path: str,
        data: Optional[Dict[str, Any]] = None,
        options: Optional[Dict[str, Any]] = None,
    ) -> HttpResponse:
        """Make PATCH request"""
        return self.request("PATCH", path, data=data, options=options)

    def close(self):
        """Close the session"""
        self.session.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

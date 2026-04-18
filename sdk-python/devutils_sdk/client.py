"""Main DevUtils SDK client"""

from typing import Optional
from .core.http_client import HttpClient, HttpClientConfig
from .core.job_resolver import JobResolver
from .types import (
    ScreenshotOptions,
    ScreenshotResult,
    PDFOptions,
    PDFResult,
    ReaderOptions,
    ReaderResult,
)


class DevUtilsSDK:
    """Main SDK client for DevUtils API"""

    def __init__(self, api_key: str, config: Optional[HttpClientConfig] = None):
        """
        Initialize DevUtils SDK

        Args:
            api_key: API key for authentication
            config: Optional HTTP client configuration
        """
        if not api_key:
            raise ValueError("API key is required")

        self.api_key = api_key
        self.config = config or HttpClientConfig(api_key=api_key)
        self.http_client = HttpClient(self.config)
        self.job_resolver = JobResolver()

    async def screenshot(
        self, options: ScreenshotOptions
    ) -> ScreenshotResult:
        """
        Take a screenshot

        Args:
            options: Screenshot options

        Returns:
            ScreenshotResult with job ID and status
        """
        payload = {
            "url": options.url,
            "format": options.format,
            "width": options.width,
            "height": options.height,
            "full_page": options.full_page,
            "wait_until": options.wait_until,
            "timeout": options.timeout,
        }

        if options.device:
            payload["device"] = options.device
        if options.user_agent:
            payload["user_agent"] = options.user_agent
        if options.cookies:
            payload["cookies"] = options.cookies
        if options.headers:
            payload["headers"] = options.headers

        response = await self.http_client.post("/screenshot", data=payload)

        return ScreenshotResult(
            job_id=response.data.get("job_id"),
            status=response.data.get("status"),
            image_url=response.data.get("image_url"),
            format=response.data.get("format", "png"),
            width=response.data.get("width", 1280),
            height=response.data.get("height", 720),
            created_at=response.data.get("created_at", ""),
            expires_at=response.data.get("expires_at"),
        )

    async def pdf(self, options: PDFOptions) -> PDFResult:
        """
        Generate a PDF

        Args:
            options: PDF options

        Returns:
            PDFResult with job ID and status
        """
        payload = {
            "url": options.url,
            "format": options.format,
            "margin_top": options.margin_top,
            "margin_right": options.margin_right,
            "margin_bottom": options.margin_bottom,
            "margin_left": options.margin_left,
            "print_background": options.print_background,
            "landscape": options.landscape,
            "timeout": options.timeout,
        }

        response = await self.http_client.post("/pdf", data=payload)

        return PDFResult(
            job_id=response.data.get("job_id"),
            status=response.data.get("status"),
            pdf_url=response.data.get("pdf_url"),
            created_at=response.data.get("created_at", ""),
            expires_at=response.data.get("expires_at"),
        )

    async def reader(self, url: str, options: Optional[ReaderOptions] = None) -> ReaderResult:
        """
        Read and parse content from URL

        Args:
            url: URL to read
            options: Optional reader options

        Returns:
            ReaderResult with parsed content
        """
        options = options or ReaderOptions(url=url)

        payload = {
            "url": url,
            "timeout": options.timeout,
        }

        response = await self.http_client.post("/reader", data=payload)

        return ReaderResult(
            title=response.data.get("title", ""),
            content=response.data.get("content", ""),
            author=response.data.get("author"),
            published_date=response.data.get("published_date"),
            image=response.data.get("image"),
            language=response.data.get("language"),
        )

    async def get_screenshot_status(self, job_id: str) -> dict:
        """Get screenshot job status"""
        response = await self.http_client.get(f"/screenshot/{job_id}")
        return response.data

    async def get_pdf_status(self, job_id: str) -> dict:
        """Get PDF job status"""
        response = await self.http_client.get(f"/pdf/{job_id}")
        return response.data

    def close(self):
        """Close the SDK client"""
        self.http_client.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

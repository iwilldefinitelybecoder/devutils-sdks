"""Error handling for DevUtils SDK"""

from typing import Optional, Any


class DevUtilsError(Exception):
    """Base exception for DevUtils SDK errors"""

    def __init__(
        self,
        code: str,
        message: str,
        status_code: Optional[int] = None,
        original_error: Optional[Exception] = None,
    ):
        """
        Initialize DevUtilsError

        Args:
            code: Error code (e.g., 'INVALID_API_KEY', 'RATE_LIMITED')
            message: Human-readable error message
            status_code: HTTP status code if applicable
            original_error: Original exception if wrapped
        """
        self.code = code
        self.message = message
        self.status_code = status_code or 500
        self.original_error = original_error
        super().__init__(f"[{code}] {message}")

    def is_code(self, code: str) -> bool:
        """Check if error matches a specific code"""
        return self.code == code

    def is_status(self, status_code: int) -> bool:
        """Check if error matches a specific HTTP status code"""
        return self.status_code == status_code

    def is_retryable(self) -> bool:
        """Check if error is retryable"""
        retryable_codes = {
            "TIMEOUT",
            "RATE_LIMITED",
            "SERVICE_UNAVAILABLE",
            "TEMPORARY_ERROR",
        }
        retryable_statuses = {408, 429, 500, 502, 503, 504}

        return self.code in retryable_codes or self.status_code in retryable_statuses

    def to_dict(self) -> dict:
        """Convert error to dictionary"""
        return {
            "code": self.code,
            "message": self.message,
            "status_code": self.status_code,
            "original_error": str(self.original_error) if self.original_error else None,
        }

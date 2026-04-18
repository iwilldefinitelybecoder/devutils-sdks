"""DevUtils SDK - Production-grade SDK for DevUtils API"""

from .client import DevUtilsSDK
from .core.error_handler import DevUtilsError
from .core.http_client import HttpClient, HttpClientConfig, HttpResponse
from .core.retry_engine import RetryConfig, retry, retry_with_predicate
from .types import (
    ScreenshotOptions,
    ScreenshotResult,
    PDFOptions,
    PDFResult,
    ReaderOptions,
    ReaderResult,
    WebhookEvent,
    WebhookListener,
    ConnectorConfig,
    FileUploadOptions,
    FileUploadResult,
)

__version__ = "1.0.0"
__author__ = "DevUtils"
__license__ = "MIT"

__all__ = [
    "DevUtilsSDK",
    "DevUtilsError",
    "HttpClient",
    "HttpClientConfig",
    "HttpResponse",
    "RetryConfig",
    "retry",
    "retry_with_predicate",
    "ScreenshotOptions",
    "ScreenshotResult",
    "PDFOptions",
    "PDFResult",
    "ReaderOptions",
    "ReaderResult",
    "WebhookEvent",
    "WebhookListener",
    "ConnectorConfig",
    "FileUploadOptions",
    "FileUploadResult",
]

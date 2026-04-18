"""Type definitions for DevUtils SDK"""

from typing import Optional, Dict, Any, List
from dataclasses import dataclass


@dataclass
class ScreenshotOptions:
    """Options for screenshot API"""

    url: str
    format: str = "png"
    width: int = 1280
    height: int = 720
    full_page: bool = False
    wait_until: str = "networkidle"
    timeout: int = 30000
    device: Optional[str] = None
    user_agent: Optional[str] = None
    cookies: Optional[List[Dict[str, Any]]] = None
    headers: Optional[Dict[str, str]] = None


@dataclass
class ScreenshotResult:
    """Result from screenshot API"""

    job_id: str
    status: str
    image_url: Optional[str] = None
    format: str = "png"
    width: int = 1280
    height: int = 720
    created_at: str = ""
    expires_at: Optional[str] = None


@dataclass
class PDFOptions:
    """Options for PDF API"""

    url: str
    format: str = "A4"
    margin_top: str = "1cm"
    margin_right: str = "1cm"
    margin_bottom: str = "1cm"
    margin_left: str = "1cm"
    print_background: bool = True
    landscape: bool = False
    timeout: int = 30000


@dataclass
class PDFResult:
    """Result from PDF API"""

    job_id: str
    status: str
    pdf_url: Optional[str] = None
    created_at: str = ""
    expires_at: Optional[str] = None


@dataclass
class ReaderOptions:
    """Options for reader API"""

    url: str
    timeout: int = 30000


@dataclass
class ReaderResult:
    """Result from reader API"""

    title: str
    content: str
    author: Optional[str] = None
    published_date: Optional[str] = None
    image: Optional[str] = None
    language: Optional[str] = None


@dataclass
class WebhookEvent:
    """Webhook event data"""

    id: str
    type: str
    timestamp: str
    data: Dict[str, Any]


@dataclass
class WebhookListener:
    """Webhook listener configuration"""

    url: str
    events: List[str]
    active: bool = True
    secret: Optional[str] = None


@dataclass
class ConnectorConfig:
    """Connector configuration"""

    name: str
    type: str
    config: Dict[str, Any]


@dataclass
class Connector:
    """Connector information"""

    id: str
    name: str
    type: str
    status: str
    created_at: str


@dataclass
class FileUploadOptions:
    """Options for file upload"""

    file_path: str
    content_type: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class FileUploadResult:
    """Result from file upload"""

    file_id: str
    file_name: str
    file_size: int
    content_type: str
    url: str
    created_at: str

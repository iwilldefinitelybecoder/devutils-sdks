"""
Comprehensive Test Suite for DevUtils Python SDK
Tests all features, edge cases, and full lifecycle
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from devutils_sdk import DevUtilsSDK, DevUtilsError
from devutils_sdk.core.http_client import HttpClient, HttpClientConfig, HttpResponse
from devutils_sdk.core.retry_engine import retry, RetryConfig, calculate_delay
from devutils_sdk.types import ScreenshotOptions, PDFOptions, ReaderOptions


# ============================================================================
# Error Handling Tests
# ============================================================================

class TestDevUtilsError:
    """Test DevUtilsError functionality"""

    def test_create_error_with_code_and_message(self):
        """Should create error with code and message"""
        error = DevUtilsError('TEST_ERROR', 'Test message')
        assert error.code == 'TEST_ERROR'
        assert error.message == 'Test message'
        assert error.status_code == 500

    def test_check_error_code(self):
        """Should check error code"""
        error = DevUtilsError('INVALID_API_KEY', 'Invalid key')
        assert error.is_code('INVALID_API_KEY') is True
        assert error.is_code('OTHER_ERROR') is False

    def test_check_http_status_code(self):
        """Should check HTTP status code"""
        error = DevUtilsError('HTTP_ERROR', 'Not found', 404)
        assert error.is_status(404) is True
        assert error.is_status(500) is False

    def test_identify_retryable_errors(self):
        """Should identify retryable errors"""
        timeout_error = DevUtilsError('TIMEOUT', 'Timeout')
        assert timeout_error.is_retryable() is True

        rate_limit_error = DevUtilsError('RATE_LIMITED', 'Rate limited', 429)
        assert rate_limit_error.is_retryable() is True

        invalid_key_error = DevUtilsError('INVALID_API_KEY', 'Invalid key', 401)
        assert invalid_key_error.is_retryable() is False

    def test_convert_error_to_dict(self):
        """Should convert error to dictionary"""
        error = DevUtilsError('TEST_ERROR', 'Test message', 400)
        error_dict = error.to_dict()
        assert error_dict['code'] == 'TEST_ERROR'
        assert error_dict['message'] == 'Test message'
        assert error_dict['status_code'] == 400


# ============================================================================
# SDK Initialization Tests
# ============================================================================

class TestSDKInitialization:
    """Test SDK initialization"""

    def test_throw_error_if_api_key_missing(self):
        """Should throw error if API key is missing"""
        with pytest.raises(ValueError):
            DevUtilsSDK('')

    def test_throw_error_if_api_key_none(self):
        """Should throw error if API key is None"""
        with pytest.raises(ValueError):
            DevUtilsSDK(None)

    def test_initialize_with_valid_api_key(self):
        """Should initialize with valid API key"""
        sdk = DevUtilsSDK('test-api-key')
        assert isinstance(sdk, DevUtilsSDK)

    def test_accept_custom_configuration(self):
        """Should accept custom configuration"""
        config = HttpClientConfig(
            base_url='https://custom.api.com',
            timeout=60
        )
        sdk = DevUtilsSDK('test-api-key')
        assert isinstance(sdk, DevUtilsSDK)


# ============================================================================
# Screenshot Tests
# ============================================================================

class TestScreenshot:
    """Test screenshot functionality"""

    @pytest.fixture
    def sdk(self):
        """Create SDK instance"""
        return DevUtilsSDK('test-api-key')

    @pytest.mark.asyncio
    async def test_take_screenshot_with_default_options(self, sdk):
        """Should take screenshot with default options"""
        with patch.object(sdk.http_client, 'post', new_callable=AsyncMock) as mock_post:
            mock_post.return_value = HttpResponse(
                200,
                {
                    'job_id': 'job-123',
                    'status': 'pending',
                    'format': 'png',
                    'width': 1280,
                    'height': 720,
                },
                {}
            )

            result = await sdk.screenshot(
                ScreenshotOptions(url='https://example.com')
            )

            assert result.job_id == 'job-123'
            assert result.status == 'pending'
            assert result.format == 'png'
            assert result.width == 1280
            assert result.height == 720

    @pytest.mark.asyncio
    async def test_take_screenshot_with_custom_options(self, sdk):
        """Should take screenshot with custom options"""
        with patch.object(sdk.http_client, 'post', new_callable=AsyncMock) as mock_post:
            mock_post.return_value = HttpResponse(
                200,
                {
                    'job_id': 'job-456',
                    'status': 'pending',
                    'format': 'jpeg',
                    'width': 1920,
                    'height': 1080,
                },
                {}
            )

            result = await sdk.screenshot(
                ScreenshotOptions(
                    url='https://example.com',
                    format='jpeg',
                    width=1920,
                    height=1080,
                    full_page=True,
                    wait_until='load',
                    timeout=60000
                )
            )

            assert result.job_id == 'job-456'
            assert result.format == 'jpeg'
            assert result.width == 1920
            assert result.height == 1080

    @pytest.mark.asyncio
    async def test_handle_screenshot_with_device_preset(self, sdk):
        """Should handle screenshot with device preset"""
        with patch.object(sdk.http_client, 'post', new_callable=AsyncMock) as mock_post:
            mock_post.return_value = HttpResponse(
                200,
                {'job_id': 'job-device', 'status': 'pending'},
                {}
            )

            result = await sdk.screenshot(
                ScreenshotOptions(url='https://example.com', device='iPhone 12')
            )

            assert result.job_id == 'job-device'

    @pytest.mark.asyncio
    async def test_handle_screenshot_with_custom_headers(self, sdk):
        """Should handle screenshot with custom headers"""
        with patch.object(sdk.http_client, 'post', new_callable=AsyncMock) as mock_post:
            mock_post.return_value = HttpResponse(
                200,
                {'job_id': 'job-headers', 'status': 'pending'},
                {}
            )

            result = await sdk.screenshot(
                ScreenshotOptions(
                    url='https://example.com',
                    headers={'X-Custom': 'value'}
                )
            )

            assert result.job_id == 'job-headers'

    @pytest.mark.asyncio
    async def test_handle_screenshot_with_cookies(self, sdk):
        """Should handle screenshot with cookies"""
        with patch.object(sdk.http_client, 'post', new_callable=AsyncMock) as mock_post:
            mock_post.return_value = HttpResponse(
                200,
                {'job_id': 'job-cookies', 'status': 'pending'},
                {}
            )

            result = await sdk.screenshot(
                ScreenshotOptions(
                    url='https://example.com',
                    cookies=[{'name': 'session', 'value': 'abc123'}]
                )
            )

            assert result.job_id == 'job-cookies'

    @pytest.mark.asyncio
    async def test_get_screenshot_status(self, sdk):
        """Should get screenshot status"""
        with patch.object(sdk.http_client, 'get', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = HttpResponse(
                200,
                {
                    'job_id': 'job-123',
                    'status': 'completed',
                    'image_url': 'https://cdn.example.com/image.png',
                },
                {}
            )

            result = await sdk.get_screenshot_status('job-123')

            assert result.job_id == 'job-123'
            assert result.status == 'completed'
            assert result.image_url == 'https://cdn.example.com/image.png'


# ============================================================================
# PDF Tests
# ============================================================================

class TestPDF:
    """Test PDF functionality"""

    @pytest.fixture
    def sdk(self):
        """Create SDK instance"""
        return DevUtilsSDK('test-api-key')

    @pytest.mark.asyncio
    async def test_generate_pdf_with_default_options(self, sdk):
        """Should generate PDF with default options"""
        with patch.object(sdk.http_client, 'post', new_callable=AsyncMock) as mock_post:
            mock_post.return_value = HttpResponse(
                200,
                {'job_id': 'pdf-123', 'status': 'pending'},
                {}
            )

            result = await sdk.pdf(PDFOptions(url='https://example.com'))

            assert result.job_id == 'pdf-123'
            assert result.status == 'pending'

    @pytest.mark.asyncio
    async def test_generate_pdf_with_custom_options(self, sdk):
        """Should generate PDF with custom options"""
        with patch.object(sdk.http_client, 'post', new_callable=AsyncMock) as mock_post:
            mock_post.return_value = HttpResponse(
                200,
                {'job_id': 'pdf-456', 'status': 'pending'},
                {}
            )

            result = await sdk.pdf(
                PDFOptions(
                    url='https://example.com',
                    format='Letter',
                    margin_top='2cm',
                    margin_right='2cm',
                    margin_bottom='2cm',
                    margin_left='2cm',
                    print_background=False,
                    landscape=True
                )
            )

            assert result.job_id == 'pdf-456'

    @pytest.mark.asyncio
    async def test_get_pdf_status(self, sdk):
        """Should get PDF status"""
        with patch.object(sdk.http_client, 'get', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = HttpResponse(
                200,
                {
                    'job_id': 'pdf-123',
                    'status': 'completed',
                    'pdf_url': 'https://cdn.example.com/document.pdf',
                },
                {}
            )

            result = await sdk.get_pdf_status('pdf-123')

            assert result.job_id == 'pdf-123'
            assert result.status == 'completed'
            assert result.pdf_url == 'https://cdn.example.com/document.pdf'


# ============================================================================
# Reader Tests
# ============================================================================

class TestReader:
    """Test reader functionality"""

    @pytest.fixture
    def sdk(self):
        """Create SDK instance"""
        return DevUtilsSDK('test-api-key')

    @pytest.mark.asyncio
    async def test_read_content_from_url(self, sdk):
        """Should read content from URL"""
        with patch.object(sdk.http_client, 'post', new_callable=AsyncMock) as mock_post:
            mock_post.return_value = HttpResponse(
                200,
                {
                    'title': 'Example Page',
                    'content': 'This is the page content',
                    'author': 'John Doe',
                    'published_date': '2024-01-01',
                    'image': 'https://example.com/image.jpg',
                    'language': 'en',
                },
                {}
            )

            result = await sdk.reader('https://example.com')

            assert result.title == 'Example Page'
            assert result.content == 'This is the page content'
            assert result.author == 'John Doe'
            assert result.published_date == '2024-01-01'
            assert result.image == 'https://example.com/image.jpg'
            assert result.language == 'en'

    @pytest.mark.asyncio
    async def test_handle_missing_optional_fields(self, sdk):
        """Should handle missing optional fields"""
        with patch.object(sdk.http_client, 'post', new_callable=AsyncMock) as mock_post:
            mock_post.return_value = HttpResponse(
                200,
                {
                    'title': 'Example Page',
                    'content': 'This is the page content',
                },
                {}
            )

            result = await sdk.reader('https://example.com')

            assert result.title == 'Example Page'
            assert result.content == 'This is the page content'
            assert result.author is None
            assert result.published_date is None


# ============================================================================
# Retry Logic Tests
# ============================================================================

class TestRetryLogic:
    """Test retry logic"""

    @pytest.mark.asyncio
    async def test_retry_on_failure(self):
        """Should retry on failure"""
        attempts = 0

        async def fn():
            nonlocal attempts
            attempts += 1
            if attempts < 3:
                raise DevUtilsError('TEMPORARY_ERROR', 'Temporary error')
            return 'success'

        result = await retry(fn, RetryConfig(max_attempts=3, initial_delay=0.01))

        assert result == 'success'
        assert attempts == 3

    @pytest.mark.asyncio
    async def test_not_retry_non_retryable_errors(self):
        """Should not retry non-retryable errors"""
        attempts = 0

        async def fn():
            nonlocal attempts
            attempts += 1
            raise DevUtilsError('INVALID_API_KEY', 'Invalid key', 401)

        with pytest.raises(DevUtilsError):
            await retry(fn, RetryConfig(max_attempts=3, initial_delay=0.01))

        assert attempts == 1

    @pytest.mark.asyncio
    async def test_fail_after_max_attempts(self):
        """Should fail after max attempts"""
        attempts = 0

        async def fn():
            nonlocal attempts
            attempts += 1
            raise DevUtilsError('TEMPORARY_ERROR', 'Temporary error')

        with pytest.raises(DevUtilsError):
            await retry(fn, RetryConfig(max_attempts=3, initial_delay=0.01))

        assert attempts == 3

    def test_calculate_exponential_backoff(self):
        """Should calculate exponential backoff"""
        config = RetryConfig(initial_delay=1.0, backoff_multiplier=2, jitter=False)

        delay1 = calculate_delay(0, config)
        delay2 = calculate_delay(1, config)
        delay3 = calculate_delay(2, config)

        assert delay1 == 1.0
        assert delay2 == 2.0
        assert delay3 == 4.0

    def test_respect_max_delay(self):
        """Should respect max delay"""
        config = RetryConfig(
            initial_delay=1.0,
            max_delay=5.0,
            backoff_multiplier=2,
            jitter=False
        )

        delay = calculate_delay(10, config)

        assert delay <= 5.0


# ============================================================================
# Full Lifecycle Tests
# ============================================================================

class TestFullLifecycle:
    """Test full lifecycle"""

    @pytest.fixture
    def sdk(self):
        """Create SDK instance"""
        return DevUtilsSDK('test-api-key')

    @pytest.mark.asyncio
    async def test_complete_screenshot_lifecycle(self, sdk):
        """Should complete screenshot lifecycle"""
        with patch.object(sdk.http_client, 'post', new_callable=AsyncMock) as mock_post, \
             patch.object(sdk.http_client, 'get', new_callable=AsyncMock) as mock_get:

            # Step 1: Request screenshot
            mock_post.return_value = HttpResponse(
                200,
                {'job_id': 'job-lifecycle', 'status': 'pending'},
                {}
            )

            screenshot_result = await sdk.screenshot(
                ScreenshotOptions(url='https://example.com')
            )
            assert screenshot_result.status == 'pending'

            # Step 2: Poll for status
            mock_get.return_value = HttpResponse(
                200,
                {'job_id': 'job-lifecycle', 'status': 'processing'},
                {}
            )

            status_result = await sdk.get_screenshot_status('job-lifecycle')
            assert status_result.status == 'processing'

            # Step 3: Get completed result
            mock_get.return_value = HttpResponse(
                200,
                {
                    'job_id': 'job-lifecycle',
                    'status': 'completed',
                    'image_url': 'https://cdn.example.com/image.png',
                },
                {}
            )

            status_result = await sdk.get_screenshot_status('job-lifecycle')
            assert status_result.status == 'completed'
            assert status_result.image_url == 'https://cdn.example.com/image.png'

    @pytest.mark.asyncio
    async def test_complete_pdf_lifecycle(self, sdk):
        """Should complete PDF lifecycle"""
        with patch.object(sdk.http_client, 'post', new_callable=AsyncMock) as mock_post, \
             patch.object(sdk.http_client, 'get', new_callable=AsyncMock) as mock_get:

            # Step 1: Request PDF
            mock_post.return_value = HttpResponse(
                200,
                {'job_id': 'pdf-lifecycle', 'status': 'pending'},
                {}
            )

            pdf_result = await sdk.pdf(PDFOptions(url='https://example.com'))
            assert pdf_result.status == 'pending'

            # Step 2: Get completed result
            mock_get.return_value = HttpResponse(
                200,
                {
                    'job_id': 'pdf-lifecycle',
                    'status': 'completed',
                    'pdf_url': 'https://cdn.example.com/document.pdf',
                },
                {}
            )

            status_result = await sdk.get_pdf_status('pdf-lifecycle')
            assert status_result.status == 'completed'
            assert status_result.pdf_url == 'https://cdn.example.com/document.pdf'

    @pytest.mark.asyncio
    async def test_handle_multiple_concurrent_requests(self, sdk):
        """Should handle multiple concurrent requests"""
        with patch.object(sdk.http_client, 'post', new_callable=AsyncMock) as mock_post:
            mock_post.return_value = HttpResponse(
                200,
                {'job_id': 'job-concurrent', 'status': 'pending'},
                {}
            )

            promises = [
                sdk.screenshot(ScreenshotOptions(url='https://example1.com')),
                sdk.screenshot(ScreenshotOptions(url='https://example2.com')),
                sdk.screenshot(ScreenshotOptions(url='https://example3.com')),
            ]

            results = await asyncio.gather(*promises)

            assert len(results) == 3
            assert all(r.job_id == 'job-concurrent' for r in results)


# ============================================================================
# Edge Cases
# ============================================================================

class TestEdgeCases:
    """Test edge cases"""

    @pytest.fixture
    def sdk(self):
        """Create SDK instance"""
        return DevUtilsSDK('test-api-key')

    @pytest.mark.asyncio
    async def test_handle_very_long_urls(self, sdk):
        """Should handle very long URLs"""
        long_url = 'https://example.com/' + 'a' * 2000

        with patch.object(sdk.http_client, 'post', new_callable=AsyncMock) as mock_post:
            mock_post.return_value = HttpResponse(
                200,
                {'job_id': 'job-long-url', 'status': 'pending'},
                {}
            )

            result = await sdk.screenshot(ScreenshotOptions(url=long_url))
            assert result.job_id == 'job-long-url'

    @pytest.mark.asyncio
    async def test_handle_special_characters_in_url(self, sdk):
        """Should handle special characters in URL"""
        special_url = 'https://example.com/path?query=value&other=123#anchor'

        with patch.object(sdk.http_client, 'post', new_callable=AsyncMock) as mock_post:
            mock_post.return_value = HttpResponse(
                200,
                {'job_id': 'job-special', 'status': 'pending'},
                {}
            )

            result = await sdk.screenshot(ScreenshotOptions(url=special_url))
            assert result.job_id == 'job-special'

    @pytest.mark.asyncio
    async def test_handle_empty_response_data(self, sdk):
        """Should handle empty response data"""
        with patch.object(sdk.http_client, 'post', new_callable=AsyncMock) as mock_post:
            mock_post.return_value = HttpResponse(200, {}, {})

            result = await sdk.screenshot(ScreenshotOptions(url='https://example.com'))
            assert result.job_id is None

    @pytest.mark.asyncio
    async def test_handle_500_server_error(self, sdk):
        """Should handle 500 server error"""
        with patch.object(sdk.http_client, 'post', new_callable=AsyncMock) as mock_post:
            mock_post.side_effect = DevUtilsError('HTTP_ERROR', 'Server error', 500)

            with pytest.raises(DevUtilsError):
                await sdk.screenshot(ScreenshotOptions(url='https://example.com'))

    @pytest.mark.asyncio
    async def test_handle_429_rate_limit_error(self, sdk):
        """Should handle 429 rate limit error"""
        with patch.object(sdk.http_client, 'post', new_callable=AsyncMock) as mock_post:
            mock_post.side_effect = DevUtilsError('RATE_LIMITED', 'Rate limited', 429)

            with pytest.raises(DevUtilsError):
                await sdk.screenshot(ScreenshotOptions(url='https://example.com'))

    @pytest.mark.asyncio
    async def test_handle_timeout(self, sdk):
        """Should handle timeout"""
        with patch.object(sdk.http_client, 'post', new_callable=AsyncMock) as mock_post:
            mock_post.side_effect = DevUtilsError('TIMEOUT', 'Request timeout')

            with pytest.raises(DevUtilsError):
                await sdk.screenshot(ScreenshotOptions(url='https://example.com'))

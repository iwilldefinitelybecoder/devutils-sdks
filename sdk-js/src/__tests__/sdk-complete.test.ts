/**
 * Comprehensive Test Suite for DevUtils JavaScript SDK
 * Tests all features, edge cases, and full lifecycle
 */

import { DevUtilsSDK } from "../index";
import { DevUtilsError } from "../core/error-handler";
import { HttpClient } from "../core/http-client";
import { retry, RetryConfig } from "../core/retry-engine";

// ============================================================================
// Mock HTTP Client
// ============================================================================

jest.mock("../core/http-client");

const mockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>;

// ============================================================================
// Error Handling Tests
// ============================================================================

describe("DevUtilsError", () => {
  test("should create error with code and message", () => {
    const error = new DevUtilsError("TEST_ERROR", "Test message");
    expect(error.code).toBe("TEST_ERROR");
    expect(error.message).toBe("Test message");
    expect(error.statusCode).toBe(500);
  });

  test("should check error code", () => {
    const error = new DevUtilsError("INVALID_API_KEY", "Invalid key");
    expect(error.isCode("INVALID_API_KEY")).toBe(true);
    expect(error.isCode("OTHER_ERROR")).toBe(false);
  });

  test("should check HTTP status code", () => {
    const error = new DevUtilsError("HTTP_ERROR", "Not found", 404);
    expect(error.isStatus(404)).toBe(true);
    expect(error.isStatus(500)).toBe(false);
  });

  test("should identify retryable errors", () => {
    const timeoutError = new DevUtilsError("TIMEOUT", "Timeout");
    expect(timeoutError.isRetryable()).toBe(true);

    const rateLimitError = new DevUtilsError("RATE_LIMITED", "Rate limited", 429);
    expect(rateLimitError.isRetryable()).toBe(true);

    const invalidKeyError = new DevUtilsError("INVALID_API_KEY", "Invalid key", 401);
    expect(invalidKeyError.isRetryable()).toBe(false);
  });
});

// ============================================================================
// SDK Initialization Tests
// ============================================================================

describe("DevUtilsSDK Initialization", () => {
  test("should throw error if API key is missing", () => {
    expect(() => new DevUtilsSDK("")).toThrow(DevUtilsError);
    expect(() => new DevUtilsSDK("")).toThrow("API key is required");
  });

  test("should throw error if API key is null", () => {
    expect(() => new DevUtilsSDK(null as any)).toThrow(DevUtilsError);
  });

  test("should initialize with valid API key", () => {
    const sdk = new DevUtilsSDK("test-api-key");
    expect(sdk).toBeInstanceOf(DevUtilsSDK);
  });

  test("should accept custom configuration", () => {
    const sdk = new DevUtilsSDK("test-api-key", {
      baseUrl: "https://custom.api.com",
      timeout: 60,
    });
    expect(sdk).toBeInstanceOf(DevUtilsSDK);
  });
});

// ============================================================================
// Screenshot Tests
// ============================================================================

describe("Screenshot API", () => {
  let sdk: DevUtilsSDK;
  let mockPost: jest.Mock;

  beforeEach(() => {
    mockPost = jest.fn();
    mockHttpClient.prototype.post = mockPost;
    mockHttpClient.prototype.get = jest.fn();
    sdk = new DevUtilsSDK("test-api-key");
  });

  test("should take screenshot with default options", async () => {
    mockPost.mockResolvedValue({
      statusCode: 200,
      data: {
        jobId: "job-123",
        status: "pending",
        format: "png",
        width: 1280,
        height: 720,
      },
    });

    const result = await sdk.screenshot({
      url: "https://example.com",
    });

    expect(result.jobId).toBe("job-123");
    expect(result.status).toBe("pending");
    expect(result.format).toBe("png");
    expect(result.width).toBe(1280);
    expect(result.height).toBe(720);
  });

  test("should take screenshot with custom options", async () => {
    mockPost.mockResolvedValue({
      statusCode: 200,
      data: {
        jobId: "job-456",
        status: "pending",
        format: "jpeg",
        width: 1920,
        height: 1080,
      },
    });

    const result = await sdk.screenshot({
      url: "https://example.com",
      format: "jpeg",
      width: 1920,
      height: 1080,
      fullPage: true,
      waitUntil: "load",
      timeout: 60000,
    });

    expect(result.jobId).toBe("job-456");
    expect(result.format).toBe("jpeg");
    expect(result.width).toBe(1920);
    expect(result.height).toBe(1080);
  });

  test("should handle screenshot with device preset", async () => {
    mockPost.mockResolvedValue({
      statusCode: 200,
      data: {
        jobId: "job-device",
        status: "pending",
      },
    });

    const result = await sdk.screenshot({
      url: "https://example.com",
      device: "iPhone 12",
    });

    expect(result.jobId).toBe("job-device");
  });

  test("should handle screenshot with custom headers", async () => {
    mockPost.mockResolvedValue({
      statusCode: 200,
      data: {
        jobId: "job-headers",
        status: "pending",
      },
    });

    const result = await sdk.screenshot({
      url: "https://example.com",
      headers: { "X-Custom": "value" },
    });

    expect(result.jobId).toBe("job-headers");
  });

  test("should handle screenshot with cookies", async () => {
    mockPost.mockResolvedValue({
      statusCode: 200,
      data: {
        jobId: "job-cookies",
        status: "pending",
      },
    });

    const result = await sdk.screenshot({
      url: "https://example.com",
      cookies: [{ name: "session", value: "abc123" }],
    });

    expect(result.jobId).toBe("job-cookies");
  });

  test("should handle HTTP errors", async () => {
    mockPost.mockRejectedValue(new DevUtilsError("HTTP_ERROR", "Unauthorized", 401));

    await expect(sdk.screenshot({ url: "https://example.com" })).rejects.toThrow(DevUtilsError);
  });

  test("should get screenshot status", async () => {
    const mockGet = jest.fn();
    mockHttpClient.prototype.get = mockGet;
    (mockHttpClient.mock.instances[mockHttpClient.mock.instances.length - 1] as any).get = mockGet;

    mockGet.mockResolvedValue({
      statusCode: 200,
      data: {
        jobId: "job-123",
        status: "completed",
        imageUrl: "https://cdn.example.com/image.png",
      },
    });

    const result = await sdk.getScreenshotStatus("job-123");

    expect(result.jobId).toBe("job-123");
    expect(result.status).toBe("completed");
    expect(result.imageUrl).toBe("https://cdn.example.com/image.png");
  });
});

// ============================================================================
// PDF Tests
// ============================================================================

describe("PDF API", () => {
  let sdk: DevUtilsSDK;
  let mockPost: jest.Mock;

  beforeEach(() => {
    mockPost = jest.fn();
    mockHttpClient.prototype.post = mockPost;
    mockHttpClient.prototype.get = jest.fn();
    sdk = new DevUtilsSDK("test-api-key");
  });

  test("should generate PDF with default options", async () => {
    mockPost.mockResolvedValue({
      statusCode: 200,
      data: {
        jobId: "pdf-123",
        status: "pending",
      },
    });

    const result = await sdk.pdf({ url: "https://example.com" });

    expect(result.jobId).toBe("pdf-123");
    expect(result.status).toBe("pending");
  });

  test("should generate PDF with custom options", async () => {
    mockPost.mockResolvedValue({
      statusCode: 200,
      data: {
        jobId: "pdf-456",
        status: "pending",
      },
    });

    const result = await sdk.pdf({
      url: "https://example.com",
      format: "Letter",
      marginTop: "2cm",
      marginRight: "2cm",
      marginBottom: "2cm",
      marginLeft: "2cm",
      printBackground: false,
      landscape: true,
    });

    expect(result.jobId).toBe("pdf-456");
  });

  test("should get PDF status", async () => {
    const mockGet = jest.fn();
    mockHttpClient.prototype.get = mockGet;
    (mockHttpClient.mock.instances[mockHttpClient.mock.instances.length - 1] as any).get = mockGet;

    mockGet.mockResolvedValue({
      statusCode: 200,
      data: {
        jobId: "pdf-123",
        status: "completed",
        pdfUrl: "https://cdn.example.com/document.pdf",
      },
    });

    const result = await sdk.getPdfStatus("pdf-123");

    expect(result.jobId).toBe("pdf-123");
    expect(result.status).toBe("completed");
    expect(result.pdfUrl).toBe("https://cdn.example.com/document.pdf");
  });
});

// ============================================================================
// Reader Tests
// ============================================================================

describe("Reader API", () => {
  let sdk: DevUtilsSDK;
  let mockPost: jest.Mock;

  beforeEach(() => {
    mockPost = jest.fn();
    mockHttpClient.prototype.post = mockPost;
    sdk = new DevUtilsSDK("test-api-key");
  });

  test("should read content from URL", async () => {
    mockPost.mockResolvedValue({
      statusCode: 200,
      data: {
        title: "Example Page",
        content: "This is the page content",
        author: "John Doe",
        publishedDate: "2024-01-01",
        image: "https://example.com/image.jpg",
        language: "en",
      },
    });

    const result = await sdk.reader("https://example.com");

    expect(result.title).toBe("Example Page");
    expect(result.content).toBe("This is the page content");
    expect(result.author).toBe("John Doe");
    expect(result.publishedDate).toBe("2024-01-01");
    expect(result.image).toBe("https://example.com/image.jpg");
    expect(result.language).toBe("en");
  });

  test("should handle missing optional fields", async () => {
    mockPost.mockResolvedValue({
      statusCode: 200,
      data: {
        title: "Example Page",
        content: "This is the page content",
      },
    });

    const result = await sdk.reader("https://example.com");

    expect(result.title).toBe("Example Page");
    expect(result.content).toBe("This is the page content");
    expect(result.author).toBeUndefined();
    expect(result.publishedDate).toBeUndefined();
  });
});

// ============================================================================
// Full Lifecycle Tests
// ============================================================================

describe("Full Lifecycle", () => {
  let sdk: DevUtilsSDK;
  let mockPost: jest.Mock;
  let mockGet: jest.Mock;

  beforeEach(() => {
    mockPost = jest.fn();
    mockGet = jest.fn();
    mockHttpClient.prototype.post = mockPost;
    mockHttpClient.prototype.get = mockGet;
    sdk = new DevUtilsSDK("test-api-key");
  });

  test("should complete screenshot lifecycle", async () => {
    // Step 1: Request screenshot
    mockPost.mockResolvedValueOnce({
      statusCode: 200,
      data: {
        jobId: "job-lifecycle",
        status: "pending",
      },
    });

    const screenshotResult = await sdk.screenshot({
      url: "https://example.com",
    });
    expect(screenshotResult.status).toBe("pending");

    // Step 2: Poll for status
    mockGet.mockResolvedValueOnce({
      statusCode: 200,
      data: {
        jobId: "job-lifecycle",
        status: "processing",
      },
    });

    let statusResult = await sdk.getScreenshotStatus("job-lifecycle");
    expect(statusResult.status).toBe("processing");

    // Step 3: Get completed result
    mockGet.mockResolvedValueOnce({
      statusCode: 200,
      data: {
        jobId: "job-lifecycle",
        status: "completed",
        imageUrl: "https://cdn.example.com/image.png",
      },
    });

    statusResult = await sdk.getScreenshotStatus("job-lifecycle");
    expect(statusResult.status).toBe("completed");
    expect(statusResult.imageUrl).toBe("https://cdn.example.com/image.png");
  });

  test("should complete PDF lifecycle", async () => {
    // Step 1: Request PDF
    mockPost.mockResolvedValueOnce({
      statusCode: 200,
      data: {
        jobId: "pdf-lifecycle",
        status: "pending",
      },
    });

    const pdfResult = await sdk.pdf({ url: "https://example.com" });
    expect(pdfResult.status).toBe("pending");

    // Step 2: Get completed result
    mockGet.mockResolvedValueOnce({
      statusCode: 200,
      data: {
        jobId: "pdf-lifecycle",
        status: "completed",
        pdfUrl: "https://cdn.example.com/document.pdf",
      },
    });

    const statusResult = await sdk.getPdfStatus("pdf-lifecycle");
    expect(statusResult.status).toBe("completed");
    expect(statusResult.pdfUrl).toBe("https://cdn.example.com/document.pdf");
  });

  test("should handle multiple concurrent requests", async () => {
    mockPost.mockResolvedValue({
      statusCode: 200,
      data: {
        jobId: "job-concurrent",
        status: "pending",
      },
    });

    const promises = [
      sdk.screenshot({ url: "https://example1.com" }),
      sdk.screenshot({ url: "https://example2.com" }),
      sdk.screenshot({ url: "https://example3.com" }),
    ];

    const results = await Promise.all(promises);

    expect(results).toHaveLength(3);
    expect(results.every((r) => r.jobId === "job-concurrent")).toBe(true);
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe("Edge Cases", () => {
  let sdk: DevUtilsSDK;
  let mockPost: jest.Mock;

  beforeEach(() => {
    mockPost = jest.fn();
    mockHttpClient.prototype.post = mockPost;
    mockHttpClient.prototype.get = jest.fn();
    sdk = new DevUtilsSDK("test-api-key");
  });

  test("should handle very long URLs", async () => {
    const longUrl = "https://example.com/" + "a".repeat(2000);

    mockPost.mockResolvedValue({
      statusCode: 200,
      data: { jobId: "job-long-url", status: "pending" },
    });

    const result = await sdk.screenshot({ url: longUrl });
    expect(result.jobId).toBe("job-long-url");
  });

  test("should handle special characters in URL", async () => {
    const specialUrl = "https://example.com/path?query=value&other=123#anchor";

    mockPost.mockResolvedValue({
      statusCode: 200,
      data: { jobId: "job-special", status: "pending" },
    });

    const result = await sdk.screenshot({ url: specialUrl });
    expect(result.jobId).toBe("job-special");
  });

  test("should handle empty response data", async () => {
    mockPost.mockResolvedValue({
      statusCode: 200,
      data: {},
    });

    const result = await sdk.screenshot({ url: "https://example.com" });
    expect(result.jobId).toBeUndefined();
  });

  test("should handle 500 server error", async () => {
    mockPost.mockRejectedValue(new DevUtilsError("HTTP_ERROR", "Server error", 500));

    await expect(sdk.screenshot({ url: "https://example.com" })).rejects.toThrow();
  });

  test("should handle 429 rate limit error", async () => {
    mockPost.mockRejectedValue(new DevUtilsError("RATE_LIMITED", "Rate limited", 429));

    await expect(sdk.screenshot({ url: "https://example.com" })).rejects.toThrow();
  });

  test("should handle timeout", async () => {
    mockPost.mockRejectedValue(new DevUtilsError("TIMEOUT", "TIMEOUT: Request timeout"));

    await expect(sdk.screenshot({ url: "https://example.com" })).rejects.toThrow("TIMEOUT");
  });

  test("should handle malformed response", async () => {
    mockPost.mockResolvedValue({
      statusCode: 200,
      data: null,
    });

    const result = await sdk.screenshot({ url: "https://example.com" });
    expect(result).toBeDefined();
  });
});

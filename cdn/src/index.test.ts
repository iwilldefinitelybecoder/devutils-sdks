/**
 * Comprehensive Test Suite for DevUtils CDN SDK
 * Tests all features, edge cases, and full lifecycle
 */

import {
  DevUtilsSDK,
  DevUtilsError,
  retry,
  sleep,
  calculateDelay,
} from "./index";

// ============================================================================
// Mock Fetch
// ============================================================================

let mockFetchResponse: any = null;
let mockFetchError: Error | null = null;
let fetchCallCount = 0;

const originalFetch = global.fetch;

function mockFetch(url: string, options: any) {
  fetchCallCount++;

  if (mockFetchError) {
    return Promise.reject(mockFetchError);
  }

  return Promise.resolve({
    ok: mockFetchResponse?.ok !== false,
    status: mockFetchResponse?.status || 200,
    statusText: mockFetchResponse?.statusText || "OK",
    headers: new Map(Object.entries(mockFetchResponse?.headers || {})),
    json: () => Promise.resolve(mockFetchResponse?.data || {}),
  });
}

beforeEach(() => {
  (global as any).fetch = mockFetch;
  mockFetchResponse = { ok: true, status: 200, data: {} };
  mockFetchError = null;
  fetchCallCount = 0;
});

afterEach(() => {
  (global as any).fetch = originalFetch;
});

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

    const rateLimitError = new DevUtilsError(
      "RATE_LIMITED",
      "Rate limited",
      429,
    );
    expect(rateLimitError.isRetryable()).toBe(true);

    const invalidKeyError = new DevUtilsError(
      "INVALID_API_KEY",
      "Invalid key",
      401,
    );
    expect(invalidKeyError.isRetryable()).toBe(false);
  });

  test("should convert error to JSON", () => {
    const error = new DevUtilsError("TEST_ERROR", "Test message", 400);
    const json = error.toJSON();
    expect(json.code).toBe("TEST_ERROR");
    expect(json.message).toBe("Test message");
    expect(json.statusCode).toBe(400);
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

  beforeEach(() => {
    sdk = new DevUtilsSDK("test-api-key");
  });

  test("should throw error if URL is missing", async () => {
    await expect(sdk.screenshot({ url: "" })).rejects.toThrow(
      "URL is required",
    );
  });

  test("should take screenshot with default options", async () => {
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: {
        jobId: "job-123",
        status: "pending",
        format: "png",
        width: 1280,
        height: 720,
      },
    };

    const result = await sdk.screenshot({ url: "https://example.com" });

    expect(result.jobId).toBe("job-123");
    expect(result.status).toBe("pending");
    expect(result.format).toBe("png");
    expect(result.width).toBe(1280);
    expect(result.height).toBe(720);
  });

  test("should take screenshot with custom options", async () => {
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: {
        jobId: "job-456",
        status: "pending",
        format: "jpeg",
        width: 1920,
        height: 1080,
      },
    };

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
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: {
        jobId: "job-device",
        status: "pending",
      },
    };

    const result = await sdk.screenshot({
      url: "https://example.com",
      device: "iPhone 12",
    });

    expect(result.jobId).toBe("job-device");
  });

  test("should handle screenshot with custom headers", async () => {
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: {
        jobId: "job-headers",
        status: "pending",
      },
    };

    const result = await sdk.screenshot({
      url: "https://example.com",
      headers: { "X-Custom": "value" },
    });

    expect(result.jobId).toBe("job-headers");
  });

  test("should handle screenshot with cookies", async () => {
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: {
        jobId: "job-cookies",
        status: "pending",
      },
    };

    const result = await sdk.screenshot({
      url: "https://example.com",
      cookies: [{ name: "session", value: "abc123" }],
    });

    expect(result.jobId).toBe("job-cookies");
  });

  test("should handle HTTP errors", async () => {
    mockFetchResponse = {
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      data: { message: "Invalid API key" },
    };

    await expect(
      sdk.screenshot({ url: "https://example.com" }),
    ).rejects.toThrow(DevUtilsError);
  });

  test("should handle network errors", async () => {
    mockFetchError = new TypeError("Network error");

    await expect(
      sdk.screenshot({ url: "https://example.com" }),
    ).rejects.toThrow("CONNECTION_ERROR");
  });

  test("should get screenshot status", async () => {
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: {
        jobId: "job-123",
        status: "completed",
        imageUrl: "https://cdn.example.com/image.png",
      },
    };

    const result = await sdk.getScreenshotStatus("job-123");

    expect(result.jobId).toBe("job-123");
    expect(result.status).toBe("completed");
    expect(result.imageUrl).toBe("https://cdn.example.com/image.png");
  });

  test("should throw error if job ID is missing", async () => {
    await expect(sdk.getScreenshotStatus("")).rejects.toThrow(
      "Job ID is required",
    );
  });
});

// ============================================================================
// PDF Tests
// ============================================================================

describe("PDF API", () => {
  let sdk: DevUtilsSDK;

  beforeEach(() => {
    sdk = new DevUtilsSDK("test-api-key");
  });

  test("should throw error if URL is missing", async () => {
    await expect(sdk.pdf({ url: "" })).rejects.toThrow("URL is required");
  });

  test("should generate PDF with default options", async () => {
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: {
        jobId: "pdf-123",
        status: "pending",
      },
    };

    const result = await sdk.pdf({ url: "https://example.com" });

    expect(result.jobId).toBe("pdf-123");
    expect(result.status).toBe("pending");
  });

  test("should generate PDF with custom options", async () => {
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: {
        jobId: "pdf-456",
        status: "pending",
      },
    };

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
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: {
        jobId: "pdf-123",
        status: "completed",
        pdfUrl: "https://cdn.example.com/document.pdf",
      },
    };

    const result = await sdk.getPdfStatus("pdf-123");

    expect(result.jobId).toBe("pdf-123");
    expect(result.status).toBe("completed");
    expect(result.pdfUrl).toBe("https://cdn.example.com/document.pdf");
  });

  test("should throw error if job ID is missing", async () => {
    await expect(sdk.getPdfStatus("")).rejects.toThrow("Job ID is required");
  });
});

// ============================================================================
// Reader Tests
// ============================================================================

describe("Reader API", () => {
  let sdk: DevUtilsSDK;

  beforeEach(() => {
    sdk = new DevUtilsSDK("test-api-key");
  });

  test("should throw error if URL is missing", async () => {
    await expect(sdk.reader("")).rejects.toThrow("URL is required");
  });

  test("should read content from URL", async () => {
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: {
        title: "Example Page",
        content: "This is the page content",
        author: "John Doe",
        publishedDate: "2024-01-01",
        image: "https://example.com/image.jpg",
        language: "en",
      },
    };

    const result = await sdk.reader("https://example.com");

    expect(result.title).toBe("Example Page");
    expect(result.content).toBe("This is the page content");
    expect(result.author).toBe("John Doe");
    expect(result.publishedDate).toBe("2024-01-01");
    expect(result.image).toBe("https://example.com/image.jpg");
    expect(result.language).toBe("en");
  });

  test("should handle missing optional fields", async () => {
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: {
        title: "Example Page",
        content: "This is the page content",
      },
    };

    const result = await sdk.reader("https://example.com");

    expect(result.title).toBe("Example Page");
    expect(result.content).toBe("This is the page content");
    expect(result.author).toBeUndefined();
    expect(result.publishedDate).toBeUndefined();
  });

  test("should read content with custom timeout", async () => {
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: {
        title: "Example Page",
        content: "Content",
      },
    };

    const result = await sdk.reader("https://example.com", { timeout: 60000 });

    expect(result.title).toBe("Example Page");
  });
});

// ============================================================================
// Retry Logic Tests
// ============================================================================

describe("Retry Logic", () => {
  test("should retry on failure", async () => {
    let attempts = 0;

    const fn = async () => {
      attempts++;
      if (attempts < 3) {
        throw new DevUtilsError("TEMPORARY_ERROR", "Temporary error");
      }
      return "success";
    };

    const result = await retry(fn, { maxAttempts: 3, initialDelay: 10 });

    expect(result).toBe("success");
    expect(attempts).toBe(3);
  });

  test("should not retry non-retryable errors", async () => {
    let attempts = 0;

    const fn = async () => {
      attempts++;
      throw new DevUtilsError("INVALID_API_KEY", "Invalid key", 401);
    };

    await expect(
      retry(fn, { maxAttempts: 3, initialDelay: 10 }),
    ).rejects.toThrow("INVALID_API_KEY");

    expect(attempts).toBe(1);
  });

  test("should fail after max attempts", async () => {
    let attempts = 0;

    const fn = async () => {
      attempts++;
      throw new DevUtilsError("TEMPORARY_ERROR", "Temporary error");
    };

    await expect(
      retry(fn, { maxAttempts: 3, initialDelay: 10 }),
    ).rejects.toThrow();

    expect(attempts).toBe(3);
  });

  test("should calculate exponential backoff", () => {
    const delay1 = calculateDelay(0, {
      initialDelay: 1000,
      backoffMultiplier: 2,
      jitter: false,
    });
    const delay2 = calculateDelay(1, {
      initialDelay: 1000,
      backoffMultiplier: 2,
      jitter: false,
    });
    const delay3 = calculateDelay(2, {
      initialDelay: 1000,
      backoffMultiplier: 2,
      jitter: false,
    });

    expect(delay1).toBe(1000);
    expect(delay2).toBe(2000);
    expect(delay3).toBe(4000);
  });

  test("should respect max delay", () => {
    const delay = calculateDelay(10, {
      initialDelay: 1000,
      maxDelay: 5000,
      backoffMultiplier: 2,
      jitter: false,
    });

    expect(delay).toBeLessThanOrEqual(5000);
  });

  test("should add jitter to delay", () => {
    const delays = [];
    for (let i = 0; i < 10; i++) {
      const delay = calculateDelay(1, {
        initialDelay: 1000,
        backoffMultiplier: 2,
        jitter: true,
      });
      delays.push(delay);
    }

    const unique = new Set(delays);
    expect(unique.size).toBeGreaterThan(1);
  });
});

// ============================================================================
// Sleep Function Tests
// ============================================================================

describe("Sleep Function", () => {
  test("should sleep for specified duration", async () => {
    const start = Date.now();
    await sleep(100);
    const duration = Date.now() - start;

    expect(duration).toBeGreaterThanOrEqual(90);
    expect(duration).toBeLessThan(200);
  });
});

// ============================================================================
// Full Lifecycle Tests
// ============================================================================

describe("Full Lifecycle", () => {
  let sdk: DevUtilsSDK;

  beforeEach(() => {
    sdk = new DevUtilsSDK("test-api-key");
  });

  test("should complete screenshot lifecycle", async () => {
    // Step 1: Request screenshot
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: {
        jobId: "job-lifecycle",
        status: "pending",
      },
    };

    const screenshotResult = await sdk.screenshot({
      url: "https://example.com",
    });
    expect(screenshotResult.status).toBe("pending");

    // Step 2: Poll for status
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: {
        jobId: "job-lifecycle",
        status: "processing",
      },
    };

    let statusResult = await sdk.getScreenshotStatus("job-lifecycle");
    expect(statusResult.status).toBe("processing");

    // Step 3: Get completed result
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: {
        jobId: "job-lifecycle",
        status: "completed",
        imageUrl: "https://cdn.example.com/image.png",
      },
    };

    statusResult = await sdk.getScreenshotStatus("job-lifecycle");
    expect(statusResult.status).toBe("completed");
    expect(statusResult.imageUrl).toBe("https://cdn.example.com/image.png");
  });

  test("should complete PDF lifecycle", async () => {
    // Step 1: Request PDF
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: {
        jobId: "pdf-lifecycle",
        status: "pending",
      },
    };

    const pdfResult = await sdk.pdf({ url: "https://example.com" });
    expect(pdfResult.status).toBe("pending");

    // Step 2: Get completed result
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: {
        jobId: "pdf-lifecycle",
        status: "completed",
        pdfUrl: "https://cdn.example.com/document.pdf",
      },
    };

    const statusResult = await sdk.getPdfStatus("pdf-lifecycle");
    expect(statusResult.status).toBe("completed");
    expect(statusResult.pdfUrl).toBe("https://cdn.example.com/document.pdf");
  });

  test("should handle multiple concurrent requests", async () => {
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: {
        jobId: "job-concurrent",
        status: "pending",
      },
    };

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

  beforeEach(() => {
    sdk = new DevUtilsSDK("test-api-key");
  });

  test("should handle very long URLs", async () => {
    const longUrl = "https://example.com/" + "a".repeat(2000);

    mockFetchResponse = {
      ok: true,
      status: 200,
      data: { jobId: "job-long-url", status: "pending" },
    };

    const result = await sdk.screenshot({ url: longUrl });
    expect(result.jobId).toBe("job-long-url");
  });

  test("should handle special characters in URL", async () => {
    const specialUrl = "https://example.com/path?query=value&other=123#anchor";

    mockFetchResponse = {
      ok: true,
      status: 200,
      data: { jobId: "job-special", status: "pending" },
    };

    const result = await sdk.screenshot({ url: specialUrl });
    expect(result.jobId).toBe("job-special");
  });

  test("should handle empty response data", async () => {
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: {},
    };

    const result = await sdk.screenshot({ url: "https://example.com" });
    expect(result.jobId).toBeUndefined();
  });

  test("should handle 500 server error", async () => {
    mockFetchResponse = {
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      data: { message: "Server error" },
    };

    await expect(
      sdk.screenshot({ url: "https://example.com" }),
    ).rejects.toThrow();
  });

  test("should handle 429 rate limit error", async () => {
    mockFetchResponse = {
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      data: { message: "Rate limited" },
    };

    await expect(
      sdk.screenshot({ url: "https://example.com" }),
    ).rejects.toThrow();
  });

  test("should handle timeout", async () => {
    mockFetchError = new Error("AbortError");
    (mockFetchError as any).name = "AbortError";

    await expect(
      sdk.screenshot({ url: "https://example.com" }),
    ).rejects.toThrow("TIMEOUT");
  });

  test("should handle malformed JSON response", async () => {
    mockFetchResponse = {
      ok: true,
      status: 200,
      data: null,
    };

    const result = await sdk.screenshot({ url: "https://example.com" });
    expect(result).toBeDefined();
  });
});

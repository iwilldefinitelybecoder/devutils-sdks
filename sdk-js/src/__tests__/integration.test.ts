import DevUtilsSDK from "../index";

/**
 * Integration tests for DevUtilsSDK
 *
 * These tests verify the SDK works end-to-end
 * Run with: npm test -- integration.test.ts
 *
 * Note: These tests mock the HTTP client to avoid real API calls
 * For real API tests, use a test API key and run against test environment
 */

// Mock fetch globally
global.fetch = jest.fn();

describe("DevUtilsSDK Integration", () => {
  let devutils: DevUtilsSDK;

  beforeEach(() => {
    devutils = new DevUtilsSDK("test-api-key");
    (global.fetch as jest.Mock).mockReset();
  });

  describe("initialization", () => {
    it("should create SDK instance with API key", () => {
      expect(devutils).toBeInstanceOf(DevUtilsSDK);
    });

    it("should create SDK instance with custom config", () => {
      const customDevutils = new DevUtilsSDK("test-api-key", {
        baseUrl: "https://custom.api.com",
        timeout: 60000,
      });
      expect(customDevutils).toBeInstanceOf(DevUtilsSDK);
    });
  });

  describe("screenshot", () => {
    it("should take screenshot and return URL", async () => {
      // Mock the API responses
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            jobId: "job-123",
            status: "PENDING",
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: "COMPLETED",
            signedUrl: "https://cdn.devutils.in/screenshot.png",
          }),
        });

      const result = await devutils.screenshot("https://example.com");

      expect(result).toHaveProperty("url");
      expect(result.url).toContain("cdn.devutils.in");
    });
  });

  describe("pdf", () => {
    it("should generate PDF from URL", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            jobId: "job-456",
            status: "PENDING",
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: "COMPLETED",
            signedUrl: "https://cdn.devutils.in/document.pdf",
          }),
        });

      const result = await devutils.pdf("https://example.com");

      expect(result).toHaveProperty("url");
      expect(result.url).toContain("cdn.devutils.in");
    });

    it("should generate PDF from HTML", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            jobId: "job-789",
            status: "PENDING",
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: "COMPLETED",
            signedUrl: "https://cdn.devutils.in/document.pdf",
          }),
        });

      const result = await devutils.pdf({ html: "<h1>Hello</h1>" });

      expect(result).toHaveProperty("url");
    });
  });

  describe("reader", () => {
    it("should extract content from URL", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            markdown: "# Title\n\nContent here...",
            text: "Title\n\nContent here...",
            metadata: {
              title: "Page Title",
              description: "Page description",
            },
            stats: {
              wordCount: 250,
              linkCount: 5,
              imageCount: 3,
            },
          },
        }),
      });

      const result = await devutils.reader("https://example.com");

      expect(result).toHaveProperty("markdown");
      expect(result).toHaveProperty("text");
      expect(result).toHaveProperty("metadata");
      expect(result).toHaveProperty("stats");
    });
  });

  describe("webhook", () => {
    it("should create webhook", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: "abc123",
          slug: "test-webhook",
          url: "https://hooks.devutils.in/webhook/test-webhook",
          streamUrl: "https://api.devutils.in/webhooks/test-webhook/stream",
        }),
      });

      const result = await devutils.webhook.create("test-webhook");

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("token");
    });
  });

  describe("error handling", () => {
    it("should handle API errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: "INVALID_URL",
          message: "Invalid URL provided",
        }),
      });

      await expect(devutils.screenshot("invalid-url")).rejects.toMatchObject({
        code: "INVALID_URL",
        statusCode: 400,
      });
    });

    it("should handle rate limiting", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          error: "RATE_LIMITED",
          message: "Rate limit exceeded",
        }),
      });

      await expect(devutils.screenshot("https://example.com")).rejects.toMatchObject({
        code: "RATE_LIMITED",
        statusCode: 429,
      });
    });

    it("should handle authentication errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: "UNAUTHORIZED",
          message: "Invalid API key",
        }),
      });

      await expect(devutils.screenshot("https://example.com")).rejects.toMatchObject({
        code: "UNAUTHORIZED",
        statusCode: 401,
      });
    });
  });

  describe("authentication", () => {
    it("should update API key", () => {
      devutils.setApiKey("new-api-key");
      expect(devutils).toBeInstanceOf(DevUtilsSDK);
    });

    it("should update token", () => {
      devutils.setToken("new-token");
      expect(devutils).toBeInstanceOf(DevUtilsSDK);
    });

    it("should clear auth", () => {
      devutils.clearAuth();
      expect(devutils).toBeInstanceOf(DevUtilsSDK);
    });
  });
});

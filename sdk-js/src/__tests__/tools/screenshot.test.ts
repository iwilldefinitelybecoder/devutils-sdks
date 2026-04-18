import { screenshot } from "../../tools/screenshot";
import { HttpClient } from "../../core/http-client";

jest.mock("../../core/http-client");

describe("Screenshot Tool", () => {
  let httpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    httpClient = {
      post: jest.fn(),
      get: jest.fn(),
    } as any;
  });

  describe("screenshot", () => {
    it("should take screenshot and return URL", async () => {
      // Mock initial response with jobId
      httpClient.post.mockResolvedValueOnce({
        jobId: "job-123",
        status: "PENDING",
      });

      // Mock poll response
      httpClient.get.mockResolvedValueOnce({
        status: "COMPLETED",
        signedUrl: "https://cdn.devutils.in/screenshot.png",
      });

      const result = await screenshot("https://example.com", {}, httpClient);

      expect(result.url).toBe("https://cdn.devutils.in/screenshot.png");
      expect(httpClient.post).toHaveBeenCalledWith(
        "/api/screenshot",
        expect.any(Object),
        expect.any(Object),
      );
    });

    it("should throw error if URL is missing", async () => {
      await expect(screenshot("", {}, httpClient)).rejects.toThrow(
        "URL is required",
      );
    });

    it("should pass options to API", async () => {
      httpClient.post.mockResolvedValueOnce({
        jobId: "job-123",
        status: "PENDING",
      });

      httpClient.get.mockResolvedValueOnce({
        status: "COMPLETED",
        signedUrl: "https://cdn.devutils.in/screenshot.png",
      });

      await screenshot(
        "https://example.com",
        {
          fullPage: true,
          mobile: true,
          darkMode: true,
          blockAds: true,
          type: "webp",
        },
        httpClient,
      );

      expect(httpClient.post).toHaveBeenCalledWith(
        "/api/screenshot",
        expect.objectContaining({
          url: "https://example.com",
          type: "webp",
          options: expect.objectContaining({
            darkMode: true,
            blockAds: true,
          }),
        }),
        expect.any(Object),
      );
    });

    it("should normalize selectors from string to array", async () => {
      httpClient.post.mockResolvedValueOnce({
        jobId: "job-123",
        status: "PENDING",
      });

      httpClient.get.mockResolvedValueOnce({
        status: "COMPLETED",
        signedUrl: "https://cdn.devutils.in/screenshot.png",
      });

      await screenshot(
        "https://example.com",
        {
          hideSelectors: ".ad, .popup",
          clickSelectors: ".accept, .button",
        },
        httpClient,
      );

      expect(httpClient.post).toHaveBeenCalledWith(
        "/api/screenshot",
        expect.objectContaining({
          options: expect.objectContaining({
            hideSelectors: [".ad", ".popup"],
            clickSelectors: [".accept", ".button"],
          }),
        }),
        expect.any(Object),
      );
    });

    it("should handle array selectors", async () => {
      httpClient.post.mockResolvedValueOnce({
        jobId: "job-123",
        status: "PENDING",
      });

      httpClient.get.mockResolvedValueOnce({
        status: "COMPLETED",
        signedUrl: "https://cdn.devutils.in/screenshot.png",
      });

      await screenshot(
        "https://example.com",
        {
          hideSelectors: [".ad", ".popup"],
        },
        httpClient,
      );

      expect(httpClient.post).toHaveBeenCalledWith(
        "/api/screenshot",
        expect.objectContaining({
          options: expect.objectContaining({
            hideSelectors: [".ad", ".popup"],
          }),
        }),
        expect.any(Object),
      );
    });

    it("should handle errors", async () => {
      httpClient.post.mockRejectedValue({
        status: 400,
        data: { error: "INVALID_URL", message: "Invalid URL" },
      });

      await expect(
        screenshot("invalid-url", {}, httpClient),
      ).rejects.toMatchObject({
        code: "INVALID_URL",
      });
    });
  });
});

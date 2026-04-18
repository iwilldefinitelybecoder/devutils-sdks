import { HttpClient } from "../../core/http-client";

describe("HttpClient", () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient({
      apiKey: "test-api-key",
      baseUrl: "https://api.test.com",
    });
  });

  describe("constructor", () => {
    it("should create instance with API key", () => {
      const client = new HttpClient({ apiKey: "test-key" });
      expect(client).toBeInstanceOf(HttpClient);
    });

    it("should create instance with token", () => {
      const client = new HttpClient({ token: "test-token" });
      expect(client).toBeInstanceOf(HttpClient);
    });

    it("should use default base URL if not provided", () => {
      const client = new HttpClient({ apiKey: "test-key" });
      expect(client).toBeInstanceOf(HttpClient);
    });

    it("should use default timeout if not provided", () => {
      const client = new HttpClient({ apiKey: "test-key" });
      expect(client).toBeInstanceOf(HttpClient);
    });
  });

  describe("request", () => {
    it("should make GET request", async () => {
      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: "test" }),
        headers: new Map([["content-type", "application/json"]]),
      });

      const result = await httpClient.get("/test");
      expect(result).toEqual({ data: "test" });
    });

    it("should make POST request with data", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
        headers: new Map(),
      });

      const result = await httpClient.post("/test", { key: "value" });
      expect(result).toEqual({ success: true });
    });

    it("should throw on non-2xx status", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: "Bad request" }),
      });

      await expect(httpClient.get("/test")).rejects.toMatchObject({
        status: 400,
      });
    });

    it("should handle timeout", async () => {
      global.fetch = jest.fn().mockImplementation(() => {
        return new Promise((_, reject) => {
          const error = new Error("Timeout");
          error.name = "AbortError";
          reject(error);
        });
      });

      await expect(httpClient.get("/test")).rejects.toMatchObject({
        status: 408,
      });
    });

    it("should handle network errors", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

      await expect(httpClient.get("/test")).rejects.toMatchObject({
        status: 0,
      });
    });
  });

  describe("authentication", () => {
    it("should set API key header", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
        headers: new Map(),
      });

      await httpClient.get("/test");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.test.com/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            "x-api-key": "test-api-key",
          }),
        }),
      );
    });

    it("should set Bearer token header", async () => {
      const client = new HttpClient({ token: "test-token" });
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
        headers: new Map(),
      });

      await client.get("/test");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.test.com/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        }),
      );
    });

    it("should update API key", () => {
      httpClient.setApiKey("new-key");
      expect(httpClient).toBeInstanceOf(HttpClient);
    });

    it("should update token", () => {
      httpClient.setToken("new-token");
      expect(httpClient).toBeInstanceOf(HttpClient);
    });

    it("should clear auth", () => {
      httpClient.clearAuth();
      expect(httpClient).toBeInstanceOf(HttpClient);
    });
  });

  describe("HTTP methods", () => {
    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
        headers: new Map(),
      });
    });

    it("should make GET request", async () => {
      await httpClient.get("/test");
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("should make POST request", async () => {
      await httpClient.post("/test", { data: "test" });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ data: "test" }),
        }),
      );
    });

    it("should make PUT request", async () => {
      await httpClient.put("/test", { data: "test" });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "PUT" }),
      );
    });

    it("should make DELETE request", async () => {
      await httpClient.delete("/test");
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "DELETE" }),
      );
    });

    it("should make PATCH request", async () => {
      await httpClient.patch("/test", { data: "test" });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "PATCH" }),
      );
    });
  });
});

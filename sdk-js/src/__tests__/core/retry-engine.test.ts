import {
  retry,
  retryWithPredicate,
  DEFAULT_RETRY_CONFIG,
} from "../../core/retry-engine";

describe("RetryEngine", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("retry", () => {
    it("should return result on first successful attempt", async () => {
      const fn = jest.fn().mockResolvedValue("success");
      const result = await retry(fn);

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should retry on retryable errors", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce({ status: 500 })
        .mockRejectedValueOnce({ status: 502 })
        .mockResolvedValue("success");

      const resultPromise = retry(fn, { maxRetries: 3, initialDelayMs: 100 });

      // Fast-forward through delays
      await jest.runAllTimersAsync();

      const result = await resultPromise;
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should not retry on non-retryable errors", async () => {
      const fn = jest.fn().mockRejectedValue({ status: 400 });

      await expect(retry(fn)).rejects.toMatchObject({ status: 400 });
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should stop retrying after max retries", async () => {
      const fn = jest.fn().mockRejectedValue({ status: 500 });

      const resultPromise = retry(fn, { maxRetries: 2, initialDelayMs: 100 });
      await jest.runAllTimersAsync();

      await expect(resultPromise).rejects.toMatchObject({ status: 500 });
      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it("should retry on 408 (timeout)", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce({ status: 408 })
        .mockResolvedValue("success");

      const resultPromise = retry(fn, { maxRetries: 2, initialDelayMs: 100 });
      await jest.runAllTimersAsync();

      const result = await resultPromise;
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should retry on 429 (rate limited)", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce({ status: 429 })
        .mockResolvedValue("success");

      const resultPromise = retry(fn, { maxRetries: 2, initialDelayMs: 100 });
      await jest.runAllTimersAsync();

      const result = await resultPromise;
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should retry on 503 (service unavailable)", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce({ status: 503 })
        .mockResolvedValue("success");

      const resultPromise = retry(fn, { maxRetries: 2, initialDelayMs: 100 });
      await jest.runAllTimersAsync();

      const result = await resultPromise;
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should use exponential backoff", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce({ status: 500 })
        .mockRejectedValueOnce({ status: 500 })
        .mockResolvedValue("success");

      const resultPromise = retry(fn, {
        maxRetries: 3,
        initialDelayMs: 100,
        backoffMultiplier: 2,
      });

      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe("retryWithPredicate", () => {
    it("should retry based on custom predicate", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce({ code: "TEMPORARY_ERROR" })
        .mockResolvedValue("success");

      const shouldRetry = (error: any) => error.code === "TEMPORARY_ERROR";
      const resultPromise = retryWithPredicate(fn, shouldRetry, {
        maxRetries: 2,
        initialDelayMs: 100,
      });

      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should not retry if predicate returns false", async () => {
      const fn = jest.fn().mockRejectedValue({ code: "PERMANENT_ERROR" });

      const shouldRetry = (error: any) => error.code === "TEMPORARY_ERROR";

      await expect(retryWithPredicate(fn, shouldRetry)).rejects.toMatchObject({
        code: "PERMANENT_ERROR",
      });
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should pass attempt number to predicate", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce({ code: "ERROR" })
        .mockResolvedValue("success");

      const shouldRetry = jest.fn().mockReturnValue(true);
      const resultPromise = retryWithPredicate(fn, shouldRetry, {
        maxRetries: 2,
        initialDelayMs: 100,
      });

      await jest.runAllTimersAsync();
      await resultPromise;

      expect(shouldRetry).toHaveBeenCalledWith(
        expect.objectContaining({ code: "ERROR" }),
        0,
      );
    });
  });

  describe("DEFAULT_RETRY_CONFIG", () => {
    it("should have correct default values", () => {
      expect(DEFAULT_RETRY_CONFIG.maxRetries).toBe(5);
      expect(DEFAULT_RETRY_CONFIG.initialDelayMs).toBe(500);
      expect(DEFAULT_RETRY_CONFIG.maxDelayMs).toBe(3000);
      expect(DEFAULT_RETRY_CONFIG.backoffMultiplier).toBe(2);
      expect(DEFAULT_RETRY_CONFIG.jitterFactor).toBe(0.1);
    });
  });
});

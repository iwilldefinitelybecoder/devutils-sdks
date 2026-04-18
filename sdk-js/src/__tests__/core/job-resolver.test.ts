import { resolveJob, DEFAULT_JOB_RESOLVER_CONFIG } from "../../core/job-resolver";

describe("JobResolver", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("resolveJob", () => {
    it("should return data immediately if no jobId", async () => {
      const response = { data: { url: "https://example.com" } };
      const result = await resolveJob(response, jest.fn());

      expect(result).toEqual({ url: "https://example.com" });
    });

    it("should poll until job is completed", async () => {
      const response = { jobId: "job-123", status: "PENDING" };
      const pollFn = jest
        .fn()
        .mockResolvedValueOnce({ status: "PENDING" })
        .mockResolvedValueOnce({
          status: "COMPLETED",
          data: { url: "https://example.com" },
        });

      const resultPromise = resolveJob(response, pollFn, {
        initialPollDelayMs: 100,
        maxWaitMs: 5000,
      });

      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toEqual({ url: "https://example.com" });
      expect(pollFn).toHaveBeenCalledTimes(2);
    });

    it("should throw on job failure", async () => {
      const response = { jobId: "job-123", status: "PENDING" };
      const pollFn = jest.fn().mockResolvedValue({
        status: "FAILED",
        error: "Job failed",
      });

      const resultPromise = resolveJob(response, pollFn, {
        initialPollDelayMs: 100,
      });

      await expect(Promise.all([resultPromise, jest.runAllTimersAsync()])).rejects.toMatchObject({
        code: "JOB_FAILED",
      });
    });

    it("should timeout after maxWaitMs", async () => {
      const response = { jobId: "job-123", status: "PENDING" };
      const pollFn = jest.fn().mockResolvedValue({ status: "PENDING" });

      const resultPromise = resolveJob(response, pollFn, {
        initialPollDelayMs: 100,
        maxWaitMs: 1000,
      });

      await expect(
        Promise.all([resultPromise, jest.advanceTimersByTimeAsync(1500)])
      ).rejects.toMatchObject({
        code: "JOB_TIMEOUT",
      });
    });

    it("should handle 404 errors (job not found yet)", async () => {
      const response = { jobId: "job-123", status: "PENDING" };
      const pollFn = jest
        .fn()
        .mockRejectedValueOnce({ status: 404 })
        .mockResolvedValueOnce({
          status: "COMPLETED",
          data: { url: "https://example.com" },
        });

      const resultPromise = resolveJob(response, pollFn, {
        initialPollDelayMs: 100,
        maxWaitMs: 5000,
      });

      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toEqual({ url: "https://example.com" });
      expect(pollFn).toHaveBeenCalledTimes(2);
    });

    it("should use exponential backoff for polling", async () => {
      const response = { jobId: "job-123", status: "PENDING" };
      const pollFn = jest
        .fn()
        .mockResolvedValueOnce({ status: "PENDING" })
        .mockResolvedValueOnce({ status: "PENDING" })
        .mockResolvedValueOnce({
          status: "COMPLETED",
          data: { url: "https://example.com" },
        });

      const resultPromise = resolveJob(response, pollFn, {
        initialPollDelayMs: 100,
        maxWaitMs: 10000,
        pollBackoffMultiplier: 2,
      });

      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toEqual({ url: "https://example.com" });
      expect(pollFn).toHaveBeenCalledTimes(3);
    });

    it("should handle different job ID field names", async () => {
      const response = { id: "job-123", status: "PENDING" };
      const pollFn = jest.fn().mockResolvedValue({
        status: "COMPLETED",
        data: { url: "https://example.com" },
      });

      const resultPromise = resolveJob(response, pollFn, {
        initialPollDelayMs: 100,
      });

      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toEqual({ url: "https://example.com" });
      expect(pollFn).toHaveBeenCalledWith("job-123");
    });

    it("should handle different completion status values", async () => {
      const response = { jobId: "job-123", status: "PENDING" };
      const pollFn = jest.fn().mockResolvedValue({
        status: "DONE",
        data: { url: "https://example.com" },
      });

      const resultPromise = resolveJob(response, pollFn, {
        initialPollDelayMs: 100,
      });

      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toEqual({ url: "https://example.com" });
    });

    it("should handle different failure status values", async () => {
      const response = { jobId: "job-123", status: "PENDING" };
      const pollFn = jest.fn().mockResolvedValue({
        status: "ERROR",
        error: "Job error",
      });

      const resultPromise = resolveJob(response, pollFn, {
        initialPollDelayMs: 100,
      });

      await expect(Promise.all([resultPromise, jest.runAllTimersAsync()])).rejects.toMatchObject({
        code: "JOB_FAILED",
      });
    });
  });

  describe("DEFAULT_JOB_RESOLVER_CONFIG", () => {
    it("should have correct default values", () => {
      expect(DEFAULT_JOB_RESOLVER_CONFIG.maxWaitMs).toBe(30000);
      expect(DEFAULT_JOB_RESOLVER_CONFIG.initialPollDelayMs).toBe(500);
      expect(DEFAULT_JOB_RESOLVER_CONFIG.maxPollDelayMs).toBe(3000);
      expect(DEFAULT_JOB_RESOLVER_CONFIG.pollBackoffMultiplier).toBe(1.5);
    });
  });
});

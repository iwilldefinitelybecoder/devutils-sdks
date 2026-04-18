/**
 * Job Resolver for DevUtils SDK
 * Polls async jobs (screenshot, PDF) until completion
 * Handles timeouts and exponential backoff
 */

import { retry, RetryConfig } from "./retry-engine";
import { DevUtilsError, normalizeError } from "./error-handler";

export interface JobResponse {
  jobId?: string;
  id?: string;
  status?: string;
  data?: any;
  success?: boolean;
  error?: any;
}

export interface JobResolverConfig {
  maxWaitMs?: number;
  initialPollDelayMs?: number;
  maxPollDelayMs?: number;
  pollBackoffMultiplier?: number;
}

export const DEFAULT_JOB_RESOLVER_CONFIG: Required<JobResolverConfig> = {
  maxWaitMs: 30000, // 30 seconds
  initialPollDelayMs: 500,
  maxPollDelayMs: 3000,
  pollBackoffMultiplier: 1.5,
};

/**
 * Check if response contains a job that needs polling
 */
function hasJobId(response: JobResponse): boolean {
  return !!(response.jobId || response.id);
}

/**
 * Get job ID from response
 */
function getJobId(response: JobResponse): string {
  return (response.jobId || response.id) as string;
}

/**
 * Check if job is complete
 */
function isJobComplete(jobStatus: string): boolean {
  return (
    jobStatus === "COMPLETED" || jobStatus === "DONE" || jobStatus === "SUCCESS"
  );
}

/**
 * Check if job failed
 */
function isJobFailed(jobStatus: string): boolean {
  return (
    jobStatus === "FAILED" || jobStatus === "ERROR" || jobStatus === "CANCELLED"
  );
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolve a job by polling until completion
 * If response doesn't have a jobId, returns immediately
 * @param response - Initial API response
 * @param pollFn - Function to poll job status
 * @param config - Job resolver configuration
 * @returns Final job data
 */
export async function resolveJob<T = any>(
  response: JobResponse,
  pollFn: (jobId: string) => Promise<JobResponse>,
  config: Partial<JobResolverConfig> = {},
): Promise<T> {
  const finalConfig = { ...DEFAULT_JOB_RESOLVER_CONFIG, ...config };

  // If no job ID, response is already complete
  if (!hasJobId(response)) {
    if (response.data) {
      return response.data as T;
    }
    return response as any as T;
  }

  const jobId = getJobId(response);
  const startTime = Date.now();
  let pollDelay = finalConfig.initialPollDelayMs;
  let pollAttempt = 0;

  while (true) {
    // Check timeout
    const elapsed = Date.now() - startTime;
    if (elapsed > finalConfig.maxWaitMs) {
      throw new DevUtilsError(
        "JOB_TIMEOUT",
        `Job ${jobId} did not complete within ${finalConfig.maxWaitMs}ms`,
        408,
      );
    }

    // Wait before polling
    if (pollAttempt > 0) {
      await sleep(pollDelay);
      // Increase delay for next poll (exponential backoff)
      pollDelay = Math.min(
        pollDelay * finalConfig.pollBackoffMultiplier,
        finalConfig.maxPollDelayMs,
      );
    }

    try {
      // Poll job status
      const jobResponse = await retry(() => pollFn(jobId), {
        maxRetries: 3,
        initialDelayMs: 100,
        maxDelayMs: 500,
      });

      const status = jobResponse.status || "UNKNOWN";

      // Job completed successfully
      if (isJobComplete(status)) {
        return jobResponse.data as T;
      }

      // Job failed
      if (isJobFailed(status)) {
        const error = jobResponse.error || "Job failed";
        throw new DevUtilsError(
          "JOB_FAILED",
          typeof error === "string" ? error : error.message || "Job failed",
          400,
        );
      }

      // Job still pending, continue polling
      pollAttempt++;
    } catch (error) {
      // If it's a 404, job might not exist yet (race condition)
      // Retry polling
      if (error && typeof error === "object" && (error as any).status === 404) {
        pollAttempt++;
        continue;
      }

      // Other errors should be thrown
      throw normalizeError(error);
    }
  }
}

/**
 * Resolve multiple jobs in parallel
 */
export async function resolveJobs<T = any>(
  responses: JobResponse[],
  pollFn: (jobId: string) => Promise<JobResponse>,
  config: Partial<JobResolverConfig> = {},
): Promise<T[]> {
  return Promise.all(
    responses.map((response) => resolveJob<T>(response, pollFn, config)),
  );
}

/**
 * Create a job resolver for a specific endpoint
 * Useful for reusing the same polling logic
 */
export function createJobResolver(
  pollFn: (jobId: string) => Promise<JobResponse>,
  config: Partial<JobResolverConfig> = {},
) {
  return {
    resolve: <T = any>(response: JobResponse) =>
      resolveJob<T>(response, pollFn, config),
    resolveMany: <T = any>(responses: JobResponse[]) =>
      resolveJobs<T>(responses, pollFn, config),
  };
}

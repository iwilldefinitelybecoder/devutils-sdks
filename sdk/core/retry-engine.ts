/**
 * Retry Engine for DevUtils SDK
 * Implements exponential backoff with jitter
 * Retries on: 408, 429, 500, 502, 503, 504
 */

export interface RetryConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  jitterFactor?: number;
}

export const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 5,
  initialDelayMs: 500,
  maxDelayMs: 3000,
  backoffMultiplier: 2,
  jitterFactor: 0.1, // 10% jitter
};

// HTTP status codes that should trigger a retry
const RETRYABLE_STATUS_CODES = new Set([
  408, // Request Timeout
  429, // Too Many Requests (Rate Limited)
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
]);

/**
 * Check if an error is retryable
 */
function isRetryable(error: any): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const status = error.status || error.statusCode;
  return RETRYABLE_STATUS_CODES.has(status);
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  config: Required<RetryConfig>,
): number {
  const exponentialDelay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelayMs,
  );

  // Add jitter to prevent thundering herd
  const jitter = exponentialDelay * config.jitterFactor * Math.random();
  return exponentialDelay + jitter;
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param fn - Function to retry
 * @param config - Retry configuration
 * @returns Result of the function
 * @throws Error if all retries are exhausted
 */
export async function retry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if not retryable
      if (!isRetryable(error)) {
        throw error;
      }

      // Don't retry if we've exhausted retries
      if (attempt === finalConfig.maxRetries) {
        throw error;
      }

      // Calculate delay and sleep
      const delay = calculateDelay(attempt, finalConfig);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Retry with custom predicate
 * Useful for retrying on specific conditions beyond HTTP status codes
 */
export async function retryWithPredicate<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: any, attempt: number) => boolean,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (!shouldRetry(error, attempt)) {
        throw error;
      }

      // Don't retry if we've exhausted retries
      if (attempt === finalConfig.maxRetries) {
        throw error;
      }

      // Calculate delay and sleep
      const delay = calculateDelay(attempt, finalConfig);
      await sleep(delay);
    }
  }

  throw lastError;
}

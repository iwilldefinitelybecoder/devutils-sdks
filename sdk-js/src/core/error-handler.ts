/**
 * Error Handler for DevUtils SDK
 * Normalizes API errors into consistent DevUtilsError format
 */

export class DevUtilsError extends Error {
  code: string;
  statusCode: number;
  originalError?: any;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    originalError?: any,
  ) {
    super(message);
    this.name = "DevUtilsError";
    this.code = code;
    this.statusCode = statusCode;
    this.originalError = originalError;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, DevUtilsError.prototype);
  }

  /**
   * Check if error is a specific code
   */
  isCode(code: string): boolean {
    return this.code === code;
  }

  /**
   * Check if error is a specific status code
   */
  isStatus(statusCode: number): boolean {
    return this.statusCode === statusCode;
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return [408, 429, 500, 502, 503, 504].includes(this.statusCode);
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.statusCode >= 500 && this.statusCode < 600;
  }

  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Normalize API error response into DevUtilsError
 */
export function normalizeError(error: any): DevUtilsError {
  // Already a DevUtilsError
  if (error instanceof DevUtilsError) {
    return error;
  }

  // HTTP error response
  if (error && typeof error === "object") {
    const status = error.status || error.statusCode || 500;
    const data = error.data || {};

    // API error format: { error: "CODE", message: "..." }
    if (data.error && typeof data.error === "string") {
      return new DevUtilsError(
        data.error,
        data.message || data.error,
        status,
        error,
      );
    }

    // Alternative format: { success: false, error: { code, message } }
    if (data.error && typeof data.error === "object") {
      return new DevUtilsError(
        data.error.code || "UNKNOWN_ERROR",
        data.error.message || "Unknown error",
        status,
        error,
      );
    }

    // Fallback: use status code as code
    const errorCode = getErrorCodeFromStatus(status);
    const message = data.message || getErrorMessageFromStatus(status);
    return new DevUtilsError(errorCode, message, status, error);
  }

  // String error
  if (typeof error === "string") {
    return new DevUtilsError("UNKNOWN_ERROR", error, 500, error);
  }

  // Unknown error
  return new DevUtilsError(
    "UNKNOWN_ERROR",
    error?.message || "An unknown error occurred",
    500,
    error,
  );
}

/**
 * Get error code from HTTP status code
 */
function getErrorCodeFromStatus(status: number): string {
  const codeMap: Record<number, string> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    408: "TIMEOUT",
    429: "RATE_LIMITED",
    500: "INTERNAL_ERROR",
    502: "BAD_GATEWAY",
    503: "SERVICE_UNAVAILABLE",
    504: "GATEWAY_TIMEOUT",
  };

  return codeMap[status] || "HTTP_ERROR";
}

/**
 * Get error message from HTTP status code
 */
function getErrorMessageFromStatus(status: number): string {
  const messageMap: Record<number, string> = {
    400: "Bad request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not found",
    408: "Request timeout",
    429: "Rate limited",
    500: "Internal server error",
    502: "Bad gateway",
    503: "Service unavailable",
    504: "Gateway timeout",
  };

  return messageMap[status] || `HTTP ${status}`;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  if (error instanceof DevUtilsError) {
    return error.statusCode === 0 || error.code === "NETWORK_ERROR";
  }

  return error?.status === 0 || error?.code === "NETWORK_ERROR";
}

/**
 * Check if error is a timeout
 */
export function isTimeoutError(error: any): boolean {
  if (error instanceof DevUtilsError) {
    return error.statusCode === 408 || error.code === "TIMEOUT";
  }

  return error?.status === 408 || error?.code === "TIMEOUT";
}

/**
 * Check if error is rate limited
 */
export function isRateLimitError(error: any): boolean {
  if (error instanceof DevUtilsError) {
    return error.statusCode === 429 || error.code === "RATE_LIMITED";
  }

  return error?.status === 429 || error?.code === "RATE_LIMITED";
}

/**
 * Check if error is authentication error
 */
export function isAuthError(error: any): boolean {
  if (error instanceof DevUtilsError) {
    return error.statusCode === 401 || error.code === "UNAUTHORIZED";
  }

  return error?.status === 401 || error?.code === "UNAUTHORIZED";
}

import {
  DevUtilsError,
  normalizeError,
  isNetworkError,
  isTimeoutError,
  isRateLimitError,
  isAuthError,
} from "../../core/error-handler";

describe("ErrorHandler", () => {
  describe("DevUtilsError", () => {
    it("should create error with all properties", () => {
      const error = new DevUtilsError("TEST_ERROR", "Test message", 400);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DevUtilsError);
      expect(error.name).toBe("DevUtilsError");
      expect(error.code).toBe("TEST_ERROR");
      expect(error.message).toBe("Test message");
      expect(error.statusCode).toBe(400);
    });

    it("should have default status code", () => {
      const error = new DevUtilsError("TEST_ERROR", "Test message");

      expect(error.statusCode).toBe(500);
    });

    it("should check error code", () => {
      const error = new DevUtilsError("TEST_ERROR", "Test message", 400);

      expect(error.isCode("TEST_ERROR")).toBe(true);
      expect(error.isCode("OTHER_ERROR")).toBe(false);
    });

    it("should check status code", () => {
      const error = new DevUtilsError("TEST_ERROR", "Test message", 400);

      expect(error.isStatus(400)).toBe(true);
      expect(error.isStatus(500)).toBe(false);
    });

    it("should check if retryable", () => {
      const retryableError = new DevUtilsError("TIMEOUT", "Timeout", 408);
      const nonRetryableError = new DevUtilsError(
        "BAD_REQUEST",
        "Bad request",
        400,
      );

      expect(retryableError.isRetryable()).toBe(true);
      expect(nonRetryableError.isRetryable()).toBe(false);
    });

    it("should check if client error", () => {
      const clientError = new DevUtilsError("BAD_REQUEST", "Bad request", 400);
      const serverError = new DevUtilsError(
        "INTERNAL_ERROR",
        "Internal error",
        500,
      );

      expect(clientError.isClientError()).toBe(true);
      expect(serverError.isClientError()).toBe(false);
    });

    it("should check if server error", () => {
      const serverError = new DevUtilsError(
        "INTERNAL_ERROR",
        "Internal error",
        500,
      );
      const clientError = new DevUtilsError("BAD_REQUEST", "Bad request", 400);

      expect(serverError.isServerError()).toBe(true);
      expect(clientError.isServerError()).toBe(false);
    });

    it("should convert to JSON", () => {
      const error = new DevUtilsError("TEST_ERROR", "Test message", 400);
      const json = error.toJSON();

      expect(json).toEqual({
        name: "DevUtilsError",
        code: "TEST_ERROR",
        message: "Test message",
        statusCode: 400,
      });
    });
  });

  describe("normalizeError", () => {
    it("should return DevUtilsError as is", () => {
      const error = new DevUtilsError("TEST_ERROR", "Test message", 400);
      const normalized = normalizeError(error);

      expect(normalized).toBe(error);
    });

    it("should normalize API error format", () => {
      const apiError = {
        status: 400,
        data: {
          error: "BAD_REQUEST",
          message: "Invalid input",
        },
      };

      const normalized = normalizeError(apiError);

      expect(normalized).toBeInstanceOf(DevUtilsError);
      expect(normalized.code).toBe("BAD_REQUEST");
      expect(normalized.message).toBe("Invalid input");
      expect(normalized.statusCode).toBe(400);
    });

    it("should normalize nested error format", () => {
      const apiError = {
        status: 400,
        data: {
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
          },
        },
      };

      const normalized = normalizeError(apiError);

      expect(normalized).toBeInstanceOf(DevUtilsError);
      expect(normalized.code).toBe("VALIDATION_ERROR");
      expect(normalized.message).toBe("Validation failed");
    });

    it("should use status code as error code if not provided", () => {
      const apiError = {
        status: 404,
        data: {},
      };

      const normalized = normalizeError(apiError);

      expect(normalized.code).toBe("NOT_FOUND");
      expect(normalized.statusCode).toBe(404);
    });

    it("should handle string errors", () => {
      const normalized = normalizeError("Something went wrong");

      expect(normalized).toBeInstanceOf(DevUtilsError);
      expect(normalized.code).toBe("UNKNOWN_ERROR");
      expect(normalized.message).toBe("Something went wrong");
    });

    it("should handle unknown error types", () => {
      const normalized = normalizeError({ foo: "bar" });

      expect(normalized).toBeInstanceOf(DevUtilsError);
      expect(normalized.code).toBe("UNKNOWN_ERROR");
    });
  });

  describe("isNetworkError", () => {
    it("should return true for network errors", () => {
      const error = new DevUtilsError("NETWORK_ERROR", "Network error", 0);
      expect(isNetworkError(error)).toBe(true);
    });

    it("should return false for non-network errors", () => {
      const error = new DevUtilsError("BAD_REQUEST", "Bad request", 400);
      expect(isNetworkError(error)).toBe(false);
    });
  });

  describe("isTimeoutError", () => {
    it("should return true for timeout errors", () => {
      const error = new DevUtilsError("TIMEOUT", "Timeout", 408);
      expect(isTimeoutError(error)).toBe(true);
    });

    it("should return false for non-timeout errors", () => {
      const error = new DevUtilsError("BAD_REQUEST", "Bad request", 400);
      expect(isTimeoutError(error)).toBe(false);
    });
  });

  describe("isRateLimitError", () => {
    it("should return true for rate limit errors", () => {
      const error = new DevUtilsError("RATE_LIMITED", "Rate limited", 429);
      expect(isRateLimitError(error)).toBe(true);
    });

    it("should return false for non-rate limit errors", () => {
      const error = new DevUtilsError("BAD_REQUEST", "Bad request", 400);
      expect(isRateLimitError(error)).toBe(false);
    });
  });

  describe("isAuthError", () => {
    it("should return true for auth errors", () => {
      const error = new DevUtilsError("UNAUTHORIZED", "Unauthorized", 401);
      expect(isAuthError(error)).toBe(true);
    });

    it("should return false for non-auth errors", () => {
      const error = new DevUtilsError("BAD_REQUEST", "Bad request", 400);
      expect(isAuthError(error)).toBe(false);
    });
  });
});

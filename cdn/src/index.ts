/**
 * DevUtils SDK - Browser/CDN Distribution
 * Production-grade SDK for DevUtils API
 */

// ============================================================================
// Type Definitions
// ============================================================================

interface HttpClientConfig {
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  apiKey?: string;
}

interface HttpResponse<T = any> {
  statusCode: number;
  data: T;
  headers: Record<string, string>;
}

interface RetryConfig {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
}

interface ScreenshotOptions {
  url: string;
  format?: string;
  width?: number;
  height?: number;
  fullPage?: boolean;
  waitUntil?: string;
  timeout?: number;
  device?: string;
  userAgent?: string;
  cookies?: any[];
  headers?: Record<string, string>;
}

interface ScreenshotResult {
  jobId: string;
  status: string;
  imageUrl?: string;
  format?: string;
  width?: number;
  height?: number;
  createdAt?: string;
  expiresAt?: string;
}

interface PDFOptions {
  url: string;
  format?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  printBackground?: boolean;
  landscape?: boolean;
  timeout?: number;
}

interface PDFResult {
  jobId: string;
  status: string;
  pdfUrl?: string;
  createdAt?: string;
  expiresAt?: string;
}

interface ReaderOptions {
  url: string;
  timeout?: number;
}

interface ReaderResult {
  title: string;
  content: string;
  author?: string;
  publishedDate?: string;
  image?: string;
  language?: string;
}

// ============================================================================
// Error Handling
// ============================================================================

class DevUtilsError extends Error {
  code: string;
  statusCode: number;
  originalError?: Error;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    originalError?: Error,
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.name = "DevUtilsError";
    Object.setPrototypeOf(this, DevUtilsError.prototype);
  }

  isCode(code: string): boolean {
    return this.code === code;
  }

  isStatus(statusCode: number): boolean {
    return this.statusCode === statusCode;
  }

  isRetryable(): boolean {
    const retryableCodes = [
      "TIMEOUT",
      "RATE_LIMITED",
      "SERVICE_UNAVAILABLE",
      "TEMPORARY_ERROR",
    ];
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return (
      retryableCodes.includes(this.code) ||
      retryableStatuses.includes(this.statusCode)
    );
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      originalError: this.originalError?.message,
    };
  }
}

// ============================================================================
// HTTP Client
// ============================================================================

class HttpClient {
  private config: HttpClientConfig;

  constructor(config: HttpClientConfig = {}) {
    this.config = {
      baseUrl: "https://api.devutils.in",
      timeout: 30,
      maxRetries: 3,
      ...config,
    };
  }

  private getHeaders(
    customHeaders?: Record<string, string>,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "devutils-sdk-cdn/1.0.0",
    };

    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }

    return { ...headers, ...customHeaders };
  }

  async request<T = any>(
    method: string,
    path: string,
    data?: any,
    options?: { headers?: Record<string, string>; timeout?: number },
  ): Promise<HttpResponse<T>> {
    const url = `${this.config.baseUrl}${path}`;
    const headers = this.getHeaders(options?.headers);
    const timeout = options?.timeout || this.config.timeout! * 1000;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: data ? JSON.stringify(data) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            // Use default error message
          }

          throw new DevUtilsError("HTTP_ERROR", errorMessage, response.status);
        }

        const responseData = await response.json();
        return {
          statusCode: response.status,
          data: responseData,
          headers: Object.fromEntries(response.headers.entries()),
        };
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      if (error instanceof DevUtilsError) throw error;
      if (error instanceof TypeError) {
        throw new DevUtilsError("CONNECTION_ERROR", (error as Error).message);
      }
      if ((error as Error).name === "AbortError") {
        throw new DevUtilsError("TIMEOUT", "Request timeout");
      }
      throw new DevUtilsError("REQUEST_FAILED", (error as Error).message);
    }
  }

  async get<T = any>(path: string, options?: any): Promise<HttpResponse<T>> {
    return this.request("GET", path, undefined, options);
  }

  async post<T = any>(
    path: string,
    data?: any,
    options?: any,
  ): Promise<HttpResponse<T>> {
    return this.request("POST", path, data, options);
  }

  async put<T = any>(
    path: string,
    data?: any,
    options?: any,
  ): Promise<HttpResponse<T>> {
    return this.request("PUT", path, data, options);
  }

  async delete<T = any>(path: string, options?: any): Promise<HttpResponse<T>> {
    return this.request("DELETE", path, undefined, options);
  }

  async patch<T = any>(
    path: string,
    data?: any,
    options?: any,
  ): Promise<HttpResponse<T>> {
    return this.request("PATCH", path, data, options);
  }
}

// ============================================================================
// Retry Logic
// ============================================================================

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  const initialDelay = config.initialDelay || 1000;
  const maxDelay = config.maxDelay || 30000;
  const backoffMultiplier = config.backoffMultiplier || 2;

  let delay = initialDelay * Math.pow(backoffMultiplier, attempt);
  delay = Math.min(delay, maxDelay);

  if (config.jitter !== false) {
    delay = delay * (0.5 + Math.random());
  }

  return delay;
}

async function retry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {},
): Promise<T> {
  const maxAttempts = config.maxAttempts || 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (error instanceof DevUtilsError && !error.isRetryable()) {
        throw error;
      }

      if (attempt < maxAttempts - 1) {
        const delay = calculateDelay(attempt, config);
        await sleep(delay);
      }
    }
  }

  throw (
    lastError || new DevUtilsError("RETRY_FAILED", "All retry attempts failed")
  );
}

// ============================================================================
// Main SDK Client
// ============================================================================

export class DevUtilsSDK {
  private httpClient: HttpClient;

  constructor(apiKey: string, config?: Partial<HttpClientConfig>) {
    if (!apiKey) {
      throw new DevUtilsError("INVALID_API_KEY", "API key is required");
    }

    this.httpClient = new HttpClient({
      baseUrl: "https://api.devutils.in",
      ...config,
      apiKey,
    });
  }

  /**
   * Take a screenshot
   */
  async screenshot(options: ScreenshotOptions): Promise<ScreenshotResult> {
    if (!options.url) {
      throw new DevUtilsError("INVALID_PARAMS", "URL is required");
    }

    const payload = {
      url: options.url,
      format: options.format || "png",
      width: options.width || 1280,
      height: options.height || 720,
      fullPage: options.fullPage || false,
      waitUntil: options.waitUntil || "networkidle",
      timeout: options.timeout || 30000,
      ...(options.device && { device: options.device }),
      ...(options.userAgent && { userAgent: options.userAgent }),
      ...(options.cookies && { cookies: options.cookies }),
      ...(options.headers && { headers: options.headers }),
    };

    const response = await this.httpClient.post<ScreenshotResult>(
      "/screenshot",
      payload,
    );

    return {
      jobId: response.data.jobId,
      status: response.data.status,
      imageUrl: response.data.imageUrl,
      format: response.data.format || "png",
      width: response.data.width || 1280,
      height: response.data.height || 720,
      createdAt: response.data.createdAt || new Date().toISOString(),
      expiresAt: response.data.expiresAt,
    };
  }

  /**
   * Generate a PDF
   */
  async pdf(options: PDFOptions): Promise<PDFResult> {
    if (!options.url) {
      throw new DevUtilsError("INVALID_PARAMS", "URL is required");
    }

    const payload = {
      url: options.url,
      format: options.format || "A4",
      marginTop: options.marginTop || "1cm",
      marginRight: options.marginRight || "1cm",
      marginBottom: options.marginBottom || "1cm",
      marginLeft: options.marginLeft || "1cm",
      printBackground: options.printBackground !== false,
      landscape: options.landscape || false,
      timeout: options.timeout || 30000,
    };

    const response = await this.httpClient.post<PDFResult>("/pdf", payload);

    return {
      jobId: response.data.jobId,
      status: response.data.status,
      pdfUrl: response.data.pdfUrl,
      createdAt: response.data.createdAt || new Date().toISOString(),
      expiresAt: response.data.expiresAt,
    };
  }

  /**
   * Read and parse content from URL
   */
  async reader(url: string, options?: ReaderOptions): Promise<ReaderResult> {
    if (!url) {
      throw new DevUtilsError("INVALID_PARAMS", "URL is required");
    }

    const payload = {
      url,
      timeout: options?.timeout || 30000,
    };

    const response = await this.httpClient.post<ReaderResult>(
      "/reader",
      payload,
    );

    return {
      title: response.data.title || "",
      content: response.data.content || "",
      author: response.data.author,
      publishedDate: response.data.publishedDate,
      image: response.data.image,
      language: response.data.language,
    };
  }

  /**
   * Get screenshot job status
   */
  async getScreenshotStatus(jobId: string): Promise<ScreenshotResult> {
    if (!jobId) {
      throw new DevUtilsError("INVALID_PARAMS", "Job ID is required");
    }

    const response = await this.httpClient.get<ScreenshotResult>(
      `/screenshot/${jobId}`,
    );
    return response.data;
  }

  /**
   * Get PDF job status
   */
  async getPdfStatus(jobId: string): Promise<PDFResult> {
    if (!jobId) {
      throw new DevUtilsError("INVALID_PARAMS", "Job ID is required");
    }

    const response = await this.httpClient.get<PDFResult>(`/pdf/${jobId}`);
    return response.data;
  }

  /**
   * Retry a function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    config?: Partial<RetryConfig>,
  ): Promise<T> {
    return retry(fn, config);
  }
}

// ============================================================================
// Exports
// ============================================================================

export type {
  ScreenshotOptions,
  ScreenshotResult,
  PDFOptions,
  PDFResult,
  ReaderOptions,
  ReaderResult,
  HttpClientConfig,
  HttpResponse,
  RetryConfig,
};

export { DevUtilsError, HttpClient, retry, sleep, calculateDelay };

// Global export for CDN
if (typeof window !== "undefined") {
  (window as any).DevUtilsSDK = DevUtilsSDK;
  (window as any).DevUtilsError = DevUtilsError;
}

export default DevUtilsSDK;

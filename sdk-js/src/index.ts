/**
 * @devutils/sdk - Production-grade SDK for DevUtils API
 *
 * Usage:
 * ```typescript
 * import DevUtils from "@devutils/sdk"
 *
 * const devutils = new DevUtils("API_KEY")
 * const result = await devutils.screenshot("https://example.com")
 * console.log(result.url)
 * ```
 */

import { HttpClient, HttpClientConfig } from "./core/http-client";
import { DevUtilsError } from "./core/error-handler";
import {
  screenshot as screenshotTool,
  ScreenshotOptions,
  ScreenshotResult,
} from "./tools/screenshot";
import { pdf as pdfTool, PdfOptions, PdfResult } from "./tools/pdf";
import { reader as readerTool, ReaderOptions, ReaderResult } from "./tools/reader";
import { upload, FileUploadOptions, FileUploadResult } from "./tools/files";
import {
  getConnectors,
  getConnector,
  createConnector,
  updateConnector,
  deleteConnector,
  testConnector,
  Connector,
  ConnectorCreateRequest,
} from "./tools/connectors";
import {
  createWebhook,
  listenWebhook,
  getWebhookRequests,
  deleteWebhook,
  WebhookCreateResult,
  WebhookEvent,
  WebhookListener,
} from "./realtime/webhook";
import { normalizeError } from "./core/error-handler";

// ============================================================================
// New-style API types (used by sdk-complete tests)
// ============================================================================

export interface ScreenshotRequest {
  url: string;
  format?: string;
  width?: number;
  height?: number;
  fullPage?: boolean;
  waitUntil?: string;
  timeout?: number;
  device?: string;
  headers?: Record<string, string>;
  cookies?: Array<{ name: string; value: string }>;
  [key: string]: any;
}

export interface ScreenshotJobResult {
  jobId?: string;
  status?: string;
  format?: string;
  width?: number;
  height?: number;
  imageUrl?: string;
  [key: string]: any;
}

export interface ScreenshotStatusResult {
  jobId?: string;
  status?: string;
  imageUrl?: string;
  [key: string]: any;
}

export interface PdfRequest {
  url?: string;
  html?: string;
  format?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  printBackground?: boolean;
  landscape?: boolean;
  [key: string]: any;
}

export interface PdfJobResult {
  jobId?: string;
  status?: string;
  pdfUrl?: string;
  [key: string]: any;
}

export interface PdfStatusResult {
  jobId?: string;
  status?: string;
  pdfUrl?: string;
  [key: string]: any;
}

export interface ReaderJobResult {
  title?: string;
  content?: string;
  author?: string;
  publishedDate?: string;
  image?: string;
  language?: string;
  [key: string]: any;
}

export class DevUtilsSDK {
  private httpClient: HttpClient;

  constructor(apiKey: string, config?: Partial<HttpClientConfig>) {
    if (!apiKey) {
      throw new DevUtilsError("INVALID_API_KEY", "API key is required", 401);
    }
    this.httpClient = new HttpClient({
      apiKey,
      ...config,
    });
  }

  /**
   * Take a screenshot — accepts either a URL string (legacy) or a request object
   */
  async screenshot(
    urlOrRequest: string | ScreenshotRequest,
    options?: ScreenshotOptions
  ): Promise<ScreenshotResult & ScreenshotJobResult> {
    // Legacy string API — use the full tool with job polling
    if (typeof urlOrRequest === "string") {
      return screenshotTool(urlOrRequest, options, this.httpClient) as any;
    }

    // New object API — post directly and return raw response
    const { url, timeout, ...rest } = urlOrRequest;
    try {
      const response = await this.httpClient.post<any>(
        "/api/screenshot",
        { url, ...rest },
        { timeout }
      );
      const data = response?.data ?? response;
      return data as ScreenshotJobResult & ScreenshotResult;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  /**
   * Get screenshot job status
   */
  async getScreenshotStatus(jobId: string): Promise<ScreenshotStatusResult> {
    try {
      const response = await this.httpClient.get<any>(`/screenshots/${jobId}`);
      const data = response?.data ?? response;
      return data as ScreenshotStatusResult;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  /**
   * Generate a PDF — accepts URL string, { html } object (legacy), or a full request object
   */
  async pdf(
    input: string | { html: string } | PdfRequest,
    options?: PdfOptions
  ): Promise<PdfResult & PdfJobResult> {
    // Legacy string or { html } API — use the full tool with job polling
    if (typeof input === "string") {
      return pdfTool(input, options, this.httpClient) as any;
    }
    if (input && typeof input === "object" && "html" in input && Object.keys(input).length === 1) {
      return pdfTool(input as { html: string }, options, this.httpClient) as any;
    }

    // New object API — post directly and return raw response
    const { timeout, ...rest } = input as PdfRequest;
    try {
      const response = await this.httpClient.post<any>("/api/pdf", rest, { timeout });
      const data = response?.data ?? response;
      return data as PdfJobResult & PdfResult;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  /**
   * Get PDF job status
   */
  async getPdfStatus(jobId: string): Promise<PdfStatusResult> {
    try {
      const response = await this.httpClient.get<any>(`/pdf/${jobId}`);
      const data = response?.data ?? response;
      return data as PdfStatusResult;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  /**
   * Extract and convert webpage content
   */
  async reader(url: string, options?: ReaderOptions): Promise<ReaderResult & ReaderJobResult> {
    try {
      const response = await this.httpClient.post<any>(
        "/api/reader",
        { url, ...options },
        { timeout: options?.timeout }
      );
      // Support both nested .data and flat response
      const data = response?.data ?? response;
      return data as ReaderResult & ReaderJobResult;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  /**
   * Upload a file to CDN
   */
  async uploadFile(file: Buffer | Blob, options?: FileUploadOptions): Promise<FileUploadResult> {
    return upload(file, options, this.httpClient);
  }

  /**
   * Webhook management
   */
  webhook = {
    create: (name?: string) => createWebhook(this.httpClient, name),
    listen: (id: string, callback: (event: WebhookEvent) => void) =>
      listenWebhook(id, callback, this.httpClient),
    getRequests: (id: string, options?: { limit?: number; offset?: number }) =>
      getWebhookRequests(id, this.httpClient, options),
    delete: (id: string) => deleteWebhook(id, this.httpClient),
  };

  /**
   * Connector management
   */
  connectors = {
    list: () => getConnectors(this.httpClient),
    get: (id: string) => getConnector(id, this.httpClient),
    create: (request: ConnectorCreateRequest) => createConnector(request, this.httpClient),
    update: (id: string, updates: Partial<ConnectorCreateRequest>) =>
      updateConnector(id, updates, this.httpClient),
    delete: (id: string) => deleteConnector(id, this.httpClient),
    test: (request: ConnectorCreateRequest) => testConnector(request, this.httpClient),
  };

  setApiKey(apiKey: string): void {
    this.httpClient.setApiKey(apiKey);
  }

  setToken(token: string): void {
    this.httpClient.setToken(token);
  }

  clearAuth(): void {
    this.httpClient.clearAuth();
  }
}

// Export all types
export * from "./core/index";
export * from "./tools/index";
export * from "./realtime/index";

// Default export
export default DevUtilsSDK;

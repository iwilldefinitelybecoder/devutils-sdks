/**
 * DevUtils SDK
 * Production-grade SDK for DevUtils API
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
import {
  screenshot,
  ScreenshotOptions,
  ScreenshotResult,
} from "./tools/screenshot";
import { pdf, PdfOptions, PdfResult } from "./tools/pdf";
import { reader, ReaderOptions, ReaderResult } from "./tools/reader";
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

export class DevUtilsSDK {
  private httpClient: HttpClient;

  constructor(apiKey: string, config?: Partial<HttpClientConfig>) {
    this.httpClient = new HttpClient({
      apiKey,
      ...config,
    });
  }

  /**
   * Take a screenshot of a website
   */
  async screenshot(
    url: string,
    options?: ScreenshotOptions,
  ): Promise<ScreenshotResult> {
    return screenshot(url, options, this.httpClient);
  }

  /**
   * Generate a PDF from URL or HTML
   */
  async pdf(
    input: string | { html: string },
    options?: PdfOptions,
  ): Promise<PdfResult> {
    return pdf(input, options, this.httpClient);
  }

  /**
   * Extract and convert webpage content
   */
  async reader(url: string, options?: ReaderOptions): Promise<ReaderResult> {
    return reader(url, options, this.httpClient);
  }

  /**
   * Upload a file to CDN
   */
  async uploadFile(
    file: Buffer | Blob,
    options?: FileUploadOptions,
  ): Promise<FileUploadResult> {
    return upload(file, options, this.httpClient);
  }

  /**
   * Webhook management
   */
  webhook = {
    /**
     * Create a new webhook
     */
    create: (name?: string) => createWebhook(this.httpClient, name),

    /**
     * Listen for webhook events via SSE
     */
    listen: (id: string, callback: (event: WebhookEvent) => void) =>
      listenWebhook(id, callback, this.httpClient),

    /**
     * Get webhook requests
     */
    getRequests: (id: string, options?: { limit?: number; offset?: number }) =>
      getWebhookRequests(id, this.httpClient, options),

    /**
     * Delete a webhook
     */
    delete: (id: string) => deleteWebhook(id, this.httpClient),
  };

  /**
   * Connector management
   */
  connectors = {
    /**
     * Get all connectors
     */
    list: () => getConnectors(this.httpClient),

    /**
     * Get a specific connector
     */
    get: (id: string) => getConnector(id, this.httpClient),

    /**
     * Create a new connector
     */
    create: (request: ConnectorCreateRequest) =>
      createConnector(request, this.httpClient),

    /**
     * Update a connector
     */
    update: (id: string, updates: Partial<ConnectorCreateRequest>) =>
      updateConnector(id, updates, this.httpClient),

    /**
     * Delete a connector
     */
    delete: (id: string) => deleteConnector(id, this.httpClient),

    /**
     * Test a connector configuration
     */
    test: (request: ConnectorCreateRequest) =>
      testConnector(request, this.httpClient),
  };

  /**
   * Update API key
   */
  setApiKey(apiKey: string): void {
    this.httpClient.setApiKey(apiKey);
  }

  /**
   * Update JWT token
   */
  setToken(token: string): void {
    this.httpClient.setToken(token);
  }

  /**
   * Clear authentication
   */
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

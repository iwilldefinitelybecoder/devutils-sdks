/**
 * Reader Tool for DevUtils SDK
 * Extracts and converts webpage content to markdown/text
 */

import { HttpClient } from "../core/http-client";
import { normalizeError } from "../core/error-handler";

export interface ReaderOptions {
  /**
   * Output format
   * @default "markdown"
   */
  outputFormat?: "markdown" | "text";

  /**
   * Include screenshot in response
   * @default false
   */
  includeScreenshot?: boolean;

  /**
   * Include links in response
   * @default true
   */
  includeLinks?: boolean;

  /**
   * Include metadata in response
   * @default true
   */
  includeMetadata?: boolean;

  /**
   * Custom timeout for this request (ms)
   */
  timeout?: number;
}

export interface ReaderMetadata {
  /**
   * Page title
   */
  title?: string;

  /**
   * Page description
   */
  description?: string;

  /**
   * Page author
   */
  author?: string;

  /**
   * Page language
   */
  language?: string;

  /**
   * Page keywords
   */
  keywords?: string[];
}

export interface ReaderStats {
  /**
   * Word count
   */
  wordCount: number;

  /**
   * Number of links
   */
  linkCount: number;

  /**
   * Number of images
   */
  imageCount: number;
}

export interface ReaderResult {
  /**
   * Markdown content
   */
  markdown?: string;

  /**
   * Plain text content
   */
  text?: string;

  /**
   * Page metadata
   */
  metadata?: ReaderMetadata;

  /**
   * Content statistics
   */
  stats?: ReaderStats;

  /**
   * Screenshot URL (if requested)
   */
  screenshotUrl?: string;

  /**
   * Original URL
   */
  url?: string;

  /**
   * Render time in milliseconds
   */
  renderTimeMs?: number;
}

/**
 * Extract and convert webpage content
 * @param url - Website URL to read
 * @param options - Reader options
 * @param httpClient - HTTP client instance
 * @returns Reader result with content and metadata
 */
export async function reader(
  url: string,
  options: ReaderOptions = {},
  httpClient: HttpClient,
): Promise<ReaderResult> {
  if (!url || typeof url !== "string") {
    throw new Error("URL is required and must be a string");
  }

  try {
    // Build request payload
    const payload = {
      url,
      outputFormat: options.outputFormat || "markdown",
      includeScreenshot: options.includeScreenshot || false,
      includeLinks: options.includeLinks !== false,
      includeMetadata: options.includeMetadata !== false,
    };

    // Make API request
    const response = await httpClient.post<any>("/api/reader", payload, {
      timeout: options.timeout,
    });

    // Reader returns complete response (no job polling needed)
    if (response && response.data) {
      return {
        markdown: response.data.markdown,
        text: response.data.text,
        metadata: response.data.metadata,
        stats: response.data.stats,
        screenshotUrl: response.data.screenshotUrl,
        url: response.data.url || url,
        renderTimeMs: response.meta?.renderTimeMs,
      };
    }

    // Fallback if response structure is different
    return {
      markdown: response.markdown,
      text: response.text,
      metadata: response.metadata,
      stats: response.stats,
      screenshotUrl: response.screenshotUrl,
      url: response.url || url,
      renderTimeMs: response.renderTimeMs,
    };
  } catch (error) {
    throw normalizeError(error);
  }
}

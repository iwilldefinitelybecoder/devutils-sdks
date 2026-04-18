/**
 * Screenshot Tool for DevUtils SDK
 * Generates screenshots of websites with advanced options
 */

import { HttpClient } from "../core/http-client";
import { resolveJob, JobResponse } from "../core/job-resolver";
import { normalizeError } from "../core/error-handler";

export interface ScreenshotOptions {
  /**
   * Capture full page or viewport only
   * @default true
   */
  fullPage?: boolean;

  /**
   * Capture mobile viewport
   * @default false
   */
  mobile?: boolean;

  /**
   * Enable dark mode
   * @default false
   */
  darkMode?: boolean;

  /**
   * Block ads
   * @default false
   */
  blockAds?: boolean;

  /**
   * Block cookie banners
   * @default false
   */
  blockCookieBanners?: boolean;

  /**
   * Hide chat widgets
   * @default false
   */
  hideChatWidgets?: boolean;

  /**
   * CSS selectors to hide (comma-separated or array)
   */
  hideSelectors?: string | string[];

  /**
   * CSS selectors to click before capture (comma-separated or array)
   */
  clickSelectors?: string | string[];

  /**
   * Viewport dimensions
   */
  viewport?: {
    width?: number;
    height?: number;
    device?: string;
  };

  /**
   * Screenshot format
   * @default "png"
   */
  type?: "png" | "webp" | "jpg";

  /**
   * Wait time before capture (ms)
   * @default 0
   */
  waitTime?: number;

  /**
   * Custom timeout for this request (ms)
   */
  timeout?: number;
}

export interface ScreenshotResult {
  /**
   * CDN URL of the screenshot
   */
  url: string;

  /**
   * File ID for reference
   */
  fileId?: string;

  /**
   * Screenshot format
   */
  type?: string;

  /**
   * Creation timestamp
   */
  createdAt?: string;

  /**
   * Any warnings from the capture
   */
  warnings?: string[];
}

/**
 * Take a screenshot of a website
 * @param url - Website URL to screenshot
 * @param options - Screenshot options
 * @param httpClient - HTTP client instance
 * @returns Screenshot result with CDN URL
 */
export async function screenshot(
  url: string,
  options: ScreenshotOptions = {},
  httpClient: HttpClient
): Promise<ScreenshotResult> {
  if (!url || typeof url !== "string") {
    throw new Error("URL is required and must be a string");
  }

  try {
    // Normalize selectors
    const hideSelectors = normalizeSelectors(options.hideSelectors);
    const clickSelectors = normalizeSelectors(options.clickSelectors);

    // Build request payload
    const payload = {
      url,
      type: options.type || "png",
      waitTime: options.waitTime || 0,
      options: {
        darkMode: options.darkMode || false,
        blockAds: options.blockAds || false,
        blockCookieBanners: options.blockCookieBanners || false,
        hideChatWidgets: options.hideChatWidgets || false,
        hideSelectors,
        clickSelectors,
      },
      viewport: {
        width: options.viewport?.width || 1280,
        height: options.viewport?.height || 720,
        device: options.viewport?.device || "desktop",
      },
      capture: {
        fullPage: options.fullPage !== false,
      },
    };

    // Make API request
    const response = await httpClient.post<JobResponse>("/api/screenshot", payload, {
      timeout: options.timeout,
    });

    // Resolve job (poll until complete)
    const result = await resolveJob(
      response,
      (jobId) => httpClient.get(`/screenshots/${jobId}`, { timeout: options.timeout }),
      { maxWaitMs: options.timeout || 30000 }
    );

    // Extract URL from result
    if (result && typeof result === "object") {
      // Handle different response formats
      if (result.signedUrl) {
        return {
          url: result.signedUrl,
          fileId: result.id || result.fileId,
          type: result.type,
          createdAt: result.createdAt,
          warnings: result.warnings,
        };
      }

      if (result.url) {
        return {
          url: result.url,
          fileId: result.id || result.fileId,
          type: result.type,
          createdAt: result.createdAt,
          warnings: result.warnings,
        };
      }
    }

    throw new Error("Invalid response format from screenshot API");
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Normalize selector input (string or array) to array
 */
function normalizeSelectors(selectors?: string | string[]): string[] {
  if (!selectors) {
    return [];
  }

  if (typeof selectors === "string") {
    return selectors.split(",").map((s) => s.trim());
  }

  return Array.isArray(selectors) ? selectors : [];
}

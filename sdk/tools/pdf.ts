/**
 * PDF Tool for DevUtils SDK
 * Generates PDFs from URLs or HTML
 */

import { HttpClient } from "../core/http-client";
import { resolveJob, JobResponse } from "../core/job-resolver";
import { normalizeError } from "../core/error-handler";

export interface PdfOptions {
  /**
   * Page size
   * @default "A4"
   */
  pageSize?: "A4" | "Letter" | "Legal" | "Tabloid";

  /**
   * Page orientation
   * @default "portrait"
   */
  orientation?: "portrait" | "landscape";

  /**
   * Custom timeout for this request (ms)
   */
  timeout?: number;
}

export interface PdfResult {
  /**
   * CDN URL of the PDF
   */
  url: string;

  /**
   * File ID for reference
   */
  fileId?: string;

  /**
   * Creation timestamp
   */
  createdAt?: string;

  /**
   * Any warnings from the generation
   */
  warnings?: string[];
}

/**
 * Generate a PDF from a URL or HTML
 * @param input - URL string or { html: string }
 * @param options - PDF options
 * @param httpClient - HTTP client instance
 * @returns PDF result with CDN URL
 */
export async function pdf(
  input: string | { html: string },
  options: PdfOptions = {},
  httpClient: HttpClient,
): Promise<PdfResult> {
  if (!input) {
    throw new Error("Input is required (URL string or { html: string })");
  }

  try {
    // Build request payload
    const payload: any = {
      pageSize: options.pageSize || "A4",
      orientation: options.orientation || "portrait",
    };

    // Handle URL vs HTML input
    if (typeof input === "string") {
      payload.url = input;
    } else if (input && typeof input === "object" && input.html) {
      payload.html = input.html;
    } else {
      throw new Error("Input must be a URL string or { html: string }");
    }

    // Make API request
    const response = await httpClient.post<JobResponse>("/api/pdf", payload, {
      timeout: options.timeout,
    });

    // Resolve job (poll until complete)
    const result = await resolveJob(
      response,
      (jobId) => httpClient.get(`/pdf/${jobId}`, { timeout: options.timeout }),
      { maxWaitMs: options.timeout || 30000 },
    );

    // Extract URL from result
    if (result && typeof result === "object") {
      // Handle different response formats
      if (result.signedUrl) {
        return {
          url: result.signedUrl,
          fileId: result.id || result.fileId,
          createdAt: result.createdAt,
          warnings: result.warnings,
        };
      }

      if (result.url) {
        return {
          url: result.url,
          fileId: result.id || result.fileId,
          createdAt: result.createdAt,
          warnings: result.warnings,
        };
      }
    }

    throw new Error("Invalid response format from PDF API");
  } catch (error) {
    throw normalizeError(error);
  }
}

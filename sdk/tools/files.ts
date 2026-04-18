/**
 * Files Tool for DevUtils SDK
 * Upload files and get CDN URLs
 */

import { HttpClient } from "../core/http-client";
import { normalizeError } from "../core/error-handler";

export interface FileUploadOptions {
  /**
   * File name (optional, will be generated if not provided)
   */
  name?: string;

  /**
   * Custom timeout for this request (ms)
   */
  timeout?: number;
}

export interface FileUploadResult {
  /**
   * CDN URL of the uploaded file
   */
  url: string;

  /**
   * File ID for reference
   */
  fileId?: string;

  /**
   * File name
   */
  name?: string;

  /**
   * File size in bytes
   */
  size?: number;

  /**
   * MIME type
   */
  mimeType?: string;

  /**
   * Creation timestamp
   */
  createdAt?: string;
}

/**
 * Upload a file to DevUtils CDN
 * @param file - File buffer or Blob
 * @param options - Upload options
 * @param httpClient - HTTP client instance
 * @returns Upload result with CDN URL
 */
export async function upload(
  file: Buffer | Blob,
  options: FileUploadOptions = {},
  httpClient: HttpClient,
): Promise<FileUploadResult> {
  if (!file) {
    throw new Error("File is required");
  }

  try {
    // Create FormData for multipart upload
    const formData = new FormData();

    // Handle Buffer vs Blob
    if (file instanceof Buffer) {
      const blob = new Blob([new Uint8Array(file)]);
      formData.append("file", blob, options.name || "file");
    } else if (file instanceof Blob) {
      formData.append("file", file, options.name || "file");
    } else {
      throw new Error("File must be a Buffer or Blob");
    }

    // Make API request with FormData
    // Note: We need to use fetch directly for multipart, not the httpClient
    // because httpClient sets Content-Type: application/json
    const response = await uploadWithFormData(
      httpClient,
      "/files/upload",
      formData,
      options.timeout,
    );

    // Extract URL from result
    if (response && typeof response === "object") {
      if (response.signedUrl) {
        return {
          url: response.signedUrl,
          fileId: response.id || response.fileId,
          name: response.name,
          size: response.size,
          mimeType: response.mimeType,
          createdAt: response.createdAt,
        };
      }

      if (response.url) {
        return {
          url: response.url,
          fileId: response.id || response.fileId,
          name: response.name,
          size: response.size,
          mimeType: response.mimeType,
          createdAt: response.createdAt,
        };
      }
    }

    throw new Error("Invalid response format from file upload API");
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Helper to upload with FormData (multipart)
 * This bypasses the httpClient's JSON handling
 */
async function uploadWithFormData(
  httpClient: HttpClient,
  path: string,
  formData: FormData,
  timeout?: number,
): Promise<any> {
  // Get auth headers from httpClient
  const authHeaders = (httpClient as any).getAuthHeaders?.() || {};

  const url = `${(httpClient as any).baseUrl || "https://api.devutils.in"}${path}`;

  const response = await fetch(url, {
    method: "POST",
    headers: authHeaders,
    body: formData,
    signal: AbortSignal.timeout(timeout || 30000),
  });

  if (!response.ok) {
    const data = await response.json();
    throw {
      status: response.status,
      data,
    };
  }

  return response.json();
}

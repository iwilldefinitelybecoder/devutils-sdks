/**
 * Webhook Tool for DevUtils SDK
 * Real-time webhook creation and SSE streaming
 */

import { HttpClient } from "../core/http-client";
import { normalizeError, DevUtilsError } from "../core/error-handler";

export interface WebhookCreateResult {
  /**
   * Webhook ID/slug
   */
  id: string;

  /**
   * Webhook URL for receiving requests
   */
  url: string;

  /**
   * Webhook token for authentication
   */
  token: string;

  /**
   * Stream URL for SSE connection
   */
  streamUrl?: string;
}

export interface WebhookEvent {
  /**
   * Request ID
   */
  id: string;

  /**
   * HTTP method
   */
  method: string;

  /**
   * Request headers
   */
  headers: Record<string, string>;

  /**
   * Request payload
   */
  payload: any;

  /**
   * Timestamp
   */
  createdAt: string;
}

export interface WebhookListener {
  /**
   * Stop listening for events
   */
  stop(): void;

  /**
   * Check if listener is active
   */
  isActive(): boolean;
}

/**
 * Create a new webhook endpoint
 */
export async function createWebhook(
  httpClient: HttpClient,
  name?: string,
  options?: { timeout?: number },
): Promise<WebhookCreateResult> {
  try {
    const response = await httpClient.post<any>(
      "/webhooks/create",
      name ? { name } : {},
      options,
    );

    return {
      id: response.slug || response.token,
      url: response.url,
      token: response.token,
      streamUrl: response.streamUrl,
    };
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Listen for webhook events via SSE
 */
export async function listenWebhook(
  id: string,
  callback: (event: WebhookEvent) => void,
  httpClient: HttpClient,
  options?: { timeout?: number; autoReconnect?: boolean },
): Promise<WebhookListener> {
  if (!id || typeof id !== "string") {
    throw new Error("Webhook ID is required");
  }

  if (!callback || typeof callback !== "function") {
    throw new Error("Callback function is required");
  }

  let eventSource: EventSource | null = null;
  let isActive = true;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const autoReconnect = options?.autoReconnect !== false;

  const baseUrl = (httpClient as any).baseUrl || "https://api.devutils.in";
  const authHeaders = (httpClient as any).getAuthHeaders?.() || {};

  // Build stream URL with auth
  const streamUrl = `${baseUrl}/webhooks/${id}/stream`;

  function connect() {
    try {
      eventSource = new EventSource(streamUrl);

      eventSource.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
          reconnectAttempts = 0; // Reset on successful message
        } catch (error) {
          console.error("Failed to parse webhook event:", error);
        }
      });

      eventSource.addEventListener("error", (error) => {
        console.error("Webhook stream error:", error);

        if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          setTimeout(() => {
            if (isActive) {
              connect();
            }
          }, delay);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          isActive = false;
        }
      });
    } catch (error) {
      console.error("Failed to connect to webhook stream:", error);
      if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        setTimeout(() => {
          if (isActive) {
            connect();
          }
        }, delay);
      }
    }
  }

  // Start listening
  connect();

  return {
    stop() {
      isActive = false;
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    },
    isActive() {
      return isActive && eventSource !== null;
    },
  };
}

/**
 * Get webhook requests
 */
export async function getWebhookRequests(
  id: string,
  httpClient: HttpClient,
  options?: { timeout?: number; limit?: number; offset?: number },
): Promise<WebhookEvent[]> {
  if (!id || typeof id !== "string") {
    throw new Error("Webhook ID is required");
  }

  try {
    const params = new URLSearchParams();
    if (options?.limit) params.append("limit", String(options.limit));
    if (options?.offset) params.append("offset", String(options.offset));

    const path = `/webhooks/${id}/requests${params.toString() ? `?${params}` : ""}`;
    const response = await httpClient.get<any>(path, options);

    return response.requests || [];
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Delete a webhook
 */
export async function deleteWebhook(
  id: string,
  httpClient: HttpClient,
  options?: { timeout?: number },
): Promise<void> {
  if (!id || typeof id !== "string") {
    throw new Error("Webhook ID is required");
  }

  try {
    await httpClient.delete(`/webhooks/${id}`, options);
  } catch (error) {
    throw normalizeError(error);
  }
}

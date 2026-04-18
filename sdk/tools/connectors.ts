/**
 * Connectors Tool for DevUtils SDK
 * Manage integrations and connectors
 */

import { HttpClient } from "../core/http-client";
import { normalizeError } from "../core/error-handler";

export interface ConnectorConfig {
  [key: string]: any;
}

export interface Connector {
  id: string;
  name: string;
  type: string;
  config: ConnectorConfig;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorCreateRequest {
  name: string;
  type: string;
  config: ConnectorConfig;
}

/**
 * Get all connectors
 */
export async function getConnectors(
  httpClient: HttpClient,
  options?: { timeout?: number },
): Promise<Connector[]> {
  try {
    const response = await httpClient.get<Connector[]>(
      "/api/connectors",
      options,
    );
    return Array.isArray(response) ? response : [];
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Get a specific connector
 */
export async function getConnector(
  id: string,
  httpClient: HttpClient,
  options?: { timeout?: number },
): Promise<Connector> {
  if (!id || typeof id !== "string") {
    throw new Error("Connector ID is required");
  }

  try {
    const response = await httpClient.get<Connector>(
      `/api/connectors/${id}`,
      options,
    );
    return response;
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Create a new connector
 */
export async function createConnector(
  request: ConnectorCreateRequest,
  httpClient: HttpClient,
  options?: { timeout?: number },
): Promise<Connector> {
  if (!request.name || !request.type) {
    throw new Error("Connector name and type are required");
  }

  try {
    const response = await httpClient.post<Connector>(
      "/api/connectors",
      request,
      options,
    );
    return response;
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Update a connector
 */
export async function updateConnector(
  id: string,
  updates: Partial<ConnectorCreateRequest>,
  httpClient: HttpClient,
  options?: { timeout?: number },
): Promise<Connector> {
  if (!id || typeof id !== "string") {
    throw new Error("Connector ID is required");
  }

  try {
    const response = await httpClient.put<Connector>(
      `/api/connectors/${id}`,
      updates,
      options,
    );
    return response;
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Delete a connector
 */
export async function deleteConnector(
  id: string,
  httpClient: HttpClient,
  options?: { timeout?: number },
): Promise<void> {
  if (!id || typeof id !== "string") {
    throw new Error("Connector ID is required");
  }

  try {
    await httpClient.delete(`/api/connectors/${id}`, options);
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Test a connector configuration
 */
export async function testConnector(
  request: ConnectorCreateRequest,
  httpClient: HttpClient,
  options?: { timeout?: number },
): Promise<{ success: boolean; message?: string }> {
  if (!request.name || !request.type) {
    throw new Error("Connector name and type are required");
  }

  try {
    const response = await httpClient.post<{
      success: boolean;
      message?: string;
    }>("/api/connectors/test", request, options);
    return response;
  } catch (error) {
    throw normalizeError(error);
  }
}

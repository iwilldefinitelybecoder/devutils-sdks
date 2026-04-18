/**
 * HTTP Client for DevUtils SDK
 * Handles authentication, headers, timeouts, and error responses
 */

export interface HttpClientConfig {
  apiKey?: string;
  token?: string;
  baseUrl?: string;
  timeout?: number;
}

export interface HttpResponse<T = any> {
  status: number;
  data: T;
  headers: Record<string, string>;
}

export class HttpClient {
  private apiKey?: string;
  private token?: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: HttpClientConfig = {}) {
    this.apiKey = config.apiKey;
    this.token = config.token;
    this.baseUrl = config.baseUrl || "https://api.devutils.in";
    this.timeout = config.timeout || 30000;
  }

  async request<T = any>(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    path: string,
    data?: any,
    options?: { timeout?: number }
  ): Promise<HttpResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const timeout = options?.timeout || this.timeout;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.getAuthHeaders(),
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    };

    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      fetchOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timer);
      const responseData = await response.json();

      if (!response.ok) {
        throw { status: response.status, data: responseData };
      }

      return {
        status: response.status,
        data: responseData,
        headers: response.headers ? Object.fromEntries(response.headers as any) : {},
      };
    } catch (error: any) {
      clearTimeout(timer);

      if (error.status) throw error;

      if (error.name === "AbortError") {
        throw { status: 408, data: { error: "TIMEOUT", message: "Request timeout" } };
      }

      throw { status: 0, data: { error: "NETWORK_ERROR", message: error.message } };
    }
  }

  async get<T = any>(path: string, options?: { timeout?: number }): Promise<T> {
    const response = await this.request<T>("GET", path, undefined, options);
    return response.data;
  }

  async post<T = any>(path: string, data?: any, options?: { timeout?: number }): Promise<T> {
    const response = await this.request<T>("POST", path, data, options);
    return response.data;
  }

  async put<T = any>(path: string, data?: any, options?: { timeout?: number }): Promise<T> {
    const response = await this.request<T>("PUT", path, data, options);
    return response.data;
  }

  async delete<T = any>(path: string, options?: { timeout?: number }): Promise<T> {
    const response = await this.request<T>("DELETE", path, undefined, options);
    return response.data;
  }

  async patch<T = any>(path: string, data?: any, options?: { timeout?: number }): Promise<T> {
    const response = await this.request<T>("PATCH", path, data, options);
    return response.data;
  }

  private getAuthHeaders(): Record<string, string> {
    if (this.apiKey) return { "x-api-key": this.apiKey };
    if (this.token) return { Authorization: `Bearer ${this.token}` };
    return {};
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.token = undefined;
  }

  setToken(token: string): void {
    this.token = token;
    this.apiKey = undefined;
  }

  clearAuth(): void {
    this.apiKey = undefined;
    this.token = undefined;
  }
}

// src/lib/api.ts
export const API_BASE_URL = 'http://localhost:12000/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'multipart/form-data',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    // Handle FormData (for file uploads)
    let body: BodyInit | null = null;
    if (data instanceof FormData) {
      body = data;
      // Let the browser set the Content-Type with boundary for FormData
      delete headers['Content-Type'];
    } else if (data) {
      body = JSON.stringify(data);
    }

    const config: RequestInit = {
      method,
      headers,
      body,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle 204 No Content responses
      if (response.status === 204) {
        return null as unknown as T;
      }

      if (!response.ok) {
        const errorData = await this.parseError(response);
        throw new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData.errors
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network request failed',
        0
      );
    }
  }

  private async parseError(response: Response): Promise<{
    message: string;
    errors?: Record<string, string[]>;
  }> {
    try {
      return await response.json();
    } catch {
      return { message: response.statusText };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<T>('GET', `${endpoint}${queryString}`);
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>('POST', endpoint, data, options);
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  async delete<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('DELETE', endpoint, data);
  }

  // Special method for file uploads
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>('POST', endpoint, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
  }
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export { ApiError };
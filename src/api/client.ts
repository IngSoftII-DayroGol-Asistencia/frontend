// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, ...requestConfig } = config;

    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object. entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    const token = localStorage.getItem('token');
    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url.toString(), {
        ...requestConfig,
        headers,
      });

      if (!response.ok) {
        const error = await response.json() as ApiError;
        throw new ApiException(error.message, response.status, error.errors);
      }
      if (response.status === 204) {
        return {} as T;
      }
      return await response.json() as T;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException('Error de conexión', 500);
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this. request<T>(endpoint, { method: 'DELETE' });
  }
}

export class ApiException extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.errors = errors;
  }
}

export const apiClient = new HttpClient(API_BASE_URL);
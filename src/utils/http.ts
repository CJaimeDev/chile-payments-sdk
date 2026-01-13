import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { ProviderError, TimeoutError } from '../types/errors';

// Cliente HTTP base para hacer requests
export class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string, timeout: number = 30000) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Setear headers personalizados
  setHeaders(headers: Record<string, string>): void {
    Object.entries(headers).forEach(([key, value]) => {
      this.client.defaults.headers.common[key] = value;
    });
  }

  // Manejo centralizado de errores
  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Timeout
      if (axiosError.code === 'ECONNABORTED') {
        throw new TimeoutError();
      }

      // Error con respuesta del servidor
      if (axiosError.response) {
        const responseData = axiosError.response.data as any;
        throw new ProviderError(
          responseData?.message || axiosError.message,
          'unknown',
          axiosError.response.status,
          responseData
        );
      }

      // Error de red
      throw new ProviderError(
        axiosError.message || 'Network error',
        'unknown'
      );
    }

    // Error desconocido
    if (error instanceof Error) {
      throw new ProviderError(error.message, 'unknown');
    }

    throw new ProviderError('Unknown error occurred', 'unknown');
  }
}
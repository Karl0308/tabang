import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Centralized API Service with Axios Interceptors
 * Handles authentication, error handling, and request/response transformations
 */
class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    // Create axios instance with default configuration
    this.axiosInstance = axios.create({
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - Add auth token to every request
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors globally
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        // Handle specific error cases
        if (error.response) {
          const status = error.response.status;

          switch (status) {
            case 401:
              // Unauthorized - clear auth and redirect to login
              localStorage.removeItem('token');
              localStorage.removeItem('id');
              localStorage.removeItem('fullname');
              localStorage.removeItem('email');
              localStorage.removeItem('role');
              localStorage.removeItem('roletext');
              localStorage.removeItem('departmentbase');

              // Only redirect if not already on login page
              if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
              }
              break;

            case 403:
              // Forbidden - user doesn't have permission
              break;

            case 404:
              // Not found
              break;

            case 500:
            case 502:
            case 503:
              // Server errors
              break;

            default:
              break;
          }
        } else if (error.request) {
          // Request made but no response received (network error)
        } else {
          // Something else happened
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Get the configured axios instance
   */
  public getInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * GET request
   */
  public get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  /**
   * POST request
   */
  public post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  /**
   * PUT request
   */
  public put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  /**
   * DELETE request
   */
  public delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }

  /**
   * PATCH request
   */
  public patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }
}

// Export a single instance (singleton pattern)
const apiService = new ApiService();
export default apiService;

// Also export the axios instance directly for backward compatibility
export const axiosInstance = apiService.getInstance();

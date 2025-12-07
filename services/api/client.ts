import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// API base URL - NestJS backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Token keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include credentials in requests
});

// Helper function to check if endpoint should be tracked
const shouldTrackPerformance = (url: string | undefined): boolean => {
  if (!url) return false;
  // Only track chat-related endpoints
  return url.includes('/chats');
};

// Request interceptor - Add auth token to requests and track timing
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get(ACCESS_TOKEN_KEY);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add performance tracking only for chat endpoints
    if (shouldTrackPerformance(config.url)) {
      (config as any).__startTime = performance.now();
      (config as any).__url = `${config.method?.toUpperCase()} ${config.url}`;
      (config as any).__shouldTrack = true;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => {
    // Log performance metrics only for chat endpoints
    const config = response.config as InternalAxiosRequestConfig & { 
      __startTime?: number; 
      __url?: string; 
      __shouldTrack?: boolean;
    };
    if (config.__shouldTrack && config.__startTime && config.__url) {
      const duration = performance.now() - config.__startTime;
      if (!isNaN(duration)) {
        console.log(`[API Client] ⏱️ ${config.__url} - Duration: ${duration.toFixed(2)}ms`, {
          status: response.status,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // If response has data wrapper from NestJS TransformInterceptor
    // Extract the actual data
    if (response.data && response.data.data !== undefined) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  async (error: AxiosError<any>) => {
    // Log performance metrics for errors only for chat endpoints
    const config = error.config as (InternalAxiosRequestConfig & { 
      __startTime?: number; 
      __url?: string; 
      _retry?: boolean;
      __shouldTrack?: boolean;
    }) | undefined;
    
    if (config?.__shouldTrack && config.__startTime) {
      try {
        const duration = performance.now() - config.__startTime;
        if (!isNaN(duration)) {
          const url = config.__url || (config.method ? `${config.method.toUpperCase()} ${config.url || 'unknown'}` : 'unknown');
          const durationStr = duration.toFixed(2);
          console.error(`[API Client] ⏱️ ${url} - ERROR - Duration: ${durationStr}ms`, {
            status: error.response?.status || 'N/A',
            error: error.message || 'Unknown error',
            timestamp: new Date().toISOString()
          });
        }
      } catch (logError) {
        // Silently fail logging to prevent breaking the error flow
        // Only log if it's a chat endpoint to avoid noise
      }
    }
    
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Skip token refresh for auth endpoints (login, register, refresh)
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || 
                           originalRequest?.url?.includes('/auth/register') ||
                           originalRequest?.url?.includes('/auth/refresh');

    // If error is 401 and we haven't retried yet AND it's not an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data || response.data;

        // Save new tokens
        Cookies.set(ACCESS_TOKEN_KEY, accessToken, { expires: 7 }); // 7 days
        Cookies.set(REFRESH_TOKEN_KEY, newRefreshToken, { expires: 30 }); // 30 days

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        Cookies.remove(ACCESS_TOKEN_KEY);
        Cookies.remove(REFRESH_TOKEN_KEY);
        
        // Redirect to login (you can customize this)
        if (typeof window !== 'undefined') {
          window.location.href = '/ar/auth/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors - preserve status code for proper error handling
    return Promise.reject(error);
  }
);

// Token management utilities
export const tokenManager = {
  setTokens: (accessToken: string, refreshToken: string) => {
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, { expires: 7 });
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 30 });
  },
  
  getAccessToken: () => Cookies.get(ACCESS_TOKEN_KEY),
  
  getRefreshToken: () => Cookies.get(REFRESH_TOKEN_KEY),
  
  clearTokens: () => {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
  },
  
  hasTokens: () => {
    return !!(Cookies.get(ACCESS_TOKEN_KEY) && Cookies.get(REFRESH_TOKEN_KEY));
  },
};

export default apiClient;


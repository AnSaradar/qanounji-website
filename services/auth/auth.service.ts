import apiClient, { tokenManager } from '../api/client';
import type { LoginDto, RegisterDto, AuthResponse, User } from './auth.types';

/**
 * Auth Service
 * Handles all authentication-related API calls to the NestJS backend
 */
class AuthService {
  /**
   * Login with email/phone and password
   * POST /api/auth/login
   */
  async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      // Store tokens
      tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      // Store tokens
      tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout current user
   * POST /api/auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error: any) {
      // Even if logout fails on backend, clear tokens
      console.error('Logout error:', error);
    } finally {
      // Always clear tokens from client
      tokenManager.clearTokens();
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<AuthResponse>('/auth/refresh', {
        refreshToken,
      });

      // Store new tokens
      tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);

      return response.data;
    } catch (error: any) {
      // If refresh fails, clear tokens
      tokenManager.clearTokens();
      throw this.handleError(error);
    }
  }

  /**
   * Get current user profile
   * This would need a backend endpoint like GET /api/users/me
   * For now, we'll extract from token or return null
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // Check if we have tokens
      if (!tokenManager.hasTokens()) {
        return null;
      }

      // Try to get user profile from backend
      // You'll need to add this endpoint in your NestJS backend
      const response = await apiClient.get<User>('/users/me');
      return response.data;
    } catch (error: any) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenManager.hasTokens();
  }

  /**
   * Handle API errors and extract meaningful messages
   */
  private handleError(error: any): Error & { statusCode?: number } {
    if (error.response) {
      // Backend returned an error response
      const statusCode = error.response.status;
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      const err = new Error(message) as Error & { statusCode?: number };
      err.statusCode = statusCode;
      return err;
    } else if (error.request) {
      // Request was made but no response received
      const err = new Error('Network error. Please check your connection.') as Error & { statusCode?: number };
      err.statusCode = undefined;
      return err;
    } else {
      // Something else happened
      const err = new Error(error.message || 'An unexpected error occurred') as Error & { statusCode?: number };
      err.statusCode = undefined;
      return err;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;


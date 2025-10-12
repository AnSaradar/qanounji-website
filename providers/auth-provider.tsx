"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth/auth.service';
import type { AuthContextType, User, LoginDto, RegisterDto } from '@/services/auth/auth.types';
import { tokenManager } from '@/services/api/client';

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated
  const isAuthenticated = !!user;

  /**
   * Initialize auth state on mount
   * Check if we have tokens and fetch user data
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (tokenManager.hasTokens()) {
          // Try to get current user
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            // Tokens exist but couldn't get user - clear tokens
            tokenManager.clearTokens();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        tokenManager.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login function
   */
  const login = useCallback(async (credentials: LoginDto) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      setUser(response.user);
      
      // Redirect based on user role
      if (response.user.role === 'ADMIN') {
        router.push(`/${response.user.preferredLang}/admin`);
      } else {
        router.push(`/${response.user.preferredLang}/chat`);
      }
    } catch (error: any) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  /**
   * Register function
   */
  const register = useCallback(async (data: RegisterDto) => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);
      setUser(response.user);
      
      // Redirect to chat dashboard after registration
      router.push(`/${response.user.preferredLang}/chat`);
    } catch (error: any) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      
      // Redirect to home page
      router.push('/ar'); // Default to Arabic
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if backend call fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        tokenManager.clearTokens();
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      setUser(null);
      tokenManager.clearTokens();
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use auth context
 * Must be used within AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}


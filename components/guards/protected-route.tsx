"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/services/auth/auth.hook';
import { UserRole } from '@/services/auth/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: UserRole;
  redirectTo?: string;
}

/**
 * Protected Route Component
 * Wraps pages that require authentication
 * 
 * Usage:
 * <ProtectedRoute>
 *   <YourPage />
 * </ProtectedRoute>
 * 
 * Or with role requirement:
 * <ProtectedRoute requireRole={UserRole.ADMIN}>
 *   <AdminPanel />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ 
  children, 
  requireRole,
  redirectTo 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      // Extract locale from pathname
      const locale = pathname.split('/')[1] || 'ar';
      const loginPath = redirectTo || `/${locale}/auth/login`;
      router.push(loginPath);
      return;
    }

    // Check role requirement
    if (requireRole && user?.role !== requireRole) {
      // User doesn't have required role - redirect based on their role
      const locale = user?.preferredLang || 'ar';
      if (user?.role === UserRole.ADMIN) {
        router.push(`/${locale}/admin`);
      } else {
        router.push(`/${locale}/chat`);
      }
    }
  }, [isAuthenticated, isLoading, user, requireRole, router, pathname, redirectTo]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  // Not authenticated - show nothing (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Check role requirement
  if (requireRole && user?.role !== requireRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Unauthorized
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Authenticated and authorized - show children
  return <>{children}</>;
}


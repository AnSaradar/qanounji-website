"use client";

import { Scale } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { LoginForm } from '@/modules/auth/components/login-form';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
  const t = useTranslations();
  const [bannerError, setBannerError] = useState<string>("");
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (bannerError) {
      // Clear any existing timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      // Set new timeout for 5 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setBannerError("");
      }, 5000);
    }
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [bannerError]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900">
      {/* Header */}
      <div className="w-full p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center" dir="ltr">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {t('common.appName')}
            </span>
          </Link>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LocaleSwitcher />
          </div>
        </div>
      </div>

      {/* Global Error Banner (outside the auth card) */}
      {bannerError && (
        <div className="w-full px-2 sm:px-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="max-w-3xl mx-auto">
            <div
              role="alert"
              aria-live="assertive"
              className="relative overflow-hidden flex items-start justify-between gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200 shadow-sm text-sm sm:text-base"
            >
              <span className="text-sm flex-1">{bannerError}</span>
              <button
                type="button"
                aria-label={t('common.close')}
                onClick={() => setBannerError("")}
                className="text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100 text-lg font-bold leading-none flex-shrink-0"
              >
                ×
              </button>
              {/* Progress bar showing time remaining */}
              <div 
                className="absolute bottom-0 left-0 h-1 bg-red-500 dark:bg-red-400 animate-shrink-width"
                style={{ animationDuration: '5s' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-2 sm:px-4 py-4 sm:py-8 md:py-12">
        <LoginForm
          onError={(msg) => setBannerError(msg)}
          onRequestStart={() => setBannerError("")}
        />
      </div>

      {/* Footer */}
      <div className="w-full p-3 sm:p-4 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        <p>{t('landing.footer.copyright')}</p>
      </div>
    </div>
  );
}


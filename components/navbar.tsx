"use client";

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Scale, Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/services/auth';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function Navbar() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push(`/${locale}`);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16" dir="ltr">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Scale className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {t('common.appName')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Navigation Links */}
            <div className="flex items-center gap-2 mr-4">
              <Link href={`/${locale}`}>
                <Button variant="ghost" size="sm">
                  {t('nav.home')}
                </Button>
              </Link>
              {isAuthenticated && (
                <>
                  {user?.role === 'ADMIN' ? (
                    <Link href={`/${locale}/admin`}>
                      <Button variant="ghost" size="sm">
                        {t('nav.admin')}
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/${locale}/chat`}>
                      <Button variant="ghost" size="sm">
                        {t('nav.dashboard')}
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Locale Switcher */}
            <LocaleSwitcher />

            {/* Auth Buttons */}
            {!isLoading && (
              <>
                {!isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <Link href={`/${locale}/auth/login`}>
                      <Button variant="ghost" size="sm">
                        {t('nav.login')}
                      </Button>
                    </Link>
                    <Link href={`/${locale}/auth/register`}>
                      <Button size="sm">
                        {t('nav.register')}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <User className="h-4 w-4" />
                        <span className="max-w-[100px] truncate">
                          {user?.displayName}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        <div className="font-medium text-foreground">{user?.displayName}</div>
                        <div className="text-xs">{user?.email || user?.phone}</div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t('nav.logout')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <LocaleSwitcher />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col gap-2">
              <Link href={`/${locale}`} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  {t('nav.home')}
                </Button>
              </Link>

              {isAuthenticated && (
                <>
                  {user?.role === 'ADMIN' ? (
                    <Link href={`/${locale}/admin`} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        {t('nav.admin')}
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/${locale}/chat`} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        {t('nav.dashboard')}
                      </Button>
                    </Link>
                  )}
                </>
              )}

              <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>

              {!isLoading && (
                <>
                  {!isAuthenticated ? (
                    <>
                      <Link href={`/${locale}/auth/login`} onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          {t('nav.login')}
                        </Button>
                      </Link>
                      <Link href={`/${locale}/auth/register`} onClick={() => setMobileMenuOpen(false)}>
                        <Button size="sm" className="w-full">
                          {t('nav.register')}
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2 text-sm">
                        <div className="font-medium">{user?.displayName}</div>
                        <div className="text-xs text-muted-foreground">
                          {user?.email || user?.phone}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        {t('nav.logout')}
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


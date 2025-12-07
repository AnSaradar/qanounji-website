"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface LoginFormProps {
  onError?: (message: string) => void;
  onRequestStart?: () => void;
}

export function LoginForm({ onError, onRequestStart }: LoginFormProps) {
  const t = useTranslations('auth.login');
  const tValidation = useTranslations('auth.validation');
  const tErrors = useTranslations('auth.errors');
  const params = useParams();
  const locale = params.locale as string;
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Keep local error only if no external handler is provided
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Validation schema
  const loginSchema = z.object({
    identifier: z.string().min(1, tValidation('required')),
    password: z.string().min(8, tValidation('minLength', { min: '8' })),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      // Notify parent to clear any existing banner before new request
      onRequestStart?.();
      setErrorMessage('');
      await login(data);
      // Redirect happens automatically in auth provider
    } catch (error: any) {
      // Extract status code from multiple possible locations
      const statusCode = error?.statusCode || 
                        error?.response?.status || 
                        error?.response?.data?.statusCode;
      const backendMessage = (error?.message || 
                             error?.response?.data?.message || 
                             '').toLowerCase();
      
      console.log('[LoginForm] Error details:', { statusCode, backendMessage, error });
      
      let message: string;
      
      // Map specific backend error messages to translation keys
      if (statusCode === 401) {
        if (backendMessage.includes('deactivated')) {
          message = tErrors('accountDeactivated');
        } else if (backendMessage.includes('expired') || backendMessage.includes('session')) {
          message = tErrors('sessionExpired');
        } else {
          // Default 401: invalid credentials
          message = tErrors('invalidCredentials');
        }
      } else if (statusCode === 403) {
        message = tErrors('unauthorized');
      } else if (statusCode === 400) {
        message = tErrors('invalidData');
      } else if (statusCode >= 500) {
        message = tErrors('serverError');
      } else if (!navigator.onLine || error?.code === 'NETWORK_ERROR') {
        message = tErrors('networkError');
      } else {
        message = tErrors('loginFailed');
      }
      
      console.log('[LoginForm] Showing error message:', message);
      
      if (onError) {
        onError(message);
      } else {
        setErrorMessage(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl mx-auto my-2 sm:my-4 md:my-8">
      <CardHeader className="space-y-1 px-4 sm:px-6 pt-4 sm:pt-5 pb-4">
        <CardTitle className="text-xl sm:text-2xl font-bold text-center">
          {t('title')}
        </CardTitle>
        <CardDescription className="text-center text-xs sm:text-sm">
          {t('subtitle')}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pb-4 px-4 sm:px-6">
          {/* Field errors are shown below each input. Submit error is handled by parent banner if provided. */}

          {/* Identifier Field */}
          <div className="space-y-1.5">
            <Label htmlFor="identifier">{t('identifier')}</Label>
            <Input
              id="identifier"
              type="text"
              placeholder={t('identifierPlaceholder')}
              {...register('identifier')}
              disabled={isLoading}
              className={`${errors.identifier ? 'border-red-500' : ''} h-10 text-sm [&::placeholder]:text-start`}
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            />
            {errors.identifier && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.identifier.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <Label htmlFor="password">{t('password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')}
                {...register('password')}
                disabled={isLoading}
                className={`${errors.password ? 'border-red-500' : ''} ${locale === 'ar' ? 'pl-10 pr-3' : 'pr-10'} h-10 text-sm [&::placeholder]:text-start`}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ${locale === 'ar' ? 'left-3' : 'right-3'}`}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className={`flex justify-end ${locale === 'ar' ? 'text-right' : ''}`}>
            <Link
              href={`/${locale}/auth/forgot-password`}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t('forgotPassword')}
            </Link>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-2 mt-2 px-4 sm:px-6 pb-6">
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="default"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('submit')}...
              </>
            ) : (
              t('submit')
            )}
          </Button>

          {/* Register Link */}
          <p className="text-center text-xs text-gray-600 dark:text-gray-400">
            {t('noAccount')}{' '}
            <Link
              href={`/${locale}/auth/register`}
              className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t('registerLink')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}


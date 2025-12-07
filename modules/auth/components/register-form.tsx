"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth, LanguageEnum, RegisterDto } from '@/services/auth';
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

export function RegisterForm() {
  const t = useTranslations('auth.register');
  const tValidation = useTranslations('auth.validation');
  const tErrors = useTranslations('auth.errors');
  const params = useParams();
  const localeParam = params.locale as string;
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    }
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [errorMessage]);

  // Validation schema
  const registerSchema = z
    .object({
      displayName: z
        .string()
        .min(2, tValidation('minLength', { min: '2' }))
        .max(255, tValidation('maxLength', { max: '255' })),
      email: z.string().email(tValidation('invalidEmail')).optional().or(z.literal('')),
      phone: z
        .string()
        .min(10, tValidation('invalidPhone'))
        .optional()
        .or(z.literal('')),
      password: z.string().min(8, tValidation('minLength', { min: '8' })),
      confirmPassword: z.string().min(8, tValidation('minLength', { min: '8' })),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: tValidation('passwordMismatch'),
      path: ['confirmPassword'],
    })
    .refine((data) => data.email || data.phone, {
      message: t('atLeastOne'),
      path: ['email'],
    });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Prepare data for backend
      const preferredLang =
        localeParam === LanguageEnum.AR ? LanguageEnum.AR : LanguageEnum.EN;

      const registerData: RegisterDto = {
        displayName: data.displayName,
        email: data.email || undefined,
        phone: data.phone || undefined,
        password: data.password,
        preferredLang,
      };

      await registerUser(registerData);
      // Redirect happens automatically in auth provider
    } catch (error: any) {
      // Extract status code from multiple possible locations
      const statusCode = error?.statusCode || 
                        error?.response?.status || 
                        error?.response?.data?.statusCode;
      const backendMessage = (error?.message || 
                             error?.response?.data?.message || 
                             '').toLowerCase();
      
      console.log('[RegisterForm] Error details:', { statusCode, backendMessage, error });
      
      let message: string;
      
      // Map specific backend error messages to translation keys
      if (statusCode === 409) {
        // Conflict - account already exists
        if (backendMessage.includes('email')) {
          message = tErrors('emailExists');
        } else if (backendMessage.includes('phone')) {
          message = tErrors('phoneExists');
        } else {
          message = tErrors('accountExists');
        }
      } else if (statusCode === 400) {
        if (backendMessage.includes('email') && backendMessage.includes('phone')) {
          message = tErrors('missingIdentifier');
        } else {
          message = tErrors('invalidData');
        }
      } else if (statusCode >= 500) {
        message = tErrors('serverError');
      } else if (!navigator.onLine || error?.code === 'NETWORK_ERROR') {
        message = tErrors('networkError');
      } else {
        message = tErrors('registerFailed');
      }
      
      console.log('[RegisterForm] Showing error message:', message);
      
      setErrorMessage(message);
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
          {/* Error Message */}
          {errorMessage && (
            <div className="relative overflow-hidden rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start justify-between gap-2 p-2 sm:p-3">
                <p className="text-xs text-red-800 dark:text-red-200 flex-1">
                  {errorMessage}
                </p>
                <button
                  type="button"
                  onClick={() => setErrorMessage('')}
                  className="text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100 text-lg font-bold leading-none flex-shrink-0"
                >
                  ×
                </button>
              </div>
              {/* Progress bar showing time remaining */}
              <div 
                className="absolute bottom-0 left-0 h-0.5 bg-red-500 dark:bg-red-400 animate-shrink-width"
                style={{ animationDuration: '5s' }}
              />
            </div>
          )}

          {/* Display Name Field */}
          <div className="space-y-1.5">
            <Label htmlFor="displayName">{t('displayName')}</Label>
            <Input
              id="displayName"
              type="text"
              placeholder={t('displayNamePlaceholder')}
              {...register('displayName')}
              disabled={isLoading}
              className={`${errors.displayName ? 'border-red-500' : ''} h-10 text-sm [&::placeholder]:text-start`}
              dir={localeParam === 'ar' ? 'rtl' : 'ltr'}
            />
            {errors.displayName && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.displayName.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              {...register('email')}
              disabled={isLoading}
              className={`${errors.email ? 'border-red-500' : ''} h-10 text-sm [&::placeholder]:text-start`}
              dir={localeParam === 'ar' ? 'rtl' : 'ltr'}
            />
            {errors.email && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">{t('phone')}</Label>
            <Input
              id="phone"
              type="tel"
              placeholder={t('phonePlaceholder')}
              {...register('phone')}
              disabled={isLoading}
              className={`${errors.phone ? 'border-red-500' : ''} h-10 text-sm [&::placeholder]:text-start`}
              dir={localeParam === 'ar' ? 'rtl' : 'ltr'}
            />
            {errors.phone && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.phone.message}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('atLeastOne')}
            </p>
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
                className={`${errors.password ? 'border-red-500' : ''} ${localeParam === 'ar' ? 'pl-10 pr-3' : 'pr-10'} h-10 text-sm [&::placeholder]:text-start`}
                dir={localeParam === 'ar' ? 'rtl' : 'ltr'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ${localeParam === 'ar' ? 'left-3' : 'right-3'}`}
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

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('confirmPasswordPlaceholder')}
                {...register('confirmPassword')}
                disabled={isLoading}
                className={`${errors.confirmPassword ? 'border-red-500' : ''} ${localeParam === 'ar' ? 'pl-10 pr-3' : 'pr-10'} h-10 text-sm [&::placeholder]:text-start`}
                dir={localeParam === 'ar' ? 'rtl' : 'ltr'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ${localeParam === 'ar' ? 'left-3' : 'right-3'}`}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
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

          {/* Login Link */}
          <p className="text-center text-xs text-gray-600 dark:text-gray-400">
            {t('haveAccount')}{' '}
            <Link
              href={`/${localeParam}/auth/login`}
              className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t('loginLink')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}


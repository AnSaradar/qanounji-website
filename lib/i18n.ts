import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Supported locales
export const locales = ['ar', 'en'] as const;
export type Locale = (typeof locales)[number];

// Default locale (Arabic)
export const defaultLocale: Locale = 'ar';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  // At this point, TypeScript knows locale is defined, but we need to assert it's a string
  const validLocale = locale as Locale;

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});


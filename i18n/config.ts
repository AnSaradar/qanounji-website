// Shared i18n config (safe to import in middleware and server/client components)
export const locales = ['ar', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ar';



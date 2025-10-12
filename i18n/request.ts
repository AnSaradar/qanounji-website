import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from './config';

export default getRequestConfig(async (params) => {
  const incoming = params.locale as string | undefined;
  const locale: Locale = (incoming && (locales as readonly string[]).includes(incoming))
    ? (incoming as Locale)
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});


import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Cairo } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { locales } from '@/i18n/config';

// Cairo font for Arabic support (also works well for English)
const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  variable: '--font-cairo',
  display: 'swap',
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Using Next.js [locale] segment with next-intl plugin handles locale detection

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  // Explicitly load messages for the current locale
  const messages = await getMessages({locale});

  // Determine text direction based on locale
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
        <AuthProvider>
          <div dir={dir} data-locale={locale} className={`${cairo.variable} font-sans antialiased`}>
            {children}
          </div>
        </AuthProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}


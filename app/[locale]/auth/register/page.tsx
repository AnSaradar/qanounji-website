import { Scale } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { RegisterForm } from '@/modules/auth/components/register-form';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { ThemeToggle } from '@/components/theme-toggle';

export default function RegisterPage() {
  const t = useTranslations();

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

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-2 sm:px-4 py-4 sm:py-8 md:py-12">
        <RegisterForm />
      </div>

      {/* Footer */}
      <div className="w-full p-3 sm:p-4 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        <p>{t('landing.footer.copyright')}</p>
      </div>
    </div>
  );
}


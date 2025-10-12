"use client";

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Scale, Mail, MapPin } from 'lucide-react';

export function Footer() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <Scale className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">
                {t('common.appName')}
              </span>
            </Link>
            <p className="text-gray-400 mb-4 leading-relaxed">
              {t('common.slogan')}
            </p>
            <div className="flex gap-4">
              {/* Social links placeholder */}
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                aria-label="Social media"
              >
                <span className="text-sm">📱</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">
              {t('nav.home')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}`}
                  className="hover:text-blue-400 transition-colors"
                >
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/auth/login`}
                  className="hover:text-blue-400 transition-colors"
                >
                  {t('nav.login')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/auth/register`}
                  className="hover:text-blue-400 transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">
              {t('nav.features')}
            </h3>
            <ul className="space-y-3">
              <li>
                <span className="hover:text-blue-400 transition-colors cursor-pointer">
                  {t('landing.features.aiPowered.title')}
                </span>
              </li>
              <li>
                <span className="hover:text-blue-400 transition-colors cursor-pointer">
                  {t('landing.features.secure.title')}
                </span>
              </li>
              <li>
                <span className="hover:text-blue-400 transition-colors cursor-pointer">
                  {t('landing.features.available.title')}
                </span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">
              {t('landing.footer.legal')}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  {t('landing.footer.privacy')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  {t('landing.footer.terms')}
                </a>
              </li>
              <li>
                <span className="text-gray-500 text-sm">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  {t('landing.footer.location')}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 mb-6">
            <p className="text-yellow-200 text-sm leading-relaxed">
              ⚠️ {t('landing.footer.disclaimer')}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-gray-400 text-center sm:text-left">
              © {currentYear} {t('common.appName')}. {t('landing.footer.rights')}.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-gray-500">{t('landing.footer.madeWith')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


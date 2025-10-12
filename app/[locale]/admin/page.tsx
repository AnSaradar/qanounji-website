"use client";

import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/components/guards/protected-route';
import { UserRole } from '@/services/auth/auth.types';
import { Navbar } from '@/components/navbar';
import { useAuth } from '@/services/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, BarChart3, Settings } from 'lucide-react';

function AdminPanelContent() {
  const t = useTranslations('admin');
  const { user } = useAuth();

  const stats = [
    {
      title: t('users'),
      value: '0',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: t('kb'),
      value: '0',
      icon: FileText,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      title: t('stats'),
      value: '0',
      icon: BarChart3,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: t('settings'),
      value: '0',
      icon: Settings,
      color: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {t('title')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Welcome back, {user?.displayName}!
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Coming Soon Card */}
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="text-center">
                <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Admin Panel Coming Soon
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Full admin dashboard with user management, knowledge base control, and analytics
                </p>
                <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  Phase 8: Protected Routes Complete ✓
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireRole={UserRole.ADMIN}>
      <AdminPanelContent />
    </ProtectedRoute>
  );
}


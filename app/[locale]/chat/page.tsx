"use client";

import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/components/guards/protected-route';
import { Navbar } from '@/components/navbar';
import { useAuth } from '@/services/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, PlusCircle, History, Sparkles } from 'lucide-react';

function ChatDashboardContent() {
  const t = useTranslations('chat');
  const { user } = useAuth();

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
              Welcome, {user?.displayName}! Start a legal conversation
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <Card className="border-2 hover:border-blue-500 dark:hover:border-blue-400 transition-all cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  {t('newChat')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start a new legal consultation with our AI assistant
                </p>
                <Button className="w-full sm:w-auto">
                  Start New Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  {t('history')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  View your previous legal conversations
                </p>
                <Button variant="outline" className="w-full sm:w-auto">
                  View History
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Coming Soon Card */}
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="text-center max-w-2xl">
                <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  AI Legal Chat Coming Soon
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Interactive chat interface with AI-powered legal assistance, document analysis, and real-time legal guidance
                </p>
                
                {/* Features List */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Real-time Chat
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      AI Analysis
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <History className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Chat History
                    </p>
                  </div>
                </div>

                <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
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

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatDashboardContent />
    </ProtectedRoute>
  );
}


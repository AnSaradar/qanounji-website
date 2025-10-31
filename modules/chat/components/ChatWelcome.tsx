"use client";

import { useTranslations } from 'next-intl';
import { MessageSquare, Brain } from 'lucide-react';

interface ChatWelcomeProps {
  onSendSuggestion?: (suggestion: string) => void;
  className?: string;
}

export function ChatWelcome({ onSendSuggestion, className = "" }: ChatWelcomeProps) {
  const t = useTranslations('chat.welcome');

  const handleSuggestionClick = (suggestion: string) => {
    onSendSuggestion?.(suggestion);
  };

  return (
    <div className={`flex-1 flex items-center justify-center p-8 ${className}`}>
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <div className="mb-12">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-4" dir="auto">
            {t('title')}
          </h1>
          
          <p className="text-xl text-muted-foreground mb-2" dir="auto">
            {t('subtitle')}
          </p>
          
          <p className="text-muted-foreground max-w-2xl mx-auto" dir="auto">
            {t('description')}
          </p>
        </div>

        <div className="mb-12 space-y-4">
          <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            {t('suggestions.title')}
          </h3>

          <div className="flex flex-wrap justify-center gap-4">
            {t.raw('suggestions.items').slice(0, 2).map((suggestion: string, index: number) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-5 py-3 rounded-full border border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                dir="auto"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* No CTA button as requested */}
      </div>
    </div>
  );
}

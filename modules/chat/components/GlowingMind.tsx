"use client";

import { useTranslations, useLocale } from 'next-intl';

interface GlowingMindProps {
  className?: string;
  inline?: boolean; // If true, render compact inline version
}

export function GlowingMind({ className = "", inline = false }: GlowingMindProps) {
  const t = useTranslations('chat.messages');
  const locale = useLocale();
  const thinkingText = t('thinking');

  // Inline version for message bubbles
  if (inline) {
    return (
      <div className={`flex items-center gap-3 ${className}`} aria-label="AI is thinking">
        {/* Glowing Mind Icon - Compact */}
        <div className="relative flex items-center justify-center">
          {/* Outer glow layers - smaller */}
          <div 
            className="absolute inset-0 rounded-full bg-blue-500/30 dark:bg-blue-400/30 blur-xl animate-glow-pulse" 
            style={{ 
              width: '48px', 
              height: '48px', 
              transform: 'translate(-50%, -50%)', 
              left: '50%', 
              top: '50%' 
            }} 
          />
          <div 
            className="absolute inset-0 rounded-full bg-purple-500/20 dark:bg-purple-400/20 blur-lg animate-glow-pulse-delayed" 
            style={{ 
              width: '40px', 
              height: '40px', 
              transform: 'translate(-50%, -50%)', 
              left: '50%', 
              top: '50%' 
            }} 
          />
          
          {/* Brain icon with glow - smaller */}
          <div className="relative z-10 animate-glow-pulse">
            <svg
              className="text-blue-500 dark:text-blue-400 w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' }}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
              />
            </svg>
          </div>
        </div>

        {/* Thinking Text - Inline size */}
        <p 
          className="text-base font-semibold text-gray-700 dark:text-gray-200 animate-text-glow"
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          {thinkingText}
        </p>
      </div>
    );
  }

  // Full version (centered)
  return (
    <div className={`flex flex-col items-center justify-center gap-6 py-8 px-4 ${className}`} aria-label="AI is thinking">
      {/* Glowing Mind Icon */}
      <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
        {/* Outer glow layers */}
        <div 
          className="absolute inset-0 rounded-full bg-blue-500/30 dark:bg-blue-400/30 blur-2xl animate-glow-pulse" 
          style={{ 
            width: '120px', 
            height: '120px', 
            transform: 'translate(-50%, -50%)', 
            left: '50%', 
            top: '50%' 
          }} 
        />
        <div 
          className="absolute inset-0 rounded-full bg-purple-500/20 dark:bg-purple-400/20 blur-xl animate-glow-pulse-delayed" 
          style={{ 
            width: '100px', 
            height: '100px', 
            transform: 'translate(-50%, -50%)', 
            left: '50%', 
            top: '50%' 
          }} 
        />
        
        {/* Brain icon with glow */}
        <div className="relative z-10 animate-glow-pulse">
          <svg
            className="text-blue-500 dark:text-blue-400 w-16 h-16 md:w-20 md:h-20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.6))' }}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
            />
          </svg>
        </div>
      </div>

      {/* Thinking Text - Larger font */}
      <div className="text-center">
        <p 
          className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-700 dark:text-gray-200 animate-text-glow"
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          {thinkingText}
        </p>
      </div>
    </div>
  );
}


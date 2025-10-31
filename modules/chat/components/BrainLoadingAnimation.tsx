"use client";

import { useTranslations } from 'next-intl';

interface BrainLoadingAnimationProps {
  className?: string;
}

export function BrainLoadingAnimation({ className = "" }: BrainLoadingAnimationProps) {
  const t = useTranslations('chat.brain');

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      {/* Brain Icon with Glow Effect */}
      <div className="relative">
        {/* Glow background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 animate-pulse scale-150 blur-xl" />
        
        {/* Brain SVG */}
        <div className="relative z-10">
          <svg
            className="w-16 h-16 text-blue-500 dark:text-blue-400 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
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

      {/* Animated Dots */}
      <div className="flex space-x-1 mt-4 rtl:space-x-reverse">
        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"></div>
      </div>

      {/* Thinking Text */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {t('thinking')}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {t('processing')}
        </p>
      </div>

      {/* Gradient Border Effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 animate-pulse" />
    </div>
  );
}

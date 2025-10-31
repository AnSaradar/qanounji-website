"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bot, Loader2 } from 'lucide-react';

interface StreamingMessageProps {
  content: string;
  isComplete?: boolean;
  className?: string;
}

export function StreamingMessage({ 
  content, 
  isComplete = false, 
  className = "" 
}: StreamingMessageProps) {
  const t = useTranslations('chat.messages');
  const [displayedContent, setDisplayedContent] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  // Typewriter effect
  useEffect(() => {
    if (content.length === 0) {
      setDisplayedContent('');
      return;
    }

    const targetLength = content.length;
    let currentLength = displayedContent.length;

    const typewriter = setInterval(() => {
      if (currentLength < targetLength) {
        currentLength += 1;
        setDisplayedContent(content.slice(0, currentLength));
      } else {
        clearInterval(typewriter);
        setShowCursor(false);
      }
    }, 20); // Adjust speed as needed

    return () => clearInterval(typewriter);
  }, [content]);

  // Cursor blink effect
  useEffect(() => {
    if (isComplete) {
      setShowCursor(false);
      return;
    }

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, [isComplete]);

  return (
    <div className={`flex gap-3 p-4 ${className}`}>
      {/* Assistant Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center">
        <Bot className="w-4 h-4" />
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Message Header */}
        <div className="flex items-center gap-2 mb-1 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">{t('assistant')}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            {!isComplete ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{t('typing')}</span>
              </>
            ) : (
              <span>Completed</span>
            )}
          </div>
        </div>

        {/* Message Bubble */}
        <div className="max-w-[80%] lg:max-w-[70%] bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md px-4 py-2">
          <div className="text-sm leading-relaxed whitespace-pre-wrap" dir="auto">
            {displayedContent}
            {showCursor && !isComplete && (
              <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
            )}
          </div>

          {/* Streaming indicator */}
          {!isComplete && displayedContent.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s] opacity-60"></div>
                <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.15s] opacity-60"></div>
                <div className="w-1 h-1 bg-current rounded-full animate-bounce opacity-60"></div>
              </div>
              <span className="text-xs opacity-60">Streaming...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useTranslations } from 'next-intl';
import { User, Bot, Clock } from 'lucide-react';
import type { Message } from '@/services/chat/chat.types';
import { useChatUtils } from '@/services/chat/chat.hook';

interface ChatMessageProps {
  message: Message;
  className?: string;
}

export function ChatMessage({ message, className = "" }: ChatMessageProps) {
  const t = useTranslations('chat.messages');
  const { formatTimestamp } = useChatUtils();
  
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div 
      className={`
        flex gap-3 p-4 transition-all duration-200 hover:bg-gray-50/50 dark:hover:bg-gray-800/50
        ${isUser ? 'flex-row-reverse' : 'flex-row'}
        ${className}
      `}
    >
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        ${isUser 
          ? 'bg-blue-500 text-white ml-3 rtl:mr-3' 
          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 mr-3 rtl:ml-3'
        }
      `}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={`
        flex-1 min-w-0
        ${isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'}
      `}>
        {/* Message Header */}
        <div className={`
          flex items-center gap-2 mb-1 text-xs text-gray-500 dark:text-gray-400
          ${isUser ? 'flex-row-reverse' : 'flex-row'}
        `}>
          <span className="font-medium">
            {isUser ? t('user') : t('assistant')}
          </span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatTimestamp(message.createdAt)}</span>
          </div>
          
          {/* Token Count for Assistant Messages */}
          {isAssistant && (message.tokensIn || message.tokensOut) && (
            <>
              <span>•</span>
              <span className="text-xs">
                {message.tokensIn && `In: ${message.tokensIn}`}
                {message.tokensIn && message.tokensOut && ' • '}
                {message.tokensOut && `Out: ${message.tokensOut}`}
              </span>
            </>
          )}
        </div>

        {/* Message Bubble */}
        <div className={`
          max-w-[80%] lg:max-w-[70%] rounded-2xl px-4 py-2 break-words
          ${isUser 
            ? 'bg-blue-500 text-white rounded-br-md' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
          }
        `}>
          {/* Message Text */}
          <div 
            className="text-sm leading-relaxed whitespace-pre-wrap"
            dir="auto"
          >
            {message.content}
          </div>

          {/* Tool Information */}
          {message.toolName && (
            <div className={`
              mt-2 pt-2 border-t text-xs opacity-75
              ${isUser 
                ? 'border-blue-400/30' 
                : 'border-gray-300 dark:border-gray-600'
              }
            `}>
              <div className="font-medium">Tool: {message.toolName}</div>
              {message.toolPayload && (
                <div className="mt-1 font-mono text-xs opacity-60">
                  {JSON.stringify(message.toolPayload, null, 2)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error State */}
        {message.role === 'assistant' && !message.content && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2 text-sm text-red-700 dark:text-red-400">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{t('error')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

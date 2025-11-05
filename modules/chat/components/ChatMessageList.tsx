"use client";

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ChatMessage } from './ChatMessage';
import { ThinkingBrain } from './ThinkingBrain';
import { GlowingMind } from './GlowingMind';
import type { Message } from '@/services/chat/chat.types';

interface ChatMessageListProps {
  messages: Message[];
  isLoading?: boolean;
  streamingMessage?: string;
  isThinking?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

export function ChatMessageList({ 
  messages, 
  isLoading = false, 
  streamingMessage = "",
  isThinking = false,
  hasMore = false,
  onLoadMore,
  className = "" 
}: ChatMessageListProps) {
  const t = useTranslations('chat.messages');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('[ChatMessageList] Render - messages count:', messages.length, 'isThinking:', isThinking, 'streamingMessage length:', streamingMessage.length);
  }, [messages, isThinking, streamingMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages, streamingMessage]);

  // Auto-scroll when streaming content changes
  useEffect(() => {
    if (streamingMessage && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [streamingMessage]);

  // Infinite scroll: load older messages when reaching top
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !onLoadMore) return;

    const onScroll = () => {
      if (el.scrollTop <= 48 && hasMore && !isLoading) {
        const prevHeight = el.scrollHeight;
        onLoadMore();
        // After loadMore, restore scroll so content doesn't jump
        setTimeout(() => {
          const newHeight = el.scrollHeight;
          el.scrollTop = newHeight - prevHeight + el.scrollTop;
        }, 50);
      }
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div 
      ref={containerRef}
      className={`flex-1 overflow-y-auto bg-background ${className}`}
      role="log"
      aria-label="Chat messages"
    >
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 && !isLoading && !streamingMessage ? (
          // Empty state - will be handled by parent component
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>No messages yet. Start a conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                className={index === messages.length - 1 ? 'pb-2' : ''}
              />
            ))}

            {/* Streaming Message */}
            {(isThinking || streamingMessage) && (
              <div className="flex gap-3 p-4">
                {/* Assistant Avatar */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center mr-3 rtl:ml-3 rtl:mr-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>

                {/* Streaming Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{t('assistant')}</span>
                    {isThinking && <ThinkingBrain size={12} />}
                  </div>
                  
                  <div className="max-w-[80%] lg:max-w-[70%] bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md px-4 py-2">
                    {streamingMessage ? (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap" dir="auto">
                        {streamingMessage}
                      </div>
                    ) : (
                      /* Show GlowingMind when thinking but no streaming content yet */
                      isThinking && !streamingMessage && (
                        <GlowingMind inline={true} />
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Thin loader row at top for pagination */}
            {hasMore && (
              <div className="flex items-center justify-center py-2 text-xs text-muted-foreground">
                <span>Load previous messages by scrolling up</span>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} className="h-4" />
          </>
        )}
      </div>
    </div>
  );
}

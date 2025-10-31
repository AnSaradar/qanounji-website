"use client";

import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { BrainLoadingAnimation } from './BrainLoadingAnimation';
import type { Message } from '@/services/chat/chat.types';

interface ChatMessageListProps {
  messages: Message[];
  isLoading?: boolean;
  streamingMessage?: string;
  className?: string;
}

export function ChatMessageList({ 
  messages, 
  isLoading = false, 
  streamingMessage = "",
  className = "" 
}: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
            {streamingMessage && (
              <div className="flex gap-3 p-4">
                {/* Assistant Avatar */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>

                {/* Streaming Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Legal Assistant</span>
                    <span>•</span>
                    <span>Typing...</span>
                  </div>
                  
                  <div className="max-w-[80%] lg:max-w-[70%] bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md px-4 py-2">
                    <div className="text-sm leading-relaxed whitespace-pre-wrap" dir="auto">
                      {streamingMessage}
                      <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading Animation */}
            {isLoading && !streamingMessage && (
              <BrainLoadingAnimation />
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} className="h-4" />
          </>
        )}
      </div>
    </div>
  );
}

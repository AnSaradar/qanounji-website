"use client";

import { useState, useRef, useEffect } from 'react';
import type { ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Loader2, Paperclip, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  caseAnalysisActive?: boolean;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder,
  maxLength = 2000,
  className = '',
  caseAnalysisActive = false,
}: ChatInputProps) {
  const t = useTranslations('chat.input');
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const isMessageEmpty = !message.trim();
  const isOverLimit = message.length > maxLength;
  const canSend = !disabled && !isMessageEmpty && !isOverLimit;

  return (
    <div className={cn('border-t border-border bg-background p-4', className)}>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl border border-input bg-background/80 dark:bg-background/60 px-3 py-2 flex items-end gap-2 shadow-sm">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled
            className="h-10 w-10 rounded-full text-muted-foreground"
            title={t('uploadDisabled')}
            aria-label={t('uploadDisabled')}
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <div className="flex-1 flex flex-col gap-2">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder={placeholder || t('placeholder')}
              disabled={disabled}
              maxLength={maxLength}
              className={cn(
                'w-full min-h-[44px] max-h-[200px] px-2 py-2 resize-none bg-transparent text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-0 focus:border-none disabled:opacity-50 disabled:cursor-not-allowed overflow-y-hidden'
              )}
              style={{ height: 'auto' }}
              dir="auto"
              rows={1}
            />

            {message.length > maxLength * 0.8 && (
              <div
                className={cn(
                  'text-xs self-end pr-1',
                  isOverLimit ? 'text-red-500' : 'text-muted-foreground'
                )}
              >
                {message.length}/{maxLength}
              </div>
            )}
          </div>

          {caseAnalysisActive && (
            <div
              aria-label="case-analysis-active"
              title={t('tools.fullCase')}
              className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center"
            >
              <Brain className="h-5 w-5" />
            </div>
          )}

          <Button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            size="icon"
            className={cn(
              'h-10 w-10 rounded-full transition-colors duration-200',
              canSend
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground'
            )}
            aria-label={t('send')}
          >
            {disabled ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{t('shortcuts.send')}</span>
            <span>{t('shortcuts.newLine')}</span>
          </div>

          {isOverLimit && (
            <span className="text-red-500">{t('maxLength')}</span>
          )}
        </div>
      </div>
    </div>
  );
}

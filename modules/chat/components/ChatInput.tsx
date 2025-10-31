"use client";

import { useState, useRef, useEffect } from 'react';
import type { ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import {
  Send,
  Loader2,
  Paperclip,
  Sparkles,
  Scale,
  FileText,
  XCircle,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type ToolOption = 'fullCase' | 'officialDocument';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  onToolChange?: (tool: ToolOption | null) => void;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder,
  maxLength = 2000,
  className = '',
  onToolChange,
}: ChatInputProps) {
  const t = useTranslations('chat.input');
  const tTools = useTranslations('chat.input.tools');
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolOption | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toolOptions: Array<{
    id: ToolOption;
    label: string;
    icon: ComponentType<{ className?: string }>;
  }> = [
    { id: 'fullCase', label: tTools('fullCase'), icon: Scale },
    { id: 'officialDocument', label: tTools('officialDocument'), icon: FileText },
  ];

  const activeToolConfig = activeTool
    ? toolOptions.find((option) => option.id === activeTool)
    : undefined;

  useEffect(() => {
    if (onToolChange) {
      onToolChange(activeTool);
    }
  }, [activeTool, onToolChange]);

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

  const handleToolSelect = (tool: ToolOption) => {
    setActiveTool((prev) => (prev === tool ? null : tool));
  };

  const clearActiveTool = () => setActiveTool(null);

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

          {activeToolConfig && (
            <Button
              type="button"
              onClick={clearActiveTool}
              size="icon"
              title={activeToolConfig.label}
              aria-label={activeToolConfig.label}
              className={cn(
                'h-10 w-10 rounded-full',
                activeTool === 'fullCase' && 'bg-blue-500 text-white hover:bg-blue-600',
                activeTool === 'officialDocument' && 'bg-emerald-500 text-white hover:bg-emerald-600'
              )}
            >
              <activeToolConfig.icon className="h-5 w-5" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-muted-foreground"
                aria-label={tTools('toggle')}
                title={tTools('toggle')}
              >
                <Sparkles className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[14rem]">
              {toolOptions.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onSelect={() => handleToolSelect(option.id)}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 text-sm" dir="auto">
                    <option.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{option.label}</span>
                  </div>
                  {activeTool === option.id && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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

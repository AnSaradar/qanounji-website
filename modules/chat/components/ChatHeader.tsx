"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Edit3, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Chat } from '@/services/chat/chat.types';
import { useChatUtils } from '@/services/chat/chat.hook';

interface ChatHeaderProps {
  chat: Chat | null;
  onEditTitle?: (newTitle: string) => void;
  className?: string;
}

export function ChatHeader({ chat, onEditTitle, className = "" }: ChatHeaderProps) {
  const t = useTranslations('chat.header');
  const { formatTimestamp } = useChatUtils();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat?.title || '');

  const handleStartEdit = () => {
    setEditTitle(chat?.title || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editTitle.trim() && editTitle.trim() !== chat?.title && onEditTitle) {
      onEditTitle(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(chat?.title || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!chat) {
    return (
      <div className={`border-b border-border bg-background p-4 ${className}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-lg font-semibold text-foreground">
            {t('title')}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-b border-border bg-background p-4 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Title Section */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-8 text-lg font-semibold"
                  maxLength={50}
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSave}
                  className="h-8 w-8 p-0"
                  aria-label={t('saveTitle')}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  className="h-8 w-8 p-0"
                  aria-label={t('cancelEdit')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-foreground truncate" dir="auto">
                  {chat.title}
                </h1>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleStartEdit}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={t('editTitle')}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Metadata Section */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {/* Language */}
            <div className="flex items-center gap-1">
              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                {chat.lang === 'ar' ? 'عربي' : 'English'}
              </span>
            </div>

            {/* Last Active */}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{t('lastActive')}: {formatTimestamp(chat.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

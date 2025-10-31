"use client";

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Edit3, Trash2, Check, X, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Chat } from '@/services/chat/chat.types';
import { useChatUtils } from '@/services/chat/chat.hook';

interface ChatHistoryItemProps {
  chat: Chat;
  isActive: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onEdit: (newTitle: string) => void;
  onDelete: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}

export function ChatHistoryItem({
  chat,
  isActive,
  isEditing,
  onSelect,
  onEdit,
  onDelete,
  onStartEdit,
  onCancelEdit,
}: ChatHistoryItemProps) {
  const t = useTranslations('chat');
  const { formatTimestamp } = useChatUtils();
  const [editTitle, setEditTitle] = useState(chat.title);
  const [showActions, setShowActions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editTitle.trim() && editTitle.trim() !== chat.title) {
      onEdit(editTitle.trim());
    } else {
      onCancelEdit();
    }
  };

  const handleCancel = () => {
    setEditTitle(chat.title);
    onCancelEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      onSelect();
    }
  };

  return (
    <div
      className={`
        group relative rounded-lg p-3 cursor-pointer transition-all duration-200
        ${isActive 
          ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
          : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
        }
      `}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {isEditing ? (
        // Edit Mode
        <div className="space-y-2">
          <Input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 text-sm"
            maxLength={50}
          />
          <div className="flex gap-1 justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              className="h-6 w-6 p-0"
              aria-label={t('header.saveTitle')}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="h-6 w-6 p-0"
              aria-label={t('header.cancelEdit')}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        // Display Mode
        <>
          {/* Chat Title */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium truncate flex-1" dir="auto">
              {chat.title}
            </h3>
            
            {/* Actions Menu */}
            <div className={`
              flex items-center gap-1 transition-opacity duration-200
              ${showActions || isActive ? 'opacity-100' : 'opacity-0'}
            `}>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartEdit();
                }}
                className="h-6 w-6 p-0 hover:bg-sidebar-accent-foreground/20"
                aria-label={t('accessibility.editChat')}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-500"
                aria-label={t('accessibility.deleteChat')}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Chat Metadata */}
          <div className="mt-2 text-xs text-sidebar-foreground/60">
            <div className="flex items-center justify-between">
              <span className="truncate">
                {chat.lang === 'ar' ? 'عربي' : 'English'}
              </span>
              <span className="shrink-0">
                {formatTimestamp(chat.updatedAt)}
              </span>
            </div>
          </div>

          {/* Active Indicator */}
          {isActive && (
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-sidebar-primary rounded-r-full" />
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, MessageSquare, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatHistoryItem } from './ChatHistoryItem';
import type { Chat } from '@/services/chat/chat.types';

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onEditChat?: (chatId: string, newTitle: string) => void;
  className?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ChatSidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onEditChat,
  className = "",
  isOpen,
  onOpenChange,
}: ChatSidebarProps) {
  const t = useTranslations('chat.sidebar');
  const [internalOpen, setInternalOpen] = useState(false);

  useEffect(() => {
    if (typeof isOpen === 'boolean') {
      return;
    }

    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
      setInternalOpen(true);
    }
  }, [isOpen]);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleEditChat = (chatId: string, newTitle: string) => {
    onEditChat?.(chatId, newTitle);
    setEditingChatId(null);
  };

  const handleDeleteChat = (chatId: string) => {
    setConfirmDeleteId(chatId);
  };

  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen;

  return (
    <>
      {/* Sidebar Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => {
            if (onOpenChange) onOpenChange(false); else setInternalOpen(false);
          }}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed lg:static inset-y-0 z-50
          ltr:left-0 rtl:right-0
          w-64 max-w-[80vw]
          bg-sidebar dark:bg-sidebar
          border-r border-sidebar-border dark:border-sidebar-border
          transform transition-transform duration-300 ease-in-out
          overflow-hidden
          ${open ? 'translate-x-0 lg:w-64' : 'ltr:-translate-x-full rtl:translate-x-full lg:-translate-x-full lg:w-0'}
          ${className}
        `}
        role="navigation"
        aria-label={t('accessibility.sidebar')}
        aria-hidden={!open}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-sidebar-border dark:border-sidebar-border">
            <h2 className="text-lg font-semibold text-sidebar-foreground dark:text-sidebar-foreground mb-4">
              {t('title')}
            </h2>
            
            {/* New Chat Button */}
            <Button 
              onClick={onNewChat}
              className="w-full justify-start gap-2 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
              aria-label={t('accessibility.newChat')}
            >
              <Plus className="h-4 w-4" />
              {t('newChat')}
            </Button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-2">
            {chats.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageSquare className="h-12 w-12 text-sidebar-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-sidebar-foreground/70 mb-2">
                  {t('empty')}
                </p>
                <p className="text-xs text-sidebar-foreground/50">
                  {t('emptyDescription')}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {chats.map((chat) => (
                  <ChatHistoryItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    isEditing={editingChatId === chat.id}
                    onSelect={() => onSelectChat(chat.id)}
                    onEdit={(newTitle: string) => handleEditChat(chat.id, newTitle)}
                    onDelete={() => handleDeleteChat(chat.id)}
                    onStartEdit={() => setEditingChatId(chat.id)}
                    onCancelEdit={() => setEditingChatId(null)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-background text-foreground rounded-xl shadow-lg w-[90%] max-w-sm p-5 border">
            <h3 className="text-base font-semibold mb-2" dir="auto">{t('confirmDelete.title', { default: 'Delete chat?' })}</h3>
            <p className="text-sm text-muted-foreground mb-4" dir="auto">{t('confirmDelete.message', { default: 'Are you sure you want to delete this chat? This cannot be undone.' })}</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>{t('confirmDelete.cancel', { default: 'Cancel' })}</Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  const id = confirmDeleteId;
                  setConfirmDeleteId(null);
                  onDeleteChat(id!);
                }}
              >
                {t('confirmDelete.confirm', { default: 'Delete' })}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

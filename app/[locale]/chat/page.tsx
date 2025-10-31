"use client";

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ProtectedRoute } from '@/components/guards/protected-route';
import { useAuth } from '@/services/auth';
import { useChats, useChatMessages, useActiveChat, useChatHistory, useStreamingAssistant } from '@/services/chat/chat.hook';
import {
  ChatSidebar,
  ChatHeader,
  ChatMessageList,
  ChatInput,
  ChatWelcome,
  ChatTopBar,
} from '@/modules/chat/components';
import chatService from '@/services/chat/chat.service';
import type { CreateChatDto, Chat, Message } from '@/services/chat/chat.types';

function ChatInterface() {
  const t = useTranslations('chat');
  const locale = useLocale();
  const { user } = useAuth();
  
  // Chat state management
  const { chats, createChat, updateChat, deleteChat, isLoading: chatsLoading } = useChats();
  const { activeChatId, activeChat, setActiveChatById, clearActiveChat } = useActiveChat();
  const { messages, sendMessage, isLoading: messagesLoading, loadMore, hasMore, loadMessages, appendMessage } = useChatMessages(activeChatId);
  const { isThinking, streamingMessage, sendMessageWithAI, stop } = useStreamingAssistant();
  const { addToHistory, removeFromHistory } = useChatHistory();

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
      setIsSidebarOpen(true);
    }
  }, []);

  const closeSidebarOnMobile = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  // Initialize with most recent chat if available
  useEffect(() => {
    if (chats.length > 0 && !activeChatId) {
      setActiveChatById(chats[0].id);
      addToHistory(chats[0].id);
    }
  }, [chats, activeChatId, setActiveChatById, addToHistory]);


  // Handle new chat creation
  const handleNewChat = useCallback(async (): Promise<Chat> => {
    try {
      setError(null);
      const createData: CreateChatDto = {
        lang: locale as 'ar' | 'en',
        title: t('header.title'),
      };
      
      const newChat = await createChat(createData);
      setActiveChatById(newChat.id);
      addToHistory(newChat.id);
      closeSidebarOnMobile();
      return newChat;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [createChat, locale, t, setActiveChatById, addToHistory, closeSidebarOnMobile]);

  // Handle chat selection
  const handleSelectChat = useCallback((chatId: string) => {
    setActiveChatById(chatId);
    addToHistory(chatId);
    closeSidebarOnMobile();
  }, [setActiveChatById, addToHistory, closeSidebarOnMobile]);

  // Handle chat deletion
  const handleDeleteChat = useCallback(async (chatId: string) => {
    try {
      await deleteChat(chatId);
      removeFromHistory(chatId);
      
      // If deleted chat was active, clear or select another
      if (chatId === activeChatId) {
        if (chats.length > 1) {
          const nextChat = chats.find(chat => chat.id !== chatId);
          if (nextChat) {
            setActiveChatById(nextChat.id);
          } else {
            clearActiveChat();
          }
        } else {
          clearActiveChat();
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [deleteChat, removeFromHistory, activeChatId, chats, setActiveChatById, clearActiveChat]);

  // Handle chat title edit
  const handleEditChat = useCallback(async (chatId: string, newTitle: string) => {
    try {
      await updateChat(chatId, { title: newTitle });
    } catch (err: any) {
      setError(err.message);
    }
  }, [updateChat]);

  // Handle message sending
  const handleSendMessage = useCallback(async (content: string) => {
    try {
      setError(null);

      let targetChatId = activeChatId;
      if (!targetChatId) {
        const newChat = await handleNewChat();
        targetChatId = newChat.id;
      }

      if (!targetChatId) {
        throw new Error('Unable to determine chat');
      }

      let userMessage: Message;

      if (targetChatId === activeChatId) {
        userMessage = await sendMessage(content);
      } else {
        userMessage = await chatService.sendMessage(targetChatId, content);
        await loadMessages();
      }

      console.log('[ChatPage] Sending message with AI, targetChat:', targetChatId, 'userMessage:', userMessage.id);
      sendMessageWithAI(targetChatId, userMessage.id, {
        onDone: async (assistant) => {
          console.log('[ChatPage] onDone callback, assistant:', assistant);
          if (assistant) {
            console.log('[ChatPage] Appending assistant message');
            appendMessage(assistant);
            // allow React to render the final message before clearing the stream bubble
            setTimeout(() => {
              console.log('[ChatPage] Calling stop() to clear streaming state');
              stop();
            }, 0);
          }
        },
        onError: (message) => {
          console.error('[ChatPage] Streaming error:', message);
          setError(message);
        },
      });
    } catch (err: any) {
      setError(err.message ?? 'Failed to send message');
    }
  }, [activeChatId, handleNewChat, sendMessage, sendMessageWithAI, loadMessages]);

  // Send a starter suggestion: ensure chat exists, then send content
  const handleSendSuggestion = useCallback(async (content: string) => {
    try {
      if (!activeChatId) {
        await handleNewChat();
      }
      await handleSendMessage(content);
    } catch (err: any) {
      setError(err.message);
    }
  }, [activeChatId, handleNewChat, handleSendMessage]);

  // Clear error on user action
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const hasMessages = messages.length > 0;
  const showChatHeader = !!activeChat && hasMessages;
  const showWelcome = !activeChat || !hasMessages;

  return (
    <div className="flex h-screen bg-background" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar Drawer */}
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onEditChat={handleEditChat}
        className=""
        isOpen={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* App/Navigation Bar */}
        <ChatTopBar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((o) => !o)}
        />

        {/* Header */}
        {showChatHeader && (
          <ChatHeader
            chat={activeChat}
            onEditTitle={(newTitle) => handleEditChat(activeChat.id, newTitle)}
          />
        )}

        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {showWelcome ? (
            <div className="flex-1 flex flex-col">
              <ChatWelcome
                className="flex-1"
                onSendSuggestion={handleSendSuggestion}
              />
              {activeChat && (
                <div className="w-full max-w-3xl mx-auto px-6 pb-10">
                  <ChatInput
                    onSend={handleSendMessage}
                    disabled={isThinking}
                    placeholder={t('input.placeholder')}
                    className="border-none bg-transparent p-0"
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Messages List */}
              <ChatMessageList
                messages={messages}
                isLoading={messagesLoading}
                streamingMessage={isThinking ? streamingMessage : ''}
                isThinking={isThinking}
                hasMore={hasMore}
                onLoadMore={loadMore}
              />

              {/* No overlay brain; indicator is inline now */}
            </>
          )}
        </div>

        {/* Input Area */}
        {!showWelcome && activeChat && (
          <ChatInput
            onSend={handleSendMessage}
            disabled={isThinking}
            placeholder={t('input.placeholder')}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <span className="text-sm font-medium">Error:</span>
                  <span className="text-sm">{error}</span>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatInterface />
    </ProtectedRoute>
  );
}


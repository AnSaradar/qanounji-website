"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  const { messages, sendMessage, isLoading: messagesLoading, loadMore, hasMore, loadMessages, appendMessage, startCaseAnalysis, startCaseAnalysisFor } = useChatMessages(activeChatId);
  // Active chat id ref to avoid stale closures in async flows
  const activeChatIdRef = useRef<string | null>(activeChatId);
  useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);
  const { isThinking, streamingMessage, sendMessageWithAI, stop } = useStreamingAssistant();
  const { addToHistory, removeFromHistory } = useChatHistory();

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  type ViewState = 'idle' | 'creatingChat' | 'selectingChat' | 'startingAnalysis' | 'welcomeForEmptyChat' | 'chatReady';
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [pendingChatId, setPendingChatId] = useState<string | null>(null);
  
  // Ref to track if we're programmatically creating/setting a chat (prevents auto-initialization interference)
  const isProgrammaticallySettingChat = useRef(false);
  // Ref to track if initial load has completed
  const hasInitialized = useRef(false);

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

  // Initialize with most recent chat if available (only on initial load)
  useEffect(() => {
    // Skip if we're programmatically setting a chat or if we've already initialized
    if (isProgrammaticallySettingChat.current || hasInitialized.current) {
      return;
    }
    
    // Only auto-initialize if we have chats but no active chat
    if (chats.length > 0 && !activeChatId) {
      hasInitialized.current = true;
      setActiveChatById(chats[0].id);
      addToHistory(chats[0].id);
    } else if (chats.length > 0 || activeChatId) {
      // Mark as initialized if we have chats or an active chat
      hasInitialized.current = true;
    }
  }, [chats, activeChatId, setActiveChatById, addToHistory]);


  // Handle New Chat action from sidebar: do NOT create a chat, just reset view to welcome
  const handleNewChat = useCallback((): void => {
    setError(null);
    setViewState('welcomeForEmptyChat');
    isProgrammaticallySettingChat.current = false;
    hasInitialized.current = true;
    setPendingChatId(null);
    clearActiveChat();
    closeSidebarOnMobile();
  }, [clearActiveChat, closeSidebarOnMobile]);

  // Handle chat selection
  const handleSelectChat = useCallback((chatId: string) => {
    setViewState('selectingChat');
    setPendingChatId(chatId);
    setActiveChatById(chatId);
    addToHistory(chatId);
    closeSidebarOnMobile();
    setTimeout(() => setViewState('chatReady'), 150);
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
        // Create a normal chat on first send if none exists
        isProgrammaticallySettingChat.current = true;
        const createData: CreateChatDto = {
          lang: locale as 'ar' | 'en',
          title: t('header.title'),
        };
        const newChat = await createChat({ ...createData, mode: 'normal' });
        setPendingChatId(newChat.id);
        await setActiveChatById(newChat.id);
        addToHistory(newChat.id);
        isProgrammaticallySettingChat.current = false;
        setViewState('chatReady');
        targetChatId = newChat.id;
      }

      if (!targetChatId) {
        throw new Error('Unable to determine chat');
      }

      let messageResult: Message | { userMessage: Message; assistantMessage: Message };

      if (targetChatId === activeChatId) {
        messageResult = await sendMessage(content);
      } else {
        messageResult = await chatService.sendMessage(targetChatId, content);
        await loadMessages();
      }

      // Check if response has assistantMessage (case analysis mode)
      if (messageResult && 'assistantMessage' in messageResult) {
        // Case analysis mode - assistant message already created, just reload messages
        console.log('[ChatPage] Case analysis mode - assistant message already created');
        appendMessage(messageResult.assistantMessage);
        setTimeout(async () => {
          await loadMessages();
        }, 300);
        return;
      }

      // Regular QA mode - use streaming
      const userMessage = messageResult as Message;
      console.log('[ChatPage] Regular mode - sending message with AI, targetChat:', targetChatId, 'userMessage:', userMessage.id);
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
  }, [activeChatId, sendMessage, sendMessageWithAI, loadMessages, appendMessage, stop, createChat, locale, t, setActiveChatById, addToHistory]);

  // Send a starter suggestion: ensure chat exists, then send content
  const handleSendSuggestion = useCallback(async (content: string) => {
    try {
      // Ensure there's an active normal chat before sending
      if (!activeChatId) {
        isProgrammaticallySettingChat.current = true;
        const createData: CreateChatDto = {
          lang: locale as 'ar' | 'en',
          title: t('header.title'),
        };
        const newChat = await createChat({ ...createData, mode: 'normal' });
        setPendingChatId(newChat.id);
        await setActiveChatById(newChat.id);
        addToHistory(newChat.id);
        isProgrammaticallySettingChat.current = false;
        setViewState('chatReady');
      }
      await handleSendMessage(content);
    } catch (err: any) {
      setError(err.message);
    }
  }, [activeChatId, handleSendMessage, createChat, locale, t, setActiveChatById, addToHistory]);

  // Start a normal chat explicitly (from the welcome page CTA)
  const handleStartNormalChat = useCallback(async () => {
    try {
      setError(null);
      setViewState('creatingChat');
      isProgrammaticallySettingChat.current = true;
      const createData: CreateChatDto = {
        lang: locale as 'ar' | 'en',
        title: t('header.title'),
      };
      const newChat = await createChat({ ...createData, mode: 'normal' });
      const targetChatId = newChat.id;
      setPendingChatId(targetChatId);
      await setActiveChatById(targetChatId);
      addToHistory(targetChatId);
      isProgrammaticallySettingChat.current = false;
      setViewState('chatReady');
    } catch (err: any) {
      isProgrammaticallySettingChat.current = false;
      setError(err.message);
      setViewState('idle');
    }
  }, [createChat, locale, t, setActiveChatById, addToHistory]);

  const handleStartCaseAnalysis = useCallback(async () => {
    try {
      console.log('[ChatPage] handleStartCaseAnalysis called');
      setError(null);
      setViewState('startingAnalysis');
      // Always create new chat for case analysis
      console.log('[ChatPage] Creating new chat for case analysis...');
      isProgrammaticallySettingChat.current = true;
      const createData: CreateChatDto = {
        lang: locale as 'ar' | 'en',
        title: t('header.title'),
      };
      const newChat = await createChat({ ...createData, mode: 'case_analysis' });
      const targetChatId = newChat.id;
      setPendingChatId(targetChatId);
      await setActiveChatById(targetChatId);
      addToHistory(targetChatId);

      console.log('[ChatPage] Starting case analysis for chat:', targetChatId);

      const waitForActive = async (retries = 10) => {
        for (let i = 0; i < retries; i++) {
          if (activeChatIdRef.current === targetChatId) return true;
          await new Promise(r => setTimeout(r, 50));
        }
        return false;
      };
      const isActiveReady = await waitForActive();

      // Always call the explicit variant to avoid race with hook's chatId closure
      const assistantMsg = await startCaseAnalysisFor(targetChatId);
      console.log('[ChatPage] Case analysis started, assistant message:', assistantMsg);
      // Do not append or force-reload; synthetic welcome will render until real messages arrive

      // Reset the flag after everything is complete
      isProgrammaticallySettingChat.current = false;
      setViewState('chatReady');
    } catch (err: any) {
      isProgrammaticallySettingChat.current = false; // Reset on error
      console.error('[ChatPage] Failed to start case analysis:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to start case analysis';
      setError(errorMessage);
      setViewState('idle');
    }
  }, [activeChatId, startCaseAnalysis, loadMessages, appendMessage, setActiveChatById, addToHistory, closeSidebarOnMobile, createChat, locale, t]);

  // Clear error on user action
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const hasMessages = messages.length > 0;
  const showChatHeader = !!activeChat && hasMessages;
  const showWelcome = viewState === 'welcomeForEmptyChat' || (!activeChatId && viewState === 'idle');
  const showLoader = viewState === 'creatingChat' || viewState === 'selectingChat' || viewState === 'startingAnalysis';
  const caseAnalysisActive = viewState === 'startingAnalysis' || false; // becomes true right after starting analysis

  // Compute display messages: inject a synthetic localized welcome for empty case-analysis chats
  const displayMessages = useMemo(() => {
    if (activeChat?.mode === 'case_analysis' && messages.length === 0 && activeChatId) {
      const localizedWelcome = locale === 'ar' ? 'يرجى وصف القضية القانونية بإيجاز.' : 'Please describe the legal case briefly.';

      const synthetic: Message = {
        id: `synthetic-welcome-${activeChatId}`,
        chatId: activeChatId,
        role: 'assistant',
        content: localizedWelcome,
        toolName: undefined,
        toolPayload: undefined,
        tokensIn: undefined,
        tokensOut: undefined,
        createdAt: new Date().toISOString(),
      } as Message;

      return [synthetic];
    }
    return messages;
  }, [messages, activeChat?.mode, activeChatId, locale, t]);

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
                onStartCaseAnalysis={handleStartCaseAnalysis}
                onStartNormalChat={handleStartNormalChat}
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
          ) : showLoader ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Messages List */}
              <ChatMessageList
                messages={displayMessages}
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
            caseAnalysisActive={activeChat?.mode === 'case_analysis'}
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


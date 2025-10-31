/**
 * Chat Hooks
 * React hooks for managing chat state and API interactions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import chatService from './chat.service';
import type {
  Chat,
  Message,
  ChatWithMessages,
  CreateChatDto,
  UpdateChatDto,
  QueryChatsDto,
  UseChatsReturn,
  UseChatMessagesReturn,
  UseStreamingReturn,
  StreamingEvent,
} from './chat.types';

/**
 * Hook for managing chat list
 */
export function useChats(initialQuery: QueryChatsDto = {}): UseChatsReturn {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChats = useCallback(async (query?: QueryChatsDto) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const queryToUse = query || initialQuery;
      const fetchedChats = await chatService.getUserChats(queryToUse);
      setChats(fetchedChats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createChat = useCallback(async (data: CreateChatDto): Promise<Chat> => {
    setError(null);
    
    try {
      const newChat = await chatService.createChat(data);
      setChats(prev => [newChat, ...prev]);
      return newChat;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateChat = useCallback(async (id: string, data: UpdateChatDto): Promise<Chat> => {
    setError(null);
    
    try {
      const updatedChat = await chatService.updateChat(id, data);
      setChats(prev => prev.map(chat => 
        chat.id === id ? updatedChat : chat
      ));
      return updatedChat;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteChat = useCallback(async (id: string): Promise<void> => {
    setError(null);
    
    try {
      await chatService.deleteChat(id);
      setChats(prev => prev.filter(chat => chat.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const refreshChats = useCallback(() => {
    return loadChats();
  }, []);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, []); // Empty dependency array - only run on mount

  return {
    chats,
    isLoading,
    error,
    createChat,
    updateChat,
    deleteChat,
    refreshChats,
  };
}

/**
 * Hook for managing messages in a specific chat
 */
export function useChatMessages(chatId: string | null): UseChatMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedMessages = await chatService.getMessages(chatId);
      setMessages(fetchedMessages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  const sendMessage = useCallback(async (content: string): Promise<Message> => {
    if (!chatId) {
      throw new Error('No active chat selected');
    }

    setError(null);
    
    try {
      const newMessage = await chatService.sendMessage(chatId, content);
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [chatId]);

  // Load messages when chatId changes
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    loadMessages,
  };
}

/**
 * Hook for managing streaming responses
 */
export function useStreamingResponse(): UseStreamingReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const streamRef = useRef<{
    chatId: string;
    onToken: (token: string) => void;
    onError: (error: string) => void;
    onComplete: () => void;
  } | null>(null);

  const startStream = useCallback((chatId: string, message: string) => {
    if (isStreaming) {
      console.warn('Stream already in progress');
      return;
    }

    setIsStreaming(true);
    setCurrentMessage('');
    setError(null);

    const onToken = (token: string) => {
      setCurrentMessage(prev => prev + token);
    };

    const onError = (errorMessage: string) => {
      setError(errorMessage);
      setIsStreaming(false);
      setCurrentMessage('');
    };

    const onComplete = () => {
      setIsStreaming(false);
      setCurrentMessage('');
    };

    // Store stream reference for cleanup
    streamRef.current = {
      chatId,
      onToken,
      onError,
      onComplete,
    };

    // Start the stream
    chatService.startStreamingResponse(chatId, message, onToken, onError, onComplete);
  }, [isStreaming]);

  const stopStream = useCallback(() => {
    if (!isStreaming) {
      return;
    }

    chatService.stopStreamingResponse();
    setIsStreaming(false);
    setCurrentMessage('');
    setError(null);
    streamRef.current = null;
  }, [isStreaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isStreaming) {
        stopStream();
      }
    };
  }, [isStreaming, stopStream]);

  return {
    isStreaming,
    currentMessage,
    error,
    startStream,
    stopStream,
  };
}

/**
 * Hook for managing active chat state
 */
export function useActiveChat() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<ChatWithMessages | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setActiveChatById = useCallback(async (chatId: string | null) => {
    setActiveChatId(chatId);
    
    if (!chatId) {
      setActiveChat(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const chat = await chatService.getChatById(chatId);
      setActiveChat(chat);
    } catch (err: any) {
      setError(err.message);
      setActiveChat(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearActiveChat = useCallback(() => {
    setActiveChatId(null);
    setActiveChat(null);
    setError(null);
  }, []);

  return {
    activeChatId,
    activeChat,
    isLoading,
    error,
    setActiveChatById,
    clearActiveChat,
  };
}

/**
 * Hook for chat utilities (title generation, timestamp formatting)
 */
export function useChatUtils() {
  const locale = useLocale();

  const generateTitle = useCallback((firstMessage: string, maxLength?: number) => {
    return chatService.generateChatTitle(firstMessage, maxLength);
  }, []);

  const formatTimestamp = useCallback((timestamp: string) => {
    return chatService.formatTimestamp(timestamp, locale);
  }, [locale]);

  return {
    generateTitle,
    formatTimestamp,
  };
}

/**
 * Hook for managing chat history with local storage persistence
 */
export function useChatHistory() {
  const [recentChats, setRecentChats] = useState<string[]>([]);
  const STORAGE_KEY = 'qanounji_recent_chats';

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentChats(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load chat history from localStorage:', error);
    }
  }, []);

  const addToHistory = useCallback((chatId: string) => {
    setRecentChats(prev => {
      // Remove if already exists and add to front
      const filtered = prev.filter(id => id !== chatId);
      const newHistory = [chatId, ...filtered].slice(0, 10); // Keep last 10
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.warn('Failed to save chat history to localStorage:', error);
      }
      
      return newHistory;
    });
  }, []);

  const removeFromHistory = useCallback((chatId: string) => {
    setRecentChats(prev => {
      const newHistory = prev.filter(id => id !== chatId);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.warn('Failed to save chat history to localStorage:', error);
      }
      
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setRecentChats([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear chat history from localStorage:', error);
    }
  }, []);

  return {
    recentChats,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}

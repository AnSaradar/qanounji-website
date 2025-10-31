/**
 * Chat Service Types
 * TypeScript interfaces for chat functionality matching backend DTOs
 */

import { Locale } from '@/i18n/config';

// ==================== CORE TYPES ====================

export interface Chat {
  id: string;
  userId: string;
  lang: Locale;
  title: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolName?: string;
  toolPayload?: Record<string, any>;
  tokensIn?: number;
  tokensOut?: number;
  createdAt: string;
}

export interface ChatWithMessages extends Chat {
  messages: Message[];
}

// ==================== REQUEST/RESPONSE DTOs ====================

export interface CreateChatDto {
  lang?: Locale;
  title?: string;
}

export interface UpdateChatDto {
  title?: string;
}

export interface CreateMessageDto {
  content: string;
}

export interface QueryChatsDto {
  filter?: 'active' | 'archived' | 'all';
  page?: number;
  limit?: number;
}

// ==================== UI STATE TYPES ====================

export interface ChatHistoryItem {
  id: string;
  title: string;
  lastMessage?: string;
  lastMessageTime?: string;
  messageCount: number;
  isActive: boolean;
}

export interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  messages: Record<string, Message[]>; // chatId -> messages
  isLoading: boolean;
  error: string | null;
}

export interface MessageState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

// ==================== STREAMING TYPES ====================

export interface StreamingState {
  isStreaming: boolean;
  currentMessage: string;
  chatId: string | null;
  error: string | null;
}

export interface StreamingEvent {
  type: 'token' | 'error' | 'end';
  data: string;
  chatId: string;
  messageId?: string;
}

// ==================== API RESPONSE TYPES ====================

export interface ChatResponse {
  id: string;
  userId: string;
  lang: Locale;
  title: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface MessageResponse {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolName?: string;
  toolPayload?: Record<string, any>;
  tokensIn?: number;
  tokensOut?: number;
  createdAt: string;
}

export interface ChatWithMessagesResponse extends ChatResponse {
  messages: MessageResponse[];
}

// ==================== ERROR TYPES ====================

export interface ChatError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, any>;
}

// ==================== HOOK RETURN TYPES ====================

export interface UseChatsReturn {
  chats: Chat[];
  isLoading: boolean;
  error: string | null;
  createChat: (data: CreateChatDto) => Promise<Chat>;
  updateChat: (id: string, data: UpdateChatDto) => Promise<Chat>;
  deleteChat: (id: string) => Promise<void>;
  refreshChats: () => Promise<void>;
}

export interface UseChatMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<Message>;
  loadMessages: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  appendMessage: (message: Message) => void;
}

export interface UseStreamingReturn {
  isStreaming: boolean;
  currentMessage: string;
  error: string | null;
  startStream: (
    chatId: string,
    userMessageId: string,
    options?: { onDone?: (assistant: Message) => void; onError?: (message: string) => void }
  ) => void;
  stopStream: () => void;
}

// ==================== UTILITY TYPES ====================

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface ChatFilter {
  status: 'active' | 'archived' | 'all';
  search?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total?: number;
}

export interface ChatListItem extends Chat {
  lastMessage?: string;
  lastMessageTime?: string;
  messageCount: number;
}

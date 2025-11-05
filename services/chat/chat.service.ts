/**
 * Chat Service
 * Handles all chat-related API calls to the NestJS backend
 */

import apiClient, { tokenManager } from '../api/client';
import type {
  Chat,
  Message,
  ChatWithMessages,
  CreateChatDto,
  UpdateChatDto,
  CreateMessageDto,
  QueryChatsDto,
  ChatResponse,
  MessageResponse,
  ChatWithMessagesResponse,
  StartCaseAnalysisResponse,
  ApiError,
} from './chat.types';

/**
 * Chat Service Class
 * Provides methods for all chat-related API operations
 */
class ChatService {
  private readonly baseUrl = '/chats';

  /**
   * Create a new chat
   * POST /api/chats
   */
  async createChat(data: CreateChatDto): Promise<Chat> {
    try {
      const response = await apiClient.post<ChatResponse>(this.baseUrl, data);
      return this.mapChatResponse(response.data);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all chats for the current user
   * GET /api/chats?filter=active&page=1&limit=20
   */
  async getUserChats(query: QueryChatsDto = {}): Promise<Chat[]> {
    try {
      const params = new URLSearchParams();
      
      if (query.filter) params.append('filter', query.filter);
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());

      const url = `${this.baseUrl}?${params.toString()}`;
      const response = await apiClient.get<ChatResponse[]>(url);
      
      return response.data.map(chat => this.mapChatResponse(chat));
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific chat by ID
   * GET /api/chats/:id
   */
  async getChatById(id: string): Promise<ChatWithMessages> {
    try {
      const response = await apiClient.get<ChatWithMessagesResponse>(`${this.baseUrl}/${id}`);
      return this.mapChatWithMessagesResponse(response.data);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update a chat
   * PATCH /api/chats/:id
   */
  async updateChat(id: string, data: UpdateChatDto): Promise<Chat> {
    try {
      const response = await apiClient.patch<ChatResponse>(`${this.baseUrl}/${id}`, data);
      return this.mapChatResponse(response.data);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete (archive) a chat
   * DELETE /api/chats/:id
   */
  async deleteChat(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Send a message in a chat
   * POST /api/chats/:chatId/messages
   * Returns either a single Message (regular mode) or both user and assistant messages (case analysis mode)
   */
  async sendMessage(
    chatId: string,
    content: string
  ): Promise<Message | { userMessage: Message; assistantMessage: Message }> {
    try {
      const createMessageDto: CreateMessageDto = { content };
      const response = await apiClient.post<MessageResponse | { userMessage: MessageResponse; assistantMessage: MessageResponse }>(
        `${this.baseUrl}/${chatId}/messages`,
        createMessageDto
      );
      
      // Check if response has assistantMessage (case analysis mode)
      if (response.data && 'assistantMessage' in response.data) {
        return {
          userMessage: this.mapMessageResponse(response.data.userMessage),
          assistantMessage: this.mapMessageResponse(response.data.assistantMessage),
        };
      }
      
      // Regular mode - single message
      return this.mapMessageResponse(response.data as MessageResponse);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async startCaseAnalysis(chatId: string): Promise<{ assistantMessage: Message | null; status: string }> {
    try {
      const response = await apiClient.post<StartCaseAnalysisResponse>(
        `${this.baseUrl}/${chatId}/mode/case-analysis`,
        {},
      );

      const assistantMessage = response.data.assistantMessage
        ? this.mapMessageResponse(response.data.assistantMessage)
        : null;

      return {
        assistantMessage,
        status: response.data.status,
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a starter assistant message (for onboarding)
   * POST /api/chats/:chatId/messages/starter
   */
  async createStarterMessage(chatId: string, content: string): Promise<Message> {
    try {
      const createMessageDto: CreateMessageDto = { content };
      const response = await apiClient.post<MessageResponse>(
        `${this.baseUrl}/${chatId}/messages/starter`,
        createMessageDto
      );
      return this.mapMessageResponse(response.data);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all messages in a chat
   * GET /api/chats/:chatId/messages
   */
  async getMessages(chatId: string, options?: { beforeId?: string; limit?: number }): Promise<Message[]> {
    try {
      const params = new URLSearchParams();
      if (options?.beforeId) params.append('beforeId', options.beforeId);
      if (options?.limit) params.append('limit', String(options.limit));
      const qs = params.toString();
      const url = qs ? `${this.baseUrl}/${chatId}/messages?${qs}` : `${this.baseUrl}/${chatId}/messages`;
      const response = await apiClient.get<MessageResponse[]>(url);
      return response.data.map(message => this.mapMessageResponse(message));
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Start streaming response (placeholder for future implementation)
   * This will be implemented when the backend supports SSE
   */
  async startStreamingResponse(
    chatId: string,
    params: {
      userMessageId: string;
      onToken: (token: string) => void;
      onDone?: (assistant: Message) => void;
      onError: (error: string) => void;
      onComplete: () => void;
    }
  ): Promise<void> {
    // Establish SSE using fetch + ReadableStream so we can send Authorization headers
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const controller = new AbortController();
    (this as any)._streamController = controller; // store for stopStreamingResponse

    try {
      const accessToken = tokenManager.getAccessToken();
      const url = `${API_BASE_URL}${this.baseUrl}/${encodeURIComponent(chatId)}/messages/stream?${new URLSearchParams({ userMessageId: params.userMessageId })}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        credentials: 'include',
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Stream failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      const processChunk = (chunk: string) => {
        buffer += chunk;
        let delimiterIndex = -1;
        let delimiterLength = 0;

        const findDelimiter = () => {
          const idxUnix = buffer.indexOf('\n\n');
          if (idxUnix !== -1) {
            delimiterIndex = idxUnix;
            delimiterLength = 2;
            return true;
          }
          const idxWin = buffer.indexOf('\r\n\r\n');
          if (idxWin !== -1) {
            delimiterIndex = idxWin;
            delimiterLength = 4;
            return true;
          }
          return false;
        };

        while (findDelimiter()) {
          const eventBlock = buffer.slice(0, delimiterIndex);
          buffer = buffer.slice(delimiterIndex + delimiterLength);
          const lines = eventBlock.split(/\r?\n/);
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data:')) {
              const dataStr = trimmed.slice(5).trim();
              try {
                const parsed = JSON.parse(dataStr);
                console.log('[ChatService] SSE event received:', parsed);
                
                // NestJS wraps SSE data in a 'data' property, unwrap it
                const evt = parsed.data || parsed;
                console.log('[ChatService] Unwrapped event:', evt);
                
                if (evt?.type === 'token' && typeof evt.chunk === 'string') {
                  console.log('[ChatService] Token chunk:', evt.chunk);
                  params.onToken(evt.chunk);
                } else if (evt?.type === 'done' && evt.assistantMessage) {
                  console.log('[ChatService] Done event with assistant message:', evt.assistantMessage);
                  if (params.onDone) {
                    params.onDone(this.mapMessageResponse(evt.assistantMessage));
                  }
                } else if (evt?.type === 'error') {
                  console.log('[ChatService] Error event:', evt.message);
                  params.onError(evt.message || 'Streaming error');
                } else {
                  console.warn('[ChatService] Unknown event type:', evt);
                }
              } catch (parseError) {
                // Fallback: treat as raw token
                console.log('[ChatService] Failed to parse SSE data, treating as raw token:', dataStr, parseError);
                if (dataStr) params.onToken(dataStr);
              }
            }
          }
        }
      };

      // Read loop
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const text = decoder.decode(value, { stream: true });
        processChunk(text);
      }

      params.onComplete();
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        // silently ignore
        return;
      }
      params.onError(error?.message || 'Streaming failed');
    }
  }

  /**
   * Stop streaming response
   */
  async stopStreamingResponse(): Promise<void> {
    const controller = (this as any)._streamController as AbortController | undefined;
    if (controller) {
      controller.abort();
      (this as any)._streamController = undefined;
    }
  }

  // ==================== MAPPING METHODS ====================

  /**
   * Map ChatResponse to Chat
   */
  private mapChatResponse(response: ChatResponse): Chat {
    return {
      id: response.id,
      userId: response.userId,
      lang: response.lang,
      title: response.title,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      archivedAt: response.archivedAt,
      mode: response.mode,
    };
  }

  /**
   * Map MessageResponse to Message
   */
  private mapMessageResponse(response: MessageResponse): Message {
    return {
      id: response.id,
      chatId: response.chatId,
      role: response.role,
      content: response.content,
      toolName: response.toolName,
      toolPayload: response.toolPayload,
      tokensIn: response.tokensIn,
      tokensOut: response.tokensOut,
      createdAt: response.createdAt,
    };
  }

  /**
   * Map ChatWithMessagesResponse to ChatWithMessages
   */
  private mapChatWithMessagesResponse(response: ChatWithMessagesResponse): ChatWithMessages {
    return {
      id: response.id,
      userId: response.userId,
      lang: response.lang,
      title: response.title,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      archivedAt: response.archivedAt,
      messages: response.messages.map(message => this.mapMessageResponse(message)),
      mode: (response as any).mode,
    } as any;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Generate a title from the first message
   */
  generateChatTitle(firstMessage: string, maxLength: number = 50): string {
    if (!firstMessage.trim()) {
      return 'New Chat';
    }

    // Remove extra whitespace and get first line
    const cleanMessage = firstMessage.trim().split('\n')[0];
    
    if (cleanMessage.length <= maxLength) {
      return cleanMessage;
    }

    // Truncate and add ellipsis
    return cleanMessage.substring(0, maxLength - 3) + '...';
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: string, locale: string = 'en'): string {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Today - show time
        return date.toLocaleTimeString(locale, { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else if (diffDays === 1) {
        // Yesterday
        return locale === 'ar' ? 'أمس' : 'Yesterday';
      } else if (diffDays < 7) {
        // This week - show day name
        return date.toLocaleDateString(locale, { weekday: 'short' });
      } else {
        // Older - show date
        return date.toLocaleDateString(locale, { 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (error) {
      return timestamp;
    }
  }

  /**
   * Handle API errors and extract meaningful messages
   */
  private handleError(error: any): ApiError {
    if (error.response) {
      // Backend returned an error response
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      const apiError: ApiError = new Error(message);
      apiError.status = error.response.status;
      apiError.code = error.response.data?.code;
      apiError.details = error.response.data?.details;
      return apiError;
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;

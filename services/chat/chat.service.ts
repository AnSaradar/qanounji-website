/**
 * Chat Service
 * Handles all chat-related API calls to the NestJS backend
 */

import apiClient from '../api/client';
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
   */
  async sendMessage(chatId: string, content: string): Promise<Message> {
    try {
      const createMessageDto: CreateMessageDto = { content };
      const response = await apiClient.post<MessageResponse>(
        `${this.baseUrl}/${chatId}/messages`,
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
  async getMessages(chatId: string): Promise<Message[]> {
    try {
      const response = await apiClient.get<MessageResponse[]>(`${this.baseUrl}/${chatId}/messages`);
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
    message: string,
    onToken: (token: string) => void,
    onError: (error: string) => void,
    onComplete: () => void
  ): Promise<void> {
    try {
      // Placeholder implementation
      // In the future, this will establish an SSE connection
      console.log('Streaming not yet implemented', { chatId, message });
      
      // Simulate a delayed response for now
      setTimeout(() => {
        const mockResponse = "This is a placeholder response. The streaming feature will be implemented when the backend supports SSE.";
        mockResponse.split('').forEach((char, index) => {
          setTimeout(() => onToken(char), index * 50);
        });
        setTimeout(onComplete, mockResponse.length * 50 + 1000);
      }, 1000);
      
    } catch (error: any) {
      onError(error.message);
    }
  }

  /**
   * Stop streaming response
   */
  async stopStreamingResponse(): Promise<void> {
    // Placeholder - will close SSE connection in future
    console.log('Stopping stream...');
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
    };
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

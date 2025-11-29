import { api } from './api';

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  lastMessageText?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  otherUser: {
    id: string;
    name: string;
    email: string;
    profile?: {
      photo?: string;
    };
  };
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    profile?: {
      photo?: string;
    };
  };
}

class MessagesService {
  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get('/messages/conversations');
    return response.data;
  }

  /**
   * Get or create conversation with another user
   */
  async getOrCreateConversation(otherUserId: string): Promise<Conversation> {
    const response = await api.get(`/messages/conversations/${otherUserId}`);
    return response.data;
  }

  /**
   * Get messages in a conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await api.get(`/messages/${conversationId}`);
    return response.data;
  }

  /**
   * Send a message
   */
  async sendMessage(receiverId: string, text: string): Promise<Message> {
    const response = await api.post('/messages', {
      receiverId,
      text,
    });
    return response.data;
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/messages/unread/count');
    return response.data.count;
  }
}

export const messagesService = new MessagesService();

import { api } from './api';

export interface Notification {
  id: string;
  type: 'booking' | 'reminder' | 'rating' | 'update' | 'message';
  title: string;
  message: string;
  read: boolean;
  sessionId?: string;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
}

class NotificationsService {
  /**
   * Get all notifications for the current user
   */
  async getAll(): Promise<Notification[]> {
    const response = await api.get('/notifications');
    return response.data;
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/mark-all-read');
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  }
}

export const notificationsService = new NotificationsService();

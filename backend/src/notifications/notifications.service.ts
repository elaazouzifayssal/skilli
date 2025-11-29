import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all notifications for a user
   */
  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    // Verify notification belongs to user
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    // Verify notification belongs to user
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  /**
   * Create a notification
   * This will be called internally by other services (bookings, sessions, etc.)
   */
  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    sessionId?: string;
    bookingId?: string;
  }) {
    return this.prisma.notification.create({
      data,
    });
  }

  /**
   * Create booking notification for provider
   */
  async notifyProviderOfBooking(
    providerId: string,
    sessionTitle: string,
    sessionId: string,
    bookingId: string,
  ) {
    return this.createNotification({
      userId: providerId,
      type: 'booking',
      title: 'Nouvelle réservation',
      message: `Quelqu'un a réservé votre session "${sessionTitle}"`,
      sessionId,
      bookingId,
    });
  }

  /**
   * Create reminder notification for client
   */
  async notifyClientOfUpcomingSession(
    clientId: string,
    sessionTitle: string,
    sessionId: string,
    bookingId: string,
  ) {
    return this.createNotification({
      userId: clientId,
      type: 'reminder',
      title: 'Session dans 1 heure',
      message: `N'oubliez pas votre session "${sessionTitle}" qui commence bientôt`,
      sessionId,
      bookingId,
    });
  }

  /**
   * Create rating notification for provider
   */
  async notifyProviderOfRating(
    providerId: string,
    rating: number,
    sessionId: string,
    bookingId: string,
  ) {
    const stars = '⭐'.repeat(rating);
    return this.createNotification({
      userId: providerId,
      type: 'rating',
      title: 'Nouvelle note reçue',
      message: `Un participant a noté votre session: ${stars}`,
      sessionId,
      bookingId,
    });
  }
}

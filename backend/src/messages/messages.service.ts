import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Get or create a conversation between two users
   */
  async getOrCreateConversation(user1Id: string, user2Id: string) {
    if (user1Id === user2Id) {
      throw new BadRequestException('Cannot create conversation with yourself');
    }

    // Ensure consistent ordering (smaller ID first)
    const [smallerId, largerId] = [user1Id, user2Id].sort();

    // Check if conversation already exists
    let conversation = await this.prisma.conversation.findUnique({
      where: {
        user1Id_user2Id: {
          user1Id: smallerId,
          user2Id: largerId,
        },
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                photo: true,
              },
            },
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                photo: true,
              },
            },
          },
        },
      },
    });

    // Create if doesn't exist
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          user1Id: smallerId,
          user2Id: largerId,
        },
        include: {
          user1: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: {
                select: {
                  photo: true,
                },
              },
            },
          },
          user2: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: {
                select: {
                  photo: true,
                },
              },
            },
          },
        },
      });
    }

    return conversation;
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                photo: true,
              },
            },
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                photo: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    // Transform to add otherUser field for easier frontend handling
    return conversations.map((conv) => ({
      ...conv,
      otherUser: conv.user1Id === userId ? conv.user2 : conv.user1,
      unreadCount: 0, // TODO: Calculate unread count
    }));
  }

  /**
   * Send a message
   */
  async sendMessage(senderId: string, receiverId: string, text: string) {
    if (senderId === receiverId) {
      throw new BadRequestException('Cannot send message to yourself');
    }

    if (!text || !text.trim()) {
      throw new BadRequestException('Message text cannot be empty');
    }

    // Get or create conversation
    const conversation = await this.getOrCreateConversation(senderId, receiverId);

    // Create message
    const message = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        receiverId,
        text: text.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                photo: true,
              },
            },
          },
        },
      },
    });

    // Update conversation's last message
    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageText: text.trim(),
        lastMessageAt: new Date(),
      },
    });

    // Create notification for receiver
    await this.notificationsService.createNotification({
      userId: receiverId,
      type: 'message',
      title: 'Nouveau message',
      message: `${message.sender.name}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`,
    });

    return message;
  }

  /**
   * Get messages in a conversation
   */
  async getConversationMessages(conversationId: string, userId: string) {
    // Verify user is part of conversation
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    // Get messages
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                photo: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        read: false,
      },
      data: { read: true },
    });

    return messages;
  }

  /**
   * Get unread message count for user
   */
  async getUnreadCount(userId: string) {
    return this.prisma.message.count({
      where: {
        receiverId: userId,
        read: false,
      },
    });
  }
}

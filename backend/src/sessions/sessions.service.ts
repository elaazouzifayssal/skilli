import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new session (provider only)
   */
  async create(providerId: string, dto: CreateSessionDto) {
    // Verify user is a provider
    const user = await this.prisma.user.findUnique({
      where: { id: providerId },
    });

    if (!user || !user.isProvider) {
      throw new ForbiddenException('Only providers can create sessions');
    }

    // Validate location for presential sessions
    if (!dto.isOnline && !dto.location) {
      throw new BadRequestException('Location is required for presential sessions');
    }

    return this.prisma.session.create({
      data: {
        providerId,
        ...dto,
        date: new Date(dto.date),
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
      },
    });
  }

  /**
   * Get all sessions with optional filters
   */
  async findAll(filters?: {
    skills?: string[];
    city?: string;
    isOnline?: boolean;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    providerId?: string;
  }) {
    const where: any = {};

    if (filters?.skills && filters.skills.length > 0) {
      where.skills = {
        hasSome: filters.skills,
      };
    }

    if (filters?.city) {
      where.location = {
        contains: filters.city,
        mode: 'insensitive',
      };
    }

    if (filters?.isOnline !== undefined) {
      where.isOnline = filters.isOnline;
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.providerId) {
      where.providerId = filters.providerId;
    }

    return this.prisma.session.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                photo: true,
                city: true,
                rating: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  /**
   * Get session by ID
   */
  async findOne(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
        bookings: {
          select: {
            id: true,
            status: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  /**
   * Update session (provider only)
   */
  async update(sessionId: string, userId: string, dto: UpdateSessionDto) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.providerId !== userId) {
      throw new ForbiddenException('You can only update your own sessions');
    }

    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            profile: true,
          },
        },
      },
    });
  }

  /**
   * Delete session (provider only)
   */
  async remove(sessionId: string, userId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.providerId !== userId) {
      throw new ForbiddenException('You can only delete your own sessions');
    }

    if (session._count.bookings > 0) {
      throw new BadRequestException('Cannot delete session with existing bookings');
    }

    await this.prisma.session.delete({
      where: { id: sessionId },
    });

    return { message: 'Session deleted successfully' };
  }

  /**
   * Get provider's sessions
   */
  async getProviderSessions(providerId: string) {
    return this.prisma.session.findMany({
      where: { providerId },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }
}

import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RateSessionDto } from './dto/rate-session.dto';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Create a booking (client books a session)
   */
  async create(clientId: string, dto: CreateBookingDto) {
    // Get session details
    const session = await this.prisma.session.findUnique({
      where: { id: dto.sessionId },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                status: { in: ['pending', 'confirmed'] },
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check if client is trying to book their own session
    if (session.providerId === clientId) {
      throw new BadRequestException('You cannot book your own session');
    }

    // Check if session is full
    if (session._count.bookings >= session.maxParticipants) {
      throw new BadRequestException('Session is fully booked');
    }

    // Check if session has already passed
    if (new Date(session.date) < new Date()) {
      throw new BadRequestException('Cannot book a session that has already passed');
    }

    // Check if client has already booked this session
    const existingBooking = await this.prisma.booking.findUnique({
      where: {
        sessionId_clientId: {
          sessionId: dto.sessionId,
          clientId,
        },
      },
    });

    if (existingBooking) {
      throw new BadRequestException('You have already booked this session');
    }

    // Create booking (in real app, this would happen after payment)
    const booking = await this.prisma.booking.create({
      data: {
        sessionId: dto.sessionId,
        clientId,
        amount: session.price,
        status: 'confirmed', // For MVP, auto-confirm. In production, would be 'pending' until payment
        paymentStatus: 'paid', // For MVP. In production, would process payment first
      },
      include: {
        session: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Notify provider of new booking
    await this.notificationsService.notifyProviderOfBooking(
      session.providerId,
      session.title,
      session.id,
      booking.id,
    );

    return booking;
  }

  /**
   * Get user's bookings (as client)
   */
  async getMyBookings(clientId: string) {
    return this.prisma.booking.findMany({
      where: { clientId },
      include: {
        session: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                profile: {
                  select: {
                    photo: true,
                    city: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get bookings for provider's sessions
   */
  async getProviderBookings(providerId: string) {
    return this.prisma.booking.findMany({
      where: {
        session: {
          providerId,
        },
      },
      include: {
        session: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Cancel a booking
   */
  async cancel(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        session: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Only client can cancel their booking
    if (booking.clientId !== userId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    // Check if session hasn't started yet
    if (new Date(booking.session.date) < new Date()) {
      throw new BadRequestException('Cannot cancel a session that has already started');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
    });
  }

  /**
   * Rate a session after completion
   */
  async rateSession(bookingId: string, userId: string, dto: RateSessionDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        session: {
          include: {
            provider: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.clientId !== userId) {
      throw new ForbiddenException('You can only rate sessions you attended');
    }

    if (booking.status !== 'completed') {
      throw new BadRequestException('You can only rate completed sessions');
    }

    // Update booking with rating
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        rating: dto.rating,
        review: dto.review,
      },
    });

    // Update provider's overall rating
    const providerProfile = booking.session.provider.profile;
    if (providerProfile) {
      const newTotalRatings = providerProfile.totalRatings + 1;
      const newRating =
        (providerProfile.rating * providerProfile.totalRatings + dto.rating) / newTotalRatings;

      await this.prisma.providerProfile.update({
        where: { id: providerProfile.id },
        data: {
          rating: newRating,
          totalRatings: newTotalRatings,
        },
      });
    }

    // Notify provider of new rating
    await this.notificationsService.notifyProviderOfRating(
      booking.session.providerId,
      dto.rating,
      booking.session.id,
      booking.id,
    );

    return updatedBooking;
  }
}

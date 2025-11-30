import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Create a new offer for a request
   */
  async createOffer(userId: string, dto: CreateOfferDto) {
    // Check if request exists
    const request = await this.prisma.request.findUnique({
      where: { id: dto.requestId },
      include: {
        requester: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    // Can't offer on your own request
    if (request.requesterId === userId) {
      throw new ForbiddenException('You cannot offer on your own request');
    }

    // Can't offer on cancelled or completed requests
    if (request.status === 'cancelled' || request.status === 'completed') {
      throw new BadRequestException(`Cannot offer on a ${request.status} request`);
    }

    // Check if user is a provider
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.isProvider) {
      throw new ForbiddenException('Only providers can submit offers');
    }

    // Check if provider already submitted an offer for this request
    const existingOffer = await this.prisma.offer.findUnique({
      where: {
        requestId_providerId: {
          requestId: dto.requestId,
          providerId: userId,
        },
      },
    });

    if (existingOffer) {
      throw new ConflictException('You have already submitted an offer for this request');
    }

    // Create the offer
    const offer = await this.prisma.offer.create({
      data: {
        requestId: dto.requestId,
        providerId: userId,
        message: dto.message,
        price: dto.price,
        duration: dto.duration,
        firstAvailableDate: dto.firstAvailableDate ? new Date(dto.firstAvailableDate) : null,
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
        request: {
          select: {
            id: true,
            title: true,
            requesterId: true,
          },
        },
      },
    });

    // Update request status to in_progress if this is the first offer
    const offerCount = await this.prisma.offer.count({
      where: { requestId: dto.requestId },
    });

    if (offerCount === 1 && request.status === 'open') {
      await this.prisma.request.update({
        where: { id: dto.requestId },
        data: { status: 'in_progress' },
      });
    }

    // Send notification to request owner
    await this.notificationsService.createNotification({
      userId: request.requesterId,
      type: 'offer',
      title: 'Nouvelle offre reçue',
      message: `${user.name} a soumis une offre pour votre demande "${request.title}"`,
    });

    return offer;
  }

  /**
   * Get all offers for a specific request
   */
  async getRequestOffers(requestId: string) {
    // Check if request exists
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const offers = await this.prisma.offer.findMany({
      where: {
        requestId,
      },
      orderBy: {
        createdAt: 'desc',
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

    return offers;
  }

  /**
   * Get offers submitted by the current user (provider)
   */
  async getMyOffers(userId: string) {
    const offers = await this.prisma.offer.findMany({
      where: {
        providerId: userId,
      },
      orderBy: {
        createdAt: 'desc',
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
        request: {
          include: {
            requester: {
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

    return offers;
  }

  /**
   * Get a single offer by ID
   */
  async getOfferById(offerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
        request: {
          include: {
            requester: {
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

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }

  /**
   * Update an offer (only by provider who created it)
   */
  async updateOffer(userId: string, offerId: string, dto: UpdateOfferDto) {
    // Check if offer exists
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        request: true,
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Check ownership
    if (offer.providerId !== userId) {
      throw new ForbiddenException('You can only update your own offers');
    }

    // Can't update accepted or rejected offers
    if (offer.status !== 'pending') {
      throw new BadRequestException(`Cannot update ${offer.status} offer`);
    }

    const updatedOffer = await this.prisma.offer.update({
      where: { id: offerId },
      data: dto,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
        request: {
          include: {
            requester: {
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

    return updatedOffer;
  }

  /**
   * Accept an offer (only by request owner)
   */
  async acceptOffer(userId: string, offerId: string) {
    // Get offer with request details
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        request: {
          include: {
            requester: true,
          },
        },
        provider: true,
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Check if user is the request owner
    if (offer.request.requesterId !== userId) {
      throw new ForbiddenException('Only the request owner can accept offers');
    }

    // Check if offer is still pending
    if (offer.status !== 'pending') {
      throw new BadRequestException(`Cannot accept ${offer.status} offer`);
    }

    // Check if request is still open or in_progress
    if (offer.request.status === 'cancelled' || offer.request.status === 'completed') {
      throw new BadRequestException(`Cannot accept offer for ${offer.request.status} request`);
    }

    // Accept the offer and reject all other offers for this request
    await this.prisma.$transaction([
      // Accept this offer
      this.prisma.offer.update({
        where: { id: offerId },
        data: { status: 'accepted' },
      }),
      // Reject all other pending offers for this request
      this.prisma.offer.updateMany({
        where: {
          requestId: offer.requestId,
          id: { not: offerId },
          status: 'pending',
        },
        data: { status: 'rejected' },
      }),
      // Update request status to completed
      this.prisma.request.update({
        where: { id: offer.requestId },
        data: { status: 'completed' },
      }),
    ]);

    // Send notifications
    await Promise.all([
      // Notify the provider whose offer was accepted
      this.notificationsService.createNotification({
        userId: offer.providerId,
        type: 'offer_accepted',
        title: 'Offre acceptée',
        message: `Votre offre pour "${offer.request.title}" a été acceptée par ${offer.request.requester.name}`,
      }),
      // Notify the request owner
      this.notificationsService.createNotification({
        userId: offer.request.requesterId,
        type: 'offer_accepted',
        title: 'Offre acceptée',
        message: `Vous avez accepté l'offre de ${offer.provider.name} pour "${offer.request.title}"`,
      }),
    ]);

    // Return updated offer
    return this.getOfferById(offerId);
  }

  /**
   * Reject an offer (only by request owner)
   */
  async rejectOffer(userId: string, offerId: string) {
    // Get offer with request details
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        request: true,
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Check if user is the request owner
    if (offer.request.requesterId !== userId) {
      throw new ForbiddenException('Only the request owner can reject offers');
    }

    // Check if offer is still pending
    if (offer.status !== 'pending') {
      throw new BadRequestException(`Cannot reject ${offer.status} offer`);
    }

    const rejectedOffer = await this.prisma.offer.update({
      where: { id: offerId },
      data: { status: 'rejected' },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
        request: {
          include: {
            requester: {
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

    return rejectedOffer;
  }

  /**
   * Delete an offer (only by provider who created it, and only if pending)
   */
  async deleteOffer(userId: string, offerId: string) {
    // Check if offer exists
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Check ownership
    if (offer.providerId !== userId) {
      throw new ForbiddenException('You can only delete your own offers');
    }

    // Can only delete pending offers
    if (offer.status !== 'pending') {
      throw new BadRequestException('Can only delete pending offers');
    }

    await this.prisma.offer.delete({
      where: { id: offerId },
    });

    return { message: 'Offer deleted successfully' };
  }
}

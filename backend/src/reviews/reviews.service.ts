import { Injectable, BadRequestException, ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new review for a session
   * Business rules:
   * - User must have attended the session (booking exists with status completed)
   * - User can only review once per session
   */
  async createReview(reviewerId: string, dto: CreateReviewDto) {
    const { sessionId, providerId, rating, comment } = dto;

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Check if session exists
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check if provider exists and owns the session
    if (session.providerId !== providerId) {
      throw new BadRequestException('Provider does not match session provider');
    }

    // Check if user attended the session (booking exists with completed status)
    const booking = await this.prisma.booking.findUnique({
      where: {
        sessionId_clientId: {
          sessionId,
          clientId: reviewerId,
        },
      },
    });

    if (!booking) {
      throw new ForbiddenException('You must attend the session to leave a review');
    }

    // Check if session has passed (either status is completed OR session date has passed)
    const sessionHasPassed = new Date(session.date) < new Date();
    const isCompleted = booking.status === 'completed' || (booking.status === 'confirmed' && sessionHasPassed);

    if (!isCompleted) {
      throw new ForbiddenException('You can only review completed sessions');
    }

    // Check if user already reviewed this session
    const existingReview = await this.prisma.review.findUnique({
      where: {
        reviewerId_sessionId: {
          reviewerId,
          sessionId,
        },
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this session');
    }

    // Create the review
    const review = await this.prisma.review.create({
      data: {
        reviewerId,
        providerId,
        sessionId,
        rating,
        comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Recalculate ratings
    await this.recalculateProviderRating(providerId);
    await this.recalculateSessionRating(sessionId);

    return review;
  }

  /**
   * Update an existing review
   */
  async updateReview(reviewerId: string, reviewId: string, dto: UpdateReviewDto) {
    // Find the review
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Ensure user owns the review
    if (review.reviewerId !== reviewerId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Validate rating if provided
    if (dto.rating && (dto.rating < 1 || dto.rating > 5)) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Update the review
    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: dto,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Recalculate ratings if rating changed
    if (dto.rating) {
      await this.recalculateProviderRating(review.providerId);
      await this.recalculateSessionRating(review.sessionId);
    }

    return updatedReview;
  }

  /**
   * Get all reviews for a provider
   */
  async getProviderReviews(providerId: string) {
    return this.prisma.review.findMany({
      where: { providerId },
      include: {
        reviewer: {
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
        session: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get all reviews for a session
   */
  async getSessionReviews(sessionId: string) {
    return this.prisma.review.findMany({
      where: { sessionId },
      include: {
        reviewer: {
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get all reviews written by a user
   */
  async getMyReviews(userId: string) {
    return this.prisma.review.findMany({
      where: { reviewerId: userId },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Check if user can review a specific session
   */
  async canReviewSession(userId: string, sessionId: string) {
    // Check if booking exists
    const booking = await this.prisma.booking.findUnique({
      where: {
        sessionId_clientId: {
          sessionId,
          clientId: userId,
        },
      },
      include: {
        session: {
          select: {
            date: true,
          },
        },
      },
    });

    if (!booking) {
      return { canReview: false, reason: 'Session not booked' };
    }

    // Check if session has passed (either status is completed OR session date has passed)
    const sessionHasPassed = new Date(booking.session.date) < new Date();
    const isCompleted = booking.status === 'completed' || (booking.status === 'confirmed' && sessionHasPassed);

    if (!isCompleted) {
      return { canReview: false, reason: 'Session not completed yet' };
    }

    // Check if already reviewed
    const existingReview = await this.prisma.review.findUnique({
      where: {
        reviewerId_sessionId: {
          reviewerId: userId,
          sessionId,
        },
      },
    });

    if (existingReview) {
      return { canReview: false, reason: 'Already reviewed', review: existingReview };
    }

    return { canReview: true };
  }

  /**
   * Recalculate provider's average rating and total count
   */
  private async recalculateProviderRating(providerId: string) {
    const result = await this.prisma.review.aggregate({
      where: { providerId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    const rating = result._avg.rating || 0;
    const totalRatings = result._count.rating || 0;

    // Update provider profile
    await this.prisma.providerProfile.updateMany({
      where: { userId: providerId },
      data: {
        rating: Math.round(rating * 10) / 10, // Round to 1 decimal place
        totalRatings,
      },
    });
  }

  /**
   * Recalculate session's average rating and total count
   */
  private async recalculateSessionRating(sessionId: string) {
    const result = await this.prisma.review.aggregate({
      where: { sessionId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    const rating = result._avg.rating || 0;
    const totalRatings = result._count.rating || 0;

    // Update session
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        rating: Math.round(rating * 10) / 10, // Round to 1 decimal place
        totalRatings,
      },
    });
  }
}

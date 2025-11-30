import { Controller, Post, Get, Patch, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * Create a new review
   * POST /api/reviews
   */
  @Post()
  async createReview(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.createReview(req.user.id, createReviewDto);
  }

  /**
   * Update an existing review
   * PATCH /api/reviews/:id
   */
  @Patch(':id')
  async updateReview(
    @Request() req,
    @Param('id') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(req.user.id, reviewId, updateReviewDto);
  }

  /**
   * Get all reviews for a provider
   * GET /api/reviews/provider/:providerId
   */
  @Get('provider/:providerId')
  async getProviderReviews(@Param('providerId') providerId: string) {
    return this.reviewsService.getProviderReviews(providerId);
  }

  /**
   * Get all reviews for a session
   * GET /api/reviews/session/:sessionId
   */
  @Get('session/:sessionId')
  async getSessionReviews(@Param('sessionId') sessionId: string) {
    return this.reviewsService.getSessionReviews(sessionId);
  }

  /**
   * Get reviews written by the logged-in user
   * GET /api/reviews/me
   */
  @Get('me')
  async getMyReviews(@Request() req) {
    return this.reviewsService.getMyReviews(req.user.id);
  }

  /**
   * Check if user can review a session
   * GET /api/reviews/can-review/:sessionId
   */
  @Get('can-review/:sessionId')
  async canReviewSession(@Request() req, @Param('sessionId') sessionId: string) {
    return this.reviewsService.canReviewSession(req.user.id, sessionId);
  }
}

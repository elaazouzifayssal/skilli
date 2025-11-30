import { Controller, Post, Get, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('offers')
@UseGuards(JwtAuthGuard)
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  /**
   * Create a new offer for a request
   * POST /api/offers
   */
  @Post()
  async createOffer(@Request() req, @Body() createOfferDto: CreateOfferDto) {
    return this.offersService.createOffer(req.user.id, createOfferDto);
  }

  /**
   * Get all offers for a specific request
   * GET /api/offers/request/:requestId
   */
  @Get('request/:requestId')
  async getRequestOffers(@Param('requestId') requestId: string) {
    return this.offersService.getRequestOffers(requestId);
  }

  /**
   * Get offers submitted by the logged-in user (provider)
   * GET /api/offers/me
   */
  @Get('me')
  async getMyOffers(@Request() req) {
    return this.offersService.getMyOffers(req.user.id);
  }

  /**
   * Get a single offer by ID
   * GET /api/offers/:id
   */
  @Get(':id')
  async getOfferById(@Param('id') offerId: string) {
    return this.offersService.getOfferById(offerId);
  }

  /**
   * Update an offer (only by provider who created it)
   * PATCH /api/offers/:id
   */
  @Patch(':id')
  async updateOffer(
    @Request() req,
    @Param('id') offerId: string,
    @Body() updateOfferDto: UpdateOfferDto,
  ) {
    return this.offersService.updateOffer(req.user.id, offerId, updateOfferDto);
  }

  /**
   * Accept an offer (only by request owner)
   * PATCH /api/offers/:id/accept
   */
  @Patch(':id/accept')
  async acceptOffer(@Request() req, @Param('id') offerId: string) {
    return this.offersService.acceptOffer(req.user.id, offerId);
  }

  /**
   * Reject an offer (only by request owner)
   * PATCH /api/offers/:id/reject
   */
  @Patch(':id/reject')
  async rejectOffer(@Request() req, @Param('id') offerId: string) {
    return this.offersService.rejectOffer(req.user.id, offerId);
  }

  /**
   * Delete an offer (only by provider who created it, and only if pending)
   * DELETE /api/offers/:id
   */
  @Delete(':id')
  async deleteOffer(@Request() req, @Param('id') offerId: string) {
    return this.offersService.deleteOffer(req.user.id, offerId);
  }
}

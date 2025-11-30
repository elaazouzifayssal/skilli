import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ProviderProfilesService } from './provider-profiles.service';
import { CreateProviderProfileDto, ProfileStatus } from './dto/create-provider-profile.dto';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('provider-profiles')
export class ProviderProfilesController {
  constructor(private readonly providerProfilesService: ProviderProfilesService) {}

  /**
   * Get current user's provider profile
   * GET /api/provider-profiles/me
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@Request() req) {
    try {
      return await this.providerProfilesService.findByUserId(req.user.id);
    } catch (error) {
      // Return null if profile doesn't exist yet (instead of 404)
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create or update current user's provider profile
   * POST /api/provider-profiles/me
   */
  @UseGuards(JwtAuthGuard)
  @Post('me')
  async createOrUpdateMyProfile(@Request() req, @Body() dto: CreateProviderProfileDto) {
    return this.providerProfilesService.createOrUpdate(req.user.id, dto);
  }

  /**
   * Update current user's provider profile
   * PATCH /api/provider-profiles/me
   */
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMyProfile(@Request() req, @Body() dto: UpdateProviderProfileDto) {
    return this.providerProfilesService.update(req.user.id, dto);
  }

  /**
   * Delete current user's provider profile
   * DELETE /api/provider-profiles/me
   */
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteMyProfile(@Request() req) {
    return this.providerProfilesService.delete(req.user.id);
  }

  /**
   * Get all providers with optional filters
   * GET /api/provider-profiles?city=Casablanca&skills=Kafka,React
   */
  @Get()
  async findAll(
    @Query('city') city?: string,
    @Query('skills') skills?: string,
    @Query('level') level?: string,
    @Query('search') search?: string,
    @Query('status') status?: ProfileStatus,
  ) {
    const filters: any = {};

    if (city) filters.city = city;
    if (skills) filters.skills = skills.split(',');
    if (level) filters.level = level;
    if (search) filters.search = search;
    if (status) filters.profileStatus = status;

    return this.providerProfilesService.findAll(filters);
  }

  /**
   * Get provider profile by user ID (public view)
   * GET /api/provider-profiles/:userId
   */
  @Get(':userId')
  async findOne(@Param('userId') userId: string) {
    return this.providerProfilesService.findByUserId(userId);
  }

  // ===== LEGACY ENDPOINTS (for backward compatibility) =====
  // TODO: Remove these once mobile app is updated to use /me endpoints

  /**
   * @deprecated Use POST /me instead
   * Create or become a provider
   * POST /api/provider-profiles
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrUpdate(@Request() req, @Body() dto: CreateProviderProfileDto) {
    return this.providerProfilesService.createOrUpdate(req.user.id, dto);
  }

  /**
   * @deprecated Use PATCH /me instead
   * Update provider profile
   * PUT /api/provider-profiles
   */
  @UseGuards(JwtAuthGuard)
  @Put()
  async update(@Request() req, @Body() dto: UpdateProviderProfileDto) {
    return this.providerProfilesService.update(req.user.id, dto);
  }

  /**
   * @deprecated Use DELETE /me instead
   * Delete provider profile
   * DELETE /api/provider-profiles
   */
  @UseGuards(JwtAuthGuard)
  @Delete()
  async delete(@Request() req) {
    return this.providerProfilesService.delete(req.user.id);
  }

  // ===== ADMIN-ONLY ENDPOINTS =====
  // TODO: Add AdminGuard to these endpoints

  /**
   * Admin: Update verification status for a provider
   * PATCH /api/provider-profiles/:userId/verification
   */
  @UseGuards(JwtAuthGuard) // TODO: Add @UseGuards(AdminGuard)
  @Patch(':userId/verification')
  async updateVerification(
    @Param('userId') userId: string,
    @Body() body: { isPhoneVerified?: boolean; isEmailVerified?: boolean }
  ) {
    return this.providerProfilesService.updateVerificationStatus(userId, body);
  }

  /**
   * Admin: Update profile status for a provider
   * PATCH /api/provider-profiles/:userId/status
   */
  @UseGuards(JwtAuthGuard) // TODO: Add @UseGuards(AdminGuard)
  @Patch(':userId/status')
  async updateStatus(
    @Param('userId') userId: string,
    @Body() body: { status: ProfileStatus }
  ) {
    return this.providerProfilesService.updateProfileStatus(userId, body.status);
  }
}

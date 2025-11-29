import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ProviderProfilesService } from './provider-profiles.service';
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('provider-profiles')
export class ProviderProfilesController {
  constructor(private readonly providerProfilesService: ProviderProfilesService) {}

  /**
   * Create or become a provider
   * POST /api/provider-profiles
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrUpdate(@Request() req, @Body() dto: CreateProviderProfileDto) {
    return this.providerProfilesService.createOrUpdate(req.user.id, dto);
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
  ) {
    const filters: any = {};

    if (city) filters.city = city;
    if (skills) filters.skills = skills.split(',');
    if (level) filters.level = level;
    if (search) filters.search = search;

    return this.providerProfilesService.findAll(filters);
  }

  /**
   * Get current user's provider profile
   * GET /api/provider-profiles/me
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@Request() req) {
    return this.providerProfilesService.findByUserId(req.user.id);
  }

  /**
   * Get provider profile by user ID
   * GET /api/provider-profiles/:userId
   */
  @Get(':userId')
  async findOne(@Param('userId') userId: string) {
    return this.providerProfilesService.findByUserId(userId);
  }

  /**
   * Update provider profile
   * PUT /api/provider-profiles
   */
  @UseGuards(JwtAuthGuard)
  @Put()
  async update(@Request() req, @Body() dto: UpdateProviderProfileDto) {
    return this.providerProfilesService.update(req.user.id, dto);
  }

  /**
   * Delete provider profile
   * DELETE /api/provider-profiles
   */
  @UseGuards(JwtAuthGuard)
  @Delete()
  async delete(@Request() req) {
    return this.providerProfilesService.delete(req.user.id);
  }
}

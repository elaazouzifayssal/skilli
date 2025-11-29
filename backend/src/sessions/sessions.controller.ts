import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  /**
   * Create a new session (provider only)
   * POST /api/sessions
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() dto: CreateSessionDto) {
    return this.sessionsService.create(req.user.id, dto);
  }

  /**
   * Get all sessions with optional filters
   * GET /api/sessions?skills=React,Node.js&city=Casablanca&isOnline=true
   */
  @Get()
  async findAll(
    @Query('skills') skills?: string,
    @Query('city') city?: string,
    @Query('isOnline') isOnline?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('status') status?: string,
    @Query('providerId') providerId?: string,
  ) {
    const filters: any = {};

    if (skills) filters.skills = skills.split(',');
    if (city) filters.city = city;
    if (isOnline) filters.isOnline = isOnline === 'true';
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (status) filters.status = status;
    if (providerId) filters.providerId = providerId;

    return this.sessionsService.findAll(filters);
  }

  /**
   * Get current user's sessions (as provider)
   * GET /api/sessions/my-sessions
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-sessions')
  async getMySessions(@Request() req) {
    return this.sessionsService.getProviderSessions(req.user.id);
  }

  /**
   * Get session by ID
   * GET /api/sessions/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  /**
   * Update session (provider only)
   * PUT /api/sessions/:id
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Request() req, @Body() dto: UpdateSessionDto) {
    return this.sessionsService.update(id, req.user.id, dto);
  }

  /**
   * Delete session (provider only)
   * DELETE /api/sessions/:id
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.sessionsService.remove(id, req.user.id);
  }
}

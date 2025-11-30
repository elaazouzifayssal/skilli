import { Controller, Post, Get, Patch, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { FilterRequestDto } from './dto/filter-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  /**
   * Create a new request
   * POST /api/requests
   */
  @Post()
  async createRequest(@Request() req, @Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.createRequest(req.user.id, createRequestDto);
  }

  /**
   * Get all requests with filters and pagination
   * GET /api/requests
   */
  @Get()
  async getAllRequests(@Query() filters: FilterRequestDto) {
    return this.requestsService.getAllRequests(filters);
  }

  /**
   * Get requests created by the logged-in user
   * GET /api/requests/me
   */
  @Get('me')
  async getMyRequests(@Request() req) {
    return this.requestsService.getMyRequests(req.user.id);
  }

  /**
   * Get a single request by ID
   * GET /api/requests/:id
   */
  @Get(':id')
  async getRequestById(@Param('id') requestId: string) {
    return this.requestsService.getRequestById(requestId);
  }

  /**
   * Update a request
   * PATCH /api/requests/:id
   */
  @Patch(':id')
  async updateRequest(
    @Request() req,
    @Param('id') requestId: string,
    @Body() updateRequestDto: UpdateRequestDto,
  ) {
    return this.requestsService.updateRequest(req.user.id, requestId, updateRequestDto);
  }

  /**
   * Cancel a request
   * PATCH /api/requests/:id/cancel
   */
  @Patch(':id/cancel')
  async cancelRequest(@Request() req, @Param('id') requestId: string) {
    return this.requestsService.cancelRequest(req.user.id, requestId);
  }

  /**
   * Delete a request
   * DELETE /api/requests/:id
   */
  @Delete(':id')
  async deleteRequest(@Request() req, @Param('id') requestId: string) {
    return this.requestsService.deleteRequest(req.user.id, requestId);
  }
}

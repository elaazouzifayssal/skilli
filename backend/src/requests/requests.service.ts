import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { FilterRequestDto } from './dto/filter-request.dto';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new request
   */
  async createRequest(userId: string, dto: CreateRequestDto) {
    // Validate budget range
    if (dto.budgetMin && dto.budgetMax && dto.budgetMin > dto.budgetMax) {
      throw new BadRequestException('budgetMin cannot be greater than budgetMax');
    }

    const request = await this.prisma.request.create({
      data: {
        requesterId: userId,
        title: dto.title,
        description: dto.description,
        skills: dto.skills,
        level: dto.level,
        location: dto.location,
        requestType: dto.requestType,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            offers: true,
          },
        },
      },
    });

    return request;
  }

  /**
   * Get all requests with filters and pagination
   */
  async getAllRequests(filters: FilterRequestDto) {
    const {
      status = 'open',
      requestType,
      skill,
      location,
      minBudget,
      maxBudget,
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    // Status filter (default to open requests)
    if (status) {
      where.status = status;
    }

    // Request type filter
    if (requestType) {
      where.requestType = requestType;
    }

    // Skill filter (check if skill is in skills array)
    if (skill) {
      where.skills = {
        has: skill,
      };
    }

    // Location filter
    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    // Budget filters
    if (minBudget !== undefined) {
      where.budgetMax = {
        gte: minBudget,
      };
    }

    if (maxBudget !== undefined) {
      where.budgetMin = {
        lte: maxBudget,
      };
    }

    const [requests, total] = await Promise.all([
      this.prisma.request.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              offers: true,
            },
          },
        },
      }),
      this.prisma.request.count({ where }),
    ]);

    return {
      requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single request by ID
   */
  async getRequestById(requestId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        offers: {
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  /**
   * Get requests created by the current user
   */
  async getMyRequests(userId: string) {
    const requests = await this.prisma.request.findMany({
      where: {
        requesterId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            offers: true,
          },
        },
      },
    });

    return requests;
  }

  /**
   * Update a request
   */
  async updateRequest(userId: string, requestId: string, dto: UpdateRequestDto) {
    // Check if request exists
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    // Check ownership
    if (request.requesterId !== userId) {
      throw new ForbiddenException('You can only update your own requests');
    }

    // Validate budget range if both are provided
    const budgetMin = dto.budgetMin ?? request.budgetMin;
    const budgetMax = dto.budgetMax ?? request.budgetMax;

    if (budgetMin && budgetMax && budgetMin > budgetMax) {
      throw new BadRequestException('budgetMin cannot be greater than budgetMax');
    }

    const updatedRequest = await this.prisma.request.update({
      where: { id: requestId },
      data: dto,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            offers: true,
          },
        },
      },
    });

    return updatedRequest;
  }

  /**
   * Cancel a request (soft delete - change status to cancelled)
   */
  async cancelRequest(userId: string, requestId: string) {
    // Check if request exists
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    // Check ownership
    if (request.requesterId !== userId) {
      throw new ForbiddenException('You can only cancel your own requests');
    }

    // Check if already cancelled or completed
    if (request.status === 'cancelled' || request.status === 'completed') {
      throw new BadRequestException(`Cannot cancel a ${request.status} request`);
    }

    const cancelledRequest = await this.prisma.request.update({
      where: { id: requestId },
      data: {
        status: 'cancelled',
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            offers: true,
          },
        },
      },
    });

    return cancelledRequest;
  }

  /**
   * Delete a request permanently
   */
  async deleteRequest(userId: string, requestId: string) {
    // Check if request exists
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    // Check ownership
    if (request.requesterId !== userId) {
      throw new ForbiddenException('You can only delete your own requests');
    }

    await this.prisma.request.delete({
      where: { id: requestId },
    });

    return { message: 'Request deleted successfully' };
  }
}

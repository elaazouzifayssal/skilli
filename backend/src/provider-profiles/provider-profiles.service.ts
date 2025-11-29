import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';

@Injectable()
export class ProviderProfilesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create or update provider profile
   * Also marks user as provider
   */
  async createOrUpdate(userId: string, dto: CreateProviderProfileDto) {
    // First, mark user as provider if not already
    await this.prisma.user.update({
      where: { id: userId },
      data: { isProvider: true },
    });

    // Check if profile already exists
    const existingProfile = await this.prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      // Update existing profile
      return this.prisma.providerProfile.update({
        where: { userId },
        data: dto,
      });
    } else {
      // Create new profile
      return this.prisma.providerProfile.create({
        data: {
          userId,
          ...dto,
        },
      });
    }
  }

  /**
   * Get provider profile by user ID
   */
  async findByUserId(userId: string) {
    const profile = await this.prisma.providerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    return profile;
  }

  /**
   * Get all provider profiles with optional filters
   */
  async findAll(filters?: {
    city?: string;
    skills?: string[];
    level?: string;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.city) {
      where.city = filters.city;
    }

    if (filters?.skills && filters.skills.length > 0) {
      where.skills = {
        hasSome: filters.skills,
      };
    }

    if (filters?.level) {
      where.level = filters.level;
    }

    if (filters?.search) {
      where.OR = [
        { bio: { contains: filters.search, mode: 'insensitive' } },
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.providerProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        rating: 'desc',
      },
    });
  }

  /**
   * Update provider profile
   */
  async update(userId: string, dto: UpdateProviderProfileDto) {
    const profile = await this.prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    return this.prisma.providerProfile.update({
      where: { userId },
      data: dto,
    });
  }

  /**
   * Delete provider profile
   * Also removes provider status from user
   */
  async delete(userId: string) {
    const profile = await this.prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    // Delete profile
    await this.prisma.providerProfile.delete({
      where: { userId },
    });

    // Remove provider status
    await this.prisma.user.update({
      where: { id: userId },
      data: { isProvider: false },
    });

    return { message: 'Provider profile deleted successfully' };
  }
}

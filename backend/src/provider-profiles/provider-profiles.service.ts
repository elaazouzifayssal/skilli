import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderProfileDto, ProfileStatus } from './dto/create-provider-profile.dto';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';

@Injectable()
export class ProviderProfilesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Helper method to determine if a provider profile is complete
   * A complete profile has:
   * - At least one category
   * - At least one skill
   * - Teaching format specified
   * - At least one city if teaching format is IN_PERSON or BOTH
   * - Pricing information (hourlyRateType or legacy pricingTier)
   * - Bio with minimum length
   */
  private isProfileComplete(profileData: any): boolean {
    // Check categories (legacy or new)
    const hasCategories =
      (profileData.categories && profileData.categories.length > 0) ||
      (profileData.categoryRelations && profileData.categoryRelations.length > 0);

    // Check skills (legacy or new)
    const hasSkills =
      (profileData.skills && profileData.skills.length > 0) ||
      (profileData.skillRelations && profileData.skillRelations.length > 0);

    // Check teaching format (legacy or new)
    const hasTeachingFormat =
      profileData.teachingFormat ||
      profileData.teachingFormatNew;

    // Check cities requirement for in-person teaching
    const teachingFormat = profileData.teachingFormatNew || profileData.teachingFormat;
    const needsCities =
      teachingFormat === 'IN_PERSON' ||
      teachingFormat === 'BOTH' ||
      teachingFormat === 'presential' ||
      teachingFormat === 'both';

    const hasCitiesIfNeeded = !needsCities ||
      (profileData.cities && profileData.cities.length > 0) ||
      profileData.city; // legacy single city

    // Check pricing
    const hasPricing =
      profileData.hourlyRateType ||
      profileData.pricingTier ||
      profileData.hourlyRate;

    // Check bio
    const hasBio = profileData.bio && profileData.bio.trim().length >= 50;

    return hasCategories && hasSkills && hasTeachingFormat &&
           hasCitiesIfNeeded && hasPricing && hasBio;
  }

  /**
   * Compute the appropriate profile status based on completeness and verification
   */
  private computeProfileStatus(profileData: any, currentStatus?: ProfileStatus): ProfileStatus {
    // If profile is already approved or suspended, keep that status (admin-controlled)
    if (currentStatus === ProfileStatus.APPROVED || currentStatus === ProfileStatus.SUSPENDED) {
      return currentStatus;
    }

    // Determine new status based on completeness
    const isComplete = this.isProfileComplete(profileData);

    if (!isComplete) {
      return ProfileStatus.DRAFT;
    }

    // TODO: Add additional verification checks here
    // For now, complete profiles go to PENDING_REVIEW
    // Future: check isPhoneVerified, isEmailVerified, KYC documents, etc.
    return ProfileStatus.PENDING_REVIEW;
  }

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

    // Compute profile status
    const profileStatus = this.computeProfileStatus(
      dto,
      existingProfile?.profileStatus as ProfileStatus
    );

    // Prepare data with computed status
    const dataWithStatus = {
      ...dto,
      profileStatus,
    };

    if (existingProfile) {
      // Update existing profile
      return this.prisma.providerProfile.update({
        where: { userId },
        data: dataWithStatus,
      });
    } else {
      // Create new profile
      return this.prisma.providerProfile.create({
        data: {
          userId,
          ...dataWithStatus,
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
        // Include relational data for categories and skills
        categoryRelations: {
          include: {
            category: true,
          },
        },
        skillRelations: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    // Add computed field for profile completion
    return {
      ...profile,
      isComplete: this.isProfileComplete(profile),
    };
  }

  /**
   * Get all provider profiles with optional filters
   */
  async findAll(filters?: {
    city?: string;
    skills?: string[];
    level?: string;
    search?: string;
    profileStatus?: ProfileStatus;
  }) {
    const where: any = {};

    // Development mode: Show all profiles when no status filter is provided
    // Production: Uncomment the line below to only show APPROVED profiles
    // where.profileStatus = filters?.profileStatus || ProfileStatus.APPROVED;

    // Only filter by status if explicitly provided
    if (filters?.profileStatus) {
      where.profileStatus = filters.profileStatus;
    }

    if (filters?.city) {
      where.OR = [
        { city: filters.city }, // legacy single city
        { cities: { has: filters.city } }, // new cities array
      ];
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
        categoryRelations: {
          include: {
            category: true,
          },
        },
        skillRelations: {
          include: {
            skill: true,
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

    // Compute new profile status based on updates
    const mergedData = { ...profile, ...dto };
    const profileStatus = this.computeProfileStatus(
      mergedData,
      profile.profileStatus as ProfileStatus
    );

    return this.prisma.providerProfile.update({
      where: { userId },
      data: {
        ...dto,
        profileStatus,
      },
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

  /**
   * Admin-only: Update verification status
   * TODO: Add admin guard when calling this method
   */
  async updateVerificationStatus(
    userId: string,
    updates: {
      isPhoneVerified?: boolean;
      isEmailVerified?: boolean;
    }
  ) {
    const profile = await this.prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    return this.prisma.providerProfile.update({
      where: { userId },
      data: updates,
    });
  }

  /**
   * Admin-only: Update profile status
   * TODO: Add admin guard when calling this method
   */
  async updateProfileStatus(userId: string, status: ProfileStatus) {
    const profile = await this.prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    return this.prisma.providerProfile.update({
      where: { userId },
      data: { profileStatus: status },
    });
  }
}

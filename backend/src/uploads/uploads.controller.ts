import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('uploads')
export class UploadsController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Post('profile-photo')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadProfilePhoto(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Generate the file URL
    const fileUrl = `/uploads/profile-photos/${file.filename}`;

    // Check if user has a provider profile
    const providerProfile = await this.prisma.providerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (providerProfile) {
      // Update provider profile photo
      await this.prisma.providerProfile.update({
        where: { userId: req.user.id },
        data: { photo: fileUrl },
      });
    }

    // Return the file URL
    return {
      message: 'Photo uploaded successfully',
      url: fileUrl,
    };
  }
}

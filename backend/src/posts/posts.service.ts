import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { FilterPostDto } from './dto/filter-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new post (providers only)
   */
  async createPost(userId: string, dto: CreatePostDto) {
    // Check if user is a provider
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.isProvider) {
      throw new ForbiddenException('Only providers can create posts');
    }

    const post = await this.prisma.post.create({
      data: {
        authorId: userId,
        content: dto.content,
        skills: dto.skills,
        category: dto.category,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return post;
  }

  /**
   * Get all posts with filters and pagination
   */
  async getAllPosts(filters: FilterPostDto, userId?: string) {
    const {
      skill,
      category,
      authorId,
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    // Skill filter
    if (skill) {
      where.skills = {
        has: skill,
      };
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // Author filter
    if (authorId) {
      where.authorId = authorId;
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: true,
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
          ...(userId && {
            likes: {
              where: {
                userId,
              },
              select: {
                id: true,
              },
            },
          }),
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    // Add isLiked flag for each post
    const postsWithLikedStatus = posts.map(post => ({
      ...post,
      isLiked: userId ? (post.likes as any[])?.length > 0 : false,
      likes: undefined, // Remove likes array from response
    }));

    return {
      posts: postsWithLikedStatus,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single post by ID
   */
  async getPostById(postId: string, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
        ...(userId && {
          likes: {
            where: {
              userId,
            },
            select: {
              id: true,
            },
          },
        }),
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      ...post,
      isLiked: userId ? (post.likes as any[])?.length > 0 : false,
      likes: undefined,
    };
  }

  /**
   * Get posts by specific user
   */
  async getUserPosts(targetUserId: string, userId?: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        authorId: targetUserId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
        ...(userId && {
          likes: {
            where: {
              userId,
            },
            select: {
              id: true,
            },
          },
        }),
      },
    });

    return posts.map(post => ({
      ...post,
      isLiked: userId ? (post.likes as any[])?.length > 0 : false,
      likes: undefined,
    }));
  }

  /**
   * Get posts by current user
   */
  async getMyPosts(userId: string) {
    return this.getUserPosts(userId, userId);
  }

  /**
   * Like a post
   */
  async likePost(userId: string, postId: string) {
    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if already liked
    const existingLike = await this.prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      throw new ConflictException('You have already liked this post');
    }

    // Create like and increment like count
    await this.prisma.$transaction([
      this.prisma.postLike.create({
        data: {
          postId,
          userId,
        },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return { message: 'Post liked successfully' };
  }

  /**
   * Unlike a post
   */
  async unlikePost(userId: string, postId: string) {
    // Check if like exists
    const existingLike = await this.prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (!existingLike) {
      throw new NotFoundException('Like not found');
    }

    // Delete like and decrement like count
    await this.prisma.$transaction([
      this.prisma.postLike.delete({
        where: {
          id: existingLike.id,
        },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    return { message: 'Post unliked successfully' };
  }

  /**
   * Delete a post (only by author)
   */
  async deletePost(userId: string, postId: string) {
    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check ownership
    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return { message: 'Post deleted successfully' };
  }
}

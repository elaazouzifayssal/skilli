import { Controller, Post, Get, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { FilterPostDto } from './dto/filter-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * Create a new post
   * POST /api/posts
   */
  @Post()
  async createPost(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.postsService.createPost(req.user.id, createPostDto);
  }

  /**
   * Get all posts with filters
   * GET /api/posts
   */
  @Get()
  async getAllPosts(@Query() filters: FilterPostDto, @Request() req) {
    return this.postsService.getAllPosts(filters, req.user.id);
  }

  /**
   * Get posts by current user
   * GET /api/posts/me
   */
  @Get('me')
  async getMyPosts(@Request() req) {
    return this.postsService.getMyPosts(req.user.id);
  }

  /**
   * Get posts by specific user
   * GET /api/posts/user/:userId
   */
  @Get('user/:userId')
  async getUserPosts(@Param('userId') userId: string, @Request() req) {
    return this.postsService.getUserPosts(userId, req.user.id);
  }

  /**
   * Get a single post by ID
   * GET /api/posts/:id
   */
  @Get(':id')
  async getPostById(@Param('id') postId: string, @Request() req) {
    return this.postsService.getPostById(postId, req.user.id);
  }

  /**
   * Like a post
   * POST /api/posts/:id/like
   */
  @Post(':id/like')
  async likePost(@Request() req, @Param('id') postId: string) {
    return this.postsService.likePost(req.user.id, postId);
  }

  /**
   * Unlike a post
   * DELETE /api/posts/:id/unlike
   */
  @Delete(':id/unlike')
  async unlikePost(@Request() req, @Param('id') postId: string) {
    return this.postsService.unlikePost(req.user.id, postId);
  }

  /**
   * Delete a post
   * DELETE /api/posts/:id
   */
  @Delete(':id')
  async deletePost(@Request() req, @Param('id') postId: string) {
    return this.postsService.deletePost(req.user.id, postId);
  }
}

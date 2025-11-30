import api from './api';

export interface Post {
  id: string;
  authorId: string;
  content: string;
  skills: string[];
  category?: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  isLiked: boolean;
  author: {
    id: string;
    name: string;
    email: string;
    profile?: {
      photo?: string;
      city?: string;
      rating?: number;
      totalRatings?: number;
    };
  };
  _count?: {
    likes: number;
  };
}

export interface CreatePostData {
  content: string;
  skills: string[];
  category?: string;
}

export interface FilterPostParams {
  skill?: string;
  category?: string;
  authorId?: string;
  page?: number;
  limit?: number;
}

export const postsService = {
  /**
   * Create a new post
   */
  async createPost(data: CreatePostData): Promise<Post> {
    const response = await api.post('/posts', data);
    return response.data;
  },

  /**
   * Get all posts with filters
   */
  async getAllPosts(params?: FilterPostParams): Promise<{ posts: Post[]; pagination: any }> {
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined)
    ) : {};
    const response = await api.get('/posts', { params: cleanParams });
    return response.data;
  },

  /**
   * Get a single post by ID
   */
  async getPostById(postId: string): Promise<Post> {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  /**
   * Get posts by current user
   */
  async getMyPosts(): Promise<Post[]> {
    const response = await api.get('/posts/me');
    return response.data;
  },

  /**
   * Get posts by specific user
   */
  async getUserPosts(userId: string): Promise<Post[]> {
    const response = await api.get(`/posts/user/${userId}`);
    return response.data;
  },

  /**
   * Like a post
   */
  async likePost(postId: string): Promise<void> {
    await api.post(`/posts/${postId}/like`);
  },

  /**
   * Unlike a post
   */
  async unlikePost(postId: string): Promise<void> {
    await api.delete(`/posts/${postId}/unlike`);
  },

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<void> {
    await api.delete(`/posts/${postId}`);
  },
};

import api from "./api";

export interface Review {
  id: string;
  reviewerId: string;
  providerId: string;
  sessionId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  reviewer: {
    id: string;
    name: string;
    email: string;
    profile?: {
      photo?: string;
    };
  };
  session?: {
    id: string;
    title: string;
    date: string;
  };
  provider?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CanReviewResponse {
  canReview: boolean;
  reason?: string;
  review?: Review;
}

class ReviewsService {
  /**
   * Create a new review
   */
  async createReview(data: {
    sessionId: string;
    providerId: string;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    const response = await api.post("/reviews", data);
    return response.data;
  }

  /**
   * Update an existing review
   */
  async updateReview(
    reviewId: string,
    data: {
      rating?: number;
      comment?: string;
    }
  ): Promise<Review> {
    const response = await api.patch(`/reviews/${reviewId}`, data);
    return response.data;
  }

  /**
   * Get all reviews for a provider
   */
  async getProviderReviews(providerId: string): Promise<Review[]> {
    const response = await api.get(`/reviews/provider/${providerId}`);
    return response.data;
  }

  /**
   * Get all reviews for a session
   */
  async getSessionReviews(sessionId: string): Promise<Review[]> {
    const response = await api.get(`/reviews/session/${sessionId}`);
    return response.data;
  }

  /**
   * Get reviews written by the logged-in user
   */
  async getMyReviews(): Promise<Review[]> {
    const response = await api.get("/reviews/me");
    return response.data;
  }

  /**
   * Check if user can review a session
   */
  async canReviewSession(sessionId: string): Promise<CanReviewResponse> {
    const response = await api.get(`/reviews/can-review/${sessionId}`);
    return response.data;
  }
}

export const reviewsService = new ReviewsService();

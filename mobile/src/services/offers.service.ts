import api from './api';

export interface Offer {
  id: string;
  requestId: string;
  providerId: string;
  message: string;
  price: number;
  duration: number;
  firstAvailableDate?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  provider: {
    id: string;
    name: string;
    email: string;
    profile?: any;
  };
  request?: {
    id: string;
    title: string;
    description: string;
    skills: string[];
    requestType: string;
    budgetMin?: number;
    budgetMax?: number;
    status: string;
    requester: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface CreateOfferData {
  requestId: string;
  message: string;
  price: number;
  duration: number;
  firstAvailableDate?: string;
}

export interface UpdateOfferData {
  message?: string;
  price?: number;
  duration?: number;
  firstAvailableDate?: string;
  status?: string;
}

export const offersService = {
  /**
   * Create a new offer for a request
   */
  async createOffer(data: CreateOfferData): Promise<Offer> {
    const response = await api.post('/offers', data);
    return response.data;
  },

  /**
   * Get all offers for a specific request
   */
  async getRequestOffers(requestId: string): Promise<Offer[]> {
    const response = await api.get(`/offers/request/${requestId}`);
    return response.data;
  },

  /**
   * Get offers submitted by the current user
   */
  async getMyOffers(): Promise<Offer[]> {
    const response = await api.get('/offers/me');
    return response.data;
  },

  /**
   * Get a single offer by ID
   */
  async getOfferById(offerId: string): Promise<Offer> {
    const response = await api.get(`/offers/${offerId}`);
    return response.data;
  },

  /**
   * Update an offer
   */
  async updateOffer(offerId: string, data: UpdateOfferData): Promise<Offer> {
    const response = await api.patch(`/offers/${offerId}`, data);
    return response.data;
  },

  /**
   * Accept an offer
   */
  async acceptOffer(offerId: string): Promise<Offer> {
    const response = await api.patch(`/offers/${offerId}/accept`);
    return response.data;
  },

  /**
   * Reject an offer
   */
  async rejectOffer(offerId: string): Promise<Offer> {
    const response = await api.patch(`/offers/${offerId}/reject`);
    return response.data;
  },

  /**
   * Delete an offer
   */
  async deleteOffer(offerId: string): Promise<void> {
    await api.delete(`/offers/${offerId}`);
  },
};

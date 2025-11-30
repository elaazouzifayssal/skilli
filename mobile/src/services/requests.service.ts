import api from './api';

export interface Request {
  id: string;
  requesterId: string;
  title: string;
  description: string;
  skills: string[];
  level?: string;
  location?: string;
  requestType: string;
  budgetMin?: number;
  budgetMax?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  requester: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    offers: number;
  };
  offers?: any[];
}

export interface CreateRequestData {
  title: string;
  description: string;
  skills: string[];
  level?: string;
  location?: string;
  requestType: string;
  budgetMin?: number;
  budgetMax?: number;
}

export interface UpdateRequestData {
  title?: string;
  description?: string;
  skills?: string[];
  level?: string;
  location?: string;
  requestType?: string;
  budgetMin?: number;
  budgetMax?: number;
  status?: string;
}

export interface FilterRequestParams {
  status?: string;
  requestType?: string;
  skill?: string;
  location?: string;
  minBudget?: number;
  maxBudget?: number;
  page?: number;
  limit?: number;
}

export const requestsService = {
  /**
   * Create a new request
   */
  async createRequest(data: CreateRequestData): Promise<Request> {
    const response = await api.post('/requests', data);
    return response.data;
  },

  /**
   * Get all requests with filters
   */
  async getAllRequests(params?: FilterRequestParams): Promise<{ requests: Request[]; pagination: any }> {
    // Remove undefined values from params
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined)
    ) : {};
    const response = await api.get('/requests', { params: cleanParams });
    return response.data;
  },

  /**
   * Get a single request by ID
   */
  async getRequestById(requestId: string): Promise<Request> {
    const response = await api.get(`/requests/${requestId}`);
    return response.data;
  },

  /**
   * Get requests created by the current user
   */
  async getMyRequests(): Promise<Request[]> {
    const response = await api.get('/requests/me');
    return response.data;
  },

  /**
   * Update a request
   */
  async updateRequest(requestId: string, data: UpdateRequestData): Promise<Request> {
    const response = await api.patch(`/requests/${requestId}`, data);
    return response.data;
  },

  /**
   * Cancel a request
   */
  async cancelRequest(requestId: string): Promise<Request> {
    const response = await api.patch(`/requests/${requestId}/cancel`);
    return response.data;
  },

  /**
   * Delete a request
   */
  async deleteRequest(requestId: string): Promise<void> {
    await api.delete(`/requests/${requestId}`);
  },
};

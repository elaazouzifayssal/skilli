import api from './api';

export interface ProviderProfileData {
  bio?: string;
  city?: string;
  languages?: string[];
  level?: string;
  skills?: string[];
  photo?: string;
}

export const providerProfileService = {
  /**
   * Create or update provider profile (also becomes provider)
   */
  async createOrUpdate(data: ProviderProfileData) {
    const response = await api.post('/provider-profiles', data);
    return response.data;
  },

  /**
   * Get current user's provider profile
   */
  async getMyProfile() {
    const response = await api.get('/provider-profiles/me');
    return response.data;
  },

  /**
   * Get provider profile by user ID
   */
  async getByUserId(userId: string) {
    const response = await api.get(`/provider-profiles/${userId}`);
    return response.data;
  },

  /**
   * Update provider profile
   */
  async update(data: Partial<ProviderProfileData>) {
    const response = await api.put('/provider-profiles', data);
    return response.data;
  },

  /**
   * Delete provider profile
   */
  async delete() {
    const response = await api.delete('/provider-profiles');
    return response.data;
  },

  /**
   * Get all providers with filters
   */
  async getAll(filters?: {
    city?: string;
    skills?: string[];
    level?: string;
    search?: string;
  }) {
    const params: any = {};
    if (filters?.city) params.city = filters.city;
    if (filters?.skills) params.skills = filters.skills.join(',');
    if (filters?.level) params.level = filters.level;
    if (filters?.search) params.search = filters.search;

    const response = await api.get('/provider-profiles', { params });
    return response.data;
  },
};

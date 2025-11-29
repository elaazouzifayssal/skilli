import api from './api';

export const providersService = {
  async getAll(filters?: {
    city?: string;
    skills?: string[];
    level?: string;
  }) {
    const params: any = {};
    if (filters?.city) params.city = filters.city;
    if (filters?.skills) params.skills = filters.skills.join(',');
    if (filters?.level) params.level = filters.level;

    const response = await api.get('/provider-profiles', { params });
    return response.data;
  },

  async getById(userId: string) {
    const response = await api.get(`/provider-profiles/${userId}`);
    return response.data;
  },
};

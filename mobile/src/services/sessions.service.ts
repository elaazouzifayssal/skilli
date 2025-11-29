import api from './api';

export interface SessionData {
  title: string;
  description: string;
  skills: string[];
  date: string; // ISO string
  duration: number;
  isOnline: boolean;
  location?: string;
  price: number;
  maxParticipants: number;
}

export const sessionsService = {
  async create(data: SessionData) {
    const response = await api.post('/sessions', data);
    return response.data;
  },

  async getAll(filters?: {
    skills?: string[];
    city?: string;
    isOnline?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const params: any = {};
    if (filters?.skills) params.skills = filters.skills.join(',');
    if (filters?.city) params.city = filters.city;
    if (filters?.isOnline !== undefined) params.isOnline = filters.isOnline;
    if (filters?.minPrice) params.minPrice = filters.minPrice;
    if (filters?.maxPrice) params.maxPrice = filters.maxPrice;

    const response = await api.get('/sessions', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
  },

  async getMySessions() {
    const response = await api.get('/sessions/my-sessions');
    return response.data;
  },

  async update(id: string, data: Partial<SessionData>) {
    const response = await api.put(`/sessions/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/sessions/${id}`);
    return response.data;
  },

  // Booking methods
  async book(sessionId: string) {
    const response = await api.post('/bookings', { sessionId });
    return response.data;
  },

  async getMyBookings() {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  async cancelBooking(bookingId: string) {
    const response = await api.put(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  async rateSession(bookingId: string, rating: number, review?: string) {
    const response = await api.put(`/bookings/${bookingId}/rate`, { rating, review });
    return response.data;
  },
};

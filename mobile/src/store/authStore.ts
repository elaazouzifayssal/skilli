import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, AuthResponse } from '../services/auth.service';
import { setAuthToken } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  isProvider: boolean;
  isClient: boolean;
  profile?: {
    photo?: string | null;
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadTokens: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,

  /**
   * Login user
   */
  login: async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });

      // Save tokens
      await AsyncStorage.setItem('accessToken', response.accessToken);
      await AsyncStorage.setItem('refreshToken', response.refreshToken);

      // Set auth header
      setAuthToken(response.accessToken);

      // Update state
      set({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
      });
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  /**
   * Register new user
   */
  register: async (name: string, email: string, password: string, phone?: string) => {
    try {
      const response = await authService.register({ name, email, password, phone });

      // Save tokens
      await AsyncStorage.setItem('accessToken', response.accessToken);
      await AsyncStorage.setItem('refreshToken', response.refreshToken);

      // Set auth header
      setAuthToken(response.accessToken);

      // Update state
      set({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
      });
    } catch (error: any) {
      console.error('Register error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      const { refreshToken } = get();

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      // Clear tokens
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');

      // Clear auth header
      setAuthToken(null);

      // Clear state
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  /**
   * Load tokens from storage on app startup
   */
  loadTokens: async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      if (accessToken && refreshToken) {
        // Set auth header
        setAuthToken(accessToken);

        // Load user profile
        try {
          const user = await authService.getProfile();

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Token might be expired, try to refresh
          try {
            const tokens = await authService.refreshToken(refreshToken);
            await AsyncStorage.setItem('accessToken', tokens.accessToken);
            await AsyncStorage.setItem('refreshToken', tokens.refreshToken);

            setAuthToken(tokens.accessToken);
            const user = await authService.getProfile();

            set({
              user,
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (refreshError) {
            // Refresh failed, clear everything
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            setAuthToken(null);

            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Load tokens error:', error);
      set({ isLoading: false });
    }
  },

  /**
   * Update user data
   */
  setUser: (user: User) => {
    set({ user });
  },
}));

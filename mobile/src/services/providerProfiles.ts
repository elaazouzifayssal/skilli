/**
 * Provider Profiles API Client
 *
 * API functions and React Query hooks for interacting with
 * /api/provider-profiles endpoints
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './api';
import {
  ProviderProfile,
  CreateProviderProfilePayload,
} from '../types/providerProfile';

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get current user's provider profile
 * GET /api/provider-profiles/me
 *
 * Returns null if no profile exists yet (instead of throwing 404)
 */
export const getMyProviderProfile = async (): Promise<ProviderProfile | null> => {
  try {
    const response = await api.get<ProviderProfile>('/provider-profiles/me');
    return response.data;
  } catch (error: any) {
    // Backend returns null for non-existent profiles
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Create or update current user's provider profile
 * POST /api/provider-profiles/me
 *
 * This endpoint handles both creation and updates (upsert)
 */
export const upsertMyProviderProfile = async (
  payload: CreateProviderProfilePayload
): Promise<ProviderProfile> => {
  const response = await api.post<ProviderProfile>('/provider-profiles/me', payload);
  return response.data;
};

/**
 * Partial update of current user's provider profile
 * PATCH /api/provider-profiles/me
 */
export const updateMyProviderProfile = async (
  payload: Partial<CreateProviderProfilePayload>
): Promise<ProviderProfile> => {
  const response = await api.patch<ProviderProfile>('/provider-profiles/me', payload);
  return response.data;
};

/**
 * Delete current user's provider profile
 * DELETE /api/provider-profiles/me
 */
export const deleteMyProviderProfile = async (): Promise<{ message: string }> => {
  const response = await api.delete('/provider-profiles/me');
  return response.data;
};

/**
 * Get all approved provider profiles (public)
 * GET /api/provider-profiles
 */
export const getProviderProfiles = async (filters?: {
  city?: string;
  skills?: string[];
  level?: string;
  search?: string;
  status?: string; // Add status filter support
}): Promise<ProviderProfile[]> => {
  const params = new URLSearchParams();

  if (filters?.city) params.append('city', filters.city);
  if (filters?.skills && filters.skills.length > 0) {
    params.append('skills', filters.skills.join(','));
  }
  if (filters?.level) params.append('level', filters.level);
  if (filters?.search) params.append('search', filters.search);

  // Development mode: Show all profiles regardless of status
  // TODO: Remove this in production - only show APPROVED profiles
  // Uncomment the line below to only show approved profiles:
  // if (!filters?.status) params.append('status', 'APPROVED');

  const response = await api.get<ProviderProfile[]>(
    `/provider-profiles${params.toString() ? `?${params.toString()}` : ''}`
  );
  return response.data;
};

/**
 * Get specific provider profile by user ID (public)
 * GET /api/provider-profiles/:userId
 */
export const getProviderProfileByUserId = async (userId: string): Promise<ProviderProfile> => {
  const response = await api.get<ProviderProfile>(`/provider-profiles/${userId}`);
  return response.data;
};

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

// Query keys
export const PROVIDER_PROFILE_KEYS = {
  all: ['providerProfiles'] as const,
  myProfile: () => [...PROVIDER_PROFILE_KEYS.all, 'me'] as const,
  list: (filters?: any) => [...PROVIDER_PROFILE_KEYS.all, 'list', filters] as const,
  detail: (userId: string) => [...PROVIDER_PROFILE_KEYS.all, 'detail', userId] as const,
};

/**
 * Hook to fetch current user's provider profile
 *
 * @example
 * const { data: profile, isLoading, error } = useMyProviderProfileQuery();
 *
 * if (profile) {
 *   // Profile exists
 * } else {
 *   // No profile yet, show onboarding
 * }
 */
export const useMyProviderProfileQuery = () => {
  return useQuery({
    queryKey: PROVIDER_PROFILE_KEYS.myProfile(),
    queryFn: getMyProviderProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook to create or update provider profile
 *
 * @example
 * const mutation = useUpsertMyProviderProfileMutation();
 *
 * const handleSubmit = () => {
 *   mutation.mutate(payload, {
 *     onSuccess: (profile) => {
 *       console.log('Profile saved:', profile);
 *       navigation.navigate('Profile');
 *     },
 *     onError: (error) => {
 *       console.error('Failed to save profile:', error);
 *     },
 *   });
 * };
 */
export const useUpsertMyProviderProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertMyProviderProfile,
    onSuccess: (data) => {
      // Update the cached profile data
      queryClient.setQueryData(PROVIDER_PROFILE_KEYS.myProfile(), data);

      // Invalidate the list to refresh if needed
      queryClient.invalidateQueries({
        queryKey: PROVIDER_PROFILE_KEYS.list(),
      });
    },
  });
};

/**
 * Hook to partially update provider profile
 *
 * @example
 * const mutation = useUpdateMyProviderProfileMutation();
 *
 * mutation.mutate({ bio: 'Updated bio text' });
 */
export const useUpdateMyProviderProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProviderProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(PROVIDER_PROFILE_KEYS.myProfile(), data);
      queryClient.invalidateQueries({
        queryKey: PROVIDER_PROFILE_KEYS.list(),
      });
    },
  });
};

/**
 * Hook to delete provider profile
 *
 * @example
 * const mutation = useDeleteMyProviderProfileMutation();
 *
 * mutation.mutate(undefined, {
 *   onSuccess: () => {
 *     console.log('Profile deleted');
 *     navigation.navigate('Home');
 *   },
 * });
 */
export const useDeleteMyProviderProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMyProviderProfile,
    onSuccess: () => {
      // Clear the cached profile
      queryClient.setQueryData(PROVIDER_PROFILE_KEYS.myProfile(), null);

      // Invalidate the list
      queryClient.invalidateQueries({
        queryKey: PROVIDER_PROFILE_KEYS.list(),
      });
    },
  });
};

/**
 * Hook to fetch list of approved provider profiles (public)
 *
 * @example
 * const { data: providers } = useProviderProfilesQuery({
 *   city: 'Casablanca',
 *   skills: ['React', 'TypeScript'],
 * });
 */
export const useProviderProfilesQuery = (filters?: {
  city?: string;
  skills?: string[];
  level?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: PROVIDER_PROFILE_KEYS.list(filters),
    queryFn: () => getProviderProfiles(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch a specific provider profile by user ID
 *
 * @example
 * const { data: provider } = useProviderProfileQuery(userId);
 */
export const useProviderProfileQuery = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: PROVIDER_PROFILE_KEYS.detail(userId),
    queryFn: () => getProviderProfileByUserId(userId),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

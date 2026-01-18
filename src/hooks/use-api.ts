import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCities,
  fetchCityBySlug,
  fetchEvents,
  fetchEventById,
  fetchBusinesses,
  fetchPromotions,
  login,
  register,
  fetchCurrentUser,
  fetchMyBusiness,
  fetchMyBusinessStats,
  fetchMyBusinessPublications,
  fetchAdminStats,
  fetchAdminUsers,
  updateAdminUser,
  fetchAdminBusinesses,
  updateAdminBusiness,
  verifyBusiness,
  fetchAdminEvents,
  approveEvent,
  rejectEvent,
  fetchAdminPromotions,
  updateAdminPromotion,
  fetchAdminCities,
  createAdminCity,
  updateAdminCity,
  fetchTeamMembers,
  inviteTeamMember,
  updateTeamMemberRole,
  removeTeamMember,
  fetchCityBanners,
  createCityBanner,
  updateCityBanner,
  deleteCityBanner,
  fetchAllBanners,
  fetchPublicCityBanners,
  type City,
  type Event,
  type Business,
  type Promotion,
  type AdminStats,
  type AdminUser,
  type AdminBusiness,
  type AdminEvent,
  type AdminPromotion,
  type BusinessStats,
  type BusinessPublications,
  type TeamData,
  type TeamMember,
  type CityBanner,
} from '@/lib/api';

// Cities hooks
export function useCities() {
  return useQuery<City[]>({
    queryKey: ['cities'],
    queryFn: fetchCities,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useCity(slug: string) {
  return useQuery<City>({
    queryKey: ['city', slug],
    queryFn: () => fetchCityBySlug(slug),
    enabled: !!slug,
  });
}

// Events hooks
export function useEvents(params?: {
  cityId?: string;
  category?: string;
  featured?: boolean;
}) {
  return useQuery<Event[]>({
    queryKey: ['events', params],
    queryFn: () => fetchEvents(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useEvent(id: string) {
  return useQuery<Event>({
    queryKey: ['event', id],
    queryFn: () => fetchEventById(id),
    enabled: !!id,
  });
}

// Businesses hooks
export function useBusinesses(params?: {
  cityId?: string;
  category?: string;
}) {
  return useQuery<Business[]>({
    queryKey: ['businesses', params],
    queryFn: () => fetchBusinesses(params),
    staleTime: 1000 * 60 * 5,
  });
}

// Current user's business hooks
export function useMyBusiness() {
  return useQuery<Business>({
    queryKey: ['myBusiness'],
    queryFn: fetchMyBusiness,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry if user has no business
  });
}

export function useMyBusinessStats() {
  return useQuery<BusinessStats>({
    queryKey: ['myBusinessStats'],
    queryFn: fetchMyBusinessStats,
    staleTime: 1000 * 60 * 2, // 2 minutes for fresher stats
    retry: false,
  });
}

export function useMyBusinessPublications() {
  return useQuery<BusinessPublications>({
    queryKey: ['myBusinessPublications'],
    queryFn: fetchMyBusinessPublications,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: false,
  });
}

// Promotions hooks
export function usePromotions(params?: {
  cityId?: string;
  active?: boolean;
}) {
  return useQuery<Promotion[]>({
    queryKey: ['promotions', params],
    queryFn: () => fetchPromotions(params),
    staleTime: 1000 * 60 * 5,
  });
}

// Auth hooks
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      queryClient.setQueryData(['user'], data.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; password: string; name?: string; phone?: string }) =>
      register(data),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      queryClient.setQueryData(['user'], data.user);
    },
  });
}

// Current user hook - fetches from API to get fresh role data
export function useCurrentUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }
      try {
        const user = await fetchCurrentUser();
        // Update localStorage with fresh user data
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      } catch (error) {
        // If API fails, try to use cached data
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          return JSON.parse(cachedUser);
        }
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    queryClient.setQueryData(['user'], null);
    queryClient.invalidateQueries();
  };
}

// Admin hooks
export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: fetchAdminStats,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useAdminUsers(params?: {
  search?: string;
  role?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => fetchAdminUsers(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { role?: string; isPremium?: boolean } }) =>
      updateAdminUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useAdminBusinesses(params?: {
  search?: string;
  tier?: string;
  verified?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'businesses', params],
    queryFn: () => fetchAdminBusinesses(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { isVerified?: boolean; tier?: string } }) =>
      updateAdminBusiness(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'businesses'] });
    },
  });
}

export function useVerifyBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => verifyBusiness(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'businesses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useAdminEvents(params?: {
  status?: string;
  category?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'events', params],
    queryFn: () => fetchAdminEvents(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useApproveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useRejectEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rejectEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

// Toggle event featured status (only for premium businesses)
export function useToggleEventFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      // This would be an API call in a real app
      // For now, we'll just simulate it
      return { id, isFeatured };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useAdminPromotions(params?: {
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'promotions', params],
    queryFn: () => fetchAdminPromotions(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { isActive?: boolean } }) =>
      updateAdminPromotion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promotions'] });
    },
  });
}

export function useAdminCities() {
  return useQuery({
    queryKey: ['admin', 'cities'],
    queryFn: fetchAdminCities,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      nameKz?: string;
      slug: string;
      region?: string;
      population?: number;
      isActive?: boolean;
    }) => createAdminCity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cities'] });
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });
}

export function useUpdateCity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: {
      name?: string;
      nameKz?: string;
      slug?: string;
      region?: string;
      isActive?: boolean;
    } }) => updateAdminCity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cities'] });
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });
}

// Team hooks (for business cabinet - Premium feature)
export function useTeamMembers() {
  return useQuery<TeamData>({
    queryKey: ['team'],
    queryFn: fetchTeamMembers,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: false,
  });
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; role: 'admin' | 'editor' | 'viewer' }) =>
      inviteTeamMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
}

export function useUpdateTeamMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'admin' | 'editor' | 'viewer' }) =>
      updateTeamMemberRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeTeamMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
}

// City Banners hooks
export function useCityBanners(cityId: string) {
  return useQuery({
    queryKey: ['admin', 'cityBanners', cityId],
    queryFn: () => fetchCityBanners(cityId),
    enabled: !!cityId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateCityBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cityId, data }: {
      cityId: string;
      data: {
        title: string;
        description?: string;
        imageUrl: string;
        link?: string;
        linkType?: string;
        position?: number;
        isActive?: boolean;
        businessId?: string;
        startDate?: string;
        endDate?: string;
      };
    }) => createCityBanner(cityId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cityBanners', variables.cityId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
    },
  });
}

export function useUpdateCityBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cityId, bannerId, data }: {
      cityId: string;
      bannerId: string;
      data: {
        title?: string;
        description?: string;
        imageUrl?: string;
        link?: string;
        linkType?: string;
        position?: number;
        isActive?: boolean;
        businessId?: string | null;
        startDate?: string | null;
        endDate?: string | null;
      };
    }) => updateCityBanner(cityId, bannerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cityBanners', variables.cityId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
    },
  });
}

export function useDeleteCityBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cityId, bannerId }: { cityId: string; bannerId: string }) =>
      deleteCityBanner(cityId, bannerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cityBanners', variables.cityId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
    },
  });
}

export function useAllBanners() {
  return useQuery({
    queryKey: ['admin', 'banners'],
    queryFn: fetchAllBanners,
    staleTime: 1000 * 60 * 2,
  });
}

// Public city banners hook (for displaying on main page)
export function usePublicCityBanners(citySlug: string) {
  return useQuery({
    queryKey: ['cityBanners', citySlug],
    queryFn: () => fetchPublicCityBanners(citySlug),
    enabled: !!citySlug,
    staleTime: 1000 * 60 * 5,
  });
}

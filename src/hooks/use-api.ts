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
  type City,
  type Event,
  type Business,
  type Promotion,
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

// Current user hook
export function useCurrentUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    },
    staleTime: Infinity,
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

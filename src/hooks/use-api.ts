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
  fetchMyBusinessBanner,
  updateMyBusinessBanner,
  deleteMyBusinessBanner,
  type BusinessBannerResponse,
  fetchAdminStats,
  fetchAdminFinance,
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
  fetchCityPhotos,
  createCityPhoto,
  updateCityPhoto,
  deleteCityPhoto,
  fetchPublicCityPhotos,
  // Cashback
  fetchCashbackWallet,
  fetchCashbackTransactions,
  createCashbackPayment,
  fetchCashbackPayments,
  fetchCashbackPaymentById,
  confirmCashbackPayment,
  rejectCashbackPayment,
  fetchCashbackRules,
  fetchCashbackPartners,
  fetchBusinessCashbackStats,
  fetchBusinessCashbackPayments,
  // Referral
  validateReferralCode,
  fetchReferralCode,
  generateReferralCode,
  applyReferralCode,
  fetchReferralStats,
  fetchReferralRewards,
  deactivateReferralCode,
  // Admin Cashback & Referral
  fetchAdminCashbackStats,
  fetchAdminCashbackRules,
  createAdminCashbackRule,
  updateAdminCashbackRule,
  deleteAdminCashbackRule,
  fetchAdminCashbackPayments,
  fetchAdminReferralStats,
  fetchAdminReferralRewards,
  updateAdminReferralReward,
  fetchAdminReferralCodes,
  deactivateAdminReferralCode,
  // New imports for payments, push, reviews, analytics
  fetchMyReferralCode,
  fetchReferralList,
  fetchReferralBonuses,
  requestReferralWithdrawal,
  createPayment,
  fetchPaymentStatus,
  fetchPaymentHistory,
  fetchPricing,
  fetchVapidKey,
  subscribeToPush,
  unsubscribeFromPush,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  createReview,
  fetchBusinessReviews,
  fetchEventReviews,
  fetchReview,
  updateReview,
  deleteReview,
  voteOnReview,
  replyToReview,
  deleteReviewReply,
  fetchMyReviews,
  trackAnalyticsEvent,
  fetchConversionMetrics,
  fetchRevenueMetrics,
  fetchReferralMetrics,
  fetchTrafficMetrics,
  type City,
  type Event,
  type Business,
  type Promotion,
  type AdminStats,
  type AdminFinanceData,
  type AdminUser,
  type AdminBusiness,
  type AdminEvent,
  type AdminPromotion,
  type BusinessStats,
  type BusinessPublications,
  type TeamData,
  type TeamMember,
  type CityBanner,
  type CashbackWallet,
  type CashbackTransaction,
  type CashbackPayment,
  type CashbackRule,
  type CashbackPartner,
  type ReferralStats,
  type ReferralRewards,
  type ReferralCode,
  type Referral,
  type ReferralBonus,
  type Payment,
  type PaymentCreateResponse,
  type PricingInfo,
  type PushNotification,
  type NotificationsResponse,
  type Review,
  type ReviewReply,
  type ReviewsResponse,
  type ConversionMetrics,
  type RevenueMetrics,
  type ReferralMetrics,
  type TrafficMetrics,
  type AnalyticsEventType,
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

// Business banner hooks
export function useMyBusinessBanner() {
  return useQuery<BusinessBannerResponse>({
    queryKey: ['myBusinessBanner'],
    queryFn: fetchMyBusinessBanner,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: false,
  });
}

export function useUpdateMyBusinessBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMyBusinessBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBusinessBanner'] });
    },
  });
}

export function useDeleteMyBusinessBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMyBusinessBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBusinessBanner'] });
    },
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

export function useAdminFinance(period?: string) {
  return useQuery<AdminFinanceData>({
    queryKey: ['admin', 'finance', period],
    queryFn: () => fetchAdminFinance(period),
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

// City Photos hooks (for carousel)
export function useCityPhotos(cityId: string) {
  return useQuery({
    queryKey: ['admin', 'cityPhotos', cityId],
    queryFn: () => fetchCityPhotos(cityId),
    enabled: !!cityId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateCityPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cityId, data }: {
      cityId: string;
      data: {
        title: string;
        imageUrl: string;
        position?: number;
        isActive?: boolean;
      };
    }) => createCityPhoto(cityId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cityPhotos', variables.cityId] });
    },
  });
}

export function useUpdateCityPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cityId, photoId, data }: {
      cityId: string;
      photoId: string;
      data: {
        title?: string;
        imageUrl?: string;
        position?: number;
        isActive?: boolean;
      };
    }) => updateCityPhoto(cityId, photoId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cityPhotos', variables.cityId] });
    },
  });
}

export function useDeleteCityPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cityId, photoId }: { cityId: string; photoId: string }) =>
      deleteCityPhoto(cityId, photoId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cityPhotos', variables.cityId] });
    },
  });
}

// Public city photos hook (for displaying on main page carousel)
export function usePublicCityPhotos(citySlug: string) {
  return useQuery({
    queryKey: ['cityPhotos', citySlug],
    queryFn: () => fetchPublicCityPhotos(citySlug),
    enabled: !!citySlug,
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================
// CASHBACK SYSTEM HOOKS (Premium Users)
// ============================================

export function useCashbackWallet() {
  return useQuery({
    queryKey: ['cashback', 'wallet'],
    queryFn: fetchCashbackWallet,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useCashbackTransactions(params?: { limit?: number; offset?: number; type?: string }) {
  return useQuery({
    queryKey: ['cashback', 'transactions', params],
    queryFn: () => fetchCashbackTransactions(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateCashbackPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      businessId: string;
      totalAmount: number;
      useCashback?: number;
      eventId?: string;
      promotionId?: string;
      notes?: string;
    }) => createCashbackPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashback', 'wallet'] });
      queryClient.invalidateQueries({ queryKey: ['cashback', 'payments'] });
    },
  });
}

export function useCashbackPayments(params?: { limit?: number; offset?: number; status?: string }) {
  return useQuery({
    queryKey: ['cashback', 'payments', params],
    queryFn: () => fetchCashbackPayments(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCashbackPayment(id: string) {
  return useQuery({
    queryKey: ['cashback', 'payment', id],
    queryFn: () => fetchCashbackPaymentById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useConfirmCashbackPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (confirmationCode: string) => confirmCashbackPayment(confirmationCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashback'] });
      queryClient.invalidateQueries({ queryKey: ['business', 'cashback'] });
    },
  });
}

export function useRejectCashbackPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ confirmationCode, reason }: { confirmationCode: string; reason: string }) =>
      rejectCashbackPayment(confirmationCode, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashback'] });
      queryClient.invalidateQueries({ queryKey: ['business', 'cashback'] });
    },
  });
}

export function useCashbackRules(businessId?: string) {
  return useQuery({
    queryKey: ['cashback', 'rules', businessId],
    queryFn: () => fetchCashbackRules(businessId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCashbackPartners(params?: { cityId?: string; category?: string }) {
  return useQuery({
    queryKey: ['cashback', 'partners', params],
    queryFn: () => fetchCashbackPartners(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useBusinessCashbackStats() {
  return useQuery({
    queryKey: ['business', 'cashback', 'stats'],
    queryFn: fetchBusinessCashbackStats,
    staleTime: 1000 * 60 * 2,
  });
}

export function useBusinessCashbackPayments(params?: { limit?: number; offset?: number; status?: string }) {
  return useQuery({
    queryKey: ['business', 'cashback', 'payments', params],
    queryFn: () => fetchBusinessCashbackPayments(params),
    staleTime: 1000 * 60 * 2,
  });
}

// ============================================
// REFERRAL SYSTEM HOOKS (Premium Users)
// ============================================

export function useValidateReferralCode(code: string) {
  return useQuery({
    queryKey: ['referral', 'validate', code],
    queryFn: () => validateReferralCode(code),
    enabled: !!code && code.length >= 4,
    staleTime: 1000 * 60 * 5,
  });
}

export function useReferralCode() {
  return useQuery({
    queryKey: ['referral', 'code'],
    queryFn: fetchReferralCode,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMyReferralCode() {
  return useQuery<ReferralCode>({
    queryKey: ['referral', 'myCode'],
    queryFn: fetchMyReferralCode,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGenerateReferralCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateReferralCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral', 'code'] });
      queryClient.invalidateQueries({ queryKey: ['referral', 'stats'] });
    },
  });
}

export function useApplyReferralCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => applyReferralCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashback', 'wallet'] });
      queryClient.invalidateQueries({ queryKey: ['referral'] });
    },
  });
}

export function useReferralStats() {
  return useQuery({
    queryKey: ['referral', 'stats'],
    queryFn: fetchReferralStats,
    staleTime: 1000 * 60 * 2,
  });
}

export function useReferralList(params?: { limit?: number; offset?: number }) {
  return useQuery<Referral[]>({
    queryKey: ['referral', 'list', params],
    queryFn: () => fetchReferralList(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useReferralBonuses(params?: { limit?: number; offset?: number }) {
  return useQuery<ReferralBonus[]>({
    queryKey: ['referral', 'bonuses', params],
    queryFn: () => fetchReferralBonuses(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useReferralRewards() {
  return useQuery({
    queryKey: ['referral', 'rewards'],
    queryFn: fetchReferralRewards,
    staleTime: 1000 * 60 * 10,
  });
}

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { amount: number; method: 'kaspi' | 'halyk'; accountDetails: string }) =>
      requestReferralWithdrawal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral'] });
    },
  });
}

export function useDeactivateReferralCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateReferralCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral', 'code'] });
      queryClient.invalidateQueries({ queryKey: ['referral', 'stats'] });
    },
  });
}

// ============================================
// PAYMENT HOOKS
// ============================================

export function usePricing() {
  return useQuery<PricingInfo>({
    queryKey: ['pricing'],
    queryFn: fetchPricing,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      provider: 'kaspi' | 'halyk';
      type: 'subscription' | 'premium' | 'banner' | 'other';
      subscriptionType?: 'user_premium' | 'business_lite' | 'business_premium';
      subscriptionPeriod?: 'monthly' | 'yearly';
      amount?: number;
      businessId?: string;
      description?: string;
    }) => createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

export function usePaymentStatus(paymentId: string) {
  return useQuery<Payment>({
    queryKey: ['payment', paymentId],
    queryFn: () => fetchPaymentStatus(paymentId),
    enabled: !!paymentId,
    refetchInterval: (data) => {
      // Refetch every 5 seconds if payment is still pending
      if (data?.status === 'pending' || data?.status === 'processing') {
        return 5000;
      }
      return false;
    },
  });
}

export function usePaymentHistory(params?: { limit?: number; offset?: number }) {
  return useQuery<Payment[]>({
    queryKey: ['payments', 'history', params],
    queryFn: () => fetchPaymentHistory(params),
    staleTime: 1000 * 60 * 2,
  });
}

// ============================================
// PUSH NOTIFICATION HOOKS
// ============================================

export function useNotifications(params?: { unread?: boolean; limit?: number; offset?: number }) {
  return useQuery<NotificationsResponse>({
    queryKey: ['notifications', params],
    queryFn: () => fetchNotifications(params),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useSubscribeToPush() {
  return useMutation({
    mutationFn: (subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) =>
      subscribeToPush(subscription),
  });
}

export function useUnsubscribeFromPush() {
  return useMutation({
    mutationFn: (endpoint?: string) => unsubscribeFromPush(endpoint),
  });
}

// ============================================
// REVIEW HOOKS
// ============================================

export function useBusinessReviews(
  businessId: string,
  params?: { sort?: 'recent' | 'helpful' | 'rating_high' | 'rating_low'; limit?: number; offset?: number }
) {
  return useQuery<ReviewsResponse>({
    queryKey: ['reviews', 'business', businessId, params],
    queryFn: () => fetchBusinessReviews(businessId, params),
    enabled: !!businessId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useEventReviews(eventId: string, params?: { limit?: number; offset?: number }) {
  return useQuery<ReviewsResponse>({
    queryKey: ['reviews', 'event', eventId, params],
    queryFn: () => fetchEventReviews(eventId, params),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useReview(id: string) {
  return useQuery({
    queryKey: ['review', id],
    queryFn: () => fetchReview(id),
    enabled: !!id,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      targetType: 'business' | 'event';
      businessId?: string;
      eventId?: string;
      rating: number;
      title?: string;
      content?: string;
      pros?: string;
      cons?: string;
      images?: string[];
    }) => createReview(data),
    onSuccess: (_, variables) => {
      if (variables.businessId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'business', variables.businessId] });
      }
      if (variables.eventId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'event', variables.eventId] });
      }
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: {
      rating?: number;
      title?: string;
      content?: string;
      pros?: string;
      cons?: string;
      images?: string[];
    }}) => updateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
    },
  });
}

export function useVoteOnReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isHelpful }: { id: string; isHelpful: boolean }) => voteOnReview(id, isHelpful),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['review', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useReplyToReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, content }: { reviewId: string; content: string }) =>
      replyToReview(reviewId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['review', variables.reviewId] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useDeleteReviewReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId: string) => deleteReviewReply(replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useMyReviews(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['myReviews', params],
    queryFn: () => fetchMyReviews(params),
    staleTime: 1000 * 60 * 2,
  });
}

// ============================================
// ADMIN: CASHBACK MANAGEMENT HOOKS
// ============================================

export function useAdminCashbackStats() {
  return useQuery({
    queryKey: ['admin', 'cashback', 'stats'],
    queryFn: fetchAdminCashbackStats,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminCashbackRules() {
  return useQuery({
    queryKey: ['admin', 'cashback', 'rules'],
    queryFn: fetchAdminCashbackRules,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateAdminCashbackRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminCashbackRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cashback', 'rules'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'cashback', 'stats'] });
    },
  });
}

export function useUpdateAdminCashbackRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateAdminCashbackRule>[1] }) =>
      updateAdminCashbackRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cashback', 'rules'] });
    },
  });
}

export function useDeleteAdminCashbackRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminCashbackRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cashback', 'rules'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'cashback', 'stats'] });
    },
  });
}

export function useAdminCashbackPayments(params?: { status?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['admin', 'cashback', 'payments', params],
    queryFn: () => fetchAdminCashbackPayments(params),
    staleTime: 1000 * 60 * 2,
  });
}

// ============================================
// ADMIN: REFERRAL MANAGEMENT HOOKS
// ============================================

export function useAdminReferralStats() {
  return useQuery({
    queryKey: ['admin', 'referral', 'stats'],
    queryFn: fetchAdminReferralStats,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminReferralRewards() {
  return useQuery({
    queryKey: ['admin', 'referral', 'rewards'],
    queryFn: fetchAdminReferralRewards,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateAdminReferralReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, data }: { type: string; data: Parameters<typeof updateAdminReferralReward>[1] }) =>
      updateAdminReferralReward(type, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'referral', 'rewards'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'referral', 'stats'] });
    },
  });
}

export function useAdminReferralCodes(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['admin', 'referral', 'codes', params],
    queryFn: () => fetchAdminReferralCodes(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useDeactivateAdminReferralCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateAdminReferralCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'referral', 'codes'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'referral', 'stats'] });
    },
  });
}

// ============================================
// ANALYTICS HOOKS
// ============================================

export function useTrackEvent() {
  return useMutation({
    mutationFn: (data: {
      eventType: AnalyticsEventType;
      eventData?: Record<string, unknown>;
      sessionId?: string;
      source?: string;
      referrer?: string;
      utmSource?: string;
      utmMedium?: string;
      utmCampaign?: string;
    }) => trackAnalyticsEvent(data),
  });
}

export function useConversionMetrics(period?: number) {
  return useQuery<ConversionMetrics>({
    queryKey: ['analytics', 'conversions', period],
    queryFn: () => fetchConversionMetrics(period),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRevenueMetrics(period?: number) {
  return useQuery<RevenueMetrics>({
    queryKey: ['analytics', 'revenue', period],
    queryFn: () => fetchRevenueMetrics(period),
    staleTime: 1000 * 60 * 5,
  });
}

export function useReferralMetrics(period?: number) {
  return useQuery<ReferralMetrics>({
    queryKey: ['analytics', 'referrals', period],
    queryFn: () => fetchReferralMetrics(period),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTrafficMetrics(period?: number) {
  return useQuery<TrafficMetrics>({
    queryKey: ['analytics', 'traffic', period],
    queryFn: () => fetchTrafficMetrics(period),
    staleTime: 1000 * 60 * 5,
  });
}

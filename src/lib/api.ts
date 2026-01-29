const API_URL = import.meta.env.VITE_API_URL || 'https://afisha-bekend-production.up.railway.app';

export interface City {
  id: string;
  name: string;
  nameKz: string | null;
  slug: string;
  region: string | null;
  population: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface Event {
  id: string;
  cityId: string;
  businessId: string | null;
  creatorId: string;
  title: string;
  description: string | null;
  category: string;
  image: string | null;
  date: string;
  endDate: string | null;
  location: string | null;
  address: string | null;
  price: number | null;
  maxPrice: number | null;
  isFree: boolean;
  isFeatured: boolean;
  isApproved: boolean;
  viewsCount: number;
  savesCount: number;
  createdAt: string;
  city?: City;
  business?: Business;
}

export interface Business {
  id: string;
  ownerId: string;
  cityId: string;
  name: string;
  description: string | null;
  category: string;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  website: string | null;
  logo: string | null;
  cover: string | null;
  isVerified: boolean;
  tier: 'free' | 'lite' | 'premium';
  tierUntil: string | null;
  postsThisMonth: number;
  createdAt: string;
  city?: City;
}

export interface Promotion {
  id: string;
  businessId: string;
  cityId: string;
  title: string;
  description: string | null;
  image: string | null;
  discount: string | null;
  conditions: string | null;
  validFrom: string | null;
  validUntil: string;
  isActive: boolean;
  isPremiumOnly: boolean;
  viewsCount: number;
  savesCount: number;
  createdAt: string;
  business?: Business;
  city?: City;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  role: 'user' | 'business' | 'moderator' | 'admin';
  isPremium: boolean;
  premiumUntil: string | null;
}

// API functions
export async function fetchCities(): Promise<City[]> {
  const res = await fetch(`${API_URL}/cities`);
  if (!res.ok) throw new Error('Failed to fetch cities');
  return res.json();
}

export async function fetchCityBySlug(slug: string): Promise<City> {
  const res = await fetch(`${API_URL}/cities/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch city');
  return res.json();
}

export async function fetchEvents(params?: {
  cityId?: string;
  category?: string;
  featured?: boolean;
}): Promise<Event[]> {
  const searchParams = new URLSearchParams();
  if (params?.cityId) searchParams.set('cityId', params.cityId);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.featured) searchParams.set('featured', 'true');

  const url = `${API_URL}/events${searchParams.toString() ? '?' + searchParams : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchEventById(id: string): Promise<Event> {
  const res = await fetch(`${API_URL}/events/${id}`);
  if (!res.ok) throw new Error('Failed to fetch event');
  return res.json();
}

export type EventCategory = 'concerts' | 'theater' | 'festivals' | 'education' | 'seminars' | 'leisure' | 'sports' | 'children' | 'exhibitions' | 'other';

export type CategoryStats = Record<EventCategory, number>;

export async function fetchCategoryStats(cityId?: string): Promise<CategoryStats> {
  const searchParams = new URLSearchParams();
  if (cityId) searchParams.set('cityId', cityId);

  const url = `${API_URL}/events/categories${searchParams.toString() ? '?' + searchParams : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch category stats');
  return res.json();
}

export async function fetchBusinesses(params?: {
  cityId?: string;
  category?: string;
}): Promise<Business[]> {
  const searchParams = new URLSearchParams();
  if (params?.cityId) searchParams.set('cityId', params.cityId);
  if (params?.category) searchParams.set('category', params.category);

  const url = `${API_URL}/businesses${searchParams.toString() ? '?' + searchParams : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch businesses');
  return res.json();
}

export async function fetchPromotions(params?: {
  cityId?: string;
  active?: boolean;
}): Promise<Promotion[]> {
  const searchParams = new URLSearchParams();
  if (params?.cityId) searchParams.set('cityId', params.cityId);
  if (params?.active) searchParams.set('active', 'true');

  const url = `${API_URL}/promotions${searchParams.toString() ? '?' + searchParams : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch promotions');
  return res.json();
}

// Auth functions
export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Login failed');
  }
  return res.json();
}

export async function register(data: {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Registration failed');
  }
  return res.json();
}

// Fetch current user from /auth/me
export async function fetchCurrentUser(): Promise<User> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch user');
  }
  return res.json();
}

// User API functions (authenticated)

// Fetch current user's business
export async function fetchMyBusiness(): Promise<Business> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_URL}/businesses/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || error.error || 'Failed to fetch business');
  }
  return res.json();
}

// Business stats interface
export interface BusinessStats {
  events: {
    total: number;
    totalViews: number;
    approved: number;
    pending: number;
  };
  promotions: {
    total: number;
    totalViews: number;
    active: number;
  };
  totalViews: number;
  recentPublications: Array<{
    id: string;
    title: string;
    type: 'event' | 'promotion';
    status: string;
    viewsCount: number;
    createdAt: string;
  }>;
}

// Fetch current user's business stats
export async function fetchMyBusinessStats(): Promise<BusinessStats> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_URL}/businesses/me/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || error.error || 'Failed to fetch business stats');
  }
  return res.json();
}

// Business publications interface
export interface BusinessPublications {
  events: Array<{
    id: string;
    title: string;
    description: string | null;
    category: string;
    image: string | null;
    date: string;
    location: string | null;
    isApproved: boolean;
    viewsCount: number;
    createdAt: string;
    type: 'event';
    status: 'approved' | 'pending';
  }>;
  promotions: Array<{
    id: string;
    title: string;
    description: string | null;
    image: string | null;
    discount: string | null;
    validUntil: string;
    isActive: boolean;
    viewsCount: number;
    createdAt: string;
    type: 'promotion';
    status: 'active' | 'expired';
  }>;
}

// Fetch current user's business publications
export async function fetchMyBusinessPublications(): Promise<BusinessPublications> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_URL}/businesses/me/publications`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || error.error || 'Failed to fetch publications');
  }
  return res.json();
}

export async function createEvent(data: {
  cityId: string;
  businessId?: string;
  title: string;
  description?: string;
  category: string;
  image?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  date: string;
  endDate?: string;
  location?: string;
  address?: string;
  price?: number;
  maxPrice?: number;
  isFree?: boolean;
}): Promise<Event> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create event');
  }
  return res.json();
}

export async function createBusiness(data: {
  cityId: string;
  name: string;
  description?: string;
  category: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  logo?: string;
  cover?: string;
}): Promise<Business> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_URL}/businesses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    // Include the message field if present (for auth errors)
    const errorMsg = error.message || error.error || 'Failed to create business';
    throw new Error(errorMsg);
  }
  return res.json();
}

export async function updateBusiness(id: string, data: Partial<{
  name: string;
  description: string;
  category: string;
  address: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  website: string;
  logo: string;
  cover: string;
}>): Promise<Business> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_URL}/businesses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update business');
  }
  return res.json();
}

export async function createPromotion(data: {
  title: string;
  description?: string;
  image?: string;
  discount: string;
  conditions?: string;
  validUntil: string;
  isPremiumOnly?: boolean;
}): Promise<Promotion> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_URL}/promotions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create promotion');
  }
  return res.json();
}

// Admin API types
export interface AdminStats {
  users: number;
  businesses: number;
  events: number;
  promotions: number;
  pendingEvents: number;
  pendingBusinesses: number;
  newUsersThisMonth: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  role: 'user' | 'business' | 'moderator' | 'admin';
  isPremium: boolean;
  premiumUntil: string | null;
  createdAt: string;
}

export interface AdminBusiness {
  id: string;
  name: string;
  category: string;
  tier: 'free' | 'lite' | 'premium';
  isVerified: boolean;
  postsThisMonth: number;
  createdAt: string;
  ownerName: string | null;
  ownerEmail: string | null;
  cityName: string | null;
}

export interface AdminEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  isApproved: boolean;
  viewsCount: number;
  createdAt: string;
  businessName: string | null;
  cityName: string | null;
}

export interface AdminPromotion {
  id: string;
  title: string;
  discount: string | null;
  validFrom: string | null;
  validUntil: string;
  isActive: boolean;
  viewsCount: number;
  createdAt: string;
  businessName: string | null;
  cityName: string | null;
}

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Admin API functions
export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${API_URL}/admin/stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch admin stats');
  return res.json();
}

export interface AdminFinanceData {
  stats: {
    totalRevenue: number;
    revenueChange: number;
    premiumSubscriptions: number;
    liteSubscriptions: number;
    expiringSubscriptions: number;
    premiumUsers: number;
  };
  transactions: Array<{
    id: string;
    type: string;
    description: string;
    amount: number;
    status: string;
    date: string;
    businessName?: string;
    userName?: string;
  }>;
  subscriptions: Array<{
    id: string;
    business: string;
    tier: string;
    amount: number;
    startDate: string;
    endDate?: string;
    status: string;
    ownerName?: string;
    ownerEmail?: string;
  }>;
}

export async function fetchAdminFinance(period?: string): Promise<AdminFinanceData> {
  const params = period ? `?period=${period}` : '';
  const res = await fetch(`${API_URL}/admin/finance${params}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch finance data');
  return res.json();
}

export async function fetchAdminUsers(params?: {
  search?: string;
  role?: string;
  limit?: number;
  offset?: number;
}): Promise<{ users: AdminUser[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.role && params.role !== 'all') searchParams.set('role', params.role);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const url = `${API_URL}/admin/users${searchParams.toString() ? '?' + searchParams : ''}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch admin users');
  return res.json();
}

export async function updateAdminUser(id: string, data: {
  role?: string;
  isPremium?: boolean;
}): Promise<AdminUser> {
  const res = await fetch(`${API_URL}/admin/users/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
}

export async function fetchAdminBusinesses(params?: {
  search?: string;
  tier?: string;
  verified?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  businesses: AdminBusiness[];
  total: number;
  tierStats: { free: number; lite: number; premium: number };
}> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.tier && params.tier !== 'all') searchParams.set('tier', params.tier);
  if (params?.verified && params.verified !== 'all') searchParams.set('verified', params.verified);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const url = `${API_URL}/admin/businesses${searchParams.toString() ? '?' + searchParams : ''}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch admin businesses');
  return res.json();
}

export async function updateAdminBusiness(id: string, data: {
  isVerified?: boolean;
  tier?: string;
}): Promise<Business> {
  const res = await fetch(`${API_URL}/admin/businesses/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update business');
  return res.json();
}

export async function verifyBusiness(id: string): Promise<Business> {
  const res = await fetch(`${API_URL}/admin/businesses/${id}/verify`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to verify business');
  return res.json();
}

export async function fetchAdminEvents(params?: {
  status?: string;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  events: AdminEvent[];
  total: number;
  pendingCount: number;
}> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const url = `${API_URL}/admin/events${searchParams.toString() ? '?' + searchParams : ''}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch admin events');
  return res.json();
}

export async function approveEvent(id: string): Promise<Event> {
  const res = await fetch(`${API_URL}/admin/events/${id}/approve`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to approve event');
  return res.json();
}

export async function rejectEvent(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/admin/events/${id}/reject`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to reject event');
  return res.json();
}

export async function fetchAdminPromotions(params?: {
  limit?: number;
  offset?: number;
}): Promise<{
  promotions: AdminPromotion[];
  total: number;
}> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const url = `${API_URL}/admin/promotions${searchParams.toString() ? '?' + searchParams : ''}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch admin promotions');
  return res.json();
}

export async function updateAdminPromotion(id: string, data: {
  isActive?: boolean;
}): Promise<Promotion> {
  const res = await fetch(`${API_URL}/admin/promotions/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update promotion');
  return res.json();
}

export async function fetchAdminCities(): Promise<{ cities: City[] }> {
  const res = await fetch(`${API_URL}/admin/cities`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch admin cities');
  return res.json();
}

export async function createAdminCity(data: {
  name: string;
  nameKz?: string;
  slug: string;
  region?: string;
  population?: number;
  isActive?: boolean;
}): Promise<City> {
  const res = await fetch(`${API_URL}/admin/cities`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create city');
  return res.json();
}

export async function updateAdminCity(id: string, data: {
  name?: string;
  nameKz?: string;
  slug?: string;
  region?: string;
  isActive?: boolean;
}): Promise<City> {
  const res = await fetch(`${API_URL}/admin/cities/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update city');
  return res.json();
}

// City Banner types and API functions
export interface CityBanner {
  id: string;
  cityId: string;
  businessId: string | null;
  title: string;
  description: string | null;
  imageUrl: string;
  link: string | null;
  linkType: string;
  position: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  viewsCount: number;
  clicksCount: number;
  createdAt: string;
  businessName?: string | null;
  cityName?: string | null;
}

export async function fetchCityBanners(cityId: string): Promise<{ banners: CityBanner[]; city: City }> {
  const res = await fetch(`${API_URL}/admin/cities/${cityId}/banners`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch city banners');
  return res.json();
}

export async function createCityBanner(cityId: string, data: {
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
}): Promise<CityBanner> {
  const res = await fetch(`${API_URL}/admin/cities/${cityId}/banners`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create banner');
  return res.json();
}

export async function updateCityBanner(cityId: string, bannerId: string, data: {
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
}): Promise<CityBanner> {
  const res = await fetch(`${API_URL}/admin/cities/${cityId}/banners/${bannerId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update banner');
  return res.json();
}

export async function deleteCityBanner(cityId: string, bannerId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/admin/cities/${cityId}/banners/${bannerId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete banner');
  return res.json();
}

export async function fetchAllBanners(): Promise<{
  banners: CityBanner[];
  total: number;
  activeCount: number;
}> {
  const res = await fetch(`${API_URL}/admin/banners`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch banners');
  return res.json();
}

// Public API for fetching city banners
export async function fetchPublicCityBanners(citySlug: string): Promise<{
  banners: Array<{
    id: string;
    title: string;
    description: string | null;
    imageUrl: string;
    link: string | null;
    linkType: string;
    position: number;
    businessId: string | null;
    businessName: string | null;
  }>;
  city: City;
}> {
  const res = await fetch(`${API_URL}/cities/${citySlug}/banners`);
  if (!res.ok) throw new Error('Failed to fetch city banners');
  return res.json();
}

// Team member types and API functions
export interface TeamMember {
  id: string;
  role: 'admin' | 'editor' | 'viewer';
  invitedAt: string;
  acceptedAt: string | null;
  isActive: boolean;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
  };
}

export interface TeamData {
  members: TeamMember[];
  maxMembers: number;
  currentCount: number;
}

export async function fetchTeamMembers(): Promise<TeamData> {
  const res = await fetch(`${API_URL}/team`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch team members');
  }
  return res.json();
}

export async function inviteTeamMember(data: {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}): Promise<TeamMember> {
  const res = await fetch(`${API_URL}/team/invite`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || error.error || 'Failed to invite team member');
  }
  return res.json();
}

export async function updateTeamMemberRole(id: string, role: 'admin' | 'editor' | 'viewer'): Promise<TeamMember> {
  const res = await fetch(`${API_URL}/team/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update team member');
  }
  return res.json();
}

export async function removeTeamMember(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/team/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to remove team member');
  }
  return res.json();
}

// ============================================
// Favorites API
// ============================================

export interface Favorite {
  id: string;
  eventId: string | null;
  businessId: string | null;
  promotionId: string | null;
  createdAt: string;
}

export interface FavoritesResponse {
  favorites: Favorite[];
  events: Event[];
  businesses: Business[];
  promotions: Promotion[];
  counts: {
    events: number;
    businesses: number;
    promotions: number;
    total: number;
  };
}

export async function fetchFavorites(): Promise<FavoritesResponse> {
  const res = await fetch(`${API_URL}/favorites`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch favorites');
  }
  return res.json();
}

export async function checkFavorite(params: {
  eventId?: string;
  businessId?: string;
  promotionId?: string;
}): Promise<{ isFavorite: boolean; favoriteId: string | null }> {
  const searchParams = new URLSearchParams();
  if (params.eventId) searchParams.set('eventId', params.eventId);
  if (params.businessId) searchParams.set('businessId', params.businessId);
  if (params.promotionId) searchParams.set('promotionId', params.promotionId);

  const res = await fetch(`${API_URL}/favorites/check?${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to check favorite');
  }
  return res.json();
}

export async function toggleFavorite(params: {
  eventId?: string;
  businessId?: string;
  promotionId?: string;
}): Promise<{ isFavorite: boolean; favoriteId?: string; message: string }> {
  const res = await fetch(`${API_URL}/favorites/toggle`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to toggle favorite');
  }
  return res.json();
}

export async function addToFavorites(params: {
  eventId?: string;
  businessId?: string;
  promotionId?: string;
}): Promise<{ favorite: Favorite; message: string }> {
  const res = await fetch(`${API_URL}/favorites`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to add to favorites');
  }
  return res.json();
}

export async function removeFromFavorites(favoriteId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/favorites/${favoriteId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to remove from favorites');
  }
  return res.json();
}

// ============================================
// Password & Profile API
// ============================================

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to change password');
  }
  return res.json();
}

export async function updateProfile(data: {
  name?: string;
  phone?: string;
  avatar?: string;
}): Promise<User> {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update profile');
  }
  return res.json();
}

// ============================================
// Business Deletion API
// ============================================

export async function deleteMyBusiness(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/businesses/me`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete business');
  }
  return res.json();
}

// ============================================
// Image Upload API
// ============================================

export interface UploadConfig {
  url: string;
  cloudName: string;
  uploadPreset: string;
  folder?: string;
  timestamp: number;
  signature?: string;
  apiKey?: string;
}

export interface UploadPresets {
  [key: string]: {
    folder: string;
    maxSize: number;
    allowedFormats: string[];
    recommendedSize: { width: number; height: number };
  };
}

export async function getUploadConfig(folder?: string): Promise<UploadConfig> {
  const searchParams = folder ? `?folder=${encodeURIComponent(folder)}` : '';
  const res = await fetch(`${API_URL}/upload/config${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to get upload config');
  }
  return res.json();
}

export async function getUploadPresets(): Promise<{ presets: UploadPresets }> {
  const res = await fetch(`${API_URL}/upload/presets`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to get upload presets');
  }
  return res.json();
}

// Upload image to Cloudinary using the config from backend
export async function uploadImage(file: File, folder?: string): Promise<string> {
  const config = await getUploadConfig(folder);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.uploadPreset);
  formData.append('folder', config.folder || 'afisha');
  formData.append('timestamp', config.timestamp.toString());

  if (config.signature && config.apiKey) {
    formData.append('signature', config.signature);
    formData.append('api_key', config.apiKey);
  }

  const res = await fetch(config.url, {
    method: 'POST',
    body: formData,
  });

  const result = await res.json();

  if (!res.ok) {
    const errorMessage = result?.error?.message || 'Failed to upload image';
    console.error('Cloudinary error:', result);
    throw new Error(errorMessage);
  }

  return result.secure_url;
}

// ============================================
// Admin Analytics API
// ============================================

export interface AdminAnalyticsData {
  overview: {
    totalUsers: number;
    newUsers: number;
    totalBusinesses: number;
    newBusinesses: number;
    totalEvents: number;
    totalPromotions: number;
    totalViews: number;
  };
  usersByCity: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  eventsByCategory: Array<{
    category: string;
    count: number;
    views: number;
  }>;
  tierDistribution: {
    free: number;
    lite: number;
    premium: number;
  };
  conversionMetrics: {
    premiumUsers: number;
    premiumBusinesses: number;
    conversionRate: number;
  };
  period: number;
}

export async function fetchAdminAnalytics(period: number = 30): Promise<AdminAnalyticsData> {
  const res = await fetch(`${API_URL}/admin/analytics?period=${period}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

// ============================================
// Admin Moderation API
// ============================================

export type ComplaintReason = 'spam' | 'fraud' | 'inappropriate' | 'outdated' | 'copyright' | 'fake' | 'offensive' | 'other';
export type ComplaintTargetType = 'business' | 'event' | 'promotion' | 'review' | 'user';
export type ComplaintStatus = 'pending' | 'reviewing' | 'resolved' | 'rejected';

export interface Complaint {
  id: string;
  targetType: ComplaintTargetType;
  targetId: string;
  targetName: string | null;
  reason: ComplaintReason;
  description: string | null;
  status: ComplaintStatus;
  createdAt: string;
  reporterName: string | null;
  reporterEmail: string | null;
}

export interface ModerationData {
  pendingEvents: Array<{
    id: string;
    title: string;
    category: string;
    createdAt: string;
    cityName: string | null;
    businessName: string | null;
    creatorEmail: string | null;
    type: 'event';
  }>;
  pendingBusinesses: Array<{
    id: string;
    name: string;
    category: string;
    createdAt: string;
    cityName: string | null;
    ownerEmail: string | null;
    ownerName: string | null;
    type: 'business';
  }>;
  pendingComplaints: Complaint[];
  counts: {
    events: number;
    businesses: number;
    complaints: number;
    total: number;
  };
}

export async function fetchAdminModeration(): Promise<ModerationData> {
  const res = await fetch(`${API_URL}/admin/moderation`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch moderation data');
  return res.json();
}

export async function resolveComplaint(id: string, resolution: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/admin/complaints/${id}/resolve`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ resolution }),
  });
  if (!res.ok) throw new Error('Failed to resolve complaint');
  return res.json();
}

export async function rejectComplaint(id: string, resolution: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/admin/complaints/${id}/reject`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ resolution }),
  });
  if (!res.ok) throw new Error('Failed to reject complaint');
  return res.json();
}

// ============================================
// Admin Delete Operations
// ============================================

export async function deleteAdminUser(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/admin/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete user');
  }
  return res.json();
}

export async function deleteAdminBusiness(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/admin/businesses/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete business');
  }
  return res.json();
}

export async function deleteAdminEvent(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/admin/events/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete event');
  }
  return res.json();
}

export async function deleteAdminPromotion(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/admin/promotions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete promotion');
  }
  return res.json();
}

export async function deleteAdminCity(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/admin/cities/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete city');
  }
  return res.json();
}

// ============================================
// City Photos API (Carousel)
// ============================================

export interface CityPhoto {
  id: string;
  cityId: string;
  title: string;
  imageUrl: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchCityPhotos(cityId: string): Promise<{ photos: CityPhoto[]; city: City }> {
  const res = await fetch(`${API_URL}/admin/cities/${cityId}/photos`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch city photos');
  return res.json();
}

export async function createCityPhoto(cityId: string, data: {
  title: string;
  imageUrl: string;
  position?: number;
  isActive?: boolean;
}): Promise<CityPhoto> {
  const res = await fetch(`${API_URL}/admin/cities/${cityId}/photos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create photo');
  return res.json();
}

export async function updateCityPhoto(cityId: string, photoId: string, data: {
  title?: string;
  imageUrl?: string;
  position?: number;
  isActive?: boolean;
}): Promise<CityPhoto> {
  const res = await fetch(`${API_URL}/admin/cities/${cityId}/photos/${photoId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update photo');
  return res.json();
}

export async function deleteCityPhoto(cityId: string, photoId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/admin/cities/${cityId}/photos/${photoId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete photo');
  return res.json();
}

// Public API for fetching city photos
export async function fetchPublicCityPhotos(citySlug: string): Promise<{
  photos: Array<{
    id: string;
    title: string;
    imageUrl: string;
    position: number;
  }>;
  city: City;
}> {
  const res = await fetch(`${API_URL}/cities/${citySlug}/photos`);
  if (!res.ok) throw new Error('Failed to fetch city photos');
  return res.json();
}

// ============================================
// Business Premium: AI Image Generation (Nano Banana)
// ============================================

export interface AiGenerationResult {
  id: string;
  imageUrl: string;
  revisedPrompt?: string;
  prompt: string;
  style?: string;
}

export interface AiGenerationHistory {
  id: string;
  prompt: string;
  style: string | null;
  generatedImageUrl: string | null;
  status: string;
  usedFor: string | null;
  createdAt: string;
}

export interface AiStatus {
  available: boolean;
  provider: 'ideogram';
  model: string;
  isFree: boolean;
}

export async function checkAiGenerationStatus(): Promise<AiStatus> {
  const res = await fetch(`${API_URL}/ai/status`);
  if (!res.ok) throw new Error('Failed to check AI status');
  return res.json();
}

export async function getAiPromptSuggestions(params: {
  contentType: 'event' | 'promotion' | 'banner';
  title?: string;
  description?: string;
  category?: string;
  discount?: string;
}): Promise<{ suggestions: string[] }> {
  const searchParams = new URLSearchParams();
  searchParams.set('contentType', params.contentType);
  if (params.title) searchParams.set('title', params.title);
  if (params.description) searchParams.set('description', params.description);
  if (params.category) searchParams.set('category', params.category);
  if (params.discount) searchParams.set('discount', params.discount);

  const res = await fetch(`${API_URL}/ai/suggestions?${searchParams}`);
  if (!res.ok) throw new Error('Failed to get prompt suggestions');
  return res.json();
}

// Image idea structure for AI-generated suggestions
export interface ImageIdea {
  id: number;
  title: string;
  description: string;
  prompt: string;
  style: 'banner' | 'promo' | 'event' | 'poster' | 'social';
  tags: string[];
}

export async function getAiImageIdeas(params: {
  title?: string;
  description?: string;
  category?: string;
  date?: string;
  location?: string;
}): Promise<{ ideas: ImageIdea[] }> {
  const searchParams = new URLSearchParams();
  if (params.title) searchParams.set('title', params.title);
  if (params.description) searchParams.set('description', params.description);
  if (params.category) searchParams.set('category', params.category);
  if (params.date) searchParams.set('date', params.date);
  if (params.location) searchParams.set('location', params.location);

  const res = await fetch(`${API_URL}/ai/ideas?${searchParams}`);
  if (!res.ok) throw new Error('Failed to get image ideas');
  return res.json();
}

export async function generateAiImage(data: {
  prompt: string;
  style?: 'banner' | 'promo' | 'event' | 'poster' | 'social';
  translatePrompt?: boolean;
}): Promise<AiGenerationResult> {
  const res = await fetch(`${API_URL}/ai/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to generate image');
  }
  return res.json();
}

export async function fetchAiGenerationHistory(params?: {
  limit?: number;
  offset?: number;
}): Promise<AiGenerationHistory[]> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const res = await fetch(`${API_URL}/ai/history?${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch AI generation history');
  return res.json();
}

export async function markAiGenerationUsed(id: string, data: {
  usedFor: 'event' | 'promotion' | 'banner';
  usedForId: string;
}): Promise<AiGenerationHistory> {
  const res = await fetch(`${API_URL}/ai/${id}/used`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to mark generation as used');
  return res.json();
}

// ============================================
// Business Premium: Auto-Publish to Social Media
// ============================================

export type SocialPlatform = 'telegram' | 'instagram' | 'vk' | 'facebook';

export interface AutoPublishSetting {
  id: string;
  platform: SocialPlatform;
  isEnabled: boolean;
  publishEvents: boolean;
  publishPromotions: boolean;
  autoPublishOnCreate: boolean;
  isConfigured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AutoPublishHistoryItem {
  id: string;
  platform: SocialPlatform;
  contentType: string;
  contentId: string;
  status: 'pending' | 'published' | 'failed';
  externalPostId: string | null;
  externalPostUrl: string | null;
  errorMessage: string | null;
  retryCount: number;
  publishedAt: string | null;
  createdAt: string;
}

export async function fetchAutoPublishSettings(): Promise<AutoPublishSetting[]> {
  const res = await fetch(`${API_URL}/autopublish/settings`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch auto-publish settings');
  }
  return res.json();
}

export async function saveAutoPublishSettings(data: {
  platform: SocialPlatform;
  isEnabled?: boolean;
  telegramBotToken?: string;
  telegramChannelId?: string;
  instagramAccessToken?: string;
  instagramBusinessAccountId?: string;
  vkAccessToken?: string;
  vkGroupId?: string;
  facebookAccessToken?: string;
  facebookPageId?: string;
  publishEvents?: boolean;
  publishPromotions?: boolean;
  autoPublishOnCreate?: boolean;
}): Promise<AutoPublishSetting> {
  const res = await fetch(`${API_URL}/autopublish/settings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to save auto-publish settings');
  }
  return res.json();
}

export async function testAutoPublishConnection(platform: SocialPlatform): Promise<{
  success: boolean;
  error?: string;
  info?: string;
}> {
  const res = await fetch(`${API_URL}/autopublish/test-connection`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ platform }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to test connection');
  }
  return res.json();
}

export async function publishToSocialMedia(data: {
  contentType: 'event' | 'promotion';
  contentId: string;
  platforms: SocialPlatform[];
}): Promise<{
  results: Array<{
    success: boolean;
    platform: SocialPlatform;
    postId?: string;
    postUrl?: string;
    error?: string;
  }>;
  successful: number;
  failed: number;
}> {
  const res = await fetch(`${API_URL}/autopublish/publish`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to publish to social media');
  }
  return res.json();
}

export async function fetchAutoPublishHistory(params?: {
  platform?: SocialPlatform;
  contentType?: 'event' | 'promotion';
  status?: 'pending' | 'published' | 'failed';
  limit?: number;
  offset?: number;
}): Promise<AutoPublishHistoryItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.platform) searchParams.set('platform', params.platform);
  if (params?.contentType) searchParams.set('contentType', params.contentType);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const res = await fetch(`${API_URL}/autopublish/history?${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch auto-publish history');
  return res.json();
}

export async function deleteAutoPublishSettings(platform: SocialPlatform): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/autopublish/settings/${platform}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete auto-publish settings');
  return res.json();
}

// ============================================
// CASHBACK SYSTEM (Premium Users)
// ============================================

export interface CashbackWallet {
  id: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  totalExpired: number;
}

export interface CashbackTransaction {
  id: string;
  type: 'earn' | 'spend' | 'refund' | 'bonus' | 'referral' | 'premium_bonus' | 'expired';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  status: 'pending' | 'completed' | 'cancelled' | 'expired';
  businessId: string | null;
  businessName: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export interface CashbackPayment {
  id: string;
  totalAmount: number;
  cashbackUsed: number;
  cashbackEarned: number;
  amountPaid: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'refunded';
  confirmationCode: string;
  businessName: string | null;
  businessLogo: string | null;
  createdAt: string;
  confirmedAt: string | null;
}

export interface CashbackRule {
  id: string;
  name: string;
  description: string | null;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxCashback: number | null;
  isPremiumOnly: boolean;
  businessId: string | null;
  businessName: string | null;
  validUntil: string | null;
}

export interface CashbackPartner {
  id: string;
  name: string;
  description: string | null;
  category: string;
  logo: string | null;
  address: string | null;
  tier: string;
  cashbackPercent: number;
}

// Cashback API functions
export async function fetchCashbackWallet(): Promise<{ wallet: CashbackWallet; currency: string }> {
  const res = await fetch(`${API_URL}/cashback/wallet`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch wallet');
  }
  return res.json();
}

export async function fetchCashbackTransactions(params?: {
  limit?: number;
  offset?: number;
  type?: string;
}): Promise<{ transactions: CashbackTransaction[]; pagination: { limit: number; offset: number; hasMore: boolean } }> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());
  if (params?.type) searchParams.set('type', params.type);

  const res = await fetch(`${API_URL}/cashback/transactions?${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function createCashbackPayment(data: {
  businessId: string;
  totalAmount: number;
  useCashback?: number;
  eventId?: string;
  promotionId?: string;
  notes?: string;
}): Promise<{
  payment: {
    id: string;
    confirmationCode: string;
    totalAmount: number;
    cashbackUsed: number;
    cashbackEarned: number;
    amountToPay: number;
    status: string;
    businessName: string;
  };
  message: string;
  instructions: { ru: string; kz: string };
}> {
  const res = await fetch(`${API_URL}/cashback/pay`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create cashback payment');
  }
  return res.json();
}

export async function fetchCashbackPayments(params?: {
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<{ payments: CashbackPayment[]; pagination: { limit: number; offset: number; hasMore: boolean } }> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());
  if (params?.status) searchParams.set('status', params.status);

  const res = await fetch(`${API_URL}/cashback/payments?${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
}

export async function fetchCashbackPaymentById(id: string): Promise<{ payment: CashbackPayment }> {
  const res = await fetch(`${API_URL}/cashback/payment/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch payment');
  return res.json();
}

export async function confirmCashbackPayment(confirmationCode: string): Promise<{
  success: boolean;
  message: string;
  payment: {
    id: string;
    totalAmount: number;
    cashbackUsed: number;
    cashbackEarned: number;
    amountPaid: number;
    customerName: string;
  };
}> {
  const res = await fetch(`${API_URL}/cashback/confirm`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ confirmationCode }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to confirm payment');
  }
  return res.json();
}

export async function rejectCashbackPayment(confirmationCode: string, reason: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/cashback/reject`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ confirmationCode, reason }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to reject payment');
  }
  return res.json();
}

export async function fetchCashbackRules(businessId?: string): Promise<{ rules: CashbackRule[] }> {
  const searchParams = new URLSearchParams();
  if (businessId) searchParams.set('businessId', businessId);

  const res = await fetch(`${API_URL}/cashback/rules?${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch rules');
  return res.json();
}

export async function fetchCashbackPartners(params?: {
  cityId?: string;
  category?: string;
}): Promise<{ partners: CashbackPartner[] }> {
  const searchParams = new URLSearchParams();
  if (params?.cityId) searchParams.set('cityId', params.cityId);
  if (params?.category) searchParams.set('category', params.category);

  const res = await fetch(`${API_URL}/cashback/partners?${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch partners');
  return res.json();
}

export async function fetchBusinessCashbackStats(): Promise<{
  stats: {
    totalPayments: number;
    confirmedPayments: number;
    pendingPayments: number;
    totalRevenue: number;
    totalCashbackUsed: number;
    totalCashbackGiven: number;
  };
}> {
  const res = await fetch(`${API_URL}/cashback/business/stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch business cashback stats');
  return res.json();
}

export async function fetchBusinessCashbackPayments(params?: {
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<{
  payments: Array<{
    id: string;
    totalAmount: number;
    cashbackUsed: number;
    cashbackEarned: number;
    status: string;
    confirmationCode: string;
    customerName: string | null;
    createdAt: string;
    confirmedAt: string | null;
  }>;
  pagination: { limit: number; offset: number; hasMore: boolean };
}> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());
  if (params?.status) searchParams.set('status', params.status);

  const res = await fetch(`${API_URL}/cashback/business/payments?${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch business payments');
  return res.json();
}

// ============================================
// REFERRAL SYSTEM (Premium Users)
// ============================================

export interface ReferralCode {
  code: string;
  usageCount: number;
  maxUsages: number | null;
  totalRewardsEarned: number;
  premiumConversions: number;
  shareUrl: string;
  shareMessage: string;
}

export interface Referral {
  id: string;
  status: 'pending' | 'registered' | 'activated' | 'premium_converted';
  reward: number;
  rewardPaid: boolean;
  referredName: string;
  registeredAt: string | null;
  convertedAt: string | null;
}

export interface ReferralStats {
  totalReferrals: number;
  registeredReferrals: number;
  premiumConversions: number;
  totalEarned: number;
  pendingRewards: number;
}

export interface ReferralRewards {
  registration: {
    referrerBonus: number;
    referredBonus: number;
    description: string;
  } | null;
  premiumConversion: {
    referrerBonus: number;
    referredBonus: number;
    description: string;
  } | null;
  firstPurchase: {
    referrerBonus: number;
    referredBonus: number;
    description: string;
  } | null;
}

// Referral API functions
export async function validateReferralCode(code: string): Promise<{
  valid: boolean;
  code?: string;
  referrerName?: string;
  bonusAmount?: number;
  message?: string;
  error?: string;
}> {
  const res = await fetch(`${API_URL}/referral/validate/${code}`);
  return res.json();
}

export async function fetchReferralCode(): Promise<{
  code: string | null;
  usageCount?: number;
  maxUsages?: number | null;
  totalRewardsEarned?: number;
  premiumConversions?: number;
  shareUrl?: string;
  shareMessage?: string;
  message?: string;
}> {
  const res = await fetch(`${API_URL}/referral/code`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch referral code');
  }
  return res.json();
}

export async function generateReferralCode(): Promise<{
  code: string;
  shareUrl: string;
  shareMessage: string;
  message: string;
}> {
  const res = await fetch(`${API_URL}/referral/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to generate referral code');
  }
  return res.json();
}

export async function applyReferralCode(code: string): Promise<{
  success: boolean;
  message: string;
  bonusReceived: number;
  referrerName?: string;
}> {
  const res = await fetch(`${API_URL}/referral/apply`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to apply referral code');
  }
  return res.json();
}

export async function fetchReferralStats(): Promise<{
  hasCode: boolean;
  code?: string;
  stats?: ReferralStats;
  referrals?: Referral[];
  message?: string;
}> {
  const res = await fetch(`${API_URL}/referral/stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch referral stats');
  }
  return res.json();
}

export async function fetchReferralRewards(): Promise<{
  rewards: ReferralRewards;
  programDescription: { ru: string; kz: string };
}> {
  const res = await fetch(`${API_URL}/referral/rewards`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch referral rewards');
  return res.json();
}

export async function deactivateReferralCode(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/referral/deactivate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to deactivate code');
  }
  return res.json();
}

// ============================================
// ADMIN: CASHBACK & REFERRAL MANAGEMENT
// ============================================

export async function fetchAdminCashbackStats(): Promise<{
  wallets: {
    total: number;
    totalBalance: number;
    totalEarned: number;
    totalSpent: number;
  };
  payments: {
    total: number;
    confirmed: number;
    pending: number;
  };
  last30Days: {
    totalRevenue: number;
    cashbackUsed: number;
    cashbackGiven: number;
  };
  activeRules: number;
}> {
  const res = await fetch(`${API_URL}/admin/cashback/stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch cashback stats');
  return res.json();
}

export async function fetchAdminCashbackRules(): Promise<{
  rules: Array<CashbackRule & {
    isActive: boolean;
    priority: number;
    usageCount: number;
    totalCashbackGiven: number;
    category: string | null;
    createdAt: string;
  }>;
}> {
  const res = await fetch(`${API_URL}/admin/cashback/rules`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch cashback rules');
  return res.json();
}

export async function createAdminCashbackRule(data: {
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxCashback?: number | null;
  category?: string | null;
  businessId?: string | null;
  isPremiumOnly?: boolean;
  isActive?: boolean;
  priority?: number;
  validFrom?: string;
  validUntil?: string | null;
}): Promise<CashbackRule> {
  const res = await fetch(`${API_URL}/admin/cashback/rules`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create rule');
  }
  return res.json();
}

export async function updateAdminCashbackRule(id: string, data: Partial<{
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxCashback: number | null;
  category: string | null;
  businessId: string | null;
  isPremiumOnly: boolean;
  isActive: boolean;
  priority: number;
  validFrom: string;
  validUntil: string | null;
}>): Promise<CashbackRule> {
  const res = await fetch(`${API_URL}/admin/cashback/rules/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update rule');
  return res.json();
}

export async function deleteAdminCashbackRule(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/admin/cashback/rules/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete rule');
  return res.json();
}

export async function fetchAdminCashbackPayments(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  payments: Array<{
    id: string;
    totalAmount: number;
    cashbackUsed: number;
    cashbackEarned: number;
    status: string;
    confirmationCode: string;
    createdAt: string;
    confirmedAt: string | null;
    userName: string | null;
    userEmail: string | null;
    businessName: string | null;
  }>;
  total: number;
}> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const res = await fetch(`${API_URL}/admin/cashback/payments?${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
}

export async function fetchAdminReferralStats(): Promise<{
  codes: { total: number; active: number };
  referrals: { total: number; premiumConverted: number; conversionRate: number };
  rewards: { totalGiven: number };
  last30Days: { newReferrals: number };
  topReferrers: Array<{
    userId: string;
    userName: string | null;
    userEmail: string | null;
    code: string;
    usageCount: number;
    totalRewards: number;
    premiumConversions: number;
  }>;
}> {
  const res = await fetch(`${API_URL}/admin/referral/stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch referral stats');
  return res.json();
}

export async function fetchAdminReferralRewards(): Promise<{
  rewards: Array<{
    id: string;
    rewardType: string;
    referrerAmount: number;
    referredAmount: number;
    description: string | null;
    isActive: boolean;
    validFrom: string;
    validUntil: string | null;
  }>;
}> {
  const res = await fetch(`${API_URL}/admin/referral/rewards`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch referral rewards');
  return res.json();
}

export async function updateAdminReferralReward(type: string, data: {
  referrerAmount: number;
  referredAmount: number;
  description?: string;
  isActive?: boolean;
  validFrom?: string;
  validUntil?: string | null;
}): Promise<any> {
  const res = await fetch(`${API_URL}/admin/referral/rewards/${type}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update reward');
  return res.json();
}

export async function replyToReview(reviewId: string, content: string): Promise<any> {
  const res = await fetch(`${API_URL}/reviews/${reviewId}/reply`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to reply to review');
  return res.json();
}

export async function deleteReviewReply(replyId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/reviews/reply/${replyId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete reply');
  return res.json();
}

export async function fetchAdminReferralCodes(params?: {
  limit?: number;
  offset?: number;
}): Promise<{
  codes: Array<{
    id: string;
    code: string;
    isActive: boolean;
    usageCount: number;
    maxUsages: number | null;
    totalRewardsEarned: number;
    premiumConversions: number;
    expiresAt: string | null;
    createdAt: string;
    userName: string | null;
    userEmail: string | null;
  }>;
  total: number;
}> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const res = await fetch(`${API_URL}/admin/referral/codes?${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch codes');
  return res.json();
}

export async function deactivateAdminReferralCode(id: string): Promise<any> {
  const res = await fetch(`${API_URL}/admin/referral/codes/${id}/deactivate`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to deactivate code');
  return res.json();
}

// ============================================
// REFERRAL API (User)
// ============================================

export async function fetchMyReferralCode(): Promise<{
  code: string;
  usageCount: number;
  totalEarnings: number;
  isActive: boolean;
  shareUrl: string;
}> {
  const res = await fetch(`${API_URL}/referrals/my-code`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch referral code');
  return res.json();
}

export async function fetchReferralList(params?: {
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());

  const res = await fetch(`${API_URL}/referrals/list?${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch referral list');
  return res.json();
}

export async function fetchReferralBonuses(params?: {
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());

  const res = await fetch(`${API_URL}/referrals/bonuses?${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch bonuses');
  return res.json();
}

export async function requestReferralWithdrawal(data: {
  amount: number;
  method: 'kaspi' | 'halyk';
  accountDetails: string;
}): Promise<{ success: boolean; withdrawalId: string; message: string }> {
  const res = await fetch(`${API_URL}/referrals/withdraw`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to request withdrawal');
  return res.json();
}

// ============================================
// PAYMENTS API
// ============================================

export async function createPayment(data: {
  provider: 'kaspi' | 'halyk';
  type: 'subscription' | 'premium' | 'banner' | 'other';
  subscriptionType?: 'user_premium' | 'business_lite' | 'business_premium';
  subscriptionPeriod?: 'monthly' | 'yearly';
  amount?: number;
  businessId?: string;
  description?: string;
}): Promise<{
  paymentId: string;
  amount: number;
  currency: string;
  provider: string;
  paymentUrl: string;
  qrCode?: string;
  expiresAt: string;
}> {
  const res = await fetch(`${API_URL}/payments/create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create payment');
  return res.json();
}

export async function fetchPaymentStatus(paymentId: string): Promise<{
  id: string;
  status: string;
  amount: number;
  provider: string;
  type: string;
  paidAt?: string;
  paymentUrl?: string;
  qrCode?: string;
  expiresAt?: string;
}> {
  const res = await fetch(`${API_URL}/payments/status/${paymentId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch payment status');
  return res.json();
}

export async function fetchPaymentHistory(params?: {
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());

  const res = await fetch(`${API_URL}/payments/history?${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch payment history');
  return res.json();
}

export async function fetchPricing(): Promise<{
  subscriptions: Record<string, {
    name: string;
    description: string;
    prices: { monthly: number; yearly: number };
    features: string[];
  }>;
  paymentMethods: Array<{ id: string; name: string; icon: string }>;
}> {
  const res = await fetch(`${API_URL}/payments/pricing`);
  if (!res.ok) throw new Error('Failed to fetch pricing');
  return res.json();
}

// ============================================
// PUSH NOTIFICATIONS API
// ============================================

export async function fetchVapidKey(): Promise<{ publicKey: string }> {
  const res = await fetch(`${API_URL}/push/vapid-key`);
  if (!res.ok) throw new Error('Failed to fetch VAPID key');
  return res.json();
}

export async function subscribeToPush(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}): Promise<{ success: boolean; subscriptionId: string }> {
  const res = await fetch(`${API_URL}/push/subscribe`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(subscription),
  });
  if (!res.ok) throw new Error('Failed to subscribe to push');
  return res.json();
}

export async function unsubscribeFromPush(endpoint?: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/push/unsubscribe`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ endpoint }),
  });
  if (!res.ok) throw new Error('Failed to unsubscribe from push');
  return res.json();
}

export async function fetchNotifications(params?: {
  limit?: number;
  offset?: number;
  unread?: boolean;
}): Promise<{
  notifications: any[];
  unreadCount: number;
}> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());
  if (params?.unread) searchParams.append('unread', 'true');

  const res = await fetch(`${API_URL}/push/notifications?${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function markNotificationRead(notificationId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/push/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to mark notification as read');
  return res.json();
}

export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/push/notifications/read-all`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to mark all notifications as read');
  return res.json();
}

export async function deleteNotification(notificationId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/push/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete notification');
  return res.json();
}

// ============================================
// REVIEWS API
// ============================================

export async function createReview(data: {
  targetType: 'business' | 'event';
  businessId?: string;
  eventId?: string;
  rating: number;
  title?: string;
  content?: string;
  pros?: string;
  cons?: string;
  images?: string[];
}): Promise<any> {
  const res = await fetch(`${API_URL}/reviews`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create review');
  return res.json();
}

export async function fetchBusinessReviews(businessId: string, params?: {
  limit?: number;
  offset?: number;
  sort?: 'recent' | 'helpful' | 'rating_high' | 'rating_low';
}): Promise<{
  reviews: any[];
  stats: {
    averageRating: number;
    totalReviews: number;
    distribution: Record<number, number>;
  };
}> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  const res = await fetch(`${API_URL}/reviews/business/${businessId}?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch business reviews');
  return res.json();
}

export async function fetchEventReviews(eventId: string, params?: {
  limit?: number;
  offset?: number;
}): Promise<{
  reviews: any[];
  stats: {
    averageRating: number;
    totalReviews: number;
  };
}> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());

  const res = await fetch(`${API_URL}/reviews/event/${eventId}?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch event reviews');
  return res.json();
}

export async function fetchReview(reviewId: string): Promise<any> {
  const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch review');
  return res.json();
}

export async function updateReview(reviewId: string, data: {
  rating?: number;
  title?: string;
  content?: string;
  pros?: string;
  cons?: string;
  images?: string[];
}): Promise<any> {
  const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update review');
  return res.json();
}

export async function deleteReview(reviewId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete review');
  return res.json();
}

export async function voteOnReview(reviewId: string, isHelpful: boolean): Promise<{
  voted: boolean;
  isHelpful?: boolean;
}> {
  const res = await fetch(`${API_URL}/reviews/${reviewId}/vote`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ isHelpful }),
  });
  if (!res.ok) throw new Error('Failed to vote on review');
  return res.json();
}

export async function fetchMyReviews(params?: {
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());

  const res = await fetch(`${API_URL}/reviews/user/my-reviews?${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch my reviews');
  return res.json();
}

// ============================================
// ANALYTICS API
// ============================================

export async function trackAnalyticsEvent(data: {
  eventType: string;
  eventData?: Record<string, unknown>;
  sessionId?: string;
  source?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/analytics/track`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to track event');
  return res.json();
}

export async function fetchConversionMetrics(period?: number): Promise<{
  period: number;
  conversions: {
    premiumUserConversions: number;
    businessTierUpgrades: number;
  };
  users: {
    total: number;
    premium: number;
    newInPeriod: number;
    conversionRate: number;
  };
  businesses: {
    total: number;
    free: number;
    lite: number;
    premium: number;
    paidConversionRate: number;
  };
  funnel: {
    pageViews: number;
    eventViews: number;
    businessViews: number;
    subscriptionStarts: number;
  };
}> {
  const searchParams = new URLSearchParams();
  if (period) searchParams.append('period', period.toString());

  const res = await fetch(`${API_URL}/analytics/conversions?${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch conversion metrics');
  return res.json();
}

export async function fetchRevenueMetrics(period?: number): Promise<{
  period: number;
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    averageTransaction: number;
  };
  byType: Array<{ type: string; total: number; count: number }>;
  byProvider: Array<{ provider: string; total: number; count: number }>;
  daily: Array<{ date: string; total: number; count: number }>;
}> {
  const searchParams = new URLSearchParams();
  if (period) searchParams.append('period', period.toString());

  const res = await fetch(`${API_URL}/analytics/revenue?${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch revenue metrics');
  return res.json();
}

export async function fetchReferralMetrics(period?: number): Promise<{
  period: number;
  summary: {
    totalReferrals: number;
    convertedReferrals: number;
    conversionRate: number;
    totalBonusEarned: number;
  };
  topReferrers: Array<{
    userId: string;
    userName: string;
    referralCount: number;
    convertedCount: number;
    totalEarned: number;
  }>;
  daily: Array<{ date: string; count: number; converted: number }>;
}> {
  const searchParams = new URLSearchParams();
  if (period) searchParams.append('period', period.toString());

  const res = await fetch(`${API_URL}/analytics/referrals?${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch referral metrics');
  return res.json();
}

export async function fetchTrafficMetrics(period?: number): Promise<{
  period: number;
  bySource: Array<{ source: string; count: number; uniqueUsers: number }>;
  byDevice: Array<{ deviceType: string; count: number }>;
  byUtmSource: Array<{ utmSource: string; count: number }>;
  byUtmCampaign: Array<{ utmCampaign: string; count: number }>;
}> {
  const searchParams = new URLSearchParams();
  if (period) searchParams.append('period', period.toString());

  const res = await fetch(`${API_URL}/analytics/traffic?${searchParams}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch traffic metrics');
  return res.json();
}

// ============================================
// Communities API
// ============================================

export interface Community {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  isPrivate: boolean;
  membersCount: number;
  createdAt: string;
  cityId: string;
  cityName: string | null;
  creatorId: string;
  isMember: boolean;
}

export async function fetchCommunities(): Promise<Community[]> {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/communities`, { headers });
  if (!res.ok) throw new Error('Failed to fetch communities');
  return res.json();
}

export async function fetchCommunity(id: string): Promise<Community> {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/communities/${id}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch community');
  return res.json();
}

export async function createCommunity(data: {
  name: string;
  description?: string;
  image?: string;
  cityId: string;
  isPrivate?: boolean;
}): Promise<Community> {
  const res = await fetch(`${API_URL}/communities`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create community');
  return res.json();
}

export async function joinCommunity(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/communities/${id}/join`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to join community');
  return res.json();
}

export async function leaveCommunity(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/communities/${id}/leave`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to leave community');
  return res.json();
}

// ============================================
// Collaborations API
// ============================================

export type CollabStatus = 'open' | 'in_progress' | 'closed';
export type CollabCategory = 'photo_video' | 'partnership' | 'events' | 'marketing' | 'delivery' | 'other';

export const COLLAB_CATEGORY_LABELS: Record<CollabCategory, string> = {
  photo_video: 'Фото/Видео',
  partnership: 'Партнёрство',
  events: 'Мероприятия',
  marketing: 'Маркетинг',
  delivery: 'Доставка',
  other: 'Другое',
};

export const COLLAB_STATUS_LABELS: Record<CollabStatus, string> = {
  open: 'Открыто',
  in_progress: 'В работе',
  closed: 'Закрыто',
};

export interface Collaboration {
  id: string;
  cityId: string;
  cityName: string | null;
  creatorId: string;
  creatorName: string | null;
  creatorAvatar: string | null;
  businessId: string | null;
  businessName: string | null;
  title: string;
  description: string;
  category: CollabCategory;
  budget: string | null;
  status: CollabStatus;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
  hasResponded?: boolean;
}

export interface CollabResponse {
  id: string;
  collabId: string;
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  message: string;
  createdAt: string;
}

export interface CollaborationWithResponses extends Collaboration {
  responses: CollabResponse[];
}

export async function fetchCollaborations(params?: {
  cityId?: string;
  category?: CollabCategory;
  status?: CollabStatus;
}): Promise<Collaboration[]> {
  const searchParams = new URLSearchParams();
  if (params?.cityId) searchParams.set('cityId', params.cityId);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.status) searchParams.set('status', params.status);

  const headers: Record<string, string> = {};
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}/collaborations${searchParams.toString() ? `?${searchParams}` : ''}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Failed to fetch collaborations');
  return res.json();
}

export async function fetchCollaboration(id: string): Promise<CollaborationWithResponses> {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/collaborations/${id}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch collaboration');
  return res.json();
}

export async function createCollaboration(data: {
  title: string;
  description: string;
  category: CollabCategory;
  cityId: string;
  businessId?: string;
  budget?: string;
}): Promise<Collaboration> {
  const res = await fetch(`${API_URL}/collaborations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create collaboration');
  }
  return res.json();
}

export async function respondToCollaboration(id: string, message: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/collaborations/${id}/respond`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to respond to collaboration');
  }
  return res.json();
}

export async function updateCollaborationStatus(id: string, status: 'in_progress' | 'closed'): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/collaborations/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update collaboration status');
  }
  return res.json();
}

export async function deleteCollaboration(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/collaborations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete collaboration');
  }
  return res.json();
}

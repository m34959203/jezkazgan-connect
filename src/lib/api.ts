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

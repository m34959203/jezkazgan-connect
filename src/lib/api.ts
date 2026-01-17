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

// Типы для приложения "Афиша Жезказган"

export type UserRole = 'guest' | 'resident' | 'entrepreneur' | 'moderator' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isVip?: boolean;
  createdAt: Date;
}

export interface EntrepreneurProfile {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  category: string;
  logo?: string;
  coverImage?: string;
  address: string;
  phone: string;
  website?: string;
  instagram?: string;
  whatsapp?: string;
  isVerified: boolean;
  createdAt: Date;
}

export type EventCategory = 
  | 'concerts'
  | 'education'
  | 'seminars'
  | 'leisure'
  | 'sports'
  | 'children'
  | 'exhibitions'
  | 'other';

export const EVENT_CATEGORIES: Record<EventCategory, { label: string; icon: string; color: string }> = {
  concerts: { label: 'Концерты', icon: '🎵', color: 'bg-pink-500' },
  education: { label: 'Обучение', icon: '📚', color: 'bg-blue-500' },
  seminars: { label: 'Семинары', icon: '🎤', color: 'bg-purple-500' },
  leisure: { label: 'Досуг', icon: '🎉', color: 'bg-orange-500' },
  sports: { label: 'Спорт', icon: '⚽', color: 'bg-green-500' },
  children: { label: 'Для детей', icon: '🧸', color: 'bg-yellow-500' },
  exhibitions: { label: 'Выставки', icon: '🖼️', color: 'bg-indigo-500' },
  other: { label: 'Другое', icon: '✨', color: 'bg-gray-500' },
};

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  image: string;
  date: Date;
  time: string;
  location: string;
  address: string;
  price: number | null; // null = бесплатно
  maxPrice?: number;
  organizerId: string;
  organizerName: string;
  organizerLogo?: string;
  tags: string[];
  isFeatured?: boolean;
  viewCount: number;
  saveCount: number;
  createdAt: Date;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string; // "20%", "500₸" и т.д.
  image: string;
  businessId: string;
  businessName: string;
  businessLogo?: string;
  validFrom: Date;
  validUntil: Date;
  conditions?: string;
  qrCode?: string;
  viewCount: number;
  createdAt: Date;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  image: string;
  memberCount: number;
  isPrivate: boolean;
  createdAt: Date;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  images?: string[];
  likeCount: number;
  commentCount: number;
  createdAt: Date;
}

export interface CollabRequest {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  businessName: string;
  category: string;
  budget?: string;
  status: 'open' | 'in_progress' | 'closed';
  responseCount: number;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'emoji';
  createdAt: Date;
}

export interface SavedItem {
  id: string;
  userId: string;
  itemType: 'event' | 'promotion' | 'business';
  itemId: string;
  createdAt: Date;
}

export type DateFilter = 'today' | 'week' | 'month' | 'all';
export type PriceFilter = 'all' | 'free' | 'paid';

export interface EventFilters {
  search: string;
  category: EventCategory | 'all';
  date: DateFilter;
  price: PriceFilter;
  location?: string;
}

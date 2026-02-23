// ─── Core Domain Types ────────────────────────────────────────────────────────

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  rating: number;
  ratingCount: number;
  itemsPosted: number;
  itemsClaimed: number;
  verified: boolean;
  verifiedEmail: boolean;
  trustScore: number; // 0-100
  bio?: string;
  neighborhood?: NeighborhoodId;
  joinedAt: Date;
  environmentalImpactLbs: number;
}

export type ItemStatus = 'available' | 'pending' | 'claimed';

export type ItemCategory =
  | 'furniture'
  | 'electronics'
  | 'books'
  | 'clothing'
  | 'kitchen'
  | 'sports'
  | 'plants'
  | 'art'
  | 'toys'
  | 'other';

export type PickupMethod = 'curb' | 'scheduled' | 'contact';

export interface Item {
  id: string;
  title: string;
  description: string;
  category: ItemCategory;
  tags: string[];
  images: string[];
  latitude: number;
  longitude: number;
  address?: string;
  neighborhood?: NeighborhoodId;
  status: ItemStatus;
  userId: string;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  interestedCount: number;
  pickupMethod: PickupMethod;
  pickupNote?: string;
  weightEstimateLbs?: number; // for environmental impact
  expiresAt?: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: Date;
  read: boolean;
  isQuickReply?: boolean;
}

export interface Conversation {
  id: string;
  itemId: string;
  item?: Item;
  participants: string[];
  otherUser?: User;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
}

// ─── Phase 2 Types ────────────────────────────────────────────────────────────

export type NeighborhoodId =
  | 'northside'
  | 'southside'
  | 'downtown'
  | 'elmwood'
  | 'west-berkeley'
  | 'north-hills'
  | 'berkeley-hills'
  | 'all';

export interface Neighborhood {
  id: NeighborhoodId;
  label: string;
  emoji: string;
  description: string;
  center: { latitude: number; longitude: number };
  latRange: [number, number];
  lngRange: [number, number];
}

export interface Story {
  id: string;
  userId: string;
  user?: User;
  itemId?: string;
  item?: Item;
  images: string[];
  caption?: string;
  reactions: { emoji: string; count: number }[];
  userReaction?: string;
  createdAt: Date;
  type: 'find' | 'transformation' | 'setup';
}

export interface SavedSearch {
  id: string;
  userId: string;
  label: string;
  query?: string;
  category?: ItemCategory;
  neighborhood?: NeighborhoodId;
  radiusMiles: number;
  notificationsEnabled: boolean;
}

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'item' | 'user';
  reason: 'inappropriate' | 'spam' | 'unsafe' | 'other';
  description?: string;
  createdAt: Date;
}

// ─── Navigation Types ─────────────────────────────────────────────────────────

export type RootStackParamList = {
  '(tabs)': undefined;
  'item/[id]': { id: string };
  'new-item': undefined;
  auth: { returnTo?: string };
  onboarding: undefined;
};

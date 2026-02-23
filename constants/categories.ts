import { ItemCategory } from '@/types';

export interface CategoryDef {
  id: ItemCategory | 'all';
  label: string;
  emoji: string;
  icon: string; // SF Symbol name (iOS) / Material Icon (Android)
  weightEstimateLbs: number; // average weight estimate for environmental impact
  color: string;
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'all',
    label: 'All',
    emoji: '🏠',
    icon: 'square.grid.2x2',
    weightEstimateLbs: 0,
    color: '#64748B',
  },
  {
    id: 'furniture',
    label: 'Furniture',
    emoji: '🛋️',
    icon: 'sofa',
    weightEstimateLbs: 80,
    color: '#8B5CF6',
  },
  {
    id: 'electronics',
    label: 'Electronics',
    emoji: '📱',
    icon: 'tv',
    weightEstimateLbs: 5,
    color: '#3B82F6',
  },
  {
    id: 'books',
    label: 'Books',
    emoji: '📚',
    icon: 'book.fill',
    weightEstimateLbs: 3,
    color: '#F97316',
  },
  {
    id: 'clothing',
    label: 'Clothing',
    emoji: '👕',
    icon: 'tshirt.fill',
    weightEstimateLbs: 2,
    color: '#EC4899',
  },
  {
    id: 'kitchen',
    label: 'Kitchen',
    emoji: '🍳',
    icon: 'fork.knife',
    weightEstimateLbs: 8,
    color: '#EF4444',
  },
  {
    id: 'sports',
    label: 'Sports',
    emoji: '⚽',
    icon: 'figure.run',
    weightEstimateLbs: 10,
    color: '#10B981',
  },
  {
    id: 'plants',
    label: 'Plants',
    emoji: '🌱',
    icon: 'leaf.fill',
    weightEstimateLbs: 6,
    color: '#16A34A',
  },
  {
    id: 'art',
    label: 'Art',
    emoji: '🎨',
    icon: 'paintpalette.fill',
    weightEstimateLbs: 4,
    color: '#F59E0B',
  },
  {
    id: 'toys',
    label: 'Toys',
    emoji: '🧸',
    icon: 'gamecontroller.fill',
    weightEstimateLbs: 3,
    color: '#06B6D4',
  },
  {
    id: 'other',
    label: 'Other',
    emoji: '✨',
    icon: 'ellipsis.circle',
    weightEstimateLbs: 5,
    color: '#94A3B8',
  },
];

export const CATEGORY_MAP: Record<string, CategoryDef> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
);

export function getCategoryDef(id: string): CategoryDef {
  return CATEGORY_MAP[id] ?? CATEGORIES[CATEGORIES.length - 1];
}

export const QUICK_TAGS = [
  'like new',
  'good condition',
  'needs repair',
  'IKEA',
  'wood',
  'metal',
  'vintage',
  'large',
  'small',
  'set',
  'works great',
  'free',
];

export const PICKUP_METHODS = [
  {
    id: 'curb' as const,
    label: 'Curb pickup',
    description: 'Item is at the curb, grab it anytime',
    emoji: '🚶',
  },
  {
    id: 'scheduled' as const,
    label: 'Schedule pickup',
    description: 'Coordinate a time with poster',
    emoji: '📅',
  },
  {
    id: 'contact' as const,
    label: 'Contact first',
    description: 'Message the poster to arrange',
    emoji: '💬',
  },
];

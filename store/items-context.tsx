import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { Item, ItemStatus, NeighborhoodId, Story } from '@/types';
import { MOCK_ITEMS, MOCK_STORIES } from '@/constants/mock-data';
import { getNeighborhoodForCoords } from '@/constants/neighborhoods';
import { getCategoryDef } from '@/constants/categories';
import { analytics } from '@/lib/analytics';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ViewMode = 'map' | 'list';
export type SortMode = 'newest' | 'nearest' | 'trending';

interface ItemsState {
  items: Item[];
  stories: Story[];
  loading: boolean;
  selectedCategory: string;
  selectedNeighborhood: NeighborhoodId;
  viewMode: ViewMode;
  sortMode: SortMode;
}

interface ItemsContextType extends ItemsState {
  filteredItems: Item[];
  trendingItems: Item[];
  setSelectedCategory: (category: string) => void;
  setSelectedNeighborhood: (n: NeighborhoodId) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortMode: (mode: SortMode) => void;
  addItem: (
    data: Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'interestedCount'>
  ) => Promise<Item>;
  updateItemStatus: (id: string, status: ItemStatus) => Promise<void>;
  markInterested: (id: string) => void;
  incrementView: (id: string) => void;
  getItemById: (id: string) => Item | undefined;
  addStory: (story: Omit<Story, 'id' | 'createdAt' | 'reactions'>) => void;
  reactToStory: (storyId: string, emoji: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>(MOCK_ITEMS);
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [loading] = useState(false);
  const [selectedCategory, setSelectedCategoryState] = useState('all');
  const [selectedNeighborhood, setSelectedNeighborhoodState] =
    useState<NeighborhoodId>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  const setSelectedCategory = useCallback((category: string) => {
    setSelectedCategoryState(category);
    analytics.track('category_filter', { category });
  }, []);

  const setSelectedNeighborhood = useCallback((n: NeighborhoodId) => {
    setSelectedNeighborhoodState(n);
    analytics.track('neighborhood_filter', { neighborhood: n });
  }, []);

  const filteredItems = useMemo(() => {
    let result = items;

    if (selectedCategory !== 'all') {
      result = result.filter((i) => i.category === selectedCategory);
    }

    if (selectedNeighborhood !== 'all') {
      result = result.filter((i) => i.neighborhood === selectedNeighborhood);
    }

    if (sortMode === 'newest') {
      result = [...result].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    } else if (sortMode === 'trending') {
      result = [...result].sort(
        (a, b) =>
          b.viewCount + b.interestedCount * 2 - (a.viewCount + a.interestedCount * 2)
      );
    }

    return result;
  }, [items, selectedCategory, selectedNeighborhood, sortMode]);

  const trendingItems = useMemo(
    () =>
      [...items]
        .filter((i) => i.status === 'available')
        .sort(
          (a, b) =>
            b.viewCount + b.interestedCount * 3 - (a.viewCount + a.interestedCount * 3)
        )
        .slice(0, 5),
    [items]
  );

  const addItem = useCallback(
    async (
      data: Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'interestedCount'>
    ) => {
      const neighborhood = getNeighborhoodForCoords(data.latitude, data.longitude);
      const category = getCategoryDef(data.category);

      const newItem: Item = {
        ...data,
        id: `item_${Date.now()}`,
        neighborhood,
        weightEstimateLbs: category.weightEstimateLbs,
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0,
        interestedCount: 0,
      };

      setItems((prev) => [newItem, ...prev]);
      analytics.track('item_posted', { category: data.category, itemId: newItem.id });
      return newItem;
    },
    []
  );

  const updateItemStatus = useCallback(async (id: string, status: ItemStatus) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status, updatedAt: new Date() } : item
      )
    );
    if (status === 'claimed') analytics.track('item_claimed', { itemId: id });
  }, []);

  const markInterested = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, interestedCount: item.interestedCount + 1 } : item
      )
    );
    analytics.track('item_interested', { itemId: id });
  }, []);

  const incrementView = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, viewCount: item.viewCount + 1 } : item
      )
    );
    analytics.track('item_viewed', { itemId: id });
  }, []);

  const getItemById = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items]
  );

  const addStory = useCallback(
    (storyData: Omit<Story, 'id' | 'createdAt' | 'reactions'>) => {
      const newStory: Story = {
        ...storyData,
        id: `story_${Date.now()}`,
        createdAt: new Date(),
        reactions: [
          { emoji: '❤️', count: 0 },
          { emoji: '🔥', count: 0 },
          { emoji: '🙌', count: 0 },
        ],
      };
      setStories((prev) => [newStory, ...prev]);
      analytics.track('story_posted');
    },
    []
  );

  const reactToStory = useCallback((storyId: string, emoji: string) => {
    setStories((prev) =>
      prev.map((story) => {
        if (story.id !== storyId) return story;
        const reactions = story.reactions.map((r) =>
          r.emoji === emoji ? { ...r, count: r.count + 1 } : r
        );
        return { ...story, reactions, userReaction: emoji };
      })
    );
    analytics.track('story_reaction', { emoji });
  }, []);

  return (
    <ItemsContext.Provider
      value={{
        items,
        stories,
        loading,
        selectedCategory,
        selectedNeighborhood,
        viewMode,
        sortMode,
        filteredItems,
        trendingItems,
        setSelectedCategory,
        setSelectedNeighborhood,
        setViewMode,
        setSortMode,
        addItem,
        updateItemStatus,
        markInterested,
        incrementView,
        getItemById,
        addStory,
        reactToStory,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useItems() {
  const context = useContext(ItemsContext);
  if (!context) throw new Error('useItems must be used within ItemsProvider');
  return context;
}

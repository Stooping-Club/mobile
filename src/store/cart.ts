import { create } from 'zustand';

import {
  type Cart,
  type CartLine,
  addCartLines,
  createCart,
  removeCartLines,
  updateCartLines,
} from '@/lib/shopify';

type CartState = {
  cart: Cart | null;
  loading: boolean;
  error: string | null;

  addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clear: () => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,
  error: null,

  addItem: async (merchandiseId, quantity = 1) => {
    set({ loading: true, error: null });
    try {
      const { cart } = get();
      let updated: Cart;

      if (cart) {
        updated = await addCartLines(cart.id, [{ merchandiseId, quantity }]);
      } else {
        updated = await createCart([{ merchandiseId, quantity }]);
      }

      set({ cart: updated, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  updateItem: async (lineId, quantity) => {
    const { cart } = get();
    if (!cart) return;

    set({ loading: true, error: null });
    try {
      if (quantity <= 0) {
        const updated = await removeCartLines(cart.id, [lineId]);
        set({ cart: updated, loading: false });
      } else {
        const updated = await updateCartLines(cart.id, [{ id: lineId, quantity }]);
        set({ cart: updated, loading: false });
      }
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  removeItem: async (lineId) => {
    const { cart } = get();
    if (!cart) return;

    set({ loading: true, error: null });
    try {
      const updated = await removeCartLines(cart.id, [lineId]);
      set({ cart: updated, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  clear: () => set({ cart: null, error: null }),
}));

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, WishlistItem, User, Currency, Order } from '@/lib/types';

// ─── Cart Store ────────────────────────────────────────────
interface CartStore {
  items: CartItem[];
  savedForLater: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  saveForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  removeSavedForLater: (id: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  get totalItems(): number;
  get subtotal(): number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      savedForLater: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          );
          if (existingIndex >= 0) {
            const updated = [...state.items];
            const existing = updated[existingIndex];
            updated[existingIndex] = {
              ...existing,
              quantity: Math.min(existing.quantity + item.quantity, existing.maxQuantity),
            };
            return { items: updated, isOpen: true };
          }
          return {
            items: [...state.items, { ...item, id: `cart-${Date.now()}-${Math.random()}` }],
            isOpen: true,
          };
        });
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxQuantity)) } : i
          ),
        })),

      saveForLater: (id) =>
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (!item) return state;
          return {
            items: state.items.filter((i) => i.id !== id),
            savedForLater: [item, ...(state.savedForLater || [])],
          };
        }),

      moveToCart: (id) =>
        set((state) => {
          const item = (state.savedForLater || []).find((i) => i.id === id);
          if (!item) return state;
          return {
            savedForLater: (state.savedForLater || []).filter((i) => i.id !== id),
            items: [item, ...state.items],
          };
        }),

      removeSavedForLater: (id) =>
        set((state) => ({
          savedForLater: (state.savedForLater || []).filter((i) => i.id !== id),
        })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      get totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
    }),
    { name: 'bazaar-cart' }
  )
);

// ─── Wishlist Store ────────────────────────────────────────
interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  toggle: (item: WishlistItem) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => ({
          items: state.items.some((i) => i.productId === item.productId)
            ? state.items
            : [...state.items, item],
        })),

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

      hasItem: (productId) => get().items.some((i) => i.productId === productId),

      toggle: (item) => {
        const store = get();
        if (store.hasItem(item.productId)) {
          store.removeItem(item.productId);
        } else {
          store.addItem(item);
        }
      },
    }),
    { name: 'bazaar-wishlist' }
  )
);

// ─── Auth Store ────────────────────────────────────────────
interface AuthStore {
  user: User | null;
  isAuthOpen: boolean;
  login: (email: string, name: string) => void;
  logout: () => void;
  openAuth: () => void;
  closeAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthOpen: false,

      login: (email, name) =>
        set({
          user: {
            id: `user-${Date.now()}`,
            email,
            name,
            isLoggedIn: true,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
          },
          isAuthOpen: false,
        }),

      logout: () => set({ user: null }),
      openAuth: () => set({ isAuthOpen: true }),
      closeAuth: () => set({ isAuthOpen: false }),
    }),
    { name: 'bazaar-auth' }
  )
);

// ─── UI Store ─────────────────────────────────────────────
interface UIStore {
  currency: Currency;
  deliveryLocation: string;
  setCurrency: (c: Currency) => void;
  setDeliveryLocation: (loc: string) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      currency: 'EGP',
      deliveryLocation: 'Cairo, Egypt',
      setCurrency: (currency) => set({ currency }),
      setDeliveryLocation: (deliveryLocation) => set({ deliveryLocation }),
    }),
    { name: 'bazaar-ui' }
  )
);

// ─── Order Store ──────────────────────────────────────────
interface OrderStore {
  orders: Order[];
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status' | 'trackingNumber'>) => Order;
  getOrderById: (id: string) => Order | undefined;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [
        {
          id: 'BZR-EG-89421',
          createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
          items: [
            {
              productId: 'prod-1',
              name: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
              brand: 'Apple',
              image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80',
              price: 59999,
              quantity: 1,
              variantLabel: '256GB / Natural Titanium',
            },
          ],
          shippingAddress: {
            id: 'addr-1',
            fullName: 'Ahmed Hassan',
            phone: '+20 100 123 4567',
            governorate: 'Cairo',
            cityArea: 'New Cairo / 5th Settlement',
            streetAddress: '90th North Street, Building 42',
            buildingFloor: 'Floor 3, Apt 12',
            isDefault: true,
          },
          paymentMethod: 'valu',
          subtotal: 59999,
          shippingFee: 0,
          discount: 1500,
          total: 58499,
          currency: 'EGP',
          status: 'out_for_delivery',
          estimatedDeliveryDate: 'Tomorrow, between 2 PM - 6 PM',
          trackingNumber: 'EGY-CAI-7819284',
          valuPlanMonths: 12,
        },
      ],

      createOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: `BZR-EG-${Math.floor(100000 + Math.random() * 900000)}`,
          createdAt: new Date().toISOString(),
          status: 'confirmed',
          trackingNumber: `EGY-CAI-${Math.floor(1000000 + Math.random() * 9000000)}`,
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        return newOrder;
      },

      getOrderById: (id: string) => {
        return get().orders.find((o) => o.id === id);
      },
    }),
    { name: 'bazaar-orders' }
  )
);


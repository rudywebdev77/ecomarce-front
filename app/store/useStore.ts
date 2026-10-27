import { create } from "zustand";

export interface CartItem {
  id: string;
  title: string;
  price: string;
  image: string;
  quantity: number;
  size?: string;
}

export const CURRENCY_RATES: Record<string, { symbol: string; rate: number; prefix: boolean }> = {
  PKR: { symbol: "Rs.", rate: 1, prefix: true },
  USD: { symbol: "$", rate: 0.0036, prefix: true },
  GBP: { symbol: "£", rate: 0.0028, prefix: true },
  EUR: { symbol: "€", rate: 0.0033, prefix: true },
  CAD: { symbol: "CAD $", rate: 0.0049, prefix: true },
};

export function formatPrice(pkrString: string | null | undefined, currency: string = "PKR"): string {
  if (!pkrString) return "";
  if (currency === "PKR") return pkrString;
  const num = parseInt(pkrString.replace(/[^\d]/g, ""), 10);
  if (isNaN(num)) return pkrString;
  const conf = CURRENCY_RATES[currency] || CURRENCY_RATES.PKR;
  const converted = Math.round(num * conf.rate);
  return `${conf.symbol}${converted.toLocaleString()}`;
}

export function formatNumberAmount(amountPKR: number, currency: string = "PKR"): string {
  if (currency === "PKR") return `Rs.${amountPKR.toLocaleString()}`;
  const conf = CURRENCY_RATES[currency] || CURRENCY_RATES.PKR;
  const converted = Math.round(amountPKR * conf.rate);
  return `${conf.symbol}${converted.toLocaleString()}`;
}


interface AppState {
  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;

  // Search
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  // Mobile Nav Drawer
  isMobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;

  // Quick View Modal
  quickViewProduct: any | null;
  openQuickView: (product: any) => void;
  closeQuickView: () => void;

  // Currency
  currentCurrency: string;
  setCurrency: (currency: string) => void;
}

export const useStore = create<AppState>((set) => ({
  cart: [],
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  addToCart: (item) =>
    set((state) => {
      const existing = state.cart.find((i) => i.id === item.id);
      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
          isCartOpen: true,
        };
      }
      return {
        cart: [...state.cart, { ...item, quantity: 1 }],
        isCartOpen: true,
      };
    }),
  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    })),
  updateQuantity: (id, delta) =>
    set((state) => ({
      cart: state.cart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[],
    })),

  isSearchOpen: false,
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  isMobileNavOpen: false,
  openMobileNav: () => set({ isMobileNavOpen: true }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),

  quickViewProduct: null,
  openQuickView: (product) => set({ quickViewProduct: product }),
  closeQuickView: () => set({ quickViewProduct: null }),

  currentCurrency: "PKR",
  setCurrency: (currency) => set({ currentCurrency: currency }),
}));

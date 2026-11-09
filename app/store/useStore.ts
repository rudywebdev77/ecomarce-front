import { create } from "zustand";

export interface CartItem {
  id: string;
  title: string;
  price: string;
  image: string;
  quantity: number;
  size?: string;
  selectedOptions?: Record<string, string>;
}

export interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  images?: string[];
  description?: string;
  sizes?: string[];
  handle?: string;
  primaryImage?: string;
  secondaryImage?: string;
  currentPrice?: string;
}

export const CURRENCY_RATES: Record<string, { symbol: string; rate: number; prefix: boolean }> = {
  PKR: { symbol: "Rs.", rate: 1, prefix: true },
  USD: { symbol: "$", rate: 0.0036, prefix: true },
  GBP: { symbol: "£", rate: 0.0028, prefix: true },
  EUR: { symbol: "€", rate: 0.0033, prefix: true },
  CAD: { symbol: "CAD $", rate: 0.0049, prefix: true },
};

export function parsePriceToNumber(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  let s = String(val).trim();
  // Strip currency prefixes including trailing dot like "Rs." or "PKR"
  s = s.replace(/^(Rs\.?|PKR|USD|\$|£|€|CAD\s*\$)\s*/i, "").trim();
  // Strip thousands commas
  s = s.replace(/,/g, "");
  const m = s.match(/-?\d+(\.\d+)?/);
  if (!m) return 0;
  const n = parseFloat(m[0]);
  return isNaN(n) ? 0 : n;
}

export function formatPrice(pkrString: string | null | undefined, currency: string = "PKR"): string {
  if (!pkrString) return "";
  const num = parsePriceToNumber(pkrString);
  if (currency === "PKR") {
    // If original string already has proper formatted structure and no currency conversion needed
    if (String(pkrString).includes("Rs.") && !String(pkrString).includes(".0.")) {
      return pkrString;
    }
    return `Rs.${num.toLocaleString()}`;
  }
  const conf = CURRENCY_RATES[currency] || CURRENCY_RATES.PKR;
  const converted = Math.round(num * conf.rate);
  return `${conf.symbol}${converted.toLocaleString()}`;
}

export function formatNumberAmount(amountPKR: number | string, currency: string = "PKR"): string {
  const num = parsePriceToNumber(amountPKR);
  if (currency === "PKR") return `Rs.${num.toLocaleString()}`;
  const conf = CURRENCY_RATES[currency] || CURRENCY_RATES.PKR;
  const converted = Math.round(num * conf.rate);
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
  clearCart: () => void;

  // Search
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  // Mobile Nav Drawer
  isMobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;

  // Quick View Modal
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
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
  clearCart: () => set({ cart: [] }),

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
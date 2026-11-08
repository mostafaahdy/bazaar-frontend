// ============================================================
// Core TypeScript interfaces for the entire storefront
// ============================================================

export type Currency = 'EGP' | 'USD' | 'SAR';

export interface CurrencyOption {
  code: Currency;
  symbol: string;
  label: string;
  rate: number; // relative to EGP
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // lucide icon name
  color: string; // tailwind gradient classes
  image?: string;
  productCount: number;
  featured?: boolean;
}

export interface ProductImage {
  url: string;
  alt: string;
}

export type ProductCondition = 'new' | 'refurbished' | 'used';

export interface ProductVariant {
  id: string;
  name: string;        // e.g. "256GB / Midnight Black"
  price: number;       // in EGP
  originalPrice?: number;
  stock: number;
  sku: string;
  attributes: Record<string, string>; // { color: 'Black', storage: '256GB' }
}

export interface ProductReview {
  id: string;
  author: string;
  avatar: string;
  rating: number; // 1-5
  date: string;
  title: string;
  body: string;
  verified: boolean;
  helpful: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  images: ProductImage[];
  description: string;
  shortDescription: string;
  price: number;          // base price in EGP
  originalPrice?: number; // for discount display
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  condition: ProductCondition;
  tags: string[];
  variants?: ProductVariant[];
  reviews?: ProductReview[];
  specifications?: Record<string, string>;
  isFlashDeal?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  flashDealEndsAt?: string; // ISO date string
  freeShipping?: boolean;
  shippingDays?: number;    // estimated delivery in days
  warranty?: string;        // e.g. "1 Year Official Warranty"
  soldCount?: number;
  createdAt: string;
}

export interface CartItem {
  id: string;             // unique cart-line id
  productId: string;
  variantId?: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  maxQuantity: number;
  variantLabel?: string;  // e.g. "256GB / Black"
  categoryName: string;
  freeShipping: boolean;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isLoggedIn: boolean;
  role?: string;
  phoneNumber?: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  badgeText?: string;
  gradient: string; // tailwind gradient classes
  accentColor: string;
  image?: string;
}

export interface SearchSuggestion {
  type: 'product' | 'category' | 'brand' | 'query';
  label: string;
  href: string;
  image?: string;
  price?: number;
}

export interface NavCategory {
  label: string;
  href: string;
  icon?: string;
  highlight?: boolean; // e.g. Flash Deals shown in accent color
}

// ─── Checkout & Order Types ────────────────────────────────
export type PaymentMethodType = 'card' | 'meeza' | 'valu' | 'fawry' | 'cod' | 'wallet';

export interface ShippingAddress {
  id: string;
  fullName: string;
  phone: string;
  governorate: string;
  cityArea: string;
  streetAddress: string;
  buildingFloor: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  quantity: number;
  variantLabel?: string;
}

export type OrderStatus = 'placed' | 'confirmed' | 'packing' | 'out_for_delivery' | 'delivered';

export interface Order {
  id: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethodType;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  currency: Currency;
  status: OrderStatus;
  estimatedDeliveryDate: string;
  trackingNumber: string;
  valuPlanMonths?: number;
}



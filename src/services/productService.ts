import apiClient from '@/lib/api';
import type { Product } from '@/lib/types';
import { PRODUCTS, FLASH_DEAL_PRODUCTS } from '@/lib/mockData';

export interface ProductQueryParams {
  categoryId?: string;
  categorySlug?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  expressOnly?: boolean;
  flashDealsOnly?: boolean;
  searchQuery?: string;
  sortBy?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ProductsResponse {
  items: Product[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface BackendProductDto {
  id?: string;
  title?: string;
  name?: string;
  slug: string;
  brand: string;
  categoryId?: string;
  categoryName?: string;
  basePrice?: number;
  discountPrice?: number;
  price?: number;
  originalPrice?: number;
  discountPercent?: number;
  stockQuantity?: number;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  isFlashDeal?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  flashDealEndsAt?: string;
  isExpress?: boolean;
  warranty?: string;
  primaryImageUrl?: string;
  image?: string;
  description?: string;
  shortDescription?: string;
  createdAt?: string;
  images?: Array<{ imageUrl?: string; url?: string; alt?: string }>;
  variants?: Array<{
    id?: string;
    name: string;
    finalPrice?: number;
    price?: number;
    stock?: number;
    sku?: string;
    color?: string;
    storageSize?: string;
  }>;
  reviews?: Array<{
    id?: string;
    authorName?: string;
    rating?: number;
    createdAt?: string;
    title?: string;
    comment?: string;
    isVerifiedPurchase?: boolean;
    helpfulCount?: number;
  }>;
}

export function mapBackendProductToFrontend(dto: BackendProductDto): Product {
  const currentPrice = dto.discountPrice ?? dto.basePrice ?? dto.price ?? 0;
  const originalPrice = dto.discountPrice ? dto.basePrice : dto.originalPrice;
  const primaryImage =
    dto.primaryImageUrl ||
    dto.images?.[0]?.imageUrl ||
    dto.image ||
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80';

  return {
    id: dto.id?.toString() || dto.slug,
    name: dto.title || dto.name || 'Product',
    slug: dto.slug,
    brand: dto.brand,
    categoryId: dto.categoryId?.toString() || 'cat-1',
    categoryName: dto.categoryName || 'General',
    images:
      dto.images && dto.images.length > 0
        ? dto.images.map((img) => ({
            url: img.imageUrl || img.url || primaryImage,
            alt: img.alt || dto.title || dto.name || '',
          }))
        : [{ url: primaryImage, alt: dto.title || dto.name || '' }],
    description: dto.description || '',
    shortDescription: dto.shortDescription || dto.description || '',
    price: currentPrice,
    originalPrice: originalPrice,
    discountPercent:
      dto.discountPercent ||
      (originalPrice && originalPrice > currentPrice
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        : undefined),
    rating: dto.rating ?? 5.0,
    reviewCount: dto.reviewCount ?? 0,
    stock: dto.stockQuantity ?? dto.stock ?? 10,
    condition: 'new',
    tags: [dto.brand?.toLowerCase(), dto.categoryName?.toLowerCase()].filter(Boolean) as string[],
    variants:
      dto.variants?.map((v) => ({
        id: v.id?.toString() || '',
        name: v.name,
        price: v.finalPrice ?? v.price ?? currentPrice,
        originalPrice: originalPrice,
        stock: v.stock ?? 10,
        sku: v.sku || '',
        attributes: {
          color: v.color || '',
          storage: v.storageSize || '',
        },
      })) || [],
    reviews:
      dto.reviews?.map((r) => ({
        id: r.id?.toString() || '',
        author: r.authorName || 'Verified Customer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
        rating: r.rating ?? 5,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent',
        title: r.title || 'Excellent Product',
        body: r.comment || '',
        verified: r.isVerifiedPurchase ?? true,
        helpful: r.helpfulCount ?? 0,
      })) || [],
    isFlashDeal: dto.isFlashDeal ?? false,
    isBestSeller: dto.isBestSeller ?? false,
    isTrending: dto.isTrending ?? false,
    isFeatured: dto.isFeatured ?? true,
    flashDealEndsAt: dto.flashDealEndsAt || new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    freeShipping: dto.isExpress ?? true,
    shippingDays: dto.isExpress ? 1 : 3,
    warranty: dto.warranty || '1 Year Official Warranty',
    soldCount: dto.reviewCount ? dto.reviewCount * 3 : 150,
    createdAt: dto.createdAt || new Date().toISOString(),
  };
}

export const productService = {
  /**
   * Fetch paginated and filtered product catalog
   */
  async getProducts(params?: ProductQueryParams): Promise<ProductsResponse> {
    try {
      const response = await apiClient.get<{
        items: BackendProductDto[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        hasPreviousPage: boolean;
        hasNextPage: boolean;
      }>('/products', { params });
      const data = response.data;
      return {
        items: data.items.map(mapBackendProductToFrontend),
        totalCount: data.totalCount,
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
        hasPreviousPage: data.hasPreviousPage,
        hasNextPage: data.hasNextPage,
      };
    } catch (err) {
      console.warn('[productService.getProducts] Backend unreachable, falling back to mockData:', err);
      // Fallback to local mock data
      let filtered = [...PRODUCTS];
      if (params?.categorySlug && params.categorySlug !== 'all') {
        const target = params.categorySlug.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.categoryName.toLowerCase() === target ||
            p.categoryId === target ||
            p.slug.toLowerCase().includes(target) ||
            (target === 'home-living' && (p.categoryName.toLowerCase().includes('home') || p.categoryId === 'cat-7')) ||
            (target === 'baby-products' && (p.categoryName.toLowerCase().includes('baby') || p.categoryId === 'cat-8')) ||
            (target === 'supermarket' && (p.categoryName.toLowerCase().includes('supermarket') || p.categoryId === 'cat-9')) ||
            (target === 'mobiles' && (p.categoryName.toLowerCase().includes('mobile') || p.categoryId === 'cat-1')) ||
            (target === 'electronics' && (p.categoryName.toLowerCase().includes('electronic') || p.categoryId === 'cat-2')) ||
            (target === 'computers' && (p.categoryName.toLowerCase().includes('computer') || p.categoryId === 'cat-3')) ||
            (target === 'fashion' && (p.categoryName.toLowerCase().includes('fashion') || p.categoryId === 'cat-4')) ||
            (target === 'appliances' && (p.categoryName.toLowerCase().includes('appliance') || p.categoryId === 'cat-5')) ||
            (target === 'sports' && (p.categoryName.toLowerCase().includes('sport') || p.categoryId === 'cat-6'))
        );
      }
      if (params?.brand) {
        filtered = filtered.filter((p) => p.brand.toLowerCase() === params.brand?.toLowerCase());
      }
      if (params?.minPrice !== undefined) {
        filtered = filtered.filter((p) => p.price >= params.minPrice!);
      }
      if (params?.maxPrice !== undefined) {
        filtered = filtered.filter((p) => p.price <= params.maxPrice!);
      }
      if (params?.flashDealsOnly) {
        filtered = filtered.filter((p) => p.isFlashDeal);
      }
      return {
        items: filtered,
        totalCount: filtered.length,
        pageNumber: 1,
        pageSize: filtered.length,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      };
    }
  },

  /**
   * Fetch single product detail by ID or Slug
   */
  async getProductById(idOrSlug: string): Promise<Product | null> {
    try {
      const response = await apiClient.get<BackendProductDto>(
        `/products/${encodeURIComponent(idOrSlug)}`
      );
      return mapBackendProductToFrontend(response.data);
    } catch (err) {
      console.warn(`[productService.getProductById] ID ${idOrSlug} unreachable, falling back to mockData:`, err);
      const found = PRODUCTS.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
      return found || null;
    }
  },

  /**
   * Fetch active flash deals
   */
  async getFlashDeals(): Promise<Product[]> {
    try {
      const response = await apiClient.get<BackendProductDto[]>('/products/flash-deals');
      return response.data.map(mapBackendProductToFrontend);
    } catch (err) {
      console.warn('[productService.getFlashDeals] Falling back to mockData:', err);
      return FLASH_DEAL_PRODUCTS;
    }
  },
};

export default productService;

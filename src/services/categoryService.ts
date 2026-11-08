import apiClient from '@/lib/api';
import type { Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/mockData';

const CATEGORY_COLOR_MAP: Record<string, string> = {
  mobiles: 'from-indigo-500 to-purple-600',
  electronics: 'from-blue-500 to-cyan-500',
  computers: 'from-violet-500 to-indigo-600',
  fashion: 'from-pink-500 to-rose-500',
  appliances: 'from-amber-500 to-orange-500',
  sports: 'from-green-500 to-emerald-600',
  home: 'from-teal-500 to-cyan-600',
  'home-living': 'from-teal-500 to-cyan-600',
  baby: 'from-yellow-400 to-amber-500',
  'baby-products': 'from-yellow-400 to-amber-500',
  supermarket: 'from-emerald-500 to-green-600',
};

const SLUG_CANONICAL_MAP: Record<string, string> = {
  home: 'home-living',
  baby: 'baby-products',
  groceries: 'supermarket',
};

export interface BackendCategoryDto {
  id: string | number;
  name: string;
  slug: string;
  iconName?: string;
  imageUrl?: string;
  productCount?: number;
  isFeatured?: boolean;
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<BackendCategoryDto[]>('/categories');
      return response.data.map((c) => {
        const canonicalSlug = SLUG_CANONICAL_MAP[c.slug.toLowerCase()] || c.slug;
        return {
          id: c.id.toString(),
          name: c.name,
          slug: canonicalSlug,
          icon: c.iconName || 'Grid',
          color: CATEGORY_COLOR_MAP[canonicalSlug] || CATEGORY_COLOR_MAP[c.slug.toLowerCase()] || 'from-indigo-500 to-purple-600',
          image: c.imageUrl,
          productCount: c.productCount || 0,
          featured: c.isFeatured ?? true,
        };
      });
    } catch (err) {
      console.warn('[categoryService.getCategories] Backend unreachable, falling back to mockData:', err);
      return CATEGORIES;
    }
  },
};

export default categoryService;

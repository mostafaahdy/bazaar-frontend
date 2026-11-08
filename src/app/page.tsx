'use client';

import { useState, useEffect } from 'react';
import HeroSlider from '@/components/home/HeroSlider';
import FlashDeals from '@/components/home/FlashDeals';
import CategoriesGrid from '@/components/home/CategoriesGrid';
import ProductGrid from '@/components/home/ProductGrid';
import ValueProps from '@/components/home/ValueProps';
import PromoBanner from '@/components/home/PromoBanner';
import { TRENDING_PRODUCTS, BEST_SELLER_PRODUCTS, TOP_ELECTRONICS } from '@/lib/mockData';
import { productService } from '@/services/productService';
import type { Product } from '@/lib/types';

export default function HomePage() {
  const [trending, setTrending] = useState<Product[]>(TRENDING_PRODUCTS);
  const [bestSellers, setBestSellers] = useState<Product[]>(BEST_SELLER_PRODUCTS);
  const [topElectronics, setTopElectronics] = useState<Product[]>(TOP_ELECTRONICS);

  useEffect(() => {
    // 1. Fetch live trending & best seller products
    productService
      .getProducts({ sortBy: 'popular', pageSize: 8 })
      .then((res) => {
        if (res.items && res.items.length > 0) {
          setTrending(res.items.slice(0, 4));
          setBestSellers(res.items.slice(2, 6));
        }
      })
      .catch((err) => console.warn('[HomePage] Using fallback products:', err));

    // 2. Fetch live electronics
    productService
      .getProducts({ categorySlug: 'electronics', pageSize: 4 })
      .then((res) => {
        if (res.items && res.items.length > 0) {
          setTopElectronics(res.items);
        }
      })
      .catch((err) => console.warn('[HomePage] Using fallback electronics:', err));
  }, []);

  return (
    <>
      {/* 1. Hero Slider with dynamic CTAs ───────────────── */}
      <HeroSlider />

      {/* 2. Value Proposition Badges (4-card banner) ────── */}
      <ValueProps />

      {/* 3. Flash Deals with live countdown rail ────────── */}
      <FlashDeals />

      {/* 4. Category Showcase Grid ──────────────────────── */}
      <CategoriesGrid />

      {/* 5. Curated Grid: Trending in Cairo ─────────────── */}
      <ProductGrid
        title="Trending in Cairo"
        subtitle="Fastest selling items across the capital this week"
        products={trending}
        viewAllHref="/products?sort=popular"
        badge="🔥 High Demand"
      />

      {/* 6. Curated Grid: Best Sellers ──────────────────── */}
      <div className="bg-zinc-100/60 dark:bg-zinc-950/40 border-y border-zinc-200/50 dark:border-zinc-800/60">
        <ProductGrid
          title="Best Sellers"
          subtitle="Top customer rated products with 1,000+ verified purchases"
          products={bestSellers}
          viewAllHref="/products?sort=rating"
          badge="🏆 Customer Choice"
        />
      </div>

      {/* 7. Curated Grid: Top Electronics ───────────────── */}
      <div className="bg-white dark:bg-zinc-900">
        <ProductGrid
          title="Top Electronics & Gadgets"
          subtitle="Smartphones, laptops, noise-canceling audio & accessories"
          products={topElectronics}
          viewAllHref="/products?category=electronics"
          badge="⚡ Tech Hub"
        />
      </div>

      {/* 8. Promotional Banner ──────────────────────────── */}
      <PromoBanner />
    </>
  );
}

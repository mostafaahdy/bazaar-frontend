'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search, SlidersHorizontal, LayoutGrid, List, X, Star, Check,
  ChevronRight, ArrowUpDown, Truck, Zap, Package, RefreshCw, Filter
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/catalog/ProductCardSkeleton';
import { PRODUCTS, CATEGORIES } from '@/lib/mockData';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import type { Product, Category } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useUIStore } from '@/lib/store';

interface ProductCatalogProps {
  initialCategorySlug?: string;
  initialSearchQuery?: string;
  initialFlashDealsOnly?: boolean;
  pageTitle?: string;
  pageDescription?: string;
}

type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

export default function ProductCatalog({
  initialCategorySlug,
  initialSearchQuery = '',
  initialFlashDealsOnly = false,
  pageTitle,
  pageDescription,
}: ProductCatalogProps) {
  const { currency } = useUIStore();

  // ─── Filter States ─────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategorySlug || 'all');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [expressOnly, setExpressOnly] = useState<boolean>(false);
  const [discountOnly, setDiscountOnly] = useState<boolean>(initialFlashDealsOnly);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

  // Live backend data states with mock data fallbacks
  const [liveProducts, setLiveProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);

  // Loading animation simulation when changing filters
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Sync when initialCategorySlug changes
  useEffect(() => {
    if (initialCategorySlug) setSelectedCategory(initialCategorySlug);
  }, [initialCategorySlug]);

  // Fetch live categories from backend API on mount
  useEffect(() => {
    categoryService.getCategories().then((cats) => {
      if (cats && cats.length > 0) setCategories(cats);
    });
  }, []);

  // Fetch products from live backend API when filter options change
  useEffect(() => {
    setIsLoading(true);
    productService
      .getProducts({
        categorySlug: selectedCategory === 'all' ? undefined : selectedCategory,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 100000 ? maxPrice : undefined,
        brand: selectedBrands.length === 1 ? selectedBrands[0] : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        inStockOnly: inStockOnly || undefined,
        expressOnly: expressOnly || undefined,
        flashDealsOnly: discountOnly || undefined,
        searchQuery: initialSearchQuery || undefined,
        sortBy: sortBy,
        pageSize: 50,
      })
      .then((res) => {
        if (res.items && res.items.length > 0) {
          setLiveProducts(res.items);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedCategory, minPrice, maxPrice, selectedBrands, minRating, inStockOnly, expressOnly, discountOnly, sortBy, initialSearchQuery]);

  // Extract all unique brands with product counts
  const availableBrands = useMemo(() => {
    const brandMap: Record<string, number> = {};
    liveProducts.forEach(p => {
      brandMap[p.brand] = (brandMap[p.brand] || 0) + 1;
    });
    return Object.entries(brandMap).map(([brand, count]) => ({ brand, count }));
  }, [liveProducts]);

  const filteredBrandList = useMemo(() => {
    if (!brandSearch) return availableBrands;
    return availableBrands.filter(b => b.brand.toLowerCase().includes(brandSearch.toLowerCase()));
  }, [availableBrands, brandSearch]);

  const resolveCategoryObject = useCallback((slug: string) => {
    const canonical = slug === 'home' ? 'home-living' : slug === 'baby' ? 'baby-products' : slug === 'groceries' ? 'supermarket' : slug;
    return categories.find(c => c.slug === slug || c.slug === canonical);
  }, [categories]);

  // ─── Filter and Sort Logic ──────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return liveProducts.filter(product => {
      // 1. Category filter
      if (selectedCategory !== 'all') {
        const cat = resolveCategoryObject(selectedCategory);
        if (cat) {
          const matchesId = product.categoryId === cat.id;
          const matchesName = product.categoryName.toLowerCase() === cat.name.toLowerCase();
          const cleanCat = cat.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          const cleanProd = product.categoryName.toLowerCase().replace(/[^a-z0-9]/g, '');
          const matchesFuzzy = cleanCat.includes(cleanProd) || cleanProd.includes(cleanCat);
          if (!matchesId && !matchesName && !matchesFuzzy) return false;
        }
      }

      // 2. Search query filter
      if (initialSearchQuery) {
        const query = initialSearchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesTag = product.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesName && !matchesBrand && !matchesDesc && !matchesTag) return false;
      }

      // 3. Price Range
      if (product.price < minPrice || product.price > maxPrice) return false;

      // 4. Brands
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;

      // 5. Rating
      if (minRating > 0 && product.rating < minRating) return false;

      // 6. Availability toggles
      if (inStockOnly && product.stock <= 0) return false;
      if (expressOnly && !product.freeShipping) return false;
      if (discountOnly && (!product.discountPercent || product.discountPercent <= 0)) return false;

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popular':
        default:
          return (b.soldCount || 0) - (a.soldCount || 0);
      }
    });
  }, [
    liveProducts,
    categories,
    selectedCategory,
    initialSearchQuery,
    minPrice,
    maxPrice,
    selectedBrands,
    minRating,
    inStockOnly,
    expressOnly,
    discountOnly,
    sortBy,
    resolveCategoryObject,
  ]);

  // Brand toggle handler
  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  // Clear all filters handler
  const resetFilters = () => {
    setSelectedCategory('all');
    setMinPrice(0);
    setMaxPrice(100000);
    setSelectedBrands([]);
    setMinRating(0);
    setInStockOnly(false);
    setExpressOnly(false);
    setDiscountOnly(false);
    setBrandSearch('');
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (minPrice > 0 || maxPrice < 100000) count++;
    if (selectedBrands.length > 0) count += selectedBrands.length;
    if (minRating > 0) count++;
    if (inStockOnly) count++;
    if (expressOnly) count++;
    if (discountOnly) count++;
    return count;
  }, [selectedCategory, minPrice, maxPrice, selectedBrands, minRating, inStockOnly, expressOnly, discountOnly]);

  const activeCategoryObject = resolveCategoryObject(selectedCategory);

  return (
    <div className="bg-zinc-50/60 dark:bg-zinc-950/50 min-h-screen py-6 md:py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* ── Breadcrumbs ──────────────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-zinc-500 overflow-x-auto hide-scrollbar py-1">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
          <Link href="/products" className="hover:text-indigo-600 transition-colors">All Products</Link>
          {activeCategoryObject && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {activeCategoryObject.name}
              </span>
            </>
          )}
          {initialSearchQuery && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                Search: &quot;{initialSearchQuery}&quot;
              </span>
            </>
          )}
        </nav>

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              {pageTitle || (activeCategoryObject ? activeCategoryObject.name : 'Explore All Products')}
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {pageDescription ||
                (initialSearchQuery
                  ? `Showing results matching "${initialSearchQuery}"`
                  : 'Genuine brands with express delivery across Cairo and Egyptian governorates.')}
            </p>
          </div>
          <div className="text-xs font-semibold text-zinc-500">
            Showing <span className="font-bold text-zinc-900 dark:text-zinc-100">{filteredProducts.length}</span> of {PRODUCTS.length} products
          </div>
        </div>

        {/* ── Main Layout: 2-Columns ───────────────────────────────────── */}
        <div className="flex gap-8 items-start">
          {/* ── Desktop Filter Sidebar (280px sticky) ──────────────────── */}
          <aside className="w-[280px] flex-shrink-0 hidden lg:block sticky top-32 bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6 max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin">
            {/* Filter Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Filters</h2>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* 1. Category Tree */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                Categories
              </h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                      selectedCategory === 'all'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span>All Categories</span>
                    <span className="text-[10px] text-zinc-400">{PRODUCTS.length}</span>
                  </button>
                </li>
                {categories.map(cat => {
                  const count = PRODUCTS.filter(p => p.categoryId === cat.id).length;
                  const isSelected = selectedCategory === cat.slug;
                  return (
                    <li key={cat.id}>
                      <button
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-[10px] text-zinc-400 ml-2">{count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* 2. Interactive Price Range */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                Price Range ({currency})
              </h3>

              {/* Min/Max numeric inputs */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1">
                  <span className="text-[10px] text-zinc-400 block mb-1">Min EGP</span>
                  <input
                    type="number"
                    min={0}
                    max={maxPrice}
                    step={500}
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold outline-none focus:border-indigo-500"
                  />
                </div>
                <span className="text-zinc-400 text-xs mt-4">-</span>
                <div className="flex-1">
                  <span className="text-[10px] text-zinc-400 block mb-1">Max EGP</span>
                  <input
                    type="number"
                    min={minPrice}
                    max={100000}
                    step={500}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value) || 100000)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Slider Representation */}
              <div className="space-y-2">
                <input
                  type="range"
                  min={0}
                  max={100000}
                  step={1000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-indigo-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Quick Price Range Presets */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[
                  { label: '< 2.5k', min: 0, max: 2500 },
                  { label: '2.5k - 10k', min: 2500, max: 10000 },
                  { label: '10k - 40k', min: 10000, max: 40000 },
                  { label: '> 40k', min: 40000, max: 100000 },
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={() => { setMinPrice(p.min); setMaxPrice(p.max); }}
                    className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Brand Multi-Select with Inline Search */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Brands
                </h3>
                {selectedBrands.length > 0 && (
                  <button
                    onClick={() => setSelectedBrands([])}
                    className="text-[10px] text-zinc-400 hover:text-indigo-600"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Search input inside brand block */}
              <div className="relative mb-2.5">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder="Find brand..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs outline-none focus:border-indigo-500 placeholder:text-zinc-400"
                />
              </div>

              {/* Brand list */}
              <div className="max-h-44 overflow-y-auto space-y-1.5 scrollbar-thin pr-1">
                {filteredBrandList.map(({ brand, count }) => {
                  const isChecked = selectedBrands.includes(brand);
                  return (
                    <label
                      key={brand}
                      className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 cursor-pointer p-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBrand(brand)}
                          className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700"
                        />
                        <span className="font-medium">{brand}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. Customer Rating Filter */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Customer Rating
              </h3>
              <div className="space-y-1.5">
                {[
                  { stars: 4, label: '4★ & above' },
                  { stars: 3, label: '3★ & above' },
                  { stars: 0, label: 'All ratings' },
                ].map(r => (
                  <label
                    key={r.stars}
                    className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer p-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <input
                      type="radio"
                      name="rating-filter"
                      checked={minRating === r.stars}
                      onChange={() => setMinRating(r.stars)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex items-center gap-1">
                      {r.stars > 0 ? (
                        <>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i <= r.stars
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-zinc-300 dark:text-zinc-700'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium text-xs ml-1">{r.label}</span>
                        </>
                      ) : (
                        <span className="font-medium">{r.label}</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 5. Availability & Shipping Toggles */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Preferences
              </h3>

              <label className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-zinc-400" /> In Stock Only
                </span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Truck className="w-3.5 h-3.5" /> Express Cairo Shipping
                </span>
                <input
                  type="checkbox"
                  checked={expressOnly}
                  onChange={(e) => setExpressOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                  <Zap className="w-3.5 h-3.5 fill-rose-500" /> On Discount / Deals
                </span>
                <input
                  type="checkbox"
                  checked={discountOnly}
                  onChange={(e) => setDiscountOnly(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
              </label>
            </div>
          </aside>

          {/* ── Main Product Section (Flex-1) ─────────────────────────── */}
          <main className="flex-1 min-w-0">
            {/* Top Control & Sort Bar */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-sm mb-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 transition-colors"
                >
                  <Filter className="w-4 h-4 text-indigo-600" />
                  <span>Filter & Refine</span>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Left: Dynamic Results count */}
                <div className="hidden sm:block text-xs font-medium text-zinc-500">
                  Showing <span className="font-bold text-zinc-900 dark:text-zinc-100">{filteredProducts.length}</span> matching products
                </div>

                {/* Right: Sort Dropdown + Grid/List View Toggle */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  {/* Sort Selector */}
                  <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs font-medium text-zinc-500 hidden md:inline">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="text-xs font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-indigo-500 text-zinc-800 dark:text-zinc-200"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest Arrivals</option>
                    </select>
                  </div>

                  {/* Layout View Mode Buttons */}
                  <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl p-0.5 bg-zinc-50 dark:bg-zinc-800">
                    <button
                      onClick={() => setViewLayout('grid')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        viewLayout === 'grid'
                          ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-700'
                      }`}
                      aria-label="Grid View"
                      title="Grid View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewLayout('list')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        viewLayout === 'list'
                          ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-700'
                      }`}
                      aria-label="List View"
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filter Chips / Pills */}
              {activeFilterCount > 0 && (
                <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-zinc-400 mr-1">Active filters:</span>

                  {selectedCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                      Category: {activeCategoryObject?.name}
                      <button onClick={() => setSelectedCategory('all')}>
                        <X className="w-3 h-3 hover:text-indigo-900" />
                      </button>
                    </span>
                  )}

                  {(minPrice > 0 || maxPrice < 100000) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                      {formatPrice(minPrice, currency)} - {formatPrice(maxPrice, currency)}
                      <button onClick={() => { setMinPrice(0); setMaxPrice(100000); }}>
                        <X className="w-3 h-3 hover:text-indigo-900" />
                      </button>
                    </span>
                  )}

                  {selectedBrands.map(b => (
                    <span key={b} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                      {b}
                      <button onClick={() => toggleBrand(b)}>
                        <X className="w-3 h-3 hover:text-indigo-900" />
                      </button>
                    </span>
                  ))}

                  {minRating > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                      ★ {minRating}+ Stars
                      <button onClick={() => setMinRating(0)}>
                        <X className="w-3 h-3 hover:text-amber-900" />
                      </button>
                    </span>
                  )}

                  {inStockOnly && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold">
                      In Stock
                      <button onClick={() => setInStockOnly(false)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {expressOnly && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                      Express Shipping
                      <button onClick={() => setExpressOnly(false)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {discountOnly && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800">
                      On Discount
                      <button onClick={() => setDiscountOnly(false)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  <button
                    onClick={resetFilters}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline ml-1"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* ── Product List/Grid View ───────────────────────────────── */}
            {isLoading ? (
              <div className={viewLayout === 'grid' ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4' : 'space-y-4'}>
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <ProductCardSkeleton key={n} layout={viewLayout} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 mx-auto flex items-center justify-center">
                  <Search className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    No matching products found
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                    Try broadening your filters, resetting price thresholds, or clearing selected brands to see more items.
                  </p>
                </div>
                <button onClick={resetFilters} className="btn-primary">
                  <RefreshCw className="w-4 h-4 mr-1.5" /> Reset All Filters
                </button>
              </div>
            ) : (
              <div className={viewLayout === 'grid' ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4' : 'space-y-4'}>
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} layout={viewLayout} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile Filter Slide-up Drawer ─────────────────────────────── */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer content */}
          <div className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white dark:bg-zinc-900 rounded-t-3xl shadow-2xl flex flex-col animate-slide-in-up">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Filter & Sort ({activeFilterCount})
                </h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Filters */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Category */}
              <div>
                <h4 className="text-xs font-bold uppercase text-zinc-400 mb-2">Category</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`p-2 rounded-xl text-xs font-bold text-left truncate ${
                      selectedCategory === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`p-2 rounded-xl text-xs font-bold text-left truncate ${
                        selectedCategory === cat.slug
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-xs font-bold uppercase text-zinc-400 mb-2">Price Limit (EGP)</h4>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                    placeholder="Min"
                    className="w-1/2 p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold bg-zinc-50 dark:bg-zinc-800"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value) || 100000)}
                    placeholder="Max"
                    className="w-1/2 p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>
              </div>

              {/* Brands */}
              <div>
                <h4 className="text-xs font-bold uppercase text-zinc-400 mb-2">Brands</h4>
                <div className="grid grid-cols-2 gap-2">
                  {availableBrands.map(({ brand }) => {
                    const isChecked = selectedBrands.includes(brand);
                    return (
                      <button
                        key={brand}
                        onClick={() => toggleBrand(brand)}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                          isChecked
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-600'
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <span className="truncate">{brand}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <label className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <span>In Stock Only</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </label>
                <label className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Free Express Cairo Delivery</span>
                  <input
                    type="checkbox"
                    checked={expressOnly}
                    onChange={(e) => setExpressOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                </label>
                <label className="flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
                  <span>Deals & Discounts</span>
                  <input
                    type="checkbox"
                    checked={discountOnly}
                    onChange={(e) => setDiscountOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600"
                  />
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-3 bg-zinc-50 dark:bg-zinc-900">
              <button
                onClick={resetFilters}
                className="w-1/3 btn-secondary justify-center py-3 text-xs"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-2/3 btn-primary justify-center py-3 text-xs font-bold"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Filter Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-full gradient-primary text-white font-bold text-xs shadow-xl shadow-indigo-600/30 active:scale-95"
        >
          <Filter className="w-4 h-4" />
          <span>Filter & Sort</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-indigo-600 text-[10px] flex items-center justify-center font-black">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

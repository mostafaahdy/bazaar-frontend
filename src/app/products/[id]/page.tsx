'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star, Heart, ShoppingCart, Truck, ShieldCheck, RotateCcw,
  Check, Zap, MapPin, ChevronRight, ChevronLeft, X, ZoomIn,
  ArrowRight, CheckCircle2, SlidersHorizontal,
  Package, Info, ThumbsUp, Sparkles, Plus, Minus
} from 'lucide-react';
import { PRODUCTS, getRelatedProducts } from '@/lib/mockData';
import { productService } from '@/services/productService';
import { useCartStore, useWishlistStore, useUIStore } from '@/lib/store';
import { formatPrice, calculateInstallment } from '@/lib/utils';
import ProductCard from '@/components/product/ProductCard';
import type { Product, ProductVariant } from '@/lib/types';

interface ProductPageProps {
  params: { id?: string; slug?: string };
}

// ── Color Swatches Palette ─────────────────────────────────
const COLOR_HEX_MAP: Record<string, string> = {
  'Natural Titanium': '#9a958e',
  'Black Titanium': '#1f2022',
  'White Titanium': '#f2f2f2',
  'Blue Titanium': '#2e3a4e',
  'Titanium Black': '#1b1b1d',
  'Titanium Gray': '#757472',
  'Titanium Violet': '#4f4460',
  'Titanium Yellow': '#e4d29a',
  'Space Black': '#1c1c1e',
  'Silver': '#e2e2e4',
  'Space Gray': '#4e4f51',
  'Midnight': '#181e28',
  'Starlight': '#f0eade',
  'Black': '#111111',
  'White': '#ffffff',
  'Blue': '#2563eb',
  'Red': '#dc2626',
  'Green': '#16a34a',
  'Gold': '#eab308',
  'Midnight Black': '#111827',
  'Platinum Silver': '#d1d5db',
  'Navy Blue': '#1e3a8a',
  'Deep Olive': '#365314',
};

// ── Frequently Bought Together Accessories Catalog ────────
interface AccessoryItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  image: string;
}

const CATEGORY_ACCESSORIES: Record<string, AccessoryItem[]> = {
  'cat-1': [
    {
      id: 'acc-mob-1',
      name: 'Official 20W USB-C PD Fast Wall Charger (Egyptian Plug)',
      brand: 'Apple / Anker',
      price: 650,
      originalPrice: 850,
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80',
    },
    {
      id: 'acc-mob-2',
      name: 'Ultra-Clear Military-Grade Shockproof Armor Case',
      brand: 'Spigen',
      price: 450,
      originalPrice: 600,
      image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80',
    },
  ],
  'cat-2': [
    {
      id: 'acc-elec-1',
      name: 'Premium Braided Nylon 100W Fast Charging Cable (2M)',
      brand: 'Anker',
      price: 350,
      originalPrice: 499,
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80',
    },
    {
      id: 'acc-elec-2',
      name: 'Hard-Shell Shockproof Water-Resistant Storage Pouch',
      brand: 'Bazaar Basics',
      price: 290,
      originalPrice: 420,
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80',
    },
  ],
  'cat-5': [
    {
      id: 'acc-comp-1',
      name: 'Multi-Port 7-in-1 Dual 4K HDMI USB-C Hub Adapter',
      brand: 'UGREEN',
      price: 1250,
      originalPrice: 1650,
      image: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=400&q=80',
    },
    {
      id: 'acc-comp-2',
      name: 'Ergonomic Silent Bluetooth Wireless Mouse with USB-C Recharge',
      brand: 'Logitech',
      price: 890,
      originalPrice: 1190,
      image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&q=80',
    },
  ],
  'default': [
    {
      id: 'acc-def-1',
      name: 'Bazaar 2-Year Extended Egyptian Official Warranty Plan',
      brand: 'Bazaar Care',
      price: 890,
      originalPrice: 1200,
      image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&q=80',
    },
    {
      id: 'acc-def-2',
      name: 'Premium Microfiber Screen & Lens Cleaning Kit',
      brand: 'CleanTech',
      price: 220,
      originalPrice: 350,
      image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&q=80',
    },
  ],
};

// ── Realistic Egyptian Customer Reviews ───────────────────
interface CustomerReview {
  id: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  verified: boolean;
  title: string;
  comment: string;
  helpfulCount: number;
}

const MOCK_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    author: 'Khaled Mahmoud',
    city: 'New Cairo, Egypt',
    rating: 5,
    date: '3 days ago',
    verified: true,
    title: 'Authentic Egyptian agent warranty & prompt next-day delivery!',
    comment:
      'Arrived in pristine factory-sealed condition with the official Tradeline/authorized warranty stamp. The Cairo courier called 30 minutes in advance. The ValU installment verification at checkout was completed in under 2 minutes.',
    helpfulCount: 42,
  },
  {
    id: 'rev-2',
    author: 'Sarah Mansour',
    city: 'Dokki, Giza',
    rating: 5,
    date: '1 week ago',
    verified: true,
    title: 'Exceeded expectations — Best price in Greater Cairo',
    comment:
      'Compared prices across multiple local retailers and Bazaar had the best discount by far. Product performance is top-notch, battery easily lasts through long commutes, and packaging was exceptionally secure.',
    helpfulCount: 28,
  },
  {
    id: 'rev-3',
    author: 'Omar El-Sherif',
    city: 'Alexandria, Egypt',
    rating: 4,
    date: '2 weeks ago',
    verified: true,
    title: 'Great quality, delivered to Alex in 2 business days',
    comment:
      'Very solid build quality and genuine accessories included. Took 48 hours to arrive in Smouha, Alexandria. Excellent customer service support on WhatsApp when inquiring about installment tenors.',
    helpfulCount: 15,
  },
  {
    id: 'rev-4',
    author: 'Yasmin Taha',
    city: 'Sheikh Zayed, Giza',
    rating: 5,
    date: '3 weeks ago',
    verified: true,
    title: '100% genuine product & 14-day return peace of mind',
    comment:
      'I was hesitant about ordering electronics online, but Bazaar.eg proved completely trustworthy. Serial number verified cleanly on the manufacturer portal.',
    helpfulCount: 19,
  },
];

export default function ProductDetailPage({ params }: ProductPageProps) {
  const router = useRouter();
  const rawId = params?.id || params?.slug || '';

  // Initial lookup from mockData for instant SSR / zero layout shift
  const [product, setProduct] = useState<Product | null>(() => {
    return PRODUCTS.find(p => p.id === rawId || p.slug === rawId) || null;
  });
  const [isLoading, setIsLoading] = useState(!product);

  useEffect(() => {
    if (!rawId) return;
    productService
      .getProductById(rawId)
      .then((liveProd) => {
        if (liveProd) {
          setProduct(liveProd);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [rawId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-20 px-4">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 mx-auto flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">Product Not Found</h1>
          <p className="text-xs text-zinc-500">
            We couldn&apos;t locate the requested item. It may have been relocated or is currently out of stock.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Link href="/products" className="btn-primary py-2.5 px-6 text-xs font-bold">
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ProductDetailContent product={product} router={router} />;
}

function ProductDetailContent({
  product,
  router,
}: {
  product: Product;
  router: ReturnType<typeof useRouter>;
}) {
  const { addItem, openCart } = useCartStore();
  const { toggle: toggleWishlist, hasItem } = useWishlistStore();
  const { currency, deliveryLocation } = useUIStore();

  const buyBoxRef = useRef<HTMLDivElement>(null);
  const relatedScrollRef = useRef<HTMLDivElement>(null);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLightboxZoomed, setIsLightboxZoomed] = useState(false);

  // Variant & configuration state
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants?.[0]?.id || ''
  );

  // Color & Storage derived selectors
  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    product.variants?.forEach(v => {
      if (v.attributes?.color) colors.add(v.attributes.color);
    });
    if (colors.size === 0) {
      if (product.categoryId === 'cat-1') return ['Natural Titanium', 'Black Titanium', 'White Titanium', 'Blue Titanium'];
      if (product.categoryId === 'cat-2') return ['Space Black', 'Silver', 'Midnight'];
      return ['Midnight Black', 'Platinum Silver'];
    }
    return Array.from(colors);
  }, [product]);

  const [activeColor, setActiveColor] = useState<string>(availableColors[0] || 'Default');

  const availableStorages = useMemo(() => {
    const storages = new Set<string>();
    product.variants?.forEach(v => {
      if (v.attributes?.storage) storages.add(v.attributes.storage);
      if (v.attributes?.size) storages.add(v.attributes.size);
    });
    if (storages.size === 0) {
      if (product.categoryId === 'cat-1') return ['128GB', '256GB', '512GB', '1TB'];
      if (product.categoryId === 'cat-2') return ['256GB', '512GB', '1TB'];
      if (product.categoryId === 'cat-3') return ['S', 'M', 'L', 'XL'];
      return ['Standard Edition', 'Pro Bundle'];
    }
    return Array.from(storages);
  }, [product]);

  const [activeStorage, setActiveStorage] = useState<string>(availableStorages[0] || 'Standard');

  // Quantity & Action state
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'overview' | 'reviews'>('overview');

  // Review filters & state
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  // Frequently Bought Together bundle selection
  const accessoryCandidates = useMemo(() => {
    return CATEGORY_ACCESSORIES[product.categoryId] || CATEGORY_ACCESSORIES['default'];
  }, [product.categoryId]);

  const [selectedAccessories, setSelectedAccessories] = useState<Record<string, boolean>>({
    [accessoryCandidates[0]?.id || 'acc-1']: true,
    [accessoryCandidates[1]?.id || 'acc-2']: true,
  });

  const isWishlisted = hasItem(product.id);

  // Active variant resolution
  const activeVariant: ProductVariant | undefined = useMemo(() => {
    return product.variants?.find(v => v.id === selectedVariantId) || product.variants?.[0];
  }, [product.variants, selectedVariantId]);

  const currentPrice = activeVariant ? activeVariant.price : product.price;
  const currentOriginalPrice = activeVariant ? activeVariant.originalPrice : product.originalPrice;
  const savingsAmount = currentOriginalPrice ? currentOriginalPrice - currentPrice : 0;
  const monthlyInstallment = calculateInstallment(currentPrice, 12);

  const relatedProducts = useMemo(() => getRelatedProducts(product, 6), [product]);

  // Scroll listener for sticky action bar
  useEffect(() => {
    const handleScroll = () => {
      if (buyBoxRef.current) {
        const rect = buyBoxRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard controls for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') {
        setActiveImageIndex(i => (i === product.images.length - 1 ? 0 : i + 1));
      }
      if (e.key === 'ArrowLeft') {
        setActiveImageIndex(i => (i === 0 ? product.images.length - 1 : i - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, product.images.length]);

  // Mouse lens zoom handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max(0, ((e.clientX - left) / width) * 100), 100);
    const y = Math.min(Math.max(0, ((e.clientY - top) / height) * 100), 100);
    setZoomPos({ x, y });
  };

  const handleMouseLeave = () => {
    setZoomPos(null);
  };

  // Add to cart handler
  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      addItem({
        productId: product.id,
        variantId: activeVariant?.id,
        variantLabel: `${activeColor} / ${activeStorage}`,
        name: product.name,
        brand: product.brand,
        image: product.images[0]?.url || '',
        price: currentPrice,
        originalPrice: currentOriginalPrice,
        quantity,
        maxQuantity: activeVariant?.stock || product.stock,
        categoryName: product.categoryName,
        freeShipping: product.freeShipping ?? false,
      });
      setIsAdding(false);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }, 200);
  };

  // Direct checkout handler
  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      variantId: activeVariant?.id,
      variantLabel: `${activeColor} / ${activeStorage}`,
      name: product.name,
      brand: product.brand,
      image: product.images[0]?.url || '',
      price: currentPrice,
      originalPrice: currentOriginalPrice,
      quantity,
      maxQuantity: activeVariant?.stock || product.stock,
      categoryName: product.categoryName,
      freeShipping: product.freeShipping ?? false,
    });
    router.push('/checkout');
  };

  // Add bundle to cart handler
  const handleAddBundleToCart = () => {
    // 1. Add main product
    addItem({
      productId: product.id,
      variantId: activeVariant?.id,
      variantLabel: `${activeColor} / ${activeStorage}`,
      name: product.name,
      brand: product.brand,
      image: product.images[0]?.url || '',
      price: currentPrice,
      originalPrice: currentOriginalPrice,
      quantity: 1,
      maxQuantity: activeVariant?.stock || product.stock,
      categoryName: product.categoryName,
      freeShipping: product.freeShipping ?? false,
    });

    // 2. Add selected accessories
    accessoryCandidates.forEach(acc => {
      if (selectedAccessories[acc.id]) {
        addItem({
          productId: acc.id,
          name: acc.name,
          brand: acc.brand,
          image: acc.image,
          price: acc.price,
          originalPrice: acc.originalPrice,
          quantity: 1,
          maxQuantity: 10,
          categoryName: 'Accessories',
          freeShipping: true,
        });
      }
    });

    openCart();
  };

  // Calculate bundle total price
  const bundleTotalPrice = useMemo(() => {
    let sum = currentPrice;
    accessoryCandidates.forEach(acc => {
      if (selectedAccessories[acc.id]) {
        sum += acc.price;
      }
    });
    return sum;
  }, [currentPrice, accessoryCandidates, selectedAccessories]);

  const bundleOriginalPrice = useMemo(() => {
    let sum = currentOriginalPrice || currentPrice;
    accessoryCandidates.forEach(acc => {
      if (selectedAccessories[acc.id]) {
        sum += acc.originalPrice;
      }
    });
    return sum;
  }, [currentOriginalPrice, currentPrice, accessoryCandidates, selectedAccessories]);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return MOCK_REVIEWS.filter(rev => {
      if (reviewRatingFilter !== null && rev.rating !== reviewRatingFilter) return false;
      if (verifiedOnly && !rev.verified) return false;
      return true;
    });
  }, [reviewRatingFilter, verifiedOnly]);

  const currentImage = product.images[activeImageIndex] || product.images[0];

  return (
    <div className="bg-zinc-50/70 dark:bg-zinc-950 min-h-screen py-6 md:py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-10">
        {/* ── Breadcrumb Navigation ─────────────────────────────────── */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-zinc-400 overflow-x-auto hide-scrollbar py-1">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link href={`/products?category=${product.categoryId}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {product.categoryName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link href={`/products?brand=${encodeURIComponent(product.brand)}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {product.brand}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-sm">
            {product.name}
          </span>
        </nav>

        {/* ── TOP SECTION: Desktop 2-Column Split ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start" ref={buyBoxRef}>
          {/* ── LEFT COLUMN: Media Gallery (6 cols) ───────────────────── */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Stage Image with Hover Lens Magnification */}
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => setIsLightboxOpen(true)}
              className="relative h-96 sm:h-[500px] rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 flex items-center justify-center overflow-hidden cursor-zoom-in shadow-sm group select-none transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImage?.url}
                alt={currentImage?.alt || product.name}
                className="max-h-full max-w-full object-contain pointer-events-none transition-transform duration-150"
                style={{
                  transformOrigin: zoomPos ? `${zoomPos.x}% ${zoomPos.y}%` : 'center center',
                  transform: zoomPos ? 'scale(2.2)' : 'scale(1)',
                }}
              />

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
                {product.freeShipping && (
                  <span className="badge bg-emerald-600 text-white text-[11px] font-black px-3 py-1 shadow-md flex items-center gap-1.5 uppercase tracking-wide">
                    <Truck className="w-3.5 h-3.5" /> Express Cairo
                  </span>
                )}
                {product.isFlashDeal && (
                  <span className="badge bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600 text-white font-extrabold text-[11px] px-3 py-1 shadow-md shadow-orange-500/25 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-white" /> FLASH DEAL -{product.discountPercent || 25}%
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="badge bg-amber-500 text-zinc-950 font-black text-[10px] px-2.5 py-0.5 shadow-sm uppercase tracking-wide">
                    ★ Best Seller
                  </span>
                )}
              </div>

              {/* Fullscreen Trigger Overlay Pill */}
              <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/70 hover:bg-zinc-900 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-md">
                <ZoomIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Click to Expand</span>
              </div>

              {/* Hover Zoom hint */}
              <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-1 text-[11px] text-zinc-400 bg-white/80 dark:bg-zinc-800/80 px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                <span>Hover to zoom (2.2×)</span>
              </div>
            </div>

            {/* Thumbnail Carousel Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 pt-1">
                {product.images.map((img, idx) => {
                  const isSelected = activeImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      onMouseEnter={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-2xl p-2 bg-white dark:bg-zinc-900 border-2 transition-all overflow-hidden flex-shrink-0 ${
                        isSelected
                          ? 'border-indigo-600 shadow-md shadow-indigo-600/20 scale-105'
                          : 'border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-100 hover:border-zinc-300'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.alt} className="w-full h-full object-contain" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: Product Actions & Buy Box (6 cols) ──────── */}
          <div className="lg:col-span-6 space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                <Link
                  href={`/products?brand=${encodeURIComponent(product.brand)}`}
                  className="font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {product.brand} Official
                </Link>
                <span className="font-mono text-zinc-400">SKU: {activeVariant?.sku || `BZR-${product.id}`}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                {product.name}
              </h1>

              {/* Ratings and Reviews */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800/60">
                  <span className="text-xs font-black text-amber-700 dark:text-amber-300">
                    {product.rating}
                  </span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i <= Math.round(product.rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-zinc-300 dark:text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <span className="text-zinc-300 dark:text-zinc-700">|</span>

                <button
                  onClick={() => setActiveTab('reviews')}
                  className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold"
                >
                  {product.reviewCount.toLocaleString()} Verified Ratings & Reviews
                </button>

                <span className="text-zinc-300 dark:text-zinc-700">|</span>

                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Genuine
                </span>
              </div>
            </div>

            {/* Price section & ValU badge */}
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {formatPrice(currentPrice, currency)}
                </span>
                {currentOriginalPrice && (
                  <span className="text-base text-zinc-400 line-through font-semibold">
                    {formatPrice(currentOriginalPrice, currency)}
                  </span>
                )}
                {savingsAmount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold">
                    Save {formatPrice(savingsAmount, currency)} ({product.discountPercent || 18}%)
                  </span>
                )}
              </div>

              {/* ValU Installment Widget */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/40">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ValU Buy Now, Pay Later
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
                    {formatPrice(monthlyInstallment, currency)} / month
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Spread over 12 months with 0% down payment on your Egyptian National ID. Up to 60 months available at checkout.
                </p>
              </div>
            </div>

            {/* Color Variant Selector */}
            {availableColors.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Color: <strong className="text-zinc-900 dark:text-zinc-100 capitalize">{activeColor}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {availableColors.map(color => {
                    const isSelected = activeColor === color;
                    const hexColor = COLOR_HEX_MAP[color] || '#4f46e5';

                    return (
                      <button
                        key={color}
                        onClick={() => setActiveColor(color)}
                        className={`group relative p-1 rounded-full transition-transform active:scale-95 ${
                          isSelected ? 'ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-zinc-950 scale-110' : 'hover:scale-105'
                        }`}
                        title={color}
                      >
                        <span
                          className="block w-7 h-7 rounded-full border border-black/10 dark:border-white/20 shadow-inner"
                          style={{ backgroundColor: hexColor }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Storage / Size Selector */}
            {availableStorages.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Capacity / Size: <strong className="text-zinc-900 dark:text-zinc-100">{activeStorage}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {availableStorages.map((storage, idx) => {
                    const isSelected = activeStorage === storage;
                    const matchedVariant = product.variants?.[idx];

                    return (
                      <button
                        key={storage}
                        onClick={() => {
                          setActiveStorage(storage);
                          if (matchedVariant) setSelectedVariantId(matchedVariant.id);
                        }}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                        }`}
                      >
                        {storage}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock indicator & Quantity Stepper */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {product.stock <= 5 ? (
                      <span className="text-rose-600 dark:text-rose-400 font-extrabold">
                        Only {product.stock} units left in Cairo Hub!
                      </span>
                    ) : (
                      'In Stock (Cairo Warehouse)'
                    )}
                  </span>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden bg-white dark:bg-zinc-800 p-0.5">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors disabled:opacity-30"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-extrabold text-zinc-900 dark:text-zinc-100">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="w-8 h-8 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action CTAs: Add to Cart, Buy Now, Wishlist */}
              <div className="space-y-2.5 pt-2">
                <div className="flex gap-2.5">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className={`flex-1 py-4 px-6 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 ${
                      justAdded
                        ? 'bg-emerald-600 text-white'
                        : 'btn-primary shadow-indigo-600/25'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-5 h-5" /> Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" /> Add to Cart
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      toggleWishlist({
                        productId: product.id,
                        addedAt: new Date().toISOString(),
                        name: product.name,
                        image: product.images[0]?.url || '',
                        price: currentPrice,
                        originalPrice: currentOriginalPrice,
                      })
                    }
                    aria-label="Toggle wishlist"
                    className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all shadow-sm active:scale-90 ${
                      isWishlisted
                        ? 'bg-rose-500 text-white border-rose-500 shadow-rose-500/25'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-white' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-extrabold border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Buy Now — Instant Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Delivery & Fulfilled Trust Box */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    Deliver to <span className="text-indigo-600 dark:text-indigo-400">{deliveryLocation}</span>
                  </p>
                  <p className="text-zinc-500 mt-0.5">
                    Order before 2:00 PM for <strong className="text-emerald-600 dark:text-emerald-400">Guaranteed Tomorrow Delivery</strong> via Bazaar Express.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800">
                <RotateCcw className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    14-Day Free Returns
                  </p>
                  <p className="text-zinc-500 mt-0.5">
                    Zero hassle, 100% free doorstep pickup across Cairo, Giza & Alexandria.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800">
                <ShieldCheck className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    Official Egyptian Agent Warranty
                  </p>
                  <p className="text-zinc-500 mt-0.5">
                    {product.warranty || '1 Year Authorized Local Agent Warranty with repair center support.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── FREQUENTLY BOUGHT TOGETHER BUNDLE SECTION ────────────── */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wide mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Bundle & Save
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              Frequently Bought Together
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Save extra when purchasing these recommended accessories together with your {product.name}.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pt-2">
            {/* Items row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
              {/* Main item */}
              <div className="flex flex-col items-center text-center max-w-[150px]">
                <div className="w-24 h-24 rounded-2xl bg-zinc-50 dark:bg-zinc-800 p-2 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.images[0]?.url} alt={product.name} className="max-h-full max-w-full object-contain" />
                </div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 mt-2">{product.name}</p>
                <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{formatPrice(currentPrice, currency)}</p>
                <span className="text-[10px] text-zinc-400 font-semibold mt-0.5">(This Item)</span>
              </div>

              {/* Plus 1 */}
              {accessoryCandidates[0] && (
                <>
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center font-bold">
                    +
                  </div>
                  <div className="flex flex-col items-center text-center max-w-[150px]">
                    <div className="w-24 h-24 rounded-2xl bg-zinc-50 dark:bg-zinc-800 p-2 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={accessoryCandidates[0].image} alt={accessoryCandidates[0].name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 mt-2">{accessoryCandidates[0].name}</p>
                    <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{formatPrice(accessoryCandidates[0].price, currency)}</p>
                    <label className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!selectedAccessories[accessoryCandidates[0].id]}
                        onChange={e => setSelectedAccessories(prev => ({ ...prev, [accessoryCandidates[0].id]: e.target.checked }))}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Include</span>
                    </label>
                  </div>
                </>
              )}

              {/* Plus 2 */}
              {accessoryCandidates[1] && (
                <>
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center font-bold">
                    +
                  </div>
                  <div className="flex flex-col items-center text-center max-w-[150px]">
                    <div className="w-24 h-24 rounded-2xl bg-zinc-50 dark:bg-zinc-800 p-2 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={accessoryCandidates[1].image} alt={accessoryCandidates[1].name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 mt-2">{accessoryCandidates[1].name}</p>
                    <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{formatPrice(accessoryCandidates[1].price, currency)}</p>
                    <label className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!selectedAccessories[accessoryCandidates[1].id]}
                        onChange={e => setSelectedAccessories(prev => ({ ...prev, [accessoryCandidates[1].id]: e.target.checked }))}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Include</span>
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Bundle Checkout Box */}
            <div className="w-full lg:w-72 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-center lg:text-left space-y-3 flex-shrink-0">
              <div>
                <p className="text-xs text-zinc-500 font-semibold">Total Bundle Price:</p>
                <div className="flex items-baseline justify-center lg:justify-start gap-2 mt-0.5">
                  <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                    {formatPrice(bundleTotalPrice, currency)}
                  </span>
                  {bundleOriginalPrice > bundleTotalPrice && (
                    <span className="text-xs text-zinc-400 line-through">
                      {formatPrice(bundleOriginalPrice, currency)}
                    </span>
                  )}
                </div>
                {bundleOriginalPrice > bundleTotalPrice && (
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    ✓ You save {formatPrice(bundleOriginalPrice - bundleTotalPrice, currency)}!
                  </p>
                )}
              </div>

              <button
                onClick={handleAddBundleToCart}
                className="btn-primary w-full py-3 text-xs font-bold justify-center shadow-lg shadow-indigo-600/20"
              >
                Add Bundle to Cart
              </button>
            </div>
          </div>
        </section>

        {/* ── DETAILS & REVIEWS TABS ─────────────────────────────────── */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-6 md:p-8 shadow-sm space-y-6">
          {/* Tabs Selector */}
          <div className="flex gap-4 sm:gap-8 border-b border-zinc-200 dark:border-zinc-800 pb-3 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`text-sm font-extrabold pb-3 transition-colors relative flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>Overview & Highlights</span>
              {activeTab === 'overview' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`text-sm font-extrabold pb-3 transition-colors relative flex items-center gap-2 ${
                activeTab === 'specs'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Technical Specifications</span>
              {activeTab === 'specs' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`text-sm font-extrabold pb-3 transition-colors relative flex items-center gap-2 ${
                activeTab === 'reviews'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Star className="w-4 h-4 text-amber-500" />
              <span>Customer Reviews ({product.reviewCount})</span>
              {activeTab === 'reviews' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-4xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              <p className="text-base text-zinc-800 dark:text-zinc-200 font-medium">
                {product.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                  <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Egyptian Market Official Release
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Sourced directly from authorized local brand distributors in Egypt with full Arabic & English documentation, local firmware, and national carrier certification (Vodafone, Orange, etisalat by e&, WE).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                  <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Authorized Local Warranty
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Covered by {product.warranty || '1 Year Authorized Local Agent Warranty'} across accredited Egyptian service centers with original replacement components.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-base mb-3">
                  Key Product Highlights
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <li className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                    <span>Grade-A premium industrial construction & finish</span>
                  </li>
                  <li className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                    <span>Energy efficient operation compliant with Egyptian standards</span>
                  </li>
                  <li className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                    <span>High-speed connectivity and localized multi-language UI</span>
                  </li>
                  <li className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                    <span>Includes original Egyptian market power plug & accessories</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: TECHNICAL SPECIFICATIONS (Alternating 2-column table) */}
          {activeTab === 'specs' && (
            <div className="max-w-3xl space-y-6">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <tr className="bg-zinc-50 dark:bg-zinc-800/60">
                      <td className="p-3.5 font-extrabold text-zinc-500 w-1/3">Brand</td>
                      <td className="p-3.5 font-bold text-zinc-900 dark:text-zinc-100">{product.brand}</td>
                    </tr>
                    <tr className="bg-white dark:bg-zinc-900">
                      <td className="p-3.5 font-extrabold text-zinc-500">Model Name / Series</td>
                      <td className="p-3.5 font-bold text-zinc-900 dark:text-zinc-100">{product.name}</td>
                    </tr>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/60">
                      <td className="p-3.5 font-extrabold text-zinc-500">Category</td>
                      <td className="p-3.5 font-bold text-zinc-900 dark:text-zinc-100">{product.categoryName}</td>
                    </tr>
                    <tr className="bg-white dark:bg-zinc-900">
                      <td className="p-3.5 font-extrabold text-zinc-500">Condition</td>
                      <td className="p-3.5 font-bold text-zinc-900 dark:text-zinc-100 capitalize">{product.condition} (Factory Sealed)</td>
                    </tr>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/60">
                      <td className="p-3.5 font-extrabold text-zinc-500">Selected Color</td>
                      <td className="p-3.5 font-bold text-zinc-900 dark:text-zinc-100">{activeColor}</td>
                    </tr>
                    <tr className="bg-white dark:bg-zinc-900">
                      <td className="p-3.5 font-extrabold text-zinc-500">Storage / Configuration</td>
                      <td className="p-3.5 font-bold text-zinc-900 dark:text-zinc-100">{activeStorage}</td>
                    </tr>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/60">
                      <td className="p-3.5 font-extrabold text-zinc-500">SKU / Model Number</td>
                      <td className="p-3.5 font-mono font-bold text-zinc-900 dark:text-zinc-100">{activeVariant?.sku || `BZR-${product.id}`}</td>
                    </tr>
                    <tr className="bg-white dark:bg-zinc-900">
                      <td className="p-3.5 font-extrabold text-zinc-500">Warranty Coverage</td>
                      <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">{product.warranty || '1 Year Official Egyptian Warranty'}</td>
                    </tr>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/60">
                      <td className="p-3.5 font-extrabold text-zinc-500">Fulfillment & Delivery</td>
                      <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                        {product.freeShipping ? 'Bazaar Express Free Cairo & Giza Delivery' : 'Standard Nationwide Delivery'}
                      </td>
                    </tr>
                    <tr className="bg-white dark:bg-zinc-900">
                      <td className="p-3.5 font-extrabold text-zinc-500">In The Box</td>
                      <td className="p-3.5 font-medium text-zinc-700 dark:text-zinc-300">
                        Handset/Device, Official Charging Cable, Arabic/English Documentation, Warranty Certification Card.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER RATINGS & REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Rating breakdown scorecard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 items-center">
                <div className="text-center md:border-r md:border-zinc-200 dark:md:border-zinc-700 md:pr-6">
                  <div className="text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {product.rating}
                  </div>
                  <div className="flex gap-1 justify-center my-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500">
                    Based on <strong className="text-zinc-800 dark:text-zinc-200">{product.reviewCount}</strong> customer ratings
                  </p>
                </div>

                {/* Rating bars */}
                <div className="md:col-span-2 space-y-2 text-xs">
                  {[
                    { stars: 5, pct: 82, count: 2334 },
                    { stars: 4, pct: 12, count: 341 },
                    { stars: 3, pct: 4, count: 114 },
                    { stars: 2, pct: 1, count: 28 },
                    { stars: 1, pct: 1, count: 30 },
                  ].map(row => (
                    <div key={row.stars} className="flex items-center gap-3">
                      <span className="font-bold w-7 text-zinc-600 dark:text-zinc-400">{row.stars} ★</span>
                      <div className="flex-1 bg-zinc-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-zinc-400 text-[11px]">{row.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review filters toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-zinc-500">Filter by:</span>
                  <button
                    onClick={() => setReviewRatingFilter(null)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      reviewRatingFilter === null
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                    }`}
                  >
                    All Stars
                  </button>
                  {[5, 4, 3].map(s => (
                    <button
                      key={s}
                      onClick={() => setReviewRatingFilter(reviewRatingFilter === s ? null : s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        reviewRatingFilter === s
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                      }`}
                    >
                      {s} Stars
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={e => setVerifiedOnly(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Verified Purchases Only</span>
                </label>
              </div>

              {/* Review cards list */}
              <div className="space-y-4 pt-2">
                {filteredReviews.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-6">No reviews match the selected filter.</p>
                ) : (
                  filteredReviews.map(rev => {
                    const isLiked = !!likedReviews[rev.id];

                    return (
                      <div
                        key={rev.id}
                        className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-3"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                              {rev.author}
                            </span>
                            {rev.verified && (
                              <span className="badge bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                                ✓ Verified Egyptian Buyer ({rev.city})
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-400">{rev.date}</span>
                        </div>

                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= rev.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-zinc-200 dark:text-zinc-700'
                              }`}
                            />
                          ))}
                        </div>

                        <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                          {rev.title}
                        </h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {rev.comment}
                        </p>

                        <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400">
                          <span>Verified delivery via Bazaar Express Cairo</span>
                          <button
                            onClick={() => setLikedReviews(prev => ({ ...prev, [rev.id]: !prev[rev.id] }))}
                            className={`flex items-center gap-1.5 transition-colors ${
                              isLiked ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'hover:text-zinc-700'
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-indigo-600' : ''}`} />
                            <span>Helpful ({rev.helpfulCount + (isLiked ? 1 : 0)})</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RELATED PRODUCTS HORIZONTAL CAROUSEL ─────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="mb-12 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="section-title">Customers Also Viewed</h2>
                <p className="section-subtitle mt-0.5">Similar verified items in {product.categoryName}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => relatedScrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => relatedScrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={relatedScrollRef}
              className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 pt-1 scroll-smooth"
            >
              {relatedProducts.map(rel => (
                <div key={rel.id} className="w-64 sm:w-72 flex-shrink-0">
                  <ProductCard product={rel} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── STICKY BOTTOM ACTION BAR (When scrolled past buy box) ───── */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 shadow-2xl py-3 px-4 animate-fade-in transition-all">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
            {/* Product thumbnail & title */}
            <div className="flex items-center gap-3 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[0]?.url}
                alt={product.name}
                className="w-11 h-11 rounded-xl object-contain bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                  {product.name}
                </p>
                <p className="text-[11px] text-zinc-500 truncate">
                  {activeColor && `Color: ${activeColor} • `}
                  {activeStorage && `Config: ${activeStorage} • `}
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">In Stock</span>
                </p>
              </div>
            </div>

            {/* Price & Quick CTAs */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-base font-black text-zinc-900 dark:text-zinc-100">
                  {formatPrice(currentPrice, currency)}
                </p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  From {formatPrice(monthlyInstallment, currency)}/mo with ValU
                </p>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn-primary py-2.5 px-4 sm:px-6 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="hidden md:inline-flex py-2.5 px-5 rounded-2xl text-xs sm:text-sm font-bold border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FULLSCREEN LIGHTBOX DIALOG MODAL ───────────────────────── */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-fade-in select-none">
          {/* Header */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base">{product.name}</span>
              <span className="text-zinc-400 text-xs">
                ({activeImageIndex + 1} of {product.images.length})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLightboxZoomed(!isLightboxZoomed)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                title="Toggle Magnify"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Stage with Navigation Arrows */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden my-4">
            {product.images.length > 1 && (
              <button
                onClick={() => setActiveImageIndex(i => (i === 0 ? product.images.length - 1 : i - 1))}
                className="absolute left-2 sm:left-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage?.url}
              alt={product.name}
              className={`max-h-[75vh] max-w-[85vw] object-contain transition-transform duration-300 ${
                isLightboxZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
              }`}
              onClick={() => setIsLightboxZoomed(!isLightboxZoomed)}
            />

            {product.images.length > 1 && (
              <button
                onClick={() => setActiveImageIndex(i => (i === product.images.length - 1 ? 0 : i + 1))}
                className="absolute right-2 sm:right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Thumbnails strip */}
          <div className="flex justify-center gap-2 overflow-x-auto py-2 z-10">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all p-1 bg-white/5 ${
                  activeImageIndex === idx ? 'border-indigo-500 scale-105' : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

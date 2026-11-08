'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Star, Zap, Package, Check, Loader2, Truck, ShieldCheck } from 'lucide-react';
import { useCartStore, useWishlistStore, useUIStore } from '@/lib/store';
import { formatPrice, truncate, calculateInstallment } from '@/lib/utils';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
  layout?: 'grid' | 'list';
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i <= Math.round(rating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-zinc-200 dark:text-zinc-700'
            }`}
          />
        ))}
      </div>
      <span className="text-[11px] text-zinc-500 font-medium">({count.toLocaleString()})</span>
    </div>
  );
}

export default function ProductCard({
  product,
  variant = 'default',
  layout = 'grid',
}: ProductCardProps) {
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const { addItem } = useCartStore();
  const { toggle: toggleWishlist, hasItem } = useWishlistStore();
  const { currency } = useUIStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isWishlisted = mounted ? hasItem(product.id) : false;
  const currentCurrency = mounted ? currency : 'EGP';
  const isCompact = variant === 'compact';
  const isList = layout === 'list';

  const monthlyInstallment = calculateInstallment(product.price, 12);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding) return;

    setIsAdding(true);
    // Realistic momentary micro-interaction
    setTimeout(() => {
      addItem({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        image: product.images[0]?.url || '',
        price: product.price,
        originalPrice: product.originalPrice,
        quantity: 1,
        maxQuantity: product.stock,
        categoryName: product.categoryName,
        freeShipping: product.freeShipping ?? false,
      });
      setIsAdding(false);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1600);
    }, 250);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      productId: product.id,
      addedAt: new Date().toISOString(),
      name: product.name,
      image: product.images[0]?.url || '',
      price: product.price,
      originalPrice: product.originalPrice,
    });
  };

  // Target navigation link
  const productHref = `/products/${product.id}`;

  // ─── LIST VIEW LAYOUT ──────────────────────────────────────────────
  if (isList) {
    return (
      <Link
        href={productHref}
        className="product-card group flex flex-col sm:flex-row bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300 overflow-hidden"
      >
        {/* Left: Image Container */}
        <div className="relative sm:w-64 h-56 sm:h-auto flex-shrink-0 bg-zinc-50 dark:bg-zinc-800/60 overflow-hidden">
          {imageError ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-400">
              <Package className="w-10 h-10" />
              <span className="text-xs">{product.brand}</span>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]?.url}
              alt={product.images[0]?.alt || product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
            {product.discountPercent && (
              <span className="badge bg-rose-600 text-white font-extrabold text-[11px] shadow-sm">
                Save {product.discountPercent}%
              </span>
            )}
            {product.isFlashDeal && (
              <span className="badge bg-gradient-to-r from-orange-500 to-rose-600 text-white font-bold text-[10px] shadow-md shadow-orange-500/25">
                <Zap className="w-3 h-3 fill-white" /> FLASH DEAL
              </span>
            )}
          </div>

          {product.freeShipping && (
            <span className="absolute top-3 right-3 badge bg-emerald-600 text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
              <Truck className="w-3 h-3" /> EXPRESS
            </span>
          )}
        </div>

        {/* Center: Details & Metadata */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {product.brand}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-xs text-zinc-500">{product.categoryName}</span>
            </div>

            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
              {product.name}
            </h3>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
              {product.description || product.shortDescription}
            </p>

            {/* Rating */}
            <div className="mt-3">
              <StarRating rating={product.rating} count={product.reviewCount} />
            </div>

            {/* Highlights */}
            <div className="flex items-center gap-2 mt-3 flex-wrap text-[11px] text-zinc-600 dark:text-zinc-400">
              {product.warranty && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> {product.warranty}
                </span>
              )}
              {product.freeShipping && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium">
                  <Truck className="w-3.5 h-3.5" /> Free Cairo Delivery
                </span>
              )}
            </div>
          </div>

          {/* Scarcity */}
          {product.stock <= 10 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-3">
              ⚠️ Only {product.stock} units remaining in Egypt stock
            </p>
          )}
        </div>

        {/* Right: Pricing & CTA Section */}
        <div className="p-5 sm:w-60 border-t sm:border-t-0 sm:border-l border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30 flex flex-col justify-between">
          <div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xl font-black text-zinc-950 dark:text-white">
                {formatPrice(product.price, currentCurrency)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-zinc-400 line-through">
                  {formatPrice(product.originalPrice, currentCurrency)}
                </span>
              )}
            </div>

            {/* Installment Badge */}
            <div className="mt-2 p-2 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-300">
              <span className="font-bold">Installments:</span> From{' '}
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                {formatPrice(monthlyInstallment, currentCurrency)}/mo
              </span>{' '}
              with ValU
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'btn-primary'
              }`}
            >
              {isAdding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : justAdded ? (
                <>
                  <Check className="w-4 h-4" /> Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </>
              )}
            </button>

            <button
              onClick={handleWishlist}
              aria-label="Wishlist"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm border border-zinc-200 dark:border-zinc-700 active:scale-90 ${
                isWishlisted
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // ─── GRID VIEW LAYOUT (DEFAULT) ────────────────────────────────────
  return (
    <Link
      href={productHref}
      className="product-card group flex flex-col justify-between bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300 overflow-hidden relative"
    >
      {/* Image Area with hover zoom effect */}
      <div className={`relative overflow-hidden bg-zinc-50 dark:bg-zinc-800/60 ${isCompact ? 'h-44' : 'h-56'}`}>
        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-400">
            <Package className="w-10 h-10" />
            <span className="text-xs">{product.brand}</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]?.url}
            alt={product.images[0]?.alt || product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.discountPercent && (
            <span className="badge bg-rose-600 text-white font-extrabold text-[10px] shadow-sm">
              -{product.discountPercent}%
            </span>
          )}
          {product.isFlashDeal && (
            <span className="badge bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black text-[9px] shadow-md shadow-orange-500/30">
              <Zap className="w-3 h-3 fill-white" /> FLASH
            </span>
          )}
          {product.isBestSeller && !product.isFlashDeal && (
            <span className="badge bg-amber-500 text-white font-bold text-[9px] shadow-sm">
              ★ BEST SELLER
            </span>
          )}
        </div>

        {/* Express / Free Shipping */}
        {product.freeShipping && (
          <span className="absolute top-2.5 right-2.5 badge bg-emerald-600 text-white text-[9px] font-black shadow-sm flex items-center gap-0.5">
            <Truck className="w-3 h-3" /> EXPRESS
          </span>
        )}

        {/* Hover Action Bar */}
        <div className="absolute inset-x-0 bottom-0 flex gap-2 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 bg-gradient-to-t from-black/60 via-black/30 to-transparent pt-6">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added!
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
              </>
            )}
          </button>
          <button
            onClick={handleWishlist}
            aria-label="Wishlist"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-90 ${
              isWishlisted
                ? 'bg-rose-500 text-white'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {product.brand}
            </span>
            <span className="text-zinc-400 text-[10px] truncate max-w-[100px]">
              {product.categoryName}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {isCompact ? truncate(product.name, 50) : product.name}
          </h3>

          {/* Short Description */}
          {!isCompact && product.shortDescription && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </p>
          )}
        </div>

        <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
          {/* Star rating breakdown */}
          <StarRating rating={product.rating} count={product.reviewCount} />

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-2 flex-wrap">
            <span className="text-base font-black text-zinc-950 dark:text-white">
              {formatPrice(product.price, currentCurrency)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-zinc-400 line-through">
                {formatPrice(product.originalPrice, currentCurrency)}
              </span>
            )}
          </div>

          {/* Installment Hint */}
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1 truncate">
            <span>Or</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {formatPrice(monthlyInstallment, currentCurrency)}/mo
            </span>
            <span>with ValU</span>
          </p>

          {/* Scarcity indicator */}
          {product.stock <= 10 && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1.5 flex items-center gap-1">
              <span>⚠️ Only {product.stock} left in Cairo</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

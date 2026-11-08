'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, Package,
  ShieldCheck, RotateCcw, Check, Sparkles, Tag, ChevronRight,
  Bookmark, AlertCircle, ShoppingCart, Lock, Zap
} from 'lucide-react';
import { useCartStore, useUIStore } from '@/lib/store';
import { formatPrice, calculateInstallment } from '@/lib/utils';
import type { CartItem } from '@/lib/types';

interface AppliedCoupon {
  code: string;
  discount: number; // multiplier (e.g. 0.10)
  type: 'percent' | 'free_shipping';
}

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const {
    items,
    savedForLater,
    removeItem,
    updateQuantity,
    saveForLater,
    moveToCart,
    removeSavedForLater,
    clearCart,
    subtotal,
    totalItems,
    addItem,
  } = useCartStore();

  const { currency } = useUIStore();

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Undo Toast state
  const [undoItem, setUndoItem] = useState<CartItem | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Free shipping threshold
  const freeShippingThreshold = 500;
  const qualifiesForFreeShipping =
    subtotal >= freeShippingThreshold || appliedCoupon?.type === 'free_shipping';

  const shippingFee = subtotal === 0 ? 0 : qualifiesForFreeShipping ? 0 : 50;

  // Discount calculation
  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.round(subtotal * appliedCoupon.discount)
      : shippingFee
    : 0;

  // 14% Egyptian VAT calculation (breakdown)
  const vatAmount = Math.round((subtotal * 0.14) / 1.14);
  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);
  const monthlyValu = calculateInstallment(totalAmount, 12);

  // Handle coupon application
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const code = couponInput.trim().toUpperCase();

    if (!code) return;

    if (code === 'EGYPT10' || code === 'BAZAAR10') {
      setAppliedCoupon({ code, discount: 0.10, type: 'percent' });
      setCouponSuccess('Coupon applied! 10% discount has been deducted.');
      setCouponInput('');
    } else if (code === 'WELCOME15') {
      setAppliedCoupon({ code, discount: 0.15, type: 'percent' });
      setCouponSuccess('Welcome voucher applied! 15% discount has been deducted.');
      setCouponInput('');
    } else if (code === 'CAIROFREE') {
      setAppliedCoupon({ code, discount: 0, type: 'free_shipping' });
      setCouponSuccess('Free Delivery coupon applied for Greater Cairo & Egypt!');
      setCouponInput('');
    } else {
      setCouponError('Invalid promo code. Try EGYPT10, WELCOME15, or CAIROFREE.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  // Handle item deletion with undo toast
  const handleDeleteItem = (item: CartItem) => {
    removeItem(item.id);
    setUndoItem(item);
    setShowUndoToast(true);
    setTimeout(() => {
      setShowUndoToast(false);
    }, 4500);
  };

  const handleUndo = () => {
    if (undoItem) {
      addItem({
        productId: undoItem.productId,
        name: undoItem.name,
        brand: undoItem.brand,
        image: undoItem.image,
        price: undoItem.price,
        originalPrice: undoItem.originalPrice,
        quantity: undoItem.quantity,
        maxQuantity: undoItem.maxQuantity,
        variantId: undoItem.variantId,
        variantLabel: undoItem.variantLabel,
        categoryName: undoItem.categoryName,
        freeShipping: undoItem.freeShipping,
      });
      setShowUndoToast(false);
      setUndoItem(null);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/70 dark:bg-zinc-950 py-8 lg:py-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-8">
        {/* ── Breadcrumb ─────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/products" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">Products</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-900 dark:text-zinc-100 font-bold">Shopping Cart</span>
        </nav>

        {/* ── Page Header ────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-indigo-600" />
              Shopping Cart
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart • Verified Cairo fulfillment center
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-zinc-500 hover:text-rose-600 transition-colors py-1.5 px-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                Clear Cart
              </button>
              <Link
                href="/products"
                className="btn-outline py-2 px-4 text-xs font-bold"
              >
                Continue Shopping
              </Link>
            </div>
          )}
        </div>

        {/* ── Main 2-Column Split ────────────────────────── */}
        {items.length === 0 ? (
          /* ── Empty Cart State ── */
          <div className="space-y-12">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 sm:p-16 text-center border border-zinc-200/80 dark:border-zinc-800 shadow-sm max-w-2xl mx-auto space-y-5">
              <div className="w-24 h-24 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/10">
                <ShoppingCart className="w-12 h-12" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  Your Shopping Cart is Empty
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto mt-2 leading-relaxed">
                  Looks like you haven&apos;t added any items to your cart yet. Explore our trending electronics, smartphones, and fashion deals across Egypt.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/products"
                  className="btn-primary py-3 px-8 text-xs font-bold inline-flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  <span>Explore All Products</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/wishlist"
                  className="btn-outline py-3 px-6 text-xs font-bold inline-flex items-center justify-center"
                >
                  View My Wishlist
                </Link>
              </div>
            </div>

            {/* Saved For Later items in empty cart view */}
            {savedForLater && savedForLater.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
                <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-indigo-600" /> Saved for Later ({savedForLater.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedForLater.map((sItem) => (
                    <div
                      key={sItem.id}
                      className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex gap-3.5 items-center"
                    >
                      <div className="w-16 h-16 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex-shrink-0 p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={sItem.image} alt={sItem.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase text-zinc-400">{sItem.brand}</p>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">{sItem.name}</h4>
                        <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{formatPrice(sItem.price, currency)}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => moveToCart(sItem.id)}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Move to Cart
                          </button>
                          <button
                            onClick={() => removeSavedForLater(sItem.id)}
                            className="text-xs text-zinc-400 hover:text-rose-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── 2-Column Cart Active State ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── LEFT COLUMN (68% / 8 cols): Items & Promos ───── */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Shipping Progress Meter */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <Package className="w-4 h-4 text-indigo-600" />
                    {qualifiesForFreeShipping ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                        <Check className="w-4 h-4" /> You unlocked FREE Express Delivery anywhere in Egypt!
                      </span>
                    ) : (
                      <span>
                        Add <strong className="text-indigo-600 dark:text-indigo-400 font-black">{formatPrice(freeShippingThreshold - subtotal, currency)}</strong> more to unlock Free Express Delivery!
                      </span>
                    )}
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                    {Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Items List Table Card */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-5 sm:px-6 bg-zinc-50/80 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <span>Product Details</span>
                  <div className="hidden sm:flex items-center gap-16 pr-4">
                    <span>Quantity</span>
                    <span>Subtotal</span>
                  </div>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {items.map((item) => (
                    <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <Link
                          href={`/products/${item.productId}`}
                          className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex-shrink-0 p-1 group-hover:scale-105 transition-transform"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </Link>

                        <div className="min-w-0 flex-1 space-y-1">
                          <Link
                            href={`/products?brand=${encodeURIComponent(item.brand)}`}
                            className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline block"
                          >
                            {item.brand}
                          </Link>
                          <Link
                            href={`/products/${item.productId}`}
                            className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1 leading-snug"
                          >
                            {item.name}
                          </Link>
                          {item.variantLabel && (
                            <span className="inline-block text-[11px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                              {item.variantLabel}
                            </span>
                          )}

                          <div className="flex items-center gap-2 pt-1 text-xs">
                            <span className="font-black text-zinc-900 dark:text-zinc-100">
                              {formatPrice(item.price, currency)}
                            </span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-[11px] text-zinc-400 line-through">
                                {formatPrice(item.originalPrice, currency)}
                              </span>
                            )}
                          </div>

                          {/* Action links */}
                          <div className="flex items-center gap-4 pt-1.5 text-xs">
                            <button
                              onClick={() => saveForLater(item.id)}
                              className="text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>Save for Later</span>
                            </button>
                            <span className="text-zinc-300 dark:text-zinc-700">|</span>
                            <button
                              onClick={() => handleDeleteItem(item)}
                              className="text-zinc-400 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quantity Stepper & Line Total */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10 pt-2 sm:pt-0 border-t sm:border-0 border-zinc-100 dark:border-zinc-800">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-800/80 p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:bg-white dark:hover:bg-zinc-700 rounded-xl transition-colors disabled:opacity-30"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.maxQuantity}
                            className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:bg-white dark:hover:bg-zinc-700 rounded-xl transition-colors disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Calculated Line Total */}
                        <div className="text-right sm:w-28">
                          <p className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100">
                            {formatPrice(item.price * item.quantity, currency)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-zinc-400 font-medium">
                              ({formatPrice(item.price, currency)} ea)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo Code & Voucher Module */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-indigo-600" /> Have a Promo Code or Egyptian Voucher?
                  </h3>
                  <span className="text-[11px] text-indigo-600 font-semibold">Try: EGYPT10 or CAIROFREE</span>
                </div>

                {appliedCoupon ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="text-xs font-extrabold text-emerald-800 dark:text-emerald-200">
                          Coupon {appliedCoupon.code} Applied!
                        </p>
                        <p className="text-[11px] text-emerald-600">
                          {appliedCoupon.type === 'percent'
                            ? `${appliedCoupon.discount * 100}% Discount Deducted (${formatPrice(discountAmount, currency)})`
                            : 'Free Shipping Activated'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 px-2 py-1 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Enter code (e.g. EGYPT10, WELCOME15)..."
                      className="flex-1 px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold outline-none focus:border-indigo-500 uppercase text-zinc-900 dark:text-zinc-100"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponError && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                  </p>
                )}
                {couponSuccess && !appliedCoupon && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" /> {couponSuccess}
                  </p>
                )}
              </div>

              {/* Saved For Later Section (below cart items) */}
              {savedForLater && savedForLater.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-indigo-600" /> Saved for Later ({savedForLater.length})
                    </h3>
                    <span className="text-xs text-zinc-400">Items you want to buy later</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedForLater.map((sItem) => (
                      <div
                        key={sItem.id}
                        className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex gap-3.5 items-center"
                      >
                        <div className="w-16 h-16 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex-shrink-0 p-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={sItem.image} alt={sItem.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold uppercase text-zinc-400">{sItem.brand}</p>
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">{sItem.name}</h4>
                          <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{formatPrice(sItem.price, currency)}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              onClick={() => moveToCart(sItem.id)}
                              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              Move to Cart
                            </button>
                            <button
                              onClick={() => removeSavedForLater(sItem.id)}
                              className="text-xs text-zinc-400 hover:text-rose-500"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN (32% / 4 cols): Sticky Order Summary ── */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-5">
                <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs">
                  {/* Subtotal */}
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                      {formatPrice(subtotal, currency)}
                    </span>
                  </div>

                  {/* Estimated Shipping */}
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <span>Shipping (Cairo & Giza)</span>
                      {qualifiesForFreeShipping && (
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                          FREE
                        </span>
                      )}
                    </span>
                    <span className={qualifiesForFreeShipping ? 'font-bold text-emerald-600' : 'font-extrabold text-zinc-900 dark:text-zinc-100'}>
                      {qualifiesForFreeShipping ? 'FREE' : formatPrice(shippingFee, currency)}
                    </span>
                  </div>

                  {/* VAT Breakdown */}
                  <div className="flex justify-between text-zinc-500">
                    <span>Egyptian VAT (14% Included)</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {formatPrice(vatAmount, currency)}
                    </span>
                  </div>

                  {/* Applied Discount Row */}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Coupon Discount ({appliedCoupon?.code})</span>
                      <span>-{formatPrice(discountAmount, currency)}</span>
                    </div>
                  )}

                  {/* Grand Total */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-baseline">
                    <div>
                      <span className="text-base font-black text-zinc-900 dark:text-zinc-100 block">
                        Grand Total
                      </span>
                      <span className="text-[11px] text-zinc-400 font-normal">All duties & taxes included</span>
                    </div>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {formatPrice(totalAmount, currency)}
                    </span>
                  </div>
                </div>

                {/* ValU BNPL installment preview */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs">
                  <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100">
                    <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                      <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> ValU Installments:
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-black">
                      {formatPrice(monthlyValu, currency)}/mo
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Spread over 12 months with 0% down payment on your National ID.
                  </p>
                </div>

                {/* Primary Checkout CTA Button */}
                <div className="space-y-2.5 pt-1">
                  <button
                    onClick={() => router.push('/checkout')}
                    className="btn-primary w-full py-4 text-sm font-black justify-center shadow-xl shadow-indigo-600/25 flex items-center gap-2 group"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <Link
                    href="/products"
                    className="w-full py-2.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Continue Shopping</span>
                  </Link>
                </div>

                {/* Trust and Safety Badges */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-[11px] text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>256-Bit SSL Encrypted & Bank-Grade Security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span>14-Day Free Returns & Doorstep Cairo Collection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span>100% Genuine Merchandise & Authorized Warranty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Undo Toast Notification ───────────────────────── */}
      {showUndoToast && undoItem && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white p-4 rounded-2xl shadow-2xl border border-zinc-700 flex items-center gap-4 animate-slide-up">
          <div className="flex items-center gap-2 text-xs">
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Removed &quot;{undoItem.name.slice(0, 24)}...&quot; from cart</span>
          </div>
          <button
            onClick={handleUndo}
            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}


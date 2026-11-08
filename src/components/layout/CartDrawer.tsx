'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCartStore, useUIStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart, subtotal, totalItems } = useCartStore();
  const { currency } = useUIStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeCart]);

  if (!isOpen || !mounted) return null;

  const currentCurrency = currency;
  const currentSubtotal = subtotal;
  const currentCount = totalItems;
  const freeShippingThreshold = 500;
  const qualifiesForFreeShipping = currentSubtotal >= freeShippingThreshold;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed inset-y-0 right-0 z-[70] w-full max-w-md flex flex-col bg-white dark:bg-zinc-900 shadow-2xl animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-indigo-500/20">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">Shopping Cart</h2>
              <p className="text-xs text-zinc-500">
                {currentCount} {currentCount === 1 ? 'item' : 'items'} in your basket
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-zinc-400 hover:text-rose-500 transition-colors px-2 py-1"
                title="Clear all items"
              >
                Clear all
              </button>
            )}
            <button
              onClick={closeCart}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Shipping Progress Indicator */}
        {items.length > 0 && (
          <div className="px-6 py-3 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50">
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="text-indigo-800 dark:text-indigo-300 font-semibold flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                {qualifiesForFreeShipping
                  ? '🎉 You unlocked FREE Express Delivery!'
                  : `Add ${formatPrice(freeShippingThreshold - currentSubtotal, currentCurrency)} for FREE Express Delivery`}
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
                {Math.min(100, Math.round((currentSubtotal / freeShippingThreshold) * 100))}%
              </span>
            </div>
            <div className="w-full bg-indigo-200/70 dark:bg-indigo-900/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (currentSubtotal / freeShippingThreshold) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Items Scroll List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-zinc-100 dark:divide-zinc-800">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 py-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Your cart is empty</h3>
                <p className="text-xs text-zinc-500 max-w-xs mt-1">
                  Looks like you haven&apos;t added any items to your shopping cart yet.
                </p>
              </div>
              <button onClick={closeCart} className="btn-primary mt-2">
                Start Shopping Now
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4 p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group">
                {/* Product Image */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 border border-zinc-200 dark:border-zinc-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {item.freeShipping && (
                    <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                      FREE
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.productId}`}
                        onClick={closeCart}
                        className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 hover:text-indigo-600 transition-colors leading-snug"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-400 hover:text-rose-500 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                      {item.brand}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-800">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.maxQuantity}
                        className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                        {formatPrice(item.price * item.quantity, currentCurrency)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-zinc-400">
                          {formatPrice(item.price, currentCurrency)} ea
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="border-t border-zinc-100 dark:border-zinc-800 p-5 space-y-4 bg-white dark:bg-zinc-900">
            {/* Calculation summary */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal ({currentCount} items)</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatPrice(currentSubtotal, currentCurrency)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Estimated Shipping (Cairo & Giza)</span>
                <span className={qualifiesForFreeShipping ? 'text-emerald-600 font-bold' : 'font-semibold text-zinc-800 dark:text-zinc-200'}>
                  {qualifiesForFreeShipping ? 'FREE' : formatPrice(50, currentCurrency)}
                </span>
              </div>
              <div className="flex justify-between font-extrabold text-zinc-900 dark:text-zinc-100 text-base pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span>Total Amount</span>
                <span className="text-gradient">
                  {formatPrice(qualifiesForFreeShipping ? currentSubtotal : currentSubtotal + 50, currentCurrency)}
                </span>
              </div>
            </div>

            {/* Direct Checkout Button */}
            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full btn-primary justify-center py-3.5 text-sm font-bold shadow-lg shadow-indigo-600/25"
              >
                Proceed to Checkout ({formatPrice(qualifiesForFreeShipping ? currentSubtotal : currentSubtotal + 50, currentCurrency)})
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="w-full btn-outline justify-center py-2.5 text-xs font-bold"
              >
                View Full Shopping Cart Page
              </Link>
              <button
                onClick={closeCart}
                className="w-full py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
              >
                Continue Shopping
              </button>
            </div>

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Secure Checkout · 256-bit SSL Encryption</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2, Package, Truck, MapPin, Clock,
  CreditCard, Copy, Check, Printer, Sparkles,
  ShoppingBag, ChevronRight
} from 'lucide-react';
import { useOrderStore, useUIStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/lib/types';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const { getOrderById, orders } = useOrderStore();
  const { currency } = useUIStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const order: Order | undefined = mounted
    ? (orderId ? (getOrderById(orderId) || orders.find(o => o.id === orderId || o.trackingNumber === orderId)) : orders[0]) || orders[0]
    : undefined;

  const handleCopyOrderId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-20 px-4">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 mx-auto flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">Order Not Found</h1>
          <p className="text-xs text-zinc-500">
            We couldn&apos;t locate the order details. It may have been placed in another session.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Link href="/" className="btn-primary py-2.5 px-6 text-xs font-bold">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/70 dark:bg-zinc-950 py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* ── Breadcrumb ─────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/checkout" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">Checkout</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-900 dark:text-zinc-100 font-bold">Confirmation</span>
        </nav>

        {/* ── Animated Green Checkmark & Celebration Card ──── */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-zinc-200/80 dark:border-zinc-800 shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 bg-gradient-to-b from-emerald-500/15 via-indigo-500/10 to-transparent blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Animated green badge */}
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 ring-8 ring-emerald-50 dark:ring-emerald-950/30 shadow-lg shadow-emerald-500/15 animate-fade-in">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-wide uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Order Confirmed & Authorized
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              Thank You for Your Order!
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-lg">
              Order <strong className="text-indigo-600 dark:text-indigo-400">#{order.id}</strong> has been confirmed. Our Cairo fulfillment team is preparing your package for delivery.
            </p>

            {/* Order reference pill */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-3">
              <span className="text-xs text-zinc-500 font-medium">Order Number:</span>
              <span className="font-mono text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider">
                {order.id}
              </span>
              <button
                onClick={handleCopyOrderId}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-xs text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px] font-semibold">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Visual Order Timeline Tracker ──────────────── */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" /> Order Timeline Tracker
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Carrier: <strong className="text-zinc-800 dark:text-zinc-200">Bazaar Express Cairo Hub</strong> (Tracking: #{order.trackingNumber})
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold self-start sm:self-auto">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Arrival: {order.estimatedDeliveryDate}</span>
            </div>
          </div>

          {/* Stepper with 5 stages */}
          <div className="py-2">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
              {/* 1. Placed */}
              <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-500/25 flex-shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Order Placed</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">Authorized</p>
                </div>
              </div>

              {/* 2. Processing */}
              <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-600/25 flex-shrink-0 animate-pulse">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Processing</p>
                  <p className="text-[10px] text-zinc-400">Cairo Hub</p>
                </div>
              </div>

              {/* 3. Shipped */}
              <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 opacity-50">
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Shipped</p>
                  <p className="text-[10px] text-zinc-400">In Transit</p>
                </div>
              </div>

              {/* 4. Out for Delivery */}
              <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 opacity-50">
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Out for Delivery</p>
                  <p className="text-[10px] text-zinc-400">Local Courier</p>
                </div>
              </div>

              {/* 5. Delivered */}
              <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 opacity-50">
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Delivered</p>
                  <p className="text-[10px] text-zinc-400">Doorstep</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Order Breakdown Receipt ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Itemized receipt table (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
              Order Receipt ({order.items.reduce((s, i) => s + i.quantity, 0)} Items)
            </h3>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex-shrink-0 p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase text-zinc-400">{item.brand}</p>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{item.name}</p>
                      <p className="text-zinc-500 text-[11px]">Qty: {item.quantity} × {formatPrice(item.price, currency)}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-zinc-900 dark:text-zinc-100 flex-shrink-0">
                    {formatPrice(item.price * item.quantity, currency)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatPrice(order.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Shipping Fee</span>
                <span className="font-semibold text-emerald-600">
                  {order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee, currency)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Applied Discount</span>
                  <span>-{formatPrice(order.discount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-base text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span>Total Amount Paid</span>
                <span className="text-indigo-600 dark:text-indigo-400">{formatPrice(order.total, currency)}</span>
              </div>
            </div>
          </div>

          {/* Destination & Action CTAs (1 col) */}
          <div className="space-y-4">
            {/* Delivery address */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-2 text-xs">
              <p className="font-bold text-zinc-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Shipping Destination
              </p>
              <p className="font-extrabold text-zinc-900 dark:text-zinc-100">{order.shippingAddress.fullName}</p>
              <p className="text-zinc-500">{order.shippingAddress.streetAddress}, {order.shippingAddress.buildingFloor}</p>
              <p className="text-zinc-700 dark:text-zinc-300 font-semibold">{order.shippingAddress.cityArea}, {order.shippingAddress.governorate}</p>
              <p className="text-zinc-400 font-mono mt-1">📞 {order.shippingAddress.phone}</p>
            </div>

            {/* Payment details */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-2 text-xs">
              <p className="font-bold text-zinc-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-600" /> Payment Summary
              </p>
              <p className="font-bold text-zinc-900 dark:text-zinc-100 capitalize">
                {order.paymentMethod === 'card' && 'Credit / Debit Card (Visa/Mastercard)'}
                {order.paymentMethod === 'meeza' && 'Meeza National Card'}
                {order.paymentMethod === 'valu' && `ValU BNPL (${order.valuPlanMonths || 12} Months)`}
                {order.paymentMethod === 'cod' && 'Cash on Delivery (Doorstep)'}
                {order.paymentMethod === 'fawry' && 'Fawry Pay Reference'}
              </p>
              <p className="text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Payment Cleared
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <Link
                href="/"
                className="btn-primary w-full py-3.5 text-xs font-black justify-center flex items-center gap-2 shadow-lg shadow-indigo-600/25"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>

              <Link
                href="/orders"
                className="btn-outline w-full py-3 text-xs font-bold justify-center flex items-center gap-1.5"
              >
                <span>Track in My Orders</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              <button
                onClick={handlePrint}
                className="w-full py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}


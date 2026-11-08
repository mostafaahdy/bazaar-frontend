'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckCircle2, Package, Truck, MapPin, Clock,
  ArrowRight, CreditCard, ShieldCheck, Copy, Check,
  Printer, Sparkles, ShoppingBag
} from 'lucide-react';
import { useOrderStore, useUIStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/lib/types';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const { getOrderById, orders } = useOrderStore();
  const { currency } = useUIStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const order: Order | undefined = mounted
    ? getOrderById(orderId) || orders.find((o) => o.id === orderId) || orders[0]
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
          <p className="text-sm text-zinc-500">
            We couldn&apos;t locate order #{orderId}. It may have been placed in another session.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products" className="btn-primary py-2.5 px-6 text-xs font-bold">
              Browse Products
            </Link>
            <Link href="/orders" className="btn-outline py-2.5 px-6 text-xs font-bold">
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* ── Success Celebration Banner ────────────────── */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-zinc-200/80 dark:border-zinc-800 shadow-xl text-center relative overflow-hidden">
          {/* Decorative glowing gradient backdrop */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 bg-gradient-to-b from-indigo-500/15 via-emerald-500/10 to-transparent blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 ring-8 ring-emerald-50 dark:ring-emerald-950/30 animate-fade-in shadow-lg shadow-emerald-500/15">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-wide uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Order Confirmed & Processing
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              Thank You for Your Order!
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-lg">
              We&apos;ve received your order and our Cairo fulfillment team is already preparing it. You will receive SMS & WhatsApp delivery updates.
            </p>

            {/* Order Reference Tag */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-3">
              <span className="text-xs text-zinc-500 font-medium">Order Number:</span>
              <span className="font-mono text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider">
                {order.id}
              </span>
              <button
                onClick={handleCopyOrderId}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-xs text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 transition-colors shadow-sm"
                title="Copy order number"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px] font-semibold">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Egypt Delivery Tracking Timeline ──────────── */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Live Delivery Tracking
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Carrier: <span className="font-semibold text-zinc-700 dark:text-zinc-300">Bazaar Express Egypt</span> (Tracking: #{order.trackingNumber || 'EGY-CAI-992104'})
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Est. Delivery: {order.estimatedDeliveryDate || 'Tomorrow by 2:00 PM'}</span>
            </div>
          </div>

          {/* Stepper */}
          <div className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Step 1 */}
              <div className="flex md:flex-col items-center md:text-center gap-4 md:gap-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-500/25 flex-shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Order Placed</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Verified & Authorized</p>
                  <p className="text-[10px] text-emerald-600 font-medium">Today, Just now</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex md:flex-col items-center md:text-center gap-4 md:gap-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-600/25 flex-shrink-0 animate-pulse">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Packaging in Hub</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Cairo Fulfillment Center</p>
                  <p className="text-[10px] text-indigo-500 font-medium">In Progress</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex md:flex-col items-center md:text-center gap-4 md:gap-2 opacity-60">
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Out for Delivery</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Local courier van</p>
                  <p className="text-[10px] text-zinc-400 font-medium">Scheduled tomorrow</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex md:flex-col items-center md:text-center gap-4 md:gap-2 opacity-60">
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Delivered</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Direct to your doorstep</p>
                  <p className="text-[10px] text-zinc-400 font-medium">Sign on receipt</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              <strong className="text-zinc-900 dark:text-zinc-100">14-Day Free Returns:</strong> You have a full 14 days after delivery to request a free return or exchange if anything isn&apos;t 100% satisfactory.
            </p>
          </div>
        </div>

        {/* ── Order Summary & Shipping Details ──────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items Purchased (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
              <span>Items in this Order ({order.items.reduce((s, i) => s + i.quantity, 0)})</span>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Express Delivery</span>
            </h2>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center gap-4 first:pt-0 last:pb-0">
                  <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{item.brand}</p>
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                      {item.name}
                    </h3>
                    {item.variantLabel && (
                      <p className="text-[11px] text-zinc-500 mt-0.5">Variant: {item.variantLabel}</p>
                    )}
                    <p className="text-xs text-zinc-500 mt-0.5">Qty: <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.quantity}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100">
                      {formatPrice(item.price * item.quantity, currency)}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      Confirmed
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatPrice(order.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Shipping Fee (Cairo Fulfillment)</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee, currency)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount Applied</span>
                  <span className="font-semibold">-{formatPrice(order.discount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span>Total Paid</span>
                <span className="text-indigo-600 dark:text-indigo-400">{formatPrice(order.total, currency)}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Payment Meta (1 col) */}
          <div className="space-y-6">
            {/* Delivery Destination */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-500" /> Delivery Address
              </h3>
              <div>
                <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">{order.shippingAddress.fullName}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  {order.shippingAddress.streetAddress}, {order.shippingAddress.buildingFloor}
                </p>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {order.shippingAddress.cityArea}, {order.shippingAddress.governorate}, Egypt
                </p>
                <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1 font-mono">
                  📞 {order.shippingAddress.phone}
                </p>
              </div>
            </div>

            {/* Payment Method Badge */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-500" /> Payment Details
              </h3>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {order.paymentMethod === 'card' && '💳 Credit / Debit Card (Visa/Mastercard)'}
                  {order.paymentMethod === 'meeza' && '🇪🇬 Meeza National Card'}
                  {order.paymentMethod === 'valu' && `⚡ ValU Installments (${order.valuPlanMonths || 12} Mos)`}
                  {order.paymentMethod === 'fawry' && '🏪 Fawry Pay Reference Code'}
                  {order.paymentMethod === 'cod' && '💵 Cash on Delivery'}
                </div>
                {order.paymentMethod === 'valu' && (
                  <p className="text-[11px] text-zinc-500 mt-2">
                    Monthly installment: <strong className="text-zinc-800 dark:text-zinc-200">{formatPrice(Math.round(order.total / (order.valuPlanMonths || 12)), currency)}/mo</strong>
                  </p>
                )}
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Payment Status: Paid & Cleared
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="space-y-2.5">
              <Link
                href="/orders"
                className="btn-primary w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>View All My Orders</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products"
                className="btn-outline w-full py-3 text-xs font-bold flex items-center justify-center gap-2 bg-white dark:bg-zinc-900"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>
              <button
                onClick={handlePrint}
                className="w-full py-2.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Invoice</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


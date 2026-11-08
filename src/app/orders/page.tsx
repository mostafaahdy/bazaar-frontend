'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package, Truck, Clock, CheckCircle2, ChevronRight,
  RotateCcw, ShoppingBag, Search, ArrowRight
} from 'lucide-react';
import { useOrderStore, useCartStore, useUIStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import type { Order, OrderStatus } from '@/lib/types';

export default function OrdersPage() {
  const [mounted, setMounted] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reorderedId, setReorderedId] = useState<string | null>(null);

  const { orders } = useOrderStore();
  const { addItem, openCart } = useCartStore();
  const { currency } = useUIStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Tab filter
    if (filterTab === 'active' && order.status === 'delivered') return false;
    if (filterTab === 'completed' && order.status !== 'delivered') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesId = order.id.toLowerCase().includes(q);
      const matchesItem = order.items.some((i) => i.name.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q));
      return matchesId || matchesItem;
    }

    return true;
  });

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addItem({
        productId: item.productId,
        name: item.name,
        brand: item.brand,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        variantId: item.variantId,
        variantLabel: item.variantLabel,
        maxQuantity: 5,
        categoryName: 'General',
        freeShipping: true,
      });
    });
    setReorderedId(order.id);
    setTimeout(() => {
      setReorderedId(null);
      openCart();
    }, 800);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" /> Order Confirmed
          </span>
        );
      case 'packing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Package className="w-3.5 h-3.5" /> Packing at Cairo Hub
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <Truck className="w-3.5 h-3.5 animate-pulse" /> Out for Delivery
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 lg:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        {/* ── Breadcrumb ─────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/account" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">My Account</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-800 dark:text-zinc-200 font-semibold">Orders & Tracking</span>
        </nav>

        {/* ── Header Bar ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2.5">
              <Package className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              My Orders
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Track shipments across Cairo, Giza & Egyptian governorates, download invoices, or re-order.
            </p>
          </div>

          <Link href="/products" className="btn-primary py-2.5 px-5 text-xs font-bold self-start sm:self-auto flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* ── Tabs & Search Control ──────────────────────── */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1 w-full sm:w-auto">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setFilterTab('active')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'active'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Active Shipments
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterTab === 'completed'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Completed
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order # or product..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* ── Orders Listing ─────────────────────────────── */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 mx-auto flex items-center justify-center">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">No Orders Found</h2>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {searchQuery
                ? `No orders matching "${searchQuery}". Try searching for another keyword.`
                : 'You have not placed any orders in this tab yet.'}
            </p>
            <Link href="/products" className="btn-primary inline-flex py-2.5 px-6 text-xs font-bold">
              Start Shopping Now <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const totalItemsCount = order.items.reduce((s, i) => s + i.quantity, 0);

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
                >
                  {/* Top Bar with Order ID & Status */}
                  <div className="p-5 sm:px-6 bg-zinc-50/80 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <div>
                        <span className="text-zinc-400 font-medium">Order: </span>
                        <span className="font-mono font-extrabold text-zinc-900 dark:text-zinc-100">{order.id}</span>
                      </div>
                      <span className="text-zinc-300 dark:text-zinc-700">|</span>
                      <div className="text-zinc-500">
                        Placed on: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{new Date(order.createdAt).toLocaleDateString('en-EG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <span className="text-zinc-300 dark:text-zinc-700">|</span>
                      <span className="text-zinc-500 font-medium">{totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* Body with Items and Summary */}
                  <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Items List (2 cols) */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3.5">
                            <Link href={`/products/${item.productId}`} className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex-shrink-0 group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            </Link>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{item.brand}</p>
                              <Link href={`/products/${item.productId}`} className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1">
                                {item.name}
                              </Link>
                              {item.variantLabel && (
                                <p className="text-[11px] text-zinc-500">{item.variantLabel}</p>
                              )}
                              <p className="text-xs text-zinc-500 mt-0.5">
                                Qty: <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.quantity}</span> × {formatPrice(item.price, currency)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100">
                                {formatPrice(item.price * item.quantity, currency)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Status Note */}
                      <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span className="text-zinc-700 dark:text-zinc-300">
                            Fulfillment: <strong className="text-indigo-700 dark:text-indigo-300">Bazaar Express Cairo</strong> • Est. Arrival: {order.estimatedDeliveryDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Side Info & Actions (1 col) */}
                    <div className="lg:border-l lg:border-zinc-100 dark:lg:border-zinc-800 lg:pl-6 flex flex-col justify-between space-y-4">
                      <div className="space-y-3 text-xs">
                        {/* Address */}
                        <div>
                          <p className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Shipping To</p>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100 mt-1">{order.shippingAddress.fullName}</p>
                          <p className="text-zinc-500 truncate">{order.shippingAddress.cityArea}, {order.shippingAddress.governorate}</p>
                        </div>

                        {/* Payment */}
                        <div>
                          <p className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Payment Method</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                            {order.paymentMethod === 'card' && 'Credit / Debit Card'}
                            {order.paymentMethod === 'meeza' && 'Meeza National Card'}
                            {order.paymentMethod === 'valu' && `ValU (${order.valuPlanMonths || 12} Mos)`}
                            {order.paymentMethod === 'fawry' && 'Fawry Pay'}
                            {order.paymentMethod === 'cod' && 'Cash on Delivery'}
                          </p>
                        </div>

                        {/* Total */}
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                          <p className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Total Order Amount</p>
                          <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                            {formatPrice(order.total, currency)}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="space-y-2 pt-2">
                        <Link
                          href={`/order-success/${order.id}`}
                          className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <span>Track & View Details</span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleReorder(order)}
                          className="btn-outline w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw className={`w-3.5 h-3.5 ${reorderedId === order.id ? 'animate-spin' : ''}`} />
                          <span>{reorderedId === order.id ? 'Added to Cart!' : 'Buy Again'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

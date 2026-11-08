'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User as UserIcon, Package, Heart, MapPin, CreditCard,
  ShieldCheck, LogOut, ChevronRight, Mail, Clock
} from 'lucide-react';
import { useAuthStore, useOrderStore, useWishlistStore, useUIStore } from '@/lib/store';

export default function AccountPage() {
  const [mounted, setMounted] = useState(false);
  const { user, openAuth, logout, login } = useAuthStore();
  const { orders } = useOrderStore();
  const { items: wishlistItems } = useWishlistStore();
  const { deliveryLocation } = useUIStore();

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

  // If user is not logged in, show demo sign-in view
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-16 px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">My Bazaar Account</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Sign in to view your orders, manage saved Egyptian delivery addresses, and track shipments in real-time.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => login('ahmed.hassan@bazaar.eg', 'Ahmed Hassan')}
              className="btn-primary w-full py-3 text-xs font-bold"
            >
              Sign In as Ahmed Hassan (Cairo Demo)
            </button>
            <button
              onClick={() => login('sarah.mansour@bazaar.eg', 'Sarah Mansour')}
              className="btn-outline w-full py-3 text-xs font-bold"
            >
              Sign In as Sarah Mansour (Giza Demo)
            </button>
            <button
              onClick={openAuth}
              className="w-full text-xs text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1 font-semibold"
            >
              Open Full Sign In / Register Dialog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeOrdersCount = orders.filter((o) => o.status !== 'delivered').length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 lg:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        {/* ── Breadcrumb ─────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-800 dark:text-zinc-200 font-semibold">My Account</span>
        </nav>

        {/* ── Profile Header Card ────────────────────────── */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-5">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                alt={user.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-indigo-500/30 object-cover shadow-md shadow-indigo-500/10"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] text-white">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  {user.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm">
                  VIP Prime
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" /> {user.email}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Primary Location: {deliveryLocation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={logout}
              className="btn-outline flex-1 md:flex-initial py-2.5 px-5 text-xs font-bold text-rose-500 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* ── Metric Stats Cards ─────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/orders"
            className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{orders.length}</p>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">Total Orders</p>
          </Link>

          <Link
            href="/orders"
            className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:border-sky-300 dark:hover:border-sky-600 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{activeOrdersCount}</p>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">Active Shipments</p>
          </Link>

          <Link
            href="/wishlist"
            className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:border-rose-300 dark:hover:border-rose-600 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{wishlistItems.length}</p>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">Saved in Wishlist</p>
          </Link>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">100%</p>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">Buyer Protection</p>
          </div>
        </div>

        {/* ── Saved Egyptian Addresses ───────────────────── */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" /> Saved Delivery Addresses
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">Verified shipping locations across Greater Cairo and Egypt</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Address */}
            <div className="p-4 rounded-2xl border-2 border-indigo-600/30 bg-indigo-50/20 dark:bg-indigo-950/20 space-y-2 relative">
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                Primary Default
              </span>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Ahmed Hassan</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                90th North Street, Building 42, Floor 3, Apt 12
              </p>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                New Cairo / 5th Settlement, Cairo, Egypt
              </p>
              <p className="text-xs text-zinc-500 font-mono">📞 +20 100 123 4567</p>
            </div>

            {/* Secondary Address */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                Office / Work
              </span>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Ahmed Hassan (Tech Lab)</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                15 Mosaddak Street, Floor 5, Suite 502
              </p>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Dokki / Mohandessin, Giza, Egypt
              </p>
              <p className="text-xs text-zinc-500 font-mono">📞 +20 100 123 4567</p>
            </div>
          </div>
        </div>

        {/* ── Saved Payment Methods ──────────────────────── */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
          <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" /> Saved Payment Methods
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">National Payment</p>
              <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">🇪🇬 Meeza Card</p>
              <p className="text-xs font-mono text-zinc-500">•••• •••• •••• 1192</p>
              <span className="inline-block text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">BNPL Installments</p>
              <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">⚡ ValU Account</p>
              <p className="text-xs text-zinc-500">Linked to +20 100 123 4567</p>
              <span className="inline-block text-[10px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                Up to 60 Months
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Credit Card</p>
              <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">💳 Visa Platinum</p>
              <p className="text-xs font-mono text-zinc-500">•••• •••• •••• 4444</p>
              <span className="inline-block text-[10px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded-full">
                Exp 12/28
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

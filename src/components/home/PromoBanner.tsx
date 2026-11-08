'use client';

import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function PromoBanner() {
  const { openAuth, user } = useAuthStore();

  return (
    <section className="py-12">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-violet-950 py-16 px-6 md:px-12 text-center shadow-xl border border-indigo-800/40">
          {/* Subtle grid background pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Glow lights */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-white border border-white/20 mb-5 text-xs font-bold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Exclusive Egyptian Shoppers Club
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              Get <span className="text-yellow-400">15% OFF</span> Your First Order
            </h2>

            <p className="text-indigo-200 text-sm md:text-base mb-8 leading-relaxed max-w-xl mx-auto">
              Sign up today and unlock member pricing on over 50,000 electronics, fashion items, and daily essentials with free Cairo delivery.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center">
              {!user ? (
                <button
                  onClick={openAuth}
                  className="w-full sm:w-auto btn-primary bg-white text-indigo-900 hover:bg-indigo-50 py-3.5 px-8 text-sm font-extrabold shadow-lg shadow-white/10"
                >
                  Create Free Account <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/15 border border-white/20 text-white text-sm font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Welcome back, {user.name}! Your 15% voucher is active at checkout.</span>
                </div>
              )}
              <Link
                href="/flash-deals"
                className="w-full sm:w-auto btn-secondary border-white/20 text-white bg-white/10 hover:bg-white/20 py-3.5 px-8 text-sm font-semibold backdrop-blur-sm"
              >
                Browse Today&apos;s Flash Deals
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


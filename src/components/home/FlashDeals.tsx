'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Zap, ChevronRight, ChevronLeft, Flame } from 'lucide-react';
import { FLASH_DEAL_PRODUCTS, FLASH_DEAL_END } from '@/lib/mockData';
import { productService } from '@/services/productService';
import { formatCountdown } from '@/lib/utils';
import ProductCard from '@/components/product/ProductCard';

export default function FlashDeals() {
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState({ hours: '08', minutes: '00', seconds: '00', expired: false });
  const [deals, setDeals] = useState(FLASH_DEAL_PRODUCTS);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setCountdown(formatCountdown(FLASH_DEAL_END));
    const id = setInterval(() => {
      setCountdown(formatCountdown(FLASH_DEAL_END));
    }, 1000);

    // Fetch dynamic flash deals from live API
    productService.getFlashDeals().then((data) => {
      if (data && data.length > 0) {
        setDeals(data);
      }
    });

    return () => clearInterval(id);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (railRef.current) {
      const scrollAmount = 300;
      railRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-10 bg-gradient-to-b from-orange-50/40 to-transparent dark:from-orange-950/10 dark:to-transparent">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Flame className="w-5 h-5 text-white fill-white animate-bounce-subtle" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="section-title text-zinc-950 dark:text-white">Flash Deals</h2>
                  <span className="badge bg-rose-600 text-white font-black text-[10px] tracking-wider uppercase">
                    Up to 70% Off
                  </span>
                </div>
                <p className="section-subtitle mt-0.5">
                  Limited quantities available at special promotional prices.
                </p>
              </div>
            </div>

            {/* Live Countdown Clock */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 p-1.5 px-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide mr-1 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-orange-500 fill-orange-500" /> Ends in:
              </span>
              {[
                { label: 'H', val: mounted ? countdown.hours : '08' },
                { label: 'M', val: mounted ? countdown.minutes : '00' },
                { label: 'S', val: mounted ? countdown.seconds : '00' },
              ].map((item, idx) => (
                <React.Fragment key={item.label}>
                  <div className="flex flex-col items-center">
                    <span className="w-7 h-7 rounded-lg bg-zinc-900 text-white text-xs font-black flex items-center justify-center shadow-inner">
                      {item.val}
                    </span>
                  </div>
                  {idx < 2 && (
                    <span className="text-zinc-400 font-black text-xs leading-none">:</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-600 hover:border-indigo-500 hover:text-indigo-600 shadow-sm transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-600 hover:border-indigo-500 hover:text-indigo-600 shadow-sm transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <Link
              href="/flash-deals"
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:gap-2 transition-all ml-2"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Product Horizontal Rail */}
        <div
          ref={railRef}
          className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory scroll-smooth"
        >
          {deals.map(product => (
            <div key={product.id} className="snap-start flex-shrink-0 w-[240px] sm:w-[260px]">
              <ProductCard product={product} variant="compact" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

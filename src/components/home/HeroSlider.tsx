'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_BANNERS } from '@/lib/mockData';

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = HERO_BANNERS.length;

  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, paused]);

  const banner = HERO_BANNERS[current];

  return (
    <section
      className="relative h-[480px] md:h-[560px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide Content */}
      <div
        key={banner.id}
        className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} flex items-center`}
      >
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        {/* Glow */}
        <div
          className="absolute -right-20 -top-20 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: banner.accentColor }}
        />
        <div
          className="absolute -left-20 bottom-0 w-72 h-72 rounded-full blur-3xl opacity-15"
          style={{ background: banner.accentColor }}
        />

        <div className="max-w-[1400px] mx-auto px-6 md:px-10 w-full z-10">
          <div className="max-w-2xl animate-fade-in">
            {/* Badge */}
            {banner.badgeText && (
              <span className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold mb-5 text-white backdrop-blur-sm border border-white/20"
                style={{ background: `${banner.accentColor}60` }}>
                {banner.badgeText}
              </span>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-4">
              {banner.title}
            </h1>

            {/* Subtitle */}
            <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
              {banner.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href={banner.ctaHref}
                className="inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                style={{ background: banner.accentColor }}
              >
                {banner.ctaText}
              </Link>
              {banner.secondaryCtaText && (
                <Link
                  href={banner.secondaryCtaHref!}
                  className="inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-bold text-white bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                >
                  {banner.secondaryCtaText}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nav Arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {HERO_BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!paused && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
          <div
            key={current}
            className="h-full bg-white/60 rounded-full"
            style={{ animation: 'slideProgress 5s linear forwards' }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes slideProgress {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </section>
  );
}


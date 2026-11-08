'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Smartphone, Cpu, Monitor, Shirt, Zap, Dumbbell, Home, Baby,
  ChevronRight, Package
} from 'lucide-react';
import { CATEGORIES } from '@/lib/mockData';
import { categoryService } from '@/services/categoryService';
import type { Category } from '@/lib/types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone, Cpu, Monitor, Shirt, Zap, Dumbbell, Home, Baby,
};

export default function CategoriesGrid() {
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);

  useEffect(() => {
    categoryService.getCategories().then((data) => {
      if (data && data.length > 0) {
        setCategories(data);
      }
    });
  }, []);

  return (
    <section className="py-10 bg-white dark:bg-zinc-900 border-y border-zinc-100 dark:border-zinc-800">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle mt-0.5">Explore millions of products across all categories</p>
          </div>
          <Link href="/products" className="hidden md:flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:gap-2 transition-all">
            All Categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Package;
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:shadow-md hover:-translate-y-1"
              >
                {/* Icon Container */}
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                  <Icon className="w-7 h-7 md:w-8 md:h-8 text-white drop-shadow-sm" />
                </div>

                {/* Label */}
                <div className="text-center">
                  <span className="text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight block">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 mt-0.5 block">
                    {cat.productCount > 0 ? `${cat.productCount.toLocaleString()}+ items` : 'Explore'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

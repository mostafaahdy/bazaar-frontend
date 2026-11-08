import { ChevronRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/product/ProductCard';

interface ProductGridProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
  accentColor?: string;
  badge?: string;
}

export default function ProductGrid({
  title,
  subtitle,
  products,
  viewAllHref = '#',
  badge,
}: ProductGridProps) {
  return (
    <section className="py-10">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {badge && (
              <span className="badge bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 mb-2">
                {badge}
              </span>
            )}
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="section-subtitle mt-0.5">{subtitle}</p>}
          </div>
          <a
            href={viewAllHref}
            className="hidden md:flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:gap-2 transition-all whitespace-nowrap"
          >
            See All <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products.slice(0, 6).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-5 flex md:hidden">
          <a
            href={viewAllHref}
            className="flex-1 btn-secondary justify-center"
          >
            View All {title}
          </a>
        </div>
      </div>
    </section>
  );
}


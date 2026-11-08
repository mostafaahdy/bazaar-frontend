import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductCatalog from '@/components/catalog/ProductCatalog';
import { CATEGORIES } from '@/lib/mockData';

interface CategoryPageProps {
  params: { slug: string };
}

const SLUG_ALIASES: Record<string, string> = {
  home: 'home-living',
  'home-and-living': 'home-living',
  baby: 'baby-products',
  groceries: 'supermarket',
  grocery: 'supermarket',
};

function resolveCategory(rawSlug: string) {
  const normalized = rawSlug.toLowerCase();
  const canonicalSlug = SLUG_ALIASES[normalized] || normalized;
  return CATEGORIES.find((c) => c.slug === canonicalSlug || c.slug === normalized);
}

export function generateStaticParams() {
  const slugs = new Set<string>();
  CATEGORIES.forEach((c) => slugs.add(c.slug));
  Object.keys(SLUG_ALIASES).forEach((alias) => slugs.add(alias));
  slugs.add('flash-deals');
  return Array.from(slugs).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  if (params.slug.toLowerCase() === 'flash-deals') {
    return {
      title: 'Flash Deals — Up to 70% Off Electronics & Fashion | Bazaar.eg',
      description: 'Exclusive limited-time flash sales in Cairo, Alexandria, and all Egypt governorates.',
    };
  }

  const category = resolveCategory(params.slug);
  if (!category) {
    return { title: 'Category Not Found | Bazaar.eg' };
  }

  return {
    title: `${category.name} — Shop Best Deals & Top Brands | Bazaar.eg`,
    description: `Discover best-selling ${category.name.toLowerCase()} in Egypt. Fast Cairo delivery, official warranty, and easy 14-day returns.`,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const rawSlug = params.slug.toLowerCase();

  // Handle flash-deals special category view
  if (rawSlug === 'flash-deals') {
    return (
      <ProductCatalog
        initialCategorySlug="all"
        initialFlashDealsOnly={true}
        pageTitle="Flash Deals — Limited Time Mega Offers"
        pageDescription="Shop high-demand smartphones, laptops, electronics, and fashion discounted up to 70% with fast Cairo delivery."
      />
    );
  }

  const category = resolveCategory(rawSlug);
  if (!category) {
    notFound();
  }

  return (
    <ProductCatalog
      initialCategorySlug={category.slug}
      pageTitle={category.name}
      pageDescription={`Browse verified ${category.name.toLowerCase()} with official manufacturer warranties, ValU installments, and fast delivery across Egypt.`}
    />
  );
}

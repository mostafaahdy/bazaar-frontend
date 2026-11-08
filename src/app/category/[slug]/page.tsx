import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductCatalog from '@/components/catalog/ProductCatalog';
import { CATEGORIES } from '@/lib/mockData';

interface CategoryPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    slug: category.slug,
  }));
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const category = CATEGORIES.find((c) => c.slug === params.slug);
  if (!category) {
    return { title: 'Category Not Found | Bazaar' };
  }
  return {
    title: `${category.name} — Shop Best Deals & Top Brands | Bazaar`,
    description: `Discover best selling ${category.name.toLowerCase()} in Egypt. Fast Cairo delivery, warranty, and easy 14-day returns.`,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = CATEGORIES.find((c) => c.slug === params.slug);
  if (!category) {
    notFound();
  }

  return (
    <ProductCatalog
      initialCategorySlug={category.slug}
      pageTitle={`${category.name}`}
      pageDescription={`Browse verified ${category.name.toLowerCase()} with official manufacturer warranties and same-week delivery across Egypt.`}
    />
  );
}


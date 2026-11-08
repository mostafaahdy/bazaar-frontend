import type { Metadata } from 'next';
import ProductCatalog from '@/components/catalog/ProductCatalog';

export const metadata: Metadata = {
  title: 'Search Results | Bazaar',
  description: 'Search results for products, brands, and categories across Egypt.',
};

interface SearchPageProps {
  searchParams: { q?: string };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';

  return (
    <ProductCatalog
      initialSearchQuery={query}
      pageTitle={query ? `Search: "${query}"` : 'Search Products'}
      pageDescription={query ? `Discover top products and brands matching "${query}".` : 'Search our catalog for products, brands, and deals.'}
    />
  );
}


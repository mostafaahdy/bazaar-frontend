import type { Metadata } from 'next';
import ProductCatalog from '@/components/catalog/ProductCatalog';

export const metadata: Metadata = {
  title: 'All Products — Browse Catalog | Bazaar',
  description: 'Shop millions of authentic products with fast delivery across Egypt. Filter by brand, price, rating, and express delivery.',
};

export default function ProductsPage() {
  return (
    <ProductCatalog
      pageTitle="All Products"
      pageDescription="Explore our complete collection of top brands, electronics, smartphones, fashion, and home appliances."
    />
  );
}


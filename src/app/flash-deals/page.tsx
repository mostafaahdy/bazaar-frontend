import type { Metadata } from 'next';
import ProductCatalog from '@/components/catalog/ProductCatalog';

export const metadata: Metadata = {
  title: 'Flash Deals — Up to 70% Off Today Only | Bazaar',
  description: 'Limited-time daily flash deals across electronics, smartphones, fashion, and home appliances in Egypt.',
};

export default function FlashDealsPage() {
  return (
    <ProductCatalog
      initialFlashDealsOnly={true}
      pageTitle="⚡ Today's Flash Deals"
      pageDescription="Hurry! Limited stock at special promotional prices. Countdown active on all items below."
    />
  );
}


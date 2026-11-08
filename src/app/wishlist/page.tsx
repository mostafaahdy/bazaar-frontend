'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlistStore, useCartStore } from '@/lib/store';
import { PRODUCTS } from '@/lib/mockData';
import ProductCard from '@/components/product/ProductCard';

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem } = useWishlistStore();
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const wishlistProducts = mounted
    ? PRODUCTS.filter(p => items.some(item => item.productId === p.id))
    : [];

  const handleMoveToCart = (product: typeof PRODUCTS[0]) => {
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      image: product.images[0]?.url || '',
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: 1,
      maxQuantity: product.stock,
      categoryName: product.categoryName,
      freeShipping: product.freeShipping ?? false,
    });
    removeItem(product.id);
  };

  const handleAddAllToCart = () => {
    wishlistProducts.forEach(product => {
      addItem({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        image: product.images[0]?.url || '',
        price: product.price,
        originalPrice: product.originalPrice,
        quantity: 1,
        maxQuantity: product.stock,
        categoryName: product.categoryName,
        freeShipping: product.freeShipping ?? false,
      });
    });
    openCart();
  };

  return (
    <div className="bg-zinc-50/60 dark:bg-zinc-950/50 min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-800 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center border border-rose-200 dark:border-rose-900/60">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">My Wishlist</h1>
              <p className="text-xs text-zinc-500">
                {wishlistProducts.length} saved {wishlistProducts.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          {wishlistProducts.length > 0 && (
            <button
              onClick={handleAddAllToCart}
              className="btn-primary py-2.5 text-xs font-bold shadow-md shadow-indigo-600/20"
            >
              <ShoppingCart className="w-4 h-4 mr-1.5" /> Move All to Cart
            </button>
          )}
        </div>

        {/* Wishlist Items Grid */}
        {wishlistProducts.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-200/80 dark:border-zinc-800 shadow-sm max-w-lg mx-auto space-y-4 my-8">
            <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-400 mx-auto flex items-center justify-center">
              <Heart className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Your wishlist is empty
              </h2>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                Explore our catalog and click the heart icon on any product to save it here for later.
              </p>
            </div>
            <Link href="/products" className="btn-primary inline-flex py-3 px-6 text-xs font-bold">
              Explore Products <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {wishlistProducts.map(product => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="flex-1 btn-primary py-2 text-xs font-bold justify-center"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Move to Cart
                  </button>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-rose-50 hover:text-rose-500 text-zinc-400 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

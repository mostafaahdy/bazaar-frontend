import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import AuthModal from '@/components/layout/AuthModal';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: { default: 'Bazaar — Egypt\'s Premier Online Marketplace', template: '%s | Bazaar' },
  description: 'Shop millions of products across electronics, fashion, appliances and more with fast delivery across Egypt. Best prices guaranteed.',
  keywords: ['online shopping', 'egypt', 'electronics', 'fashion', 'deals', 'bazaar'],
};

export const viewport: Viewport = {
  themeColor: '#4F46E5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${plusJakarta.variable} font-sans bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <CartDrawer />
        <AuthModal />
      </body>
    </html>
  );
}

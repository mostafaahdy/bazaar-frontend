'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search, ShoppingCart, Heart, User, MapPin, ChevronDown,
  Globe, HelpCircle, Zap, Smartphone, Cpu, Monitor, Shirt,
  Home, Dumbbell, ShoppingBasket, Baby, Menu, X, Package,
  Check, CheckCircle2
} from 'lucide-react';
import { useCartStore, useWishlistStore, useAuthStore, useUIStore } from '@/lib/store';
import { CURRENCIES, NAV_CATEGORIES, SEARCH_SUGGESTIONS } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';
import type { SearchSuggestion } from '@/lib/types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Smartphone, Cpu, Monitor, Shirt, Home, Dumbbell, ShoppingBasket, Baby,
};

const DELIVERY_LOCATIONS = [
  { city: 'Cairo, Egypt', label: 'Cairo - Downtown & Heliopolis', eta: 'Tomorrow' },
  { city: 'New Cairo, Egypt', label: 'New Cairo / 5th Settlement', eta: 'Tomorrow' },
  { city: 'Giza, Egypt', label: 'Giza / Dokki & Mohandessin', eta: 'Tomorrow' },
  { city: '6th of October, Egypt', label: '6th of October / Sheikh Zayed', eta: 'Tomorrow' },
  { city: 'Alexandria, Egypt', label: 'Alexandria - Corniche & Smouha', eta: '2 Days' },
  { city: 'Mansoura, Egypt', label: 'Mansoura & Delta Cities', eta: '2-3 Days' },
];

const SEARCH_CATEGORIES = [
  'All Categories',
  'Mobiles',
  'Electronics',
  'Fashion',
  'Appliances',
  'Supermarket',
  'Computers',
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All Categories');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  const { totalItems, toggleCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { user, openAuth, logout, initAuth } = useAuthStore();
  const { currency, deliveryLocation, setCurrency, setDeliveryLocation } = useUIStore();

  useEffect(() => {
    setMounted(true);
    initAuth();
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [initAuth]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowLocationModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    const params = new URLSearchParams();
    params.set('q', searchQuery.trim());
    if (searchCategory && searchCategory !== 'All Categories') {
      params.set('category', searchCategory.toLowerCase().replace(/\s+/g, '-'));
    }
    router.push(`/products?${params.toString()}`);
  };

  const filteredSuggestions: SearchSuggestion[] = searchQuery.length > 0
    ? SEARCH_SUGGESTIONS.filter(s =>
        s.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SEARCH_SUGGESTIONS.slice(0, 6);

  const cartCount = mounted ? totalItems : 0;
  const wishCount = mounted ? wishlistItems.length : 0;
  const currentCurrency = mounted ? currency : 'EGP';
  const currentDelivery = mounted ? deliveryLocation : 'Cairo, Egypt';
  const currentUser = mounted ? user : null;

  return (
    <header className={`sticky top-0 z-50 w-full bg-white dark:bg-zinc-900 transition-shadow duration-200 ${isScrolled ? 'shadow-md dark:shadow-zinc-950' : ''}`}>
      {/* ── Top Row: Utility Bar ─────────────────────────── */}
      <div className="bg-zinc-950 text-zinc-400 text-xs border-b border-zinc-800/80">
        <div className="max-w-[1400px] mx-auto px-4 h-9 flex items-center justify-between gap-4">
          {/* Left: Delivery location selector */}
          <div className="relative" ref={locationRef}>
            <button
              onClick={() => setShowLocationModal(!showLocationModal)}
              className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors truncate max-w-[240px] py-1"
            >
              <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 animate-pulse" />
              <span className="truncate">
                Deliver to: <span className="text-white font-semibold">{currentDelivery}</span>
              </span>
              <ChevronDown className="w-3 h-3 flex-shrink-0 opacity-70" />
            </button>

            {/* Delivery Locations Dropdown */}
            {showLocationModal && (
              <div className="absolute left-0 top-full mt-1.5 w-72 bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 py-3 z-50 animate-fade-in text-zinc-900 dark:text-zinc-100">
                <div className="px-4 pb-2 border-b border-zinc-100 dark:border-zinc-700">
                  <p className="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Choose Delivery City
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Items will be filtered by local warehouse availability
                  </p>
                </div>
                <div className="py-1 max-h-60 overflow-y-auto">
                  {DELIVERY_LOCATIONS.map((loc) => {
                    const isSelected = currentDelivery === loc.city;
                    return (
                      <button
                        key={loc.city}
                        onClick={() => {
                          setDeliveryLocation(loc.city);
                          setShowLocationModal(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-xs transition-colors hover:bg-indigo-50 dark:hover:bg-zinc-700 ${
                          isSelected ? 'bg-indigo-50/80 dark:bg-zinc-700/80 text-indigo-600 dark:text-indigo-400 font-semibold' : ''
                        }`}
                      >
                        <div>
                          <p className="font-medium">{loc.label}</p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                            ⚡ Express delivery: {loc.eta}
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Center: Promo text */}
          <p className="hidden md:flex items-center gap-1.5 text-center text-zinc-400">
            <span>🚚 Free express shipping on orders over</span>
            <span className="text-indigo-400 font-bold">{formatPrice(500, currentCurrency)}</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-medium ml-1">EGYPT EXCLUSIVE</span>
          </p>

          {/* Right: Currency + Help + Auth */}
          <div className="flex items-center gap-4">
            {/* Currency Selector */}
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-white transition-colors py-1">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-bold text-white">{currentCurrency}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-100 dark:border-zinc-700 overflow-hidden min-w-[170px] py-1 text-zinc-800 dark:text-zinc-200">
                  {CURRENCIES.map(c => (
                    <button
                      key={c.code}
                      onClick={() => setCurrency(c.code)}
                      className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-colors hover:bg-indigo-50 dark:hover:bg-zinc-700 ${
                        currentCurrency === c.code ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-zinc-700' : ''
                      }`}
                    >
                      <span className="font-mono">{c.code} ({c.symbol})</span>
                      <span className="text-[10px] text-zinc-400">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/help" className="flex items-center gap-1 text-zinc-300 hover:text-white transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Help Center</span>
            </Link>

            {currentUser ? (
              <button onClick={logout} className="hidden sm:block text-zinc-300 hover:text-white transition-colors">
                Sign Out
              </button>
            ) : (
              <button onClick={openAuth} className="hidden sm:block text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Center Row: Brand + Search Bar with Category Scope + Actions ── */}
      <div className="border-b border-zinc-100 dark:border-zinc-800">
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center gap-3 md:gap-5">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight leading-none text-zinc-900 dark:text-zinc-100">
                Bazaar<span className="text-indigo-600 dark:text-indigo-400">.eg</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-semibold mt-0.5">
                Egypt Marketplace
              </span>
            </div>
          </Link>

          {/* Search Bar with Categorized Auto-Suggest & Scope Selector */}
          <div ref={searchRef} className="flex-1 relative max-w-2xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className={`flex items-center rounded-2xl border-2 transition-all duration-200 bg-zinc-50 dark:bg-zinc-800/80 ${
                showSuggestions
                  ? 'border-indigo-600 dark:border-indigo-500 shadow-lg shadow-indigo-500/10'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
              }`}
            >
              {/* Category Scope Selector */}
              <div className="relative border-r border-zinc-200 dark:border-zinc-700 hidden sm:block">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="appearance-none bg-transparent pl-3 pr-7 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
                >
                  {SEARCH_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <Search className="w-4 h-4 ml-3 text-zinc-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search products, brands, models (e.g. iPhone, Samsung, Nike)..."
                className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
                  className="p-1.5 hover:text-zinc-700 dark:hover:text-zinc-200 mr-1"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              )}
              <button
                type="submit"
                className="m-1.5 px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold hover:opacity-95 transition-opacity flex items-center gap-1.5 shadow-sm"
              >
                <span>Search</span>
              </button>
            </form>

            {/* Categorized Auto-suggest Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden z-50 animate-fade-in">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-500 uppercase tracking-wider">
                    {searchQuery ? `Results for "${searchQuery}" in ${searchCategory}` : 'Popular Suggestions'}
                  </span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                    Verified Sellers
                  </span>
                </div>
                <div className="py-1 max-h-72 overflow-y-auto">
                  {filteredSuggestions.map((s, i) => (
                    <Link
                      key={i}
                      href={s.href}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-zinc-800 transition-colors group"
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                        s.type === 'category' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600' :
                        s.type === 'brand'    ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600' :
                        'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                      }`}>
                        <Search className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {s.label}
                        </p>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        s.type === 'category' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' :
                        s.type === 'brand'    ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400' :
                        'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                      }`}>
                        {s.type}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Icons: Wishlist, Profile Menu, Cart Drawer */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Wishlist Button */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishCount > 0 && (
                <span className="absolute 1.5 top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none px-1 shadow-sm">
                  {wishCount > 99 ? '99+' : wishCount}
                </span>
              )}
            </Link>

            {/* User Profile Menu */}
            <div className="relative group">
              <button
                onClick={currentUser ? undefined : openAuth}
                className="p-2 sm:px-3 sm:py-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors"
              >
                {currentUser?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-7 h-7 rounded-full border border-indigo-500/30" />
                ) : (
                  <User className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                )}
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-[10px] text-zinc-400 leading-none">
                    {currentUser ? 'Welcome back' : 'Sign in'}
                  </span>
                  <span className="text-xs font-bold leading-tight truncate max-w-[90px]">
                    {currentUser ? currentUser.name.split(' ')[0] : 'My Account'}
                  </span>
                </div>
              </button>

              {currentUser && (
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-700 overflow-hidden min-w-[210px] py-2">
                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {currentUser.name}
                      </p>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{currentUser.email}</p>
                    </div>
                    {[
                      { label: 'My Profile & Account', href: '/account' },
                      { label: 'My Orders & Tracking', href: '/orders' },
                      { label: 'My Saved Items', href: '/wishlist' },
                      { label: 'Delivery Addresses', href: '/account' },
                      { label: 'Payment Methods & ValU', href: '/account' },
                    ].map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center px-4 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-zinc-700 hover:text-indigo-600 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-zinc-100 dark:border-zinc-700 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Live Cart Drawer Trigger */}
            <button
              onClick={toggleCart}
              className="relative flex items-center gap-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 transition-all shadow-md shadow-indigo-600/20 active:scale-95"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="sm:hidden absolute -top-2 -right-2.5 w-4.5 h-4.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden md:block text-xs font-bold tracking-wide uppercase">Cart</span>
              {cartCount > 0 && (
                <span className="hidden sm:flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-white text-indigo-700 text-xs font-black px-1.5 shadow-sm">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Sticky Category Navigation Bar ── */}
      <nav className="border-b border-zinc-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md hidden lg:block">
        <div className="max-w-[1400px] mx-auto px-4">
          <ul className="flex items-center gap-1 overflow-x-auto hide-scrollbar h-11">
            {NAV_CATEGORIES.map(cat => {
              const Icon = cat.icon ? ICON_MAP[cat.icon] : null;
              const isActive =
                cat.href.startsWith('/category/')
                  ? pathname === cat.href
                  : cat.href.includes('category=flash-deals')
                  ? pathname === '/category/flash-deals'
                  : pathname === cat.href;

              return (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 rounded-xl whitespace-nowrap relative group ${
                      isActive
                        ? cat.highlight
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold'
                          : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                        : cat.highlight
                        ? 'bg-gradient-to-r from-orange-500/10 to-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/50 hover:bg-rose-500/20'
                        : 'text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`w-3.5 h-3.5 transition-colors ${
                          isActive
                            ? 'text-white'
                            : cat.highlight
                            ? 'text-rose-500 fill-rose-500 animate-pulse'
                            : 'text-zinc-400 group-hover:text-indigo-500'
                        }`}
                      />
                    )}
                    <span>{cat.label}</span>
                    {cat.highlight && !isActive && (
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 bg-rose-500 text-white rounded-full">
                        Hot
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}

            <li className="ml-auto flex items-center gap-4 text-xs font-semibold text-zinc-500">
              <Link
                href="/sell"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  pathname === '/sell'
                    ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-600/25'
                    : 'hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <span>Sell on Bazaar</span>
                <span className={pathname === '/sell' ? 'text-white font-bold' : 'text-indigo-500 font-bold'}>→</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[105px] z-40 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white dark:bg-zinc-900 w-80 h-full overflow-y-auto p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-bold text-sm">{currentUser.name}</p>
                    <p className="text-xs text-zinc-500">{currentUser.email}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { openAuth(); setIsMobileMenuOpen(false); }}
                  className="btn-primary w-full py-2.5 text-xs font-bold"
                >
                  Sign In / Register
                </button>
              )}
            </div>

            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Shop Categories</p>
            <ul className="space-y-1">
              {NAV_CATEGORIES.map(cat => {
                const isActive =
                  cat.href.startsWith('/category/')
                    ? pathname === cat.href
                    : cat.href.includes('category=flash-deals')
                    ? pathname === '/category/flash-deals'
                    : pathname === cat.href;

                return (
                  <li key={cat.href}>
                    <Link
                      href={cat.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? cat.highlight
                            ? 'bg-rose-600 text-white font-bold'
                            : 'bg-indigo-600 text-white font-bold'
                          : cat.highlight
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {cat.highlight && (
                        <Zap className={`w-4 h-4 ${isActive ? 'fill-white text-white' : 'fill-rose-500 text-rose-500'}`} />
                      )}
                    </Link>
                  </li>
                );
              })}
              <li className="pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-2">
                <Link
                  href="/sell"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    pathname === '/sell'
                      ? 'bg-indigo-600 text-white'
                      : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-zinc-800'
                  }`}
                >
                  <span>Sell on Bazaar</span>
                  <span>→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight, Store, ShieldCheck, TrendingUp, Truck, CreditCard,
  CheckCircle2, ArrowRight, HelpCircle, Building2, UserCheck, Sparkles
} from 'lucide-react';

const CATEGORIES_OPTIONS = [
  'Mobiles & Accessories',
  'Electronics & Audio',
  'Fashion & Apparel',
  'Home & Living',
  'Appliances',
  'Computers & Office',
  'Sports & Fitness',
  'Baby & Kids',
  'Supermarket & Gourmet',
];

const GOVERNORATES = [
  'Cairo',
  'Giza',
  'Alexandria',
  'Qalyubia',
  'Sharqia',
  'Dakahlia',
  'Gharbia',
  'Port Said',
  'Suez',
  'Red Sea (Hurghada)',
  'South Sinai (Sharm El Sheikh)',
  'Other Governorates',
];

export default function SellOnBazaarPage() {
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState(CATEGORIES_OPTIONS[0]);
  const [governorate, setGovernorate] = useState(GOVERNORATES[0]);
  const [businessType, setBusinessType] = useState<'individual' | 'registered'>('individual');
  const [taxNumber, setTaxNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 900);
  };

  return (
    <div className="bg-zinc-50/60 dark:bg-zinc-950/50 min-h-screen py-8">
      <div className="max-w-[1280px] mx-auto px-4">
        {/* ── Breadcrumbs ─────────────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-zinc-500 py-1">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">Sell on Bazaar</span>
        </nav>

        {/* ── Hero Section ────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-950 text-white p-8 md:p-14 mb-12 shadow-2xl border border-indigo-900/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-5 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Partner With Egypt&apos;s Fastest Growing Marketplace</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Grow Your Sales Across Egypt with <span className="text-indigo-400">Bazaar.eg</span>
            </h1>
            <p className="mt-4 text-zinc-300 text-sm md:text-base leading-relaxed">
              Reach over 5 Million active shoppers in Cairo, Alexandria, Giza, and all governorates.
              Enjoy 0% listing fees, instant door-to-door courier pickups, and automated bi-weekly bank / Instapay payouts.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 text-xs font-semibold text-zinc-300">
              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>0% Upfront Listing Fees</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <Truck className="w-4 h-4 text-indigo-400" />
                <span>Express Cairo Fulfillment</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Instapay & Bank Payouts</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two Column: Form + Why Bazaar ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Left Column: Registration Form */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  Application Received!
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mt-2 leading-relaxed">
                  Thank you for applying to sell on Bazaar.eg. Our merchant onboarding team will contact you within 24 business hours at <span className="font-semibold text-indigo-600">{email}</span> and WhatsApp <span className="font-semibold text-indigo-600">{phone}</span> to verify your store details.
                </p>
                <div className="mt-8 flex justify-center gap-3">
                  <Link href="/" className="btn-primary py-2.5 px-6 text-xs font-bold">
                    Return to Home
                  </Link>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setStoreName('');
                      setOwnerName('');
                      setEmail('');
                      setPhone('');
                      setTaxNumber('');
                    }}
                    className="btn-outline py-2.5 px-6 text-xs font-bold"
                  >
                    Register Another Store
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 pb-5 border-b border-zinc-100 dark:border-zinc-800 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                      Open Your Bazaar Seller Account
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Fill out the form below to get verified and list your first products
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Business Type Toggle */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                      Seller Legal Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setBusinessType('individual')}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                          businessType === 'individual'
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        <UserCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold">Individual / Artisan</p>
                          <p className="text-[11px] text-zinc-500">National ID required</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBusinessType('registered')}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                          businessType === 'registered'
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        <Building2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold">Company / Brand</p>
                          <p className="text-[11px] text-zinc-500">Tax card & Commercial register</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Store Name & Owner Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Store / Brand Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="e.g. Cairo Tech Hub"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none focus:border-indigo-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="e.g. Ahmed Mostafa"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none focus:border-indigo-600 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email & Egyptian Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Business Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seller@yourstore.eg"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none focus:border-indigo-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Egyptian Phone / WhatsApp *
                      </label>
                      <div className="flex">
                        <span className="px-3 py-2.5 rounded-l-xl bg-zinc-100 dark:bg-zinc-700 text-xs font-semibold text-zinc-500 border border-r-0 border-zinc-200 dark:border-zinc-700">
                          +20
                        </span>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="10 1234 5678"
                          className="flex-1 px-4 py-2.5 rounded-r-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none focus:border-indigo-600 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category & Governorate */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Primary Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none focus:border-indigo-600 transition-colors cursor-pointer"
                      >
                        {CATEGORIES_OPTIONS.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Warehouse Governorate *
                      </label>
                      <select
                        value={governorate}
                        onChange={(e) => setGovernorate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none focus:border-indigo-600 transition-colors cursor-pointer"
                      >
                        {GOVERNORATES.map((gov) => (
                          <option key={gov} value={gov}>{gov}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tax Card if registered */}
                  {businessType === 'registered' && (
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Tax Registration Number (رقم التسجيل الضريبي)
                      </label>
                      <input
                        type="text"
                        value={taxNumber}
                        onChange={(e) => setTaxNumber(e.target.value)}
                        placeholder="e.g. 123-456-789"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white outline-none focus:border-indigo-600 transition-colors"
                      />
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-primary py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Submitting Application...</span>
                      ) : (
                        <>
                          <span>Submit Merchant Application</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-zinc-400 text-center mt-2.5">
                      By submitting, you agree to Bazaar.eg Merchant Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Column: Why Sell on Bazaar */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Why 12,000+ Egyptian Sellers Choose Bazaar
              </h3>
              <ul className="space-y-3.5 text-xs text-zinc-600 dark:text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Zero Setup Fees:</strong> It is completely free to create an account, list catalogs, and run campaigns.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Express Logistics:</strong> Couriers pick up daily from your warehouse or home across Cairo, Giza, and Alex.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span><strong>ValU & BNPL Support:</strong> Shoppers buy via 12-month installments, while you receive 100% of funds immediately.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Reliable Cash-out:</strong> Automatic bi-weekly payouts directly to your National Bank of Egypt, CIB, Banque Misr, or Instapay.</span>
                </li>
              </ul>
            </div>

            <div className="bg-indigo-50/70 dark:bg-zinc-800/80 rounded-3xl p-6 border border-indigo-100 dark:border-zinc-700">
              <h4 className="font-bold text-xs text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-600" /> Need Help Registering?
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Our seller support team is available Saturday to Thursday from 9:00 AM to 6:00 PM CLT.
              </p>
              <div className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Email: <span className="underline">sellers@bazaar.eg</span> | Hotline: 19820
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


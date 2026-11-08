'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle, Phone, MessageSquare, Mail, ChevronDown, ChevronRight,
  Sparkles, Search
} from 'lucide-react';

const FAQS = [
  {
    category: 'Delivery & Shipping',
    items: [
      {
        q: 'How fast is delivery in Cairo and Giza?',
        a: 'Orders placed before 2:00 PM for Cairo and Giza are delivered the very next business day via Bazaar Express. Weekend orders are delivered on Sunday.',
      },
      {
        q: 'How much is delivery in Egypt?',
        a: 'Standard delivery is 35 EGP, and Bazaar Express is 50 EGP. All orders above 500 EGP qualify for 100% FREE delivery anywhere across Egypt.',
      },
      {
        q: 'Do you deliver to Alexandria, Delta, and Upper Egypt?',
        a: 'Yes, we deliver nationwide to all 27 Egyptian governorates including Alexandria, Mansoura, Tanta, Ismailia, Suez, Red Sea, Assiut, and Aswan within 2 to 4 business days.',
      },
    ],
  },
  {
    category: 'ValU Installments & Meeza',
    items: [
      {
        q: 'How do ValU installments work on Bazaar.eg?',
        a: 'Select "ValU Installments" at checkout, choose your preferred tenor (from 3 up to 60 months), enter your ValU registered mobile phone, and confirm via OTP. Zero down payment is required.',
      },
      {
        q: 'Can I pay with my Egyptian Meeza debit or prepaid card?',
        a: 'Yes! We support all national Meeza cards issued by Egyptian banks (NBE, Banque Misr, CIB, QNB, etc.) with instant 3D Secure verification.',
      },
      {
        q: 'Is Cash on Delivery (COD) supported?',
        a: 'Yes, Cash on Delivery is available for eligible orders up to 10,000 EGP across Cairo, Giza, and Alexandria.',
      },
    ],
  },
  {
    category: 'Returns & Warranty',
    items: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 14-day hassle-free return policy. If you receive an item that is defective, counterfeit, or not as described, return shipping is 100% free.',
      },
      {
        q: 'Are electronics backed by official local warranty?',
        a: 'All electronics sold by Bazaar.eg are 100% genuine with official Egyptian agent warranties (e.g., Tradeline/Arab Business for Apple, Samsung Egypt, Raya, B.TECH).',
      },
    ],
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = (key: string) => {
    setOpenFaq(openFaq === key ? null : key);
  };

  const filteredFaqs = FAQS.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* ── Breadcrumb ─────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-800 dark:text-zinc-200 font-semibold">Help Center & FAQ</span>
        </nav>

        {/* ── Hero Banner ────────────────────────────────── */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-zinc-900 rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> 24/7 Egypt Customer Care
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">How Can We Help You?</h1>
            <p className="text-xs sm:text-sm text-zinc-300">
              Find answers on orders, Cairo fast delivery, ValU installments, and returns.
            </p>

            <div className="pt-3">
              <div className="relative max-w-md mx-auto">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions (e.g. ValU, delivery, returns)..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-zinc-400 text-xs sm:text-sm outline-none focus:bg-white/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Contact Options Grid ───────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mx-auto flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">WhatsApp Support</h3>
            <p className="text-xs text-zinc-500">Live chat with Cairo team</p>
            <p className="text-xs font-mono font-bold text-emerald-600">+20 100 123 4567</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 mx-auto flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Hotline</h3>
            <p className="text-xs text-zinc-500">Daily from 9 AM to 11 PM</p>
            <p className="text-xs font-mono font-bold text-indigo-600">19999 (Toll Free)</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 mx-auto flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Email Inquiries</h3>
            <p className="text-xs text-zinc-500">Response within 2 hours</p>
            <p className="text-xs font-semibold text-violet-600">care@bazaar.eg</p>
          </div>
        </div>

        {/* ── FAQ Categories Accordion ───────────────────── */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" /> Frequently Asked Questions
          </h2>

          {filteredFaqs.map((cat, catIdx) => (
            <div key={catIdx} className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {cat.category}
              </h3>
              <div className="space-y-2">
                {cat.items.map((item, itemIdx) => {
                  const key = `${catIdx}-${itemIdx}`;
                  const isOpen = openFaq === key;

                  return (
                    <div
                      key={itemIdx}
                      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFaq(key)}
                        className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      >
                        <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {item.q}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


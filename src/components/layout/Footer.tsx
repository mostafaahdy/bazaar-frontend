'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Mail, Share2, MessageCircle, Radio, Film, ArrowRight, CheckCircle2 } from 'lucide-react';

const footerLinks = {
  'About Bazaar': [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press & Media', href: '/press' },
    { label: 'Investor Relations', href: '/investors' },
    { label: 'Sustainability', href: '/sustainability' },
  ],
  'Customer Service': [
    { label: 'Help Center', href: '/help' },
    { label: 'Track Your Order', href: '/track' },
    { label: 'Returns & 14-Day Refunds', href: '/returns' },
    { label: 'Shipping Rates & Policies', href: '/shipping' },
    { label: 'Contact Us (Cairo 24/7)', href: '/contact' },
  ],
  'Sell on Bazaar': [
    { label: 'Become a Seller', href: '/seller' },
    { label: 'Seller Center Portal', href: '/seller/dashboard' },
    { label: 'Seller University', href: '/seller/learn' },
    { label: 'Fulfilled by Bazaar (FBB)', href: '/fbb' },
    { label: 'Advertise on Bazaar', href: '/advertise' },
  ],
  'Policies & Trust': [
    { label: '14-Day Return Guarantee', href: '/return-policy' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Security & Anti-Fraud', href: '/security' },
    { label: 'Consumer Rights Egypt', href: '/cpa' },
  ],
};

const paymentMethods = [
  { label: 'Visa', bg: 'bg-[#1A1F71]', text: 'text-white' },
  { label: 'Mastercard', bg: 'bg-[#EB001B]', text: 'text-white' },
  { label: 'Meeza', bg: 'bg-[#008752]', text: 'text-white' },
  { label: 'ValU (Installments)', bg: 'bg-[#673AB7]', text: 'text-white' },
  { label: 'Fawry', bg: 'bg-[#F58220]', text: 'text-white' },
  { label: 'Cash on Delivery', bg: 'bg-zinc-700', text: 'text-white' },
];

const socialLinks = [
  { icon: Share2,         href: '#', label: 'Facebook' },
  { icon: MessageCircle,  href: '#', label: 'Instagram' },
  { icon: Radio,          href: '#', label: 'Twitter / X' },
  { icon: Film,           href: '#', label: 'YouTube' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800">
      {/* Newsletter Band */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-violet-950 py-10 border-b border-indigo-800/40">
        <div className="max-w-[1400px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white font-extrabold text-xl md:text-2xl tracking-tight">
              Get exclusive deals directly in your inbox
            </h3>
            <p className="text-indigo-200 text-sm mt-1">
              Join 500,000+ shoppers in Egypt · First access to Flash Deals & coupons.
            </p>
          </div>

          {subscribed ? (
            <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-5 py-3 rounded-2xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-semibold">
                You&apos;re subscribed! Welcome coupon sent to your inbox.
              </span>
            </div>
          ) : (
            <form className="flex w-full md:w-auto gap-2 max-w-md" onSubmit={handleSubscribe}>
              <div className="flex-1 relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-indigo-950/70 border border-indigo-700/60 text-white placeholder:text-indigo-300 text-sm outline-none focus:border-indigo-400 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm transition-colors whitespace-nowrap shadow-md shadow-indigo-500/20"
              >
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1400px] mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white">
                Bazaar<span className="text-indigo-400 font-semibold">.eg</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed mb-5">
              Egypt&apos;s leading online shopping destination. Delivering millions of genuine products to Cairo, Giza, Alexandria, and all governorates.
            </p>
            <div className="flex gap-2">
              {socialLinks.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-indigo-600 hover:border-indigo-500 transition-colors flex items-center justify-center group"
                >
                  <s.icon className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-zinc-200 mb-4 text-xs uppercase tracking-wider">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-xs text-zinc-400 hover:text-indigo-400 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar with Payment Badges & Copyright */}
      <div className="border-t border-zinc-800/80 bg-zinc-950 py-6">
        <div className="max-w-[1400px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-5">
          <p className="text-xs text-zinc-500 text-center md:text-left">
            © {new Date().getFullYear()} Bazaar E-Commerce Egypt SAE. All rights reserved. Registered Commercial Registry No. 419284 Cairo.
          </p>

          {/* Payment Badges */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-[11px] text-zinc-500 mr-1 font-medium">Accepted Payment Methods:</span>
            {paymentMethods.map(p => (
              <span
                key={p.label}
                className={`${p.bg} ${p.text} text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm`}
              >
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

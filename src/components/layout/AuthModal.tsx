'use client';

import { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function AuthModal() {
  const { isAuthOpen, closeAuth, login } = useAuthStore();
  const [email, setEmail] = useState('ahmed.hassan@example.com');
  const [name, setName] = useState('Ahmed Hassan');
  const [isRegister, setIsRegister] = useState(false);

  if (!isAuthOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email, name || email.split('@')[0]);
  };

  const handleQuickDemoLogin = (demoName: string, demoEmail: string) => {
    login(demoEmail, demoName);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={closeAuth}
      />

      {/* Modal Dialog */}
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <div
          className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 p-6 text-white">
            <button
              onClick={closeAuth}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Welcome to Bazaar
            </div>
            <h3 className="text-2xl font-bold">
              {isRegister ? 'Create an Account' : 'Sign in to Bazaar'}
            </h3>
            <p className="text-xs text-indigo-100 mt-1">
              Access your orders, saved addresses, and personalized Cairo deals
            </p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            {/* Quick Demo Sign-in buttons */}
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/60">
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> 1-Click Demo Profiles:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('Ahmed Hassan', 'ahmed.hassan@example.com')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-indigo-100 dark:hover:bg-zinc-700 border border-indigo-200/50 dark:border-zinc-700 text-left truncate"
                >
                  🇪🇬 Ahmed Hassan
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('Sarah Mansour', 'sarah.mansour@example.com')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-indigo-100 dark:hover:bg-zinc-700 border border-indigo-200/50 dark:border-zinc-700 text-left truncate"
                >
                  🇪🇬 Sarah Mansour
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tamer Hosny"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    defaultValue="password123"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-primary justify-center py-3 text-sm font-bold shadow-md shadow-indigo-500/20 mt-2"
              >
                {isRegister ? 'Create Account' : 'Sign In'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                {isRegister
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Register now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


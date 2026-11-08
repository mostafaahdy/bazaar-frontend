'use client';

import { useState } from 'react';
import { 
  X, Mail, Lock, User, Phone, ArrowRight, ShieldCheck, 
  Sparkles, AlertCircle, Eye, EyeOff, Loader2, CheckCircle2 
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function AuthModal() {
  const { isAuthOpen, closeAuth, login, register, isLoading, error, clearError } = useAuthStore();
  
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('customer@bazaar.eg');
  const [password, setPassword] = useState('Customer@123');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);

    if (isRegister) {
      if (!name.trim()) return;
      if (password.length < 6) return;
      
      const success = await register(name, email, password, phone);
      if (success) {
        setSuccessMessage('Account created successfully! Welcome to Bazaar.eg');
        setTimeout(() => {
          setSuccessMessage(null);
        }, 1500);
      }
    } else {
      const success = await login(email, password);
      if (success) {
        setSuccessMessage('Signed in successfully!');
        setTimeout(() => {
          setSuccessMessage(null);
        }, 1500);
      }
    }
  };

  const handleQuickDemo = async (demoEmail: string, demoPass: string, demoName: string) => {
    clearError();
    setEmail(demoEmail);
    setPassword(demoPass);
    setName(demoName);
    setIsRegister(false);
    
    // Automatically execute live backend login
    await login(demoEmail, demoPass);
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
              <Sparkles className="w-3.5 h-3.5" /> Welcome to Bazaar.eg
            </div>
            <h3 className="text-2xl font-bold">
              {isRegister ? 'Create an Account' : 'Sign in to Bazaar'}
            </h3>
            <p className="text-xs text-indigo-100 mt-1">
              Real PostgreSQL persistence with JWT authentication & security
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-4">
            {/* Quick Demo Sign-in buttons */}
            <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/60">
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> 1-Click Verified Egyptian Profiles:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('customer@bazaar.eg', 'Customer@123', 'Ahmed Hassan')}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-indigo-100 dark:hover:bg-zinc-700 border border-indigo-200/50 dark:border-zinc-700 text-left transition-colors truncate shadow-sm"
                >
                  <span className="block font-bold text-zinc-900 dark:text-zinc-100">🇪🇬 Ahmed Hassan</span>
                  <span className="text-[10px] text-zinc-500">customer@bazaar.eg</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin@bazaar.eg', 'Admin@Bazaar2026', 'Bazaar Admin')}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-indigo-100 dark:hover:bg-zinc-700 border border-indigo-200/50 dark:border-zinc-700 text-left transition-colors truncate shadow-sm"
                >
                  <span className="block font-bold text-zinc-900 dark:text-zinc-100">⚡ Store Admin</span>
                  <span className="text-[10px] text-zinc-500">admin@bazaar.eg</span>
                </button>
              </div>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                <div className="flex-1">
                  <p className="font-semibold">Authentication Error</p>
                  <p className="text-[11px] mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Success Notification Alert */}
            {successMessage && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name (Register only) */}
              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ahmed El-Masry"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* Mobile Number (Register only) */}
              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Mobile Number <span className="text-zinc-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+20 100 123 4567"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  {isRegister && (
                    <span className="text-[10px] text-zinc-400">Min 6 characters</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm outline-none focus:border-indigo-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary justify-center py-3 text-sm font-bold shadow-md shadow-indigo-500/20 mt-3 flex items-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  clearError();
                  setIsRegister(!isRegister);
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
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

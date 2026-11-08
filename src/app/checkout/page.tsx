'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck, CreditCard, Check, ArrowRight, Truck, MapPin,
  Lock, ShoppingBag, Zap, CheckCircle2, RotateCcw,
  Package, Plus, Phone, Smartphone, ChevronLeft
} from 'lucide-react';
import { useCartStore, useOrderStore, useUIStore, useAuthStore } from '@/lib/store';
import { orderService } from '@/services/orderService';
import { formatPrice } from '@/lib/utils';
import type { PaymentMethodType, ShippingAddress } from '@/lib/types';

const EGYPT_GOVERNORATES = [
  'Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Red Sea', 'Qalyubia',
  'Sharqia', 'Gharbia', 'Monufia', 'Beheira', 'Ismailia', 'Port Said', 'Suez'
];

interface PresetAddress extends ShippingAddress {
  label: string;
}

const PRESET_ADDRESSES: PresetAddress[] = [
  {
    id: 'addr-home',
    label: 'Home (Default)',
    fullName: 'Ahmed Hassan',
    phone: '+20 100 123 4567',
    governorate: 'Cairo',
    cityArea: 'El Obour City',
    streetAddress: 'District 7, Street 12, Building 14',
    buildingFloor: 'Floor 2, Apt 3',
    landmark: 'Near City Club',
    isDefault: true,
  },
  {
    id: 'addr-work',
    label: 'Office / Work',
    fullName: 'Ahmed Hassan (Tech Lab)',
    phone: '+20 100 123 4567',
    governorate: 'Giza',
    cityArea: 'Dokki / Mohandessin',
    streetAddress: '15 Mosaddak Street, Tech Center',
    buildingFloor: 'Floor 5, Suite 502',
    landmark: 'Behind Shooting Club',
    isDefault: false,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const { items, subtotal, totalItems, clearCart } = useCartStore();
  const { createOrder } = useOrderStore();
  const { currency } = useUIStore();
  const { user } = useAuthStore();

  // Steps: 1 = Shipping, 2 = Delivery Method, 3 = Payment Options, 4 = Final Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Address State
  const [savedAddresses, setSavedAddresses] = useState<PresetAddress[]>(PRESET_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr-home');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // New address form state
  const [newFullName, setNewFullName] = useState(user?.name || 'Ahmed Hassan');
  const [newPhone, setNewPhone] = useState('+20 100 123 4567');
  const [newGovernorate, setNewGovernorate] = useState('Cairo');
  const [newCityArea, setNewCityArea] = useState('New Cairo / 5th Settlement');
  const [newStreet, setNewStreet] = useState('');
  const [newBuilding, setNewBuilding] = useState('');
  const [newLandmark, setNewLandmark] = useState('');

  // Delivery Method State: 'standard' | 'express'
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('express');

  // Payment Options State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');

  // Card details
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Ahmed Hassan');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');

  // BNPL (ValU / Sympl)
  const [bnplProvider, setBnplProvider] = useState<'valu' | 'sympl'>('valu');
  const [valuMonths, setValuMonths] = useState<number>(12);
  const [valuPhone, setValuPhone] = useState('+20 100 123 4567');

  // Mobile Wallet / InstaPay
  const [walletType, setWalletType] = useState<'vodafone' | 'instapay'>('instapay');
  const [walletAccount, setWalletAccount] = useState('ahmed.hassan@instapay');

  // Promo code in checkout
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>({
    code: 'WELCOME15',
    discount: 0.15,
  });
  const [couponError, setCouponError] = useState('');

  // Submission loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Shipping cost calculation
  const freeShippingThreshold = 500;
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold || appliedCoupon?.code === 'CAIROFREE';
  const shippingFee = deliveryMethod === 'express'
    ? (qualifiesForFreeShipping ? 0 : 50)
    : 0;

  // Discount calculation
  const discountAmount = appliedCoupon
    ? appliedCoupon.code === 'CAIROFREE'
      ? (deliveryMethod === 'express' ? 50 : 0)
      : Math.round(subtotal * appliedCoupon.discount)
    : 0;

  const vatAmount = Math.round((subtotal * 0.14) / 1.14);
  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

  // Active chosen address
  const activeAddress = savedAddresses.find(a => a.id === selectedAddressId) || savedAddresses[0];

  // Auto-detect Card Brand
  const detectCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5')) return 'Mastercard';
    if (clean.startsWith('5078')) return 'Meeza';
    return 'Credit Card';
  };

  // Add new address handler
  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newBuilding) return;

    const created: PresetAddress = {
      id: `addr-${Date.now()}`,
      label: `${newCityArea} (${newGovernorate})`,
      fullName: newFullName,
      phone: newPhone,
      governorate: newGovernorate,
      cityArea: newCityArea,
      streetAddress: newStreet,
      buildingFloor: newBuilding,
      landmark: newLandmark,
    };

    setSavedAddresses([created, ...savedAddresses]);
    setSelectedAddressId(created.id);
    setIsAddingNewAddress(false);
  };

  // Coupon application handler
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (code === 'WELCOME15') {
      setAppliedCoupon({ code: 'WELCOME15', discount: 0.15 });
      setCouponCode('');
    } else if (code === 'EGYPT10' || code === 'BAZAAR10') {
      setAppliedCoupon({ code, discount: 0.10 });
      setCouponCode('');
    } else if (code === 'CAIROFREE') {
      setAppliedCoupon({ code: 'CAIROFREE', discount: 0 });
      setCouponCode('');
    } else {
      setCouponError('Invalid promo code. Try EGYPT10, WELCOME15 or CAIROFREE.');
    }
  };

  // Place order handler with Live Backend API integration
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);

    try {
      // 1. Submit to Live Backend API
      const receipt = await orderService.createOrder({
        shippingAddress: activeAddress,
        paymentMethod: paymentMethod === 'wallet' ? 'card' : paymentMethod,
        deliverySpeed: deliveryMethod,
        couponCode: appliedCoupon?.code,
        valuMonths: paymentMethod === 'valu' ? valuMonths : undefined,
        items: items,
      });

      // 2. Sync with local Zustand order store for instant confirmation UI
      const localOrder = createOrder({
        items: items.map(i => ({
          productId: i.productId,
          variantId: i.variantId,
          variantLabel: i.variantLabel,
          name: i.name,
          brand: i.brand,
          image: i.image,
          price: i.price,
          quantity: i.quantity,
        })),
        shippingAddress: activeAddress,
        paymentMethod: paymentMethod === 'wallet' ? 'card' : paymentMethod,
        subtotal: receipt.subtotal || subtotal,
        shippingFee: receipt.shippingFee ?? shippingFee,
        discount: receipt.discountAmount ?? discountAmount,
        total: receipt.totalAmount || totalAmount,
        currency,
        estimatedDeliveryDate: receipt.estimatedDeliveryDate || (deliveryMethod === 'express' ? 'Tomorrow between 2:00 PM - 6:00 PM' : 'In 2-3 Business Days'),
        valuPlanMonths: paymentMethod === 'valu' ? valuMonths : undefined,
      });

      // Override local ID with real backend orderNumber if available
      if (receipt.orderNumber) {
        localOrder.id = receipt.orderNumber;
        localOrder.trackingNumber = receipt.trackingNumber;
      }

      clearCart();
      router.push(`/checkout/success?orderId=${encodeURIComponent(receipt.orderNumber || localOrder.id)}`);
    } catch (err: unknown) {
      console.warn('[handlePlaceOrder] Live API submission failed, fallback to local store:', err);

      // Fallback to local store order creation
      const fallbackOrder = createOrder({
        items: items.map(i => ({
          productId: i.productId,
          variantId: i.variantId,
          variantLabel: i.variantLabel,
          name: i.name,
          brand: i.brand,
          image: i.image,
          price: i.price,
          quantity: i.quantity,
        })),
        shippingAddress: activeAddress,
        paymentMethod: paymentMethod === 'wallet' ? 'card' : paymentMethod,
        subtotal,
        shippingFee,
        discount: discountAmount,
        total: totalAmount,
        currency,
        estimatedDeliveryDate: deliveryMethod === 'express' ? 'Tomorrow between 2:00 PM - 6:00 PM' : 'In 2-3 Business Days',
        valuPlanMonths: paymentMethod === 'valu' ? valuMonths : undefined,
      });

      clearCart();
      router.push(`/checkout/success?orderId=${encodeURIComponent(fallbackOrder.id)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen py-20 px-4">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">Your Cart is Empty</h2>
          <p className="text-xs text-zinc-500">
            You need to add products to your cart before proceeding to checkout.
          </p>
          <Link href="/products" className="btn-primary inline-flex py-3 px-6 text-xs font-bold mt-2">
            Browse Products <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/70 dark:bg-zinc-950">
      {/* ── DISTRACTION-FREE CLEAN HEADER ─────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Bazaar<span className="text-indigo-600 dark:text-indigo-400">.eg</span>
            </span>
          </Link>

          {/* 100% Secure Checkout SSL Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">100% Secure Checkout</span>
            <span className="text-[10px] text-emerald-600 font-semibold">• 256-Bit SSL</span>
          </div>

          {/* Hotline & WhatsApp support */}
          <div className="text-right text-xs hidden md:block">
            <p className="text-[10px] uppercase font-bold text-zinc-400">Customer Support</p>
            <p className="font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 justify-end">
              <Phone className="w-3 h-3" /> 19999 / +20 100 123 4567
            </p>
          </div>
        </div>
      </header>

      {/* ── CHECKOUT CONTENT & STEPPER ────────────────────── */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ── LEFT COLUMN (65% / 8 cols): Multi-Step Form ───── */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step Progress Bar */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
                {[
                  { step: 1, label: '1. Address' },
                  { step: 2, label: '2. Delivery' },
                  { step: 3, label: '3. Payment' },
                  { step: 4, label: '4. Review' },
                ].map((s) => {
                  const isActive = currentStep === s.step;
                  const isDone = currentStep > s.step;

                  return (
                    <button
                      key={s.step}
                      onClick={() => isDone && setCurrentStep(s.step as 1 | 2 | 3 | 4)}
                      disabled={!isDone && !isActive}
                      className={`p-2.5 sm:p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-bold'
                          : isDone
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 font-bold hover:bg-emerald-100'
                          : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-400 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-xs">
                        {isDone ? <Check className="w-3.5 h-3.5" /> : null}
                        <span>{s.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── STEP 1: SHIPPING ADDRESS ───────────────────────── */}
            {currentStep === 1 && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-indigo-600" /> 1. Shipping Address in Egypt
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Select a verified destination or add a new delivery location
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                    className="btn-outline py-2 px-3 text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingNewAddress ? 'Cancel' : 'Add New'}</span>
                  </button>
                </div>

                {/* Add New Address Form Modal/Drawer */}
                {isAddingNewAddress && (
                  <form onSubmit={handleSaveNewAddress} className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-4 animate-fade-in">
                    <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      New Delivery Address Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-zinc-500 font-semibold mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={newFullName}
                          onChange={e => setNewFullName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 font-semibold mb-1">Mobile (+20)</label>
                        <input
                          type="tel"
                          required
                          value={newPhone}
                          onChange={e => setNewPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 font-semibold mb-1">Governorate</label>
                        <select
                          value={newGovernorate}
                          onChange={e => setNewGovernorate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                        >
                          {EGYPT_GOVERNORATES.map(gov => (
                            <option key={gov} value={gov}>{gov}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-zinc-500 font-semibold mb-1">City / Area</label>
                        <input
                          type="text"
                          required
                          value={newCityArea}
                          onChange={e => setNewCityArea(e.target.value)}
                          placeholder="e.g. El Obour / 5th Settlement"
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-zinc-500 font-semibold mb-1">Street Address</label>
                        <input
                          type="text"
                          required
                          value={newStreet}
                          onChange={e => setNewStreet(e.target.value)}
                          placeholder="e.g. Street 12, District 7"
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 font-semibold mb-1">Building, Floor, Apt</label>
                        <input
                          type="text"
                          required
                          value={newBuilding}
                          onChange={e => setNewBuilding(e.target.value)}
                          placeholder="e.g. Building 14, Floor 2, Apt 3"
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 font-semibold mb-1">Landmark (Optional)</label>
                        <input
                          type="text"
                          value={newLandmark}
                          onChange={e => setNewLandmark(e.target.value)}
                          placeholder="e.g. Near City Club"
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary py-2 px-5 text-xs font-bold">
                      Save & Select Address
                    </button>
                  </form>
                )}

                {/* Saved Address Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;

                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-md shadow-indigo-600/10'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            {addr.label}
                          </span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-zinc-300'}`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>

                        <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">{addr.fullName}</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                          {addr.streetAddress}, {addr.buildingFloor}
                        </p>
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                          {addr.cityArea}, {addr.governorate}, Egypt
                        </p>
                        {addr.landmark && (
                          <p className="text-[11px] text-zinc-400 mt-1 italic">Landmark: {addr.landmark}</p>
                        )}
                        <p className="text-xs font-mono text-zinc-500 mt-2">📞 {addr.phone}</p>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn-primary w-full py-4 text-sm font-bold justify-center shadow-lg shadow-indigo-600/20"
                >
                  Continue to Delivery Method <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}

            {/* ── STEP 2: DELIVERY METHOD ────────────────────────── */}
            {currentStep === 2 && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-indigo-600" /> 2. Choose Delivery Method
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Fulfillment handled directly by Bazaar Logistics Hub (Cairo & Governorates)
                    </p>
                  </div>
                  <button onClick={() => setCurrentStep(1)} className="text-xs text-indigo-600 font-bold hover:underline">
                    Edit Address
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: Standard Delivery */}
                  <div
                    onClick={() => setDeliveryMethod('standard')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      deliveryMethod === 'standard'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase text-zinc-500">Standard Shipping</span>
                      <span className="text-xs font-extrabold text-emerald-600">FREE</span>
                    </div>
                    <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">Standard Delivery</p>
                    <p className="text-xs text-zinc-500 mt-1">Delivered in 2 to 3 business days across all Egyptian governorates.</p>
                  </div>

                  {/* Option 2: Bazaar Express Next-Day */}
                  <div
                    onClick={() => setDeliveryMethod('express')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      deliveryMethod === 'express'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-md shadow-indigo-600/10'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase text-indigo-600 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-indigo-600" /> Recommended
                      </span>
                      <span className={qualifiesForFreeShipping ? 'text-xs font-extrabold text-emerald-600' : 'text-xs font-extrabold text-zinc-900 dark:text-zinc-100'}>
                        {qualifiesForFreeShipping ? 'FREE' : formatPrice(50, currency)}
                      </span>
                    </div>
                    <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">Bazaar Express Next-Day</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Guaranteed delivery tomorrow between 2:00 PM - 6:00 PM directly to your doorstep in Cairo & Giza.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setCurrentStep(1)} className="btn-outline py-3 px-5 text-xs font-bold flex items-center gap-1">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={() => setCurrentStep(3)} className="btn-primary flex-1 py-3 text-xs font-bold justify-center">
                    Continue to Payment Options <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: PAYMENT OPTIONS (TABBED) ───────────────── */}
            {currentStep === 3 && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-indigo-600" /> 3. Select Payment Option
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      All national payment methods, Meeza cards, and ValU installments supported
                    </p>
                  </div>
                  <button onClick={() => setCurrentStep(2)} className="text-xs text-indigo-600 font-bold hover:underline">
                    Back to Delivery
                  </button>
                </div>

                {/* Tabbed Picker for 4 Payment Methods */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'card', name: 'Card / Meeza', icon: CreditCard },
                    { id: 'valu', name: 'ValU Installments', icon: Zap },
                    { id: 'cod', name: 'Cash on Delivery', icon: Package },
                    { id: 'wallet', name: 'Mobile Wallets', icon: Smartphone },
                  ].map(tab => {
                    const isSelected = paymentMethod === tab.id;
                    const IconComponent = tab.icon;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPaymentMethod(tab.id as PaymentMethodType)}
                        className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-extrabold shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="text-xs leading-tight">{tab.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab 1: Credit / Debit Card & Interactive Mockup */}
                {paymentMethod === 'card' && (
                  <div className="space-y-5 animate-fade-in">
                    {/* Realistic interactive card preview */}
                    <div className="max-w-md mx-auto p-5 rounded-2xl bg-gradient-to-tr from-zinc-900 via-indigo-950 to-zinc-900 text-white shadow-xl space-y-4 border border-zinc-700">
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                        <span>{detectCardBrand(cardNumber)}</span>
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="font-mono text-lg tracking-widest py-1">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>
                      <div className="flex justify-between items-end text-xs">
                        <div>
                          <p className="text-[10px] text-zinc-400 uppercase">Cardholder</p>
                          <p className="font-bold tracking-wider">{cardHolder || 'FULL NAME'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-zinc-400 uppercase">Expires</p>
                          <p className="font-mono font-bold">{cardExpiry || 'MM/YY'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-3 text-xs max-w-md mx-auto">
                      <div>
                        <label className="block text-zinc-500 font-semibold mb-1">Card Number (Visa, Mastercard, Meeza)</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                          placeholder="4111 2222 3333 4444"
                          className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 font-mono font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 font-semibold mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={e => setCardHolder(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-zinc-500 font-semibold mb-1">Expiry MM/YY</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={e => setCardExpiry(e.target.value)}
                            placeholder="12/28"
                            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 font-mono font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 font-semibold mb-1">CVV / CVC</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={e => setCardCvv(e.target.value)}
                            placeholder="123"
                            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 font-mono font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: ValU / Sympl Buy Now Pay Later */}
                {paymentMethod === 'valu' && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          ValU & Sympl BNPL Installments
                        </span>
                      </div>
                      <span className="badge bg-indigo-600 text-white text-[10px] font-bold">0% Down Payment</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setBnplProvider('valu')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                          bnplProvider === 'valu'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        ValU BNPL
                      </button>
                      <button
                        type="button"
                        onClick={() => setBnplProvider('sympl')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                          bnplProvider === 'sympl'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        Sympl Pay Later
                      </button>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Choose your monthly installment tenor with your Egyptian National ID.
                    </p>

                    {/* Tenor buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      {[3, 6, 12, 24].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setValuMonths(m)}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            valuMonths === m
                              ? 'border-indigo-600 bg-white dark:bg-zinc-800 text-indigo-600 font-extrabold shadow-sm'
                              : 'border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          <p className="font-extrabold text-sm">{m} Mos</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            {formatPrice(Math.round(totalAmount / m), currency)}/mo
                          </p>
                        </button>
                      ))}
                    </div>

                    <div className="text-xs pt-1">
                      <label className="block text-zinc-600 dark:text-zinc-300 font-semibold mb-1">
                        Registered ValU Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={valuPhone}
                        onChange={e => setValuPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                )}

                {/* Tab 3: Cash on Delivery */}
                {paymentMethod === 'cod' && (
                  <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-amber-600" />
                      <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                        Cash on Delivery Notice
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      You will pay <strong className="text-zinc-900 dark:text-zinc-100 font-black">{formatPrice(totalAmount, currency)}</strong> directly to our Bazaar Express courier upon doorstep inspection. Please prepare exact change if possible.
                    </p>
                    <span className="inline-block text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-md">
                      Doorstep Receipt & 14-Day Return Guarantee Included
                    </span>
                  </div>
                )}

                {/* Tab 4: Mobile Wallets / InstaPay */}
                {paymentMethod === 'wallet' && (
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-indigo-600" />
                      <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                        Egyptian Mobile Wallets & InstaPay
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setWalletType('instapay')}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                          walletType === 'instapay'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600'
                        }`}
                      >
                        InstaPay (Instant Account)
                      </button>
                      <button
                        type="button"
                        onClick={() => setWalletType('vodafone')}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                          walletType === 'vodafone'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600'
                        }`}
                      >
                        Vodafone Cash / Orange / WE
                      </button>
                    </div>

                    <div className="text-xs">
                      <label className="block text-zinc-500 font-semibold mb-1">
                        {walletType === 'instapay' ? 'InstaPay Handle (IPA)' : 'Wallet Mobile Number (+20)'}
                      </label>
                      <input
                        type="text"
                        value={walletAccount}
                        onChange={e => setWalletAccount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setCurrentStep(2)} className="btn-outline py-3 px-5 text-xs font-bold flex items-center gap-1">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={() => setCurrentStep(4)} className="btn-primary flex-1 py-3 text-xs font-bold justify-center">
                    Proceed to Final Review <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4: FINAL REVIEW & ORDER PLACEMENT ──────────── */}
            {currentStep === 4 && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" /> 4. Review Your Order
                  </h2>
                  <span className="text-xs text-zinc-400">Final confirmation step</span>
                </div>

                {/* Recap Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Address recap */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-extrabold text-indigo-600 uppercase">Delivery Destination</span>
                      <button onClick={() => setCurrentStep(1)} className="text-[11px] font-bold text-indigo-600 hover:underline">Change</button>
                    </div>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{activeAddress.fullName}</p>
                    <p className="text-zinc-500">{activeAddress.streetAddress}, {activeAddress.cityArea}, {activeAddress.governorate}</p>
                    <p className="text-zinc-400 font-mono">📞 {activeAddress.phone}</p>
                  </div>

                  {/* Payment recap */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-extrabold text-indigo-600 uppercase">Payment Method</span>
                      <button onClick={() => setCurrentStep(3)} className="text-[11px] font-bold text-indigo-600 hover:underline">Change</button>
                    </div>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 capitalize">
                      {paymentMethod === 'card' && `Credit Card (ending in ${cardNumber.slice(-4) || '4444'})`}
                      {paymentMethod === 'valu' && `ValU BNPL (${valuMonths} Mos @ ${formatPrice(Math.round(totalAmount / valuMonths), currency)}/mo)`}
                      {paymentMethod === 'cod' && 'Cash on Delivery (Doorstep)'}
                      {paymentMethod === 'wallet' && `Mobile Wallet (${walletType === 'instapay' ? 'InstaPay' : 'Vodafone Cash'})`}
                    </p>
                    <p className="text-zinc-500">Speed: {deliveryMethod === 'express' ? 'Bazaar Express (Tomorrow)' : 'Standard (2-3 days)'}</p>
                  </div>
                </div>

                {/* Items preview list */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Items Ordered ({totalItems})</h4>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-60 overflow-y-auto">
                    {items.map(item => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-contain bg-zinc-100 dark:bg-zinc-800 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{item.name}</p>
                            <p className="text-[11px] text-zinc-400">Qty: {item.quantity} × {formatPrice(item.price, currency)}</p>
                          </div>
                        </div>
                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100 ml-4 flex-shrink-0">
                          {formatPrice(item.price * item.quantity, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Place Order CTA with Loading State */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="btn-primary w-full py-4 text-sm font-black justify-center shadow-xl shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authorizing & Placing Your Order...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Place Order & Pay {formatPrice(totalAmount, currency)}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN (35% / 4 cols): Order Summary ────── */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-5">
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                Order Summary
              </h3>

              {/* Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-extrabold text-zinc-900 dark:text-zinc-100">{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Delivery ({deliveryMethod === 'express' ? 'Express' : 'Standard'})</span>
                  <span className={shippingFee === 0 ? 'text-emerald-600 font-bold' : 'font-extrabold text-zinc-900 dark:text-zinc-100'}>
                    {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Egyptian VAT (14% Included)</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">{formatPrice(vatAmount, currency)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-{formatPrice(discountAmount, currency)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-baseline">
                  <span className="text-base font-black text-zinc-900 dark:text-zinc-100">Total To Pay</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {formatPrice(totalAmount, currency)}
                  </span>
                </div>
              </div>

              {/* Promo input */}
              <form onSubmit={handleApplyCoupon} className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  placeholder="Promo code (EGYPT10)"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 uppercase font-semibold text-zinc-900 dark:text-zinc-100"
                />
                <button type="submit" className="px-4 py-2 text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl hover:opacity-90">
                  Apply
                </button>
              </form>
              {couponError && <p className="text-[11px] text-rose-500 font-medium">{couponError}</p>}

              {/* Trust Badges */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-[11px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Authorized Egyptian Agent Warranty Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                  <span>14-Day Free Returns with Doorstep Pickup</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

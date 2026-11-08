import type { Currency } from './types';

export function formatPrice(priceInEGP: number, currency: Currency = 'EGP'): string {
  const rates: Record<Currency, number> = { EGP: 1, USD: 0.02, SAR: 0.075 };
  const symbols: Record<Currency, string> = { EGP: 'ج.م', USD: '$', SAR: 'ر.س' };

  const converted = priceInEGP * rates[currency];
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: currency === 'EGP' ? 0 : 2,
    maximumFractionDigits: currency === 'EGP' ? 0 : 2,
  }).format(converted);

  return currency === 'USD'
    ? `${symbols[currency]}${formatted}`
    : `${formatted} ${symbols[currency]}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatCountdown(endDate: Date | string): { hours: string; minutes: string; seconds: string; expired: boolean } {
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const diff = end.getTime() - Date.now();

  if (diff <= 0) return { hours: '00', minutes: '00', seconds: '00', expired: true };

  const totalSeconds = Math.floor(diff / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return {
    hours: String(h).padStart(2, '0'),
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
    expired: false,
  };
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '…' : str;
}

export function calculateInstallment(priceInEGP: number, months: number = 12): number {
  return Math.round(priceInEGP / months);
}



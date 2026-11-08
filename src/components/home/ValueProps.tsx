import { Truck, RotateCcw, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';

const VALUES = [
  {
    icon: Truck,
    title: 'Fast Delivery',
    subtitle: '24-48 hour delivery across Egypt',
    detail: 'Cairo & Giza in 24 hrs',
    color: 'from-indigo-500 to-blue-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    textColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    icon: RotateCcw,
    title: '14-Day Free Returns',
    subtitle: 'Hassle-free, no questions asked',
    detail: 'Free pickup from your door',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: ShieldCheck,
    title: '100% Genuine Products',
    subtitle: 'Authenticity guaranteed on every item',
    detail: 'Verified seller & brand badges',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    textColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    subtitle: 'SSL encrypted, PCI-DSS compliant',
    detail: 'Visa, Mastercard, Meeza & more',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    textColor: 'text-rose-600 dark:text-rose-400',
  },
];

export default function ValueProps() {
  return (
    <section className="py-10 bg-zinc-50 dark:bg-zinc-950/50">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className={`${v.bg} rounded-2xl p-5 border border-transparent hover:border-current hover:shadow-md transition-all duration-300 cursor-pointer group`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <v.icon className="w-6 h-6 text-white" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-sm ${v.textColor} mb-0.5`}>{v.title}</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{v.subtitle}</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 flex items-center gap-1">
                    {v.detail}
                    <ChevronRight className="w-3 h-3" />
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


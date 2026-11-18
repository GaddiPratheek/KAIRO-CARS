import React from 'react';

interface BrandMarkProps {
  brand: string;
  className?: string;
}

const BRAND_MONOGRAMS: Record<string, string> = {
  'Mercedes-Benz': 'MB',
  BMW: 'BMW',
  Audi: 'AUDI',
  Porsche: 'P',
  Lamborghini: 'L',
  Ferrari: 'F',
  'Rolls-Royce': 'RR',
  Bentley: 'B',
  'Land Rover': 'LR',
  Jaguar: 'JAG',
  Volvo: 'V',
  Lexus: 'LX',
  'Aston Martin': 'AM',
  McLaren: 'McL',
  Maserati: 'M',
  'Other Premium Brands': 'K',
};

export const BrandMark: React.FC<BrandMarkProps> = ({ brand, className = 'w-10 h-10' }) => {
  const code = BRAND_MONOGRAMS[brand] || brand.slice(0, 2).toUpperCase();

  return (
    <div
      className={`${className} border border-[#303030] bg-[#111111] flex items-center justify-center shrink-0 relative`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 40" className="w-full h-full absolute inset-0 pointer-events-none">
        <rect x="2" y="2" width="36" height="36" fill="none" stroke="#C6A76B" strokeOpacity="0.35" strokeWidth="0.75" />
        <circle cx="20" cy="20" r="14" fill="none" stroke="#C6A76B" strokeOpacity="0.25" strokeWidth="0.75" />
      </svg>
      <span className="font-display text-[11px] tracking-widest text-[#E1C995] relative z-10">
        {code}
      </span>
    </div>
  );
};

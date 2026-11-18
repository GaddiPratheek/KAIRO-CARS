import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Car, GitCompare, Heart } from 'lucide-react';
import { useKairo } from '../context/KairoContext';
import { formatINR, formatKm } from '../utils/formatters';
import type { Vehicle } from '../types/kairo';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const { wishlistIds, compareIds, toggleWishlist, toggleCompare } = useKairo();
  const [imgError, setImgError] = useState(false);

  const isWishlisted = wishlistIds.includes(vehicle.id);
  const isCompared = compareIds.includes(vehicle.id);

  return (
    <article className="bg-[#181818] border border-[#303030] hover:border-[#C6A76B]/60 transition-all duration-200 hover:-translate-y-0.5 flex flex-col group">
      {/* Vehicle Photograph */}
      <Link
        to={`/vehicle/${vehicle.id}`}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#111111] block"
      >
        {!imgError && vehicle.primaryImage ? (
          <img
            src={vehicle.primaryImage}
            alt={`${vehicle.manufacturingYear} ${vehicle.brand} ${vehicle.model} ${vehicle.variant}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#181818] to-[#080808] p-6 text-center">
            <Car className="w-10 h-10 text-[#C6A76B]/60 mb-2" />
            <span className="font-nav text-xs tracking-[0.14em] uppercase text-[#A5A5A5]">
              {vehicle.brand} {vehicle.model}
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent pointer-events-none" />
      </Link>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Top Metadata (Zero-Pill typographic format) */}
        <div className="flex items-center justify-between gap-2 text-[11px] font-nav tracking-[0.12em] uppercase text-[#A5A5A5] mb-2">
          <span className="truncate text-[#C6A76B]">{vehicle.brand}</span>
          <span className="shrink-0 tabular-nums">{vehicle.availability}</span>
        </div>

        {/* Title */}
        <Link to={`/vehicle/${vehicle.id}`} className="block group-hover:text-[#E1C995] transition-colors">
          <h3 className="font-display text-lg text-white leading-snug line-clamp-1">
            {vehicle.model}
          </h3>
          <p className="text-xs text-[#A5A5A5] mt-0.5 line-clamp-1">{vehicle.variant}</p>
        </Link>

        {/* Key Technical Summary */}
        <div className="mt-4 pt-4 border-t border-[#303030] grid grid-cols-2 gap-y-2 gap-x-3 text-xs text-[#A5A5A5]">
          <div className="tabular-nums">
            <span className="block text-[10px] uppercase tracking-[0.1em] text-[#707070]">
              Mfg / Reg Year
            </span>
            <span className="text-white">
              {vehicle.manufacturingYear} / {vehicle.registrationYear}
            </span>
          </div>
          <div className="tabular-nums">
            <span className="block text-[10px] uppercase tracking-[0.1em] text-[#707070]">
              Kilometres
            </span>
            <span className="text-white">{formatKm(vehicle.mileage)}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-[0.1em] text-[#707070]">
              Fuel Type
            </span>
            <span className="text-white">{vehicle.fuelType}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-[0.1em] text-[#707070]">
              Transmission
            </span>
            <span className="text-white line-clamp-1" title={vehicle.transmission}>
              {vehicle.transmission.replace('Automatic', 'Auto')}
            </span>
          </div>
        </div>

        {/* Price & Action Controls */}
        <div className="mt-5 pt-4 border-t border-[#303030] flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono-tabular text-lg font-semibold text-[#E1C995]">
              {formatINR(vehicle.askingPrice)}
            </span>
            {vehicle.pricingSpecs?.isDemoPricing && (
              <span className="text-[10px] text-[#707070] uppercase tracking-wider">
                Sample Price
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/vehicle/${vehicle.id}`}
              className="flex-1 py-2.5 px-3 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-[11px] font-semibold tracking-[0.14em] uppercase flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => toggleWishlist(vehicle.id)}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              title={isWishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}
              className={`w-10 h-10 border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                isWishlisted
                  ? 'border-[#C6A76B] bg-[#C6A76B]/15 text-[#E1C995]'
                  : 'border-[#303030] text-[#A5A5A5] hover:border-[#C6A76B] hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#C6A76B]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => toggleCompare(vehicle.id)}
              aria-label={isCompared ? 'Remove from comparison' : 'Add to comparison'}
              title={isCompared ? 'In Comparison' : 'Compare Vehicle'}
              className={`w-10 h-10 border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                isCompared
                  ? 'border-[#C6A76B] bg-[#C6A76B]/15 text-[#E1C995]'
                  : 'border-[#303030] text-[#A5A5A5] hover:border-[#C6A76B] hover:text-white'
              }`}
            >
              <GitCompare className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

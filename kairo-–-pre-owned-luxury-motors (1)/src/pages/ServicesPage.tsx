import React from 'react';
import { Check, SlidersHorizontal, Sparkles, Wrench } from 'lucide-react';
import { useKairo } from '../context/KairoContext';
import { KairoMediaAssets } from '../data/showroomsSeed';

interface ServiceDivision {
  category: 'Car Modification' | 'Car Servicing' | 'Car Detailing';
  subtitle: string;
  image: string;
  description: string;
  capabilities: string[];
  ctaLabel: string;
  icon: React.FC<{ className?: string }>;
}

const SERVICE_DIVISIONS: ServiceDivision[] = [
  {
    category: 'Car Modification',
    subtitle: 'Performance, Exhaust & Bespoke Coachbuilding',
    image: KairoMediaAssets.serviceModification,
    description:
      'Engineered personalization for discerning enthusiasts. Every aerodynamic, acoustic, and wheel specification is sourced from certified OEM+ and motorsport ateliers.',
    capabilities: [
      'Body kits & carbon-fibre aerodynamic packages',
      'Performance exhaust systems (titanium & valved sport lines)',
      'Forged alloy wheels & custom offset fitments',
      'Bespoke interior customization & Alcantara trimming',
      'Signature exterior colour wraps & satin protection films',
      'Calibration-safe performance tuning upgrades',
    ],
    ctaLabel: 'Consult Modification Specialist',
    icon: SlidersHorizontal,
  },
  {
    category: 'Car Servicing',
    subtitle: 'Factory-Standard Diagnostics & Mechanical Care',
    image: KairoMediaAssets.serviceServicing,
    description:
      'Dedicated bays equipped with marque-level telemetry diagnostics, calibrated torque tooling, and OEM-grade fluids for European and British flagship automobiles.',
    capabilities: [
      'Scheduled manufacturer-interval maintenance',
      'Engine & OEM-level ECU diagnostics',
      'Suspension, adaptive air-ride & alignment calibration',
      'Carbon-ceramic & performance brake system servicing',
      'High-voltage hybrid & battery health diagnostics',
      'Multi-point mechanical & fluid verification',
    ],
    ctaLabel: 'Schedule Service Bay',
    icon: Wrench,
  },
  {
    category: 'Car Detailing',
    subtitle: 'Concours Preservation & Paint Protection',
    image: KairoMediaAssets.serviceDetailing,
    description:
      'Controlled-environment preservation studio dedicated to optical paint clarity, self-healing protection films, and delicate fine-grain leather restoration.',
    capabilities: [
      'Multi-layer 9H ceramic & graphene coating',
      'Self-healing Paint Protection Film (PPF)',
      'Multi-stage machine paint correction & gloss calibration',
      'Deep interior aniline leather conditioning & sanitization',
      'Undercarriage, wheel-well & engine bay detailing',
      'Concours-grade pre-delivery showroom preparation',
    ],
    ctaLabel: 'Book Detailing Studio',
    icon: Sparkles,
  },
];

export const ServicesPage: React.FC = () => {
  const { openEnquiryModal } = useKairo();

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="border-b border-[#303030] pb-10 mb-14">
          <span className="font-nav text-xs tracking-[0.22em] uppercase text-[#C6A76B]">
            KAIRO Atelier · Aftercare &amp; Bespoke Studio
          </span>
          <h1 className="font-display text-3xl sm:text-5xl text-white mt-3 max-w-3xl">
            Precision Care, Bespoke Performance &amp; Concours Preservation
          </h1>
          <p className="text-sm sm:text-base text-[#A5A5A5] mt-4 max-w-2xl leading-relaxed">
            Beyond acquisition, KAIRO supports collectors with dedicated mechanical bays,
            aerodynamic and interior customization, and controlled detailing studios.
          </p>
        </div>

        {/* Service Divisions */}
        <div className="space-y-14">
          {SERVICE_DIVISIONS.map((division, idx) => {
            const Icon = division.icon;
            const reversed = idx % 2 === 1;
            return (
              <section
                key={division.category}
                className="bg-[#111111] border border-[#303030] grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
              >
                <div
                  className={`lg:col-span-6 aspect-[16/10] lg:aspect-auto bg-[#181818] overflow-hidden ${
                    reversed ? 'lg:order-2' : ''
                  }`}
                >
                  <img
                    src={division.image}
                    alt={division.category}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div
                  className={`lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between ${
                    reversed ? 'lg:order-1' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3 text-[#C6A76B] mb-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-nav text-xs tracking-[0.2em] uppercase">
                        {division.subtitle}
                      </span>
                    </div>
                    <h2 className="font-display text-3xl sm:text-4xl text-white">
                      {division.category}
                    </h2>
                    <p className="text-sm text-[#A5A5A5] mt-4 leading-relaxed">
                      {division.description}
                    </p>

                    <div className="mt-7 pt-6 border-t border-[#303030] grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {division.capabilities.map((cap) => (
                        <div key={cap} className="flex items-start gap-2.5 text-sm text-white">
                          <Check className="w-4 h-4 text-[#C6A76B] shrink-0 mt-0.5" />
                          <span className="leading-snug">{cap}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-[#303030] flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs text-[#A5A5A5]">
                      Available by appointment across all KAIRO ateliers
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        openEnquiryModal({
                          mode: 'service',
                          serviceCategory: division.category,
                          serviceName: division.category,
                        })
                      }
                      className="px-7 py-3 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase transition-colors cursor-pointer"
                    >
                      {division.ctaLabel}
                    </button>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

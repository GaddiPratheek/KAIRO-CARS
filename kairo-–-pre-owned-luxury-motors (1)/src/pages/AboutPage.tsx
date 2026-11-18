import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, CheckCircle2, FileCheck2, Shield, Sparkles } from 'lucide-react';
import { LUXURY_BRANDS_CATALOG } from '../data/brandsAndModels';
import { KairoMediaAssets } from '../data/showroomsSeed';
import { BrandMark } from '../components/BrandMark';

const INSPECTION_DOMAINS = [
  {
    title: 'Powertrain & Telemetry Diagnostics',
    points: [
      'OEM-level OBD & ECU fault-memory scan across engine, gearbox, and hybrid control units',
      'Compression, oil-condition, boost pressure, and cooling-system thermal evaluation',
      'High-voltage battery State-of-Health (SoH) check on EV and plug-in hybrid models',
    ],
  },
  {
    title: 'Chassis, Bodywork & Paint Integrity',
    points: [
      'Digital paint-thickness gauge readings across all structural panels and pillars',
      'Suspension air-strut, adaptive damper, and steering-rack alignment measurement',
      'Carbon-ceramic & steel brake rotor wear and tyre manufacture date verification',
    ],
  },
  {
    title: 'Provenance & Legal Documentation',
    points: [
      'RC, chassis/VIN, and engine-number physical match with state transport records',
      'Hypothecation NOC, comprehensive insurance validity, and road-tax clearance check',
      'Authorized service log comparison to verify mileage consistency',
    ],
  },
];

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Intro Split */}
        <section className="grid grid-cols-1 lg:grid-cols-12 border border-[#303030] bg-[#111111] overflow-hidden mb-16">
          <div className="lg:col-span-6 p-8 sm:p-14 flex flex-col justify-between">
            <div>
              <span className="font-nav text-xs tracking-[0.22em] uppercase text-[#C6A76B]">
                About KAIRO · Pre-Owned Luxury Motors
              </span>
              <h1 className="font-display text-3xl sm:text-5xl text-white mt-3 leading-tight">
                Curated Automotive Excellence, Driven by Provenance
              </h1>
              <p className="text-sm sm:text-base text-[#A5A5A5] mt-5 leading-relaxed">
                KAIRO was established around a straightforward conviction: acquiring or parting with
                a pre-owned flagship automobile should mirror the composure, transparency, and
                engineering rigour of the marque itself.
              </p>
              <p className="text-sm text-[#A5A5A5] mt-4 leading-relaxed">
                From grand tourers and hand-built coachwork saloons to track-bred supercars and
                electrified luxury flagships, our specialists combine technical vetting with discreet
                concierge logistics across India.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-[#303030] flex flex-wrap gap-4">
              <Link
                to="/inventory"
                className="px-7 py-3.5 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase inline-flex items-center gap-2"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/sell-your-car"
                className="px-7 py-3.5 border border-[#303030] hover:border-[#C6A76B] text-white font-nav text-xs tracking-[0.16em] uppercase"
              >
                Sell Your Car
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 aspect-[16/10] lg:aspect-auto bg-[#181818]">
            <img
              src={KairoMediaAssets.heroShowroom}
              alt="KAIRO luxury automobile showroom"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Inspection & Verification Protocol */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="font-nav text-xs tracking-[0.22em] uppercase text-[#C6A76B]">
                Technical Diligence
              </span>
              <h2 className="font-display text-3xl text-white mt-2">
                KAIRO Vehicle Inspection &amp; Verification Standard
              </h2>
            </div>
            <p className="text-xs text-[#A5A5A5] max-w-md">
              Every listing discloses its live verification state transparently—whether showroom
              inspected or currently undergoing technical review.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {INSPECTION_DOMAINS.map((domain) => (
              <div key={domain.title} className="bg-[#111111] border border-[#303030] p-7">
                <h3 className="font-display text-xl text-white mb-5">{domain.title}</h3>
                <ul className="space-y-3.5">
                  {domain.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-sm text-[#A5A5A5]">
                      <CheckCircle2 className="w-4 h-4 text-[#C6A76B] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {[
              { icon: Shield, label: 'Disclosed History', sub: 'Honest ownership & RC clarity' },
              { icon: FileCheck2, label: 'RTO Transfer Support', sub: 'Pan-India documentation desk' },
              { icon: Award, label: 'Bespoke Sourcing', sub: 'Rare trims & specifications' },
              { icon: Sparkles, label: 'Aftercare Atelier', sub: 'Servicing, mods & detailing' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-[#181818] border border-[#303030] p-5">
                  <Icon className="w-5 h-5 text-[#C6A76B] mb-2.5" />
                  <p className="font-display text-base text-white">{item.label}</p>
                  <p className="text-xs text-[#A5A5A5] mt-1">{item.sub}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Complete Supported Marques & Models Directory */}
        <section id="marques" className="pt-10 border-t border-[#303030]">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10">
            <div>
              <span className="font-nav text-xs tracking-[0.22em] uppercase text-[#C6A76B]">
                Supported Catalogue Directory
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-white mt-2">
                Luxury &amp; Performance Marques
              </h2>
            </div>
            <p className="text-xs text-[#A5A5A5] max-w-lg">
              Supported catalogue models for buying, sourcing, and valuation enquiries. Availability
              varies continuously across our live showroom inventory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LUXURY_BRANDS_CATALOG.map((brand) => (
              <div
                key={brand.id}
                className="bg-[#111111] border border-[#303030] p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#303030]">
                    <div className="flex items-center gap-3.5">
                      <BrandMark brand={brand.name} className="w-11 h-11" />
                      <div>
                        <h3 className="font-display text-xl text-white">{brand.name}</h3>
                        <p className="text-xs text-[#A5A5A5]">
                          {brand.country} · {brand.tagline}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/inventory?brand=${encodeURIComponent(brand.name)}`}
                      className="font-nav text-[11px] tracking-[0.14em] uppercase text-[#E1C995] hover:text-white shrink-0"
                    >
                      View Stock →
                    </Link>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#A5A5A5]">
                    {brand.models.map((m) => (
                      <Link
                        key={m}
                        to={`/inventory?brand=${encodeURIComponent(brand.name)}&model=${encodeURIComponent(m)}`}
                        className="hover:text-[#E1C995] transition-colors"
                      >
                        {m}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

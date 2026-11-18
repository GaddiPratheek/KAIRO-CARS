import React from 'react';
import { ArrowRight, Building2, Compass, Home, KeyRound } from 'lucide-react';
import { useKairo } from '../context/KairoContext';
import { KairoMediaAssets } from '../data/showroomsSeed';

const REALTY_PILLARS = [
  {
    icon: Home,
    title: 'Luxury Villas',
    region: 'Delhi-NCR · Alibaug · Hyderabad',
    summary:
      'Gated estate villas featuring climate-controlled multi-car motor courts, private landscaping, and bespoke architectural finishes.',
  },
  {
    icon: Building2,
    title: 'Premium Apartments & Penthouses',
    region: 'South Mumbai · Worli · Bengaluru CBD',
    summary:
      'Full-floor sky residences and waterfront penthouses paired with dedicated valet access and private elevator lobbies.',
  },
  {
    icon: KeyRound,
    title: 'Exclusive Residences',
    region: 'Off-Market Private Mandates',
    summary:
      'Discreet acquisition advisory for trophy bungalows, heritage estates, and low-density architectural sanctuaries.',
  },
  {
    icon: Compass,
    title: 'Architectural Developments',
    region: 'Curated Design Partnerships',
    summary:
      'Early access to flagship low-rise developments engineered around collector garages, natural light, and timeless stone.',
  },
];

export const RealtyPage: React.FC = () => {
  const { openEnquiryModal } = useKairo();

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Hero Feature */}
        <section className="grid grid-cols-1 lg:grid-cols-12 border border-[#303030] bg-[#111111] overflow-hidden mb-16">
          <div className="lg:col-span-6 p-8 sm:p-14 flex flex-col justify-between">
            <div>
              <span className="font-nav text-xs tracking-[0.22em] uppercase text-[#C6A76B]">
                KAIRO Realty · Private Estates Division
              </span>
              <h1 className="font-display text-3xl sm:text-5xl text-white mt-3 leading-tight">
                WHERE LUXURY LIVING MEETS UNMATCHED CRAFTSMANSHIP
              </h1>
              <p className="text-sm sm:text-base text-[#A5A5A5] mt-5 leading-relaxed">
                Extending KAIRO&apos;s curation philosophy beyond automobiles, KAIRO Realty advises
                clients on private residences, collector-garage villas, penthouses, and flagship
                architectural developments.
              </p>
            </div>

            <div className="mt-10 pt-6 border-t border-[#303030] flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  openEnquiryModal({
                    mode: 'enquiry',
                    category: 'KAIRO Realty',
                    vehicleName: 'KAIRO Realty Private Portfolio Consultation',
                  })
                }
                className="px-8 py-3.5 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Request Private Portfolio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-xs text-[#A5A5A5]">
                Discreet mandate advisory · By appointment
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 aspect-[16/11] lg:aspect-auto bg-[#181818]">
            <img
              src={KairoMediaAssets.realtyVilla}
              alt="KAIRO Realty architectural villa with luxury sports coupe"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Four Divisions */}
        <div className="mb-10">
          <span className="font-nav text-xs tracking-[0.22em] uppercase text-[#C6A76B]">
            Portfolio Verticals
          </span>
          <h2 className="font-display text-3xl text-white mt-2">
            Curated Architectural Real Estate
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REALTY_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-[#111111] border border-[#303030] p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <Icon className="w-6 h-6 text-[#C6A76B]" />
                    <span className="font-nav text-[11px] tracking-[0.14em] uppercase text-[#A5A5A5]">
                      {pillar.region}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl text-white">{pillar.title}</h3>
                  <p className="text-sm text-[#A5A5A5] mt-3 leading-relaxed">{pillar.summary}</p>
                </div>

                <div className="mt-6 pt-5 border-t border-[#303030]">
                  <button
                    type="button"
                    onClick={() =>
                      openEnquiryModal({
                        mode: 'enquiry',
                        category: 'KAIRO Realty',
                        vehicleName: `KAIRO Realty — ${pillar.title}`,
                      })
                    }
                    className="font-nav text-xs tracking-[0.15em] uppercase text-[#E1C995] hover:text-white inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Enquire About {pillar.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

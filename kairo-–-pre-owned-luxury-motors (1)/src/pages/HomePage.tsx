import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Award,
  CheckSquare,
  Compass,
  FileCheck2,
  Gem,
  Headphones,
  Search,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useKairo } from '../context/KairoContext';
import {
  ALL_BRAND_NAMES,
  COLLECTION_CATEGORIES,
  getModelsForBrand,
  LUXURY_BRANDS_CATALOG,
} from '../data/brandsAndModels';
import { KairoMediaAssets } from '../data/showroomsSeed';
import { VehicleCard } from '../components/VehicleCard';
import { ShowroomsMapSection } from '../components/ShowroomsMapSection';
import { BrandMark } from '../components/BrandMark';
import type { CollectionCategory } from '../types/kairo';

const PRICE_OPTIONS = [
  { label: 'Any', value: '' },
  { label: '₹25 Lakhs', value: '2500000' },
  { label: '₹50 Lakhs', value: '5000000' },
  { label: '₹1 Crore', value: '10000000' },
  { label: '₹2 Crore', value: '20000000' },
  { label: '₹3 Crore', value: '30000000' },
  { label: '₹5 Crore', value: '50000000' },
];

const WHY_KAIRO_CARDS = [
  {
    icon: Gem,
    title: 'Carefully Curated Inventory',
    description:
      'Every automobile in the KAIRO showcase is selectively sourced for provenance, specification pedigree, and collector appeal.',
  },
  {
    icon: FileCheck2,
    title: 'Verified Vehicle Documentation',
    description:
      'Registration, road tax, insurance, and hypothecation records are reviewed and transparently disclosed prior to transaction.',
  },
  {
    icon: Award,
    title: 'Transparent Pricing',
    description:
      'Clear asking figures, market estimates, and transfer charge outlines with zero opaque showroom markups.',
  },
  {
    icon: CheckSquare,
    title: 'Professional Vehicle Inspection',
    description:
      'Structured mechanical, diagnostic, and bodywork evaluations are documented before a vehicle is marked as inspected.',
  },
  {
    icon: Shield,
    title: 'Premium Customer Experience',
    description:
      'Appointment-led private lounge viewings, enclosed carrier logistics, and discreet concierge handling.',
  },
  {
    icon: Headphones,
    title: 'Dedicated Customer Assistance',
    description:
      'Specialists guide you from specification comparison and finance structuring through RTO transfer and aftercare.',
  },
];

export const HomePage: React.FC = () => {
  const { vehicles, siteContent, openEnquiryModal } = useKairo();
  const navigate = useNavigate();

  // Dynamic Hero Search State
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [year, setYear] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [category, setCategory] = useState('');

  // Collection Filter State
  const [activeCollection, setActiveCollection] = useState<CollectionCategory>('All Cars');

  const availableModels = useMemo(() => {
    if (!brand) return [];
    return getModelsForBrand(brand);
  }, [brand]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (brand) params.set('brand', brand);
    if (model) params.set('model', model);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (year) params.set('year', year);
    if (fuelType) params.set('fuelType', fuelType);
    if (category) params.set('category', category);
    navigate(`/inventory?${params.toString()}`);
  };

  const collectionVehicles = useMemo(() => {
    if (activeCollection === 'All Cars') {
      return vehicles;
    }
    return vehicles.filter((v) => {
      if (activeCollection === 'Newly Arrived') {
        return v.categories.includes('Newly Arrived') || v.availability === 'Newly Arrived';
      }
      if (activeCollection === 'Certified Pre-Owned') {
        return (
          v.categories.includes('Certified Pre-Owned') ||
          v.documentationSpecs.inspectionReportStatus.toLowerCase().includes('completed')
        );
      }
      return v.category === activeCollection || v.categories.includes(activeCollection);
    });
  }, [vehicles, activeCollection]);

  const heroTitle = siteContent.heroTitle || 'DRIVE THE EXTRAORDINARY';
  const heroSubtitle =
    siteContent.heroSubtitle ||
    'Discover an exceptional collection of pre-owned luxury automobiles, curated for individuals who appreciate timeless design, superior engineering and extraordinary performance.';

  return (
    <div>
      {/* 1. Full-Screen Cinematic Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-end pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={KairoMediaAssets.heroShowroom}
            alt="KAIRO luxury automobile gallery featuring flagship supercar and grand tourer"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/65 to-[#080808]/55" />
        </div>

        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-3xl"
          >
            <p className="font-nav text-xs tracking-[0.28em] uppercase text-[#C6A76B] mb-4">
              KAIRO · Where Luxury Meets Performance
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.08] tracking-tight">
              {heroTitle}
            </h1>
            <p className="text-base sm:text-lg text-[#D0D0D0] mt-5 leading-relaxed max-w-2xl">
              {heroSubtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/inventory"
                className="px-7 py-3.5 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-xs font-semibold tracking-[0.18em] uppercase transition-colors inline-flex items-center gap-2 whitespace-nowrap"
              >
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/sell-your-car"
                className="px-7 py-3.5 border border-[#C6A76B] text-[#E1C995] hover:bg-[#C6A76B] hover:text-[#080808] font-nav text-xs font-semibold tracking-[0.18em] uppercase transition-colors whitespace-nowrap"
              >
                SELL YOUR CAR
              </Link>
            </div>
          </motion.div>

          {/* Dynamic Vehicle Search Panel */}
          <motion.form
            onSubmit={handleHeroSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-12 bg-[#111111]/95 backdrop-blur-md border border-[#303030] p-5 sm:p-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
              <select
                aria-label="Select Brand"
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  setModel('');
                }}
                className="bg-[#181818] border border-[#303030] px-3 py-3 text-xs text-white focus:border-[#C6A76B] focus:outline-none"
              >
                <option value="">All Brands</option>
                {ALL_BRAND_NAMES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <select
                aria-label="Select Model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={!brand}
                className="bg-[#181818] border border-[#303030] px-3 py-3 text-xs text-white disabled:opacity-50 focus:border-[#C6A76B] focus:outline-none"
              >
                <option value="">{brand ? 'All Models' : 'Select Brand First'}</option>
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                aria-label="Minimum Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-[#181818] border border-[#303030] px-3 py-3 text-xs text-white focus:border-[#C6A76B] focus:outline-none"
              >
                <option value="">Min Price</option>
                {PRICE_OPTIONS.slice(1).map((opt) => (
                  <option key={`min-${opt.value}`} value={opt.value}>
                    From {opt.label}
                  </option>
                ))}
              </select>

              <select
                aria-label="Maximum Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-[#181818] border border-[#303030] px-3 py-3 text-xs text-white focus:border-[#C6A76B] focus:outline-none"
              >
                <option value="">Max Price</option>
                {PRICE_OPTIONS.slice(1).map((opt) => (
                  <option key={`max-${opt.value}`} value={opt.value}>
                    Up to {opt.label}
                  </option>
                ))}
              </select>

              <select
                aria-label="Manufacturing Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="bg-[#181818] border border-[#303030] px-3 py-3 text-xs text-white focus:border-[#C6A76B] focus:outline-none"
              >
                <option value="">Any Year</option>
                {[2025, 2024, 2023, 2022, 2021, 2020, 2019].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr} &amp; Newer
                  </option>
                ))}
              </select>

              <select
                aria-label="Fuel Type"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="bg-[#181818] border border-[#303030] px-3 py-3 text-xs text-white focus:border-[#C6A76B] focus:outline-none"
              >
                <option value="">Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Plug-in Hybrid">Plug-in Hybrid</option>
              </select>

              <select
                aria-label="Vehicle Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-[#181818] border border-[#303030] px-3 py-3 text-xs text-white focus:border-[#C6A76B] focus:outline-none"
              >
                <option value="">Vehicle Category</option>
                {COLLECTION_CATEGORIES.filter((c) => c !== 'All Cars').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-[11px] font-semibold tracking-[0.14em] uppercase px-4 py-3 flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>FIND YOUR DREAM CAR</span>
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* 2. Luxury Car Collections & Inventory Showcase */}
      <section id="collections" className="py-20 bg-[#080808] border-t border-[#303030]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <span className="font-nav text-xs tracking-[0.22em] uppercase text-[#C6A76B]">
                Curated Portfolio
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-white mt-2">
                Luxury Car Collections
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/inventory"
                className="inline-flex items-center gap-2 font-nav text-xs tracking-[0.16em] uppercase text-[#E1C995] hover:text-white transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Full Advanced Filter</span>
              </Link>
            </div>
          </div>

          {/* 12 Interactive Category Buttons */}
          <div className="flex flex-wrap gap-2 mb-10">
            {COLLECTION_CATEGORIES.map((cat) => {
              const active = activeCollection === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCollection(cat)}
                  className={`px-4 py-2.5 font-nav text-[11px] tracking-[0.12em] uppercase border transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#C6A76B] border-[#C6A76B] text-[#080808] font-semibold'
                      : 'bg-[#111111] border-[#303030] text-[#A5A5A5] hover:border-[#C6A76B]/60 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* 4-Column Desktop / 2-Column Tablet / 1-Column Mobile Inventory Grid */}
          {collectionVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {collectionVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="bg-[#111111] border border-[#303030] p-12 text-center">
              <p className="font-display text-2xl text-white">
                No vehicles currently listed under {activeCollection}
              </p>
              <p className="text-sm text-[#A5A5A5] mt-2 max-w-xl mx-auto">
                Our private sourcing desk acquires bespoke vehicles on client mandate. Contact our
                concierge to commission a specific marque or view all available inventory.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setActiveCollection('All Cars')}
                  className="px-6 py-3 bg-[#C6A76B] text-[#080808] font-nav text-xs font-semibold tracking-[0.15em] uppercase cursor-pointer"
                >
                  View All Cars
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openEnquiryModal({
                      mode: 'enquiry',
                      category: 'Buy a Car',
                      vehicleName: `Sourcing Request: ${activeCollection}`,
                    })
                  }
                  className="px-6 py-3 border border-[#C6A76B] text-[#E1C995] font-nav text-xs tracking-[0.15em] uppercase cursor-pointer"
                >
                  Request Bespoke Sourcing
                </button>
              </div>
            </div>
          )}

          {/* Supported Marques Strip */}
          <div className="mt-16 pt-12 border-t border-[#303030]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-nav text-xs tracking-[0.2em] uppercase text-[#C6A76B]">
                  Supported Luxury Marques
                </h3>
                <p className="text-xs text-[#A5A5A5] mt-1">
                  Supported catalogue brands for buying, selling, and private sourcing mandates.
                </p>
              </div>
              <Link
                to="/about#marques"
                className="font-nav text-[11px] tracking-[0.14em] uppercase text-[#E1C995] hover:text-white"
              >
                Explore All 16 Marques &amp; Models →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {LUXURY_BRANDS_CATALOG.slice(0, 8).map((b) => (
                <Link
                  key={b.id}
                  to={`/inventory?brand=${encodeURIComponent(b.name)}`}
                  className="bg-[#111111] border border-[#303030] hover:border-[#C6A76B] p-3.5 flex items-center gap-3 transition-colors group"
                >
                  <BrandMark brand={b.name} className="w-9 h-9" />
                  <span className="font-nav text-[11px] tracking-wider text-[#A5A5A5] group-hover:text-white truncate">
                    {b.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Choose KAIRO? */}
      <section className="py-20 bg-[#111111] border-t border-[#303030]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mb-12">
            <span className="font-nav text-xs tracking-[0.22em] uppercase text-[#C6A76B]">
              The KAIRO Standard
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-white mt-2">
              Why Choose KAIRO?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_KAIRO_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="bg-[#181818] border border-[#303030] p-7 hover:border-[#C6A76B]/50 transition-colors"
                >
                  <div className="w-11 h-11 border border-[#C6A76B]/40 flex items-center justify-center text-[#C6A76B] mb-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-xl text-white mb-2.5">{card.title}</h3>
                  <p className="text-sm text-[#A5A5A5] leading-relaxed">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. KAIRO Services Preview */}
      <section className="py-20 bg-[#080808] border-t border-[#303030]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="font-nav text-xs tracking-[0.22em] uppercase text-[#C6A76B]">
                Bespoke Care &amp; Engineering
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-white mt-2">
                KAIRO Services Atelier
              </h2>
            </div>
            <Link
              to="/services"
              className="font-nav text-xs tracking-[0.16em] uppercase text-[#E1C995] hover:text-white inline-flex items-center gap-2"
            >
              <span>Explore All Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Car Modification',
                category: 'Car Modification' as const,
                image: KairoMediaAssets.serviceModification,
                icon: Compass,
                desc: 'Personalize your automobile through bespoke modifications and performance enhancements.',
                items: 'Body Kits · Carbon Fibre · ECU Tuning · Exhaust & Forged Wheels',
              },
              {
                title: 'Car Servicing',
                category: 'Car Servicing' as const,
                image: KairoMediaAssets.serviceServicing,
                icon: Wrench,
                desc: 'Expert automotive maintenance delivered with precision and care.',
                items: 'Periodic Maintenance · Engine & Gearbox · Diagnostics · OEM Parts',
              },
              {
                title: 'Car Detailing',
                category: 'Car Detailing' as const,
                image: KairoMediaAssets.serviceDetailing,
                icon: Sparkles,
                desc: 'Protect and restore your vehicle with premium automotive detailing.',
                items: 'Paint Correction · Ceramic & Graphene Coating · PPF · Interior Care',
              },
            ].map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.title}
                  className="bg-[#181818] border border-[#303030] flex flex-col overflow-hidden group"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#111111]">
                    <img
                      src={srv.image}
                      alt={srv.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[#C6A76B] font-nav text-[11px] uppercase tracking-[0.16em] mb-2">
                        <Icon className="w-4 h-4" />
                        <span>Atelier Division</span>
                      </div>
                      <h3 className="font-display text-2xl text-white">{srv.title}</h3>
                      <p className="text-sm text-[#A5A5A5] mt-2 leading-relaxed">{srv.desc}</p>
                      <p className="text-xs text-[#707070] mt-4 pt-4 border-t border-[#303030]">
                        {srv.items}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          openEnquiryModal({
                            mode: 'service',
                            serviceCategory: srv.category,
                            serviceName: `${srv.title} Consultation`,
                          })
                        }
                        className="flex-1 py-2.5 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors cursor-pointer"
                      >
                        Book Service
                      </button>
                      <Link
                        to="/services"
                        className="px-4 py-2.5 border border-[#303030] hover:border-[#C6A76B] text-white font-nav text-[11px] tracking-[0.14em] uppercase"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. KAIRO Realty Promotional Showcase */}
      <section className="relative py-28 overflow-hidden border-t border-[#303030]">
        <div className="absolute inset-0">
          <img
            src={KairoMediaAssets.realtyVilla}
            alt="KAIRO Realty architectural villa estate with glass automotive pavilion"
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/95 via-[#080808]/75 to-[#080808]/40" />
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl">
            <span className="font-nav text-xs tracking-[0.24em] uppercase text-[#C6A76B]">
              KAIRO Realty
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-white mt-3 leading-tight">
              WHERE LUXURY LIVING MEETS UNMATCHED CRAFTSMANSHIP
            </h2>
            <p className="text-base text-[#D0D0D0] mt-4 leading-relaxed">
              Experience exceptional residences designed for those who appreciate the finest things
              in life.
            </p>
            <p className="font-nav text-xs tracking-[0.16em] uppercase text-[#E1C995] mt-6">
              Luxury Villas · Premium Apartments · Exclusive Residences · Architectural Developments
            </p>
            <Link
              to="/realty"
              className="inline-flex items-center gap-2 mt-8 px-7 py-3.5 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-xs font-semibold tracking-[0.18em] uppercase transition-colors"
            >
              <span>EXPLORE KAIRO REALTY</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Showroom Locations & Interactive Map */}
      <ShowroomsMapSection />
    </div>
  );
};

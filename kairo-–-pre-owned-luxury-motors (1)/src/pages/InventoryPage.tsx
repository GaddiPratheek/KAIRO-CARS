import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { useKairo } from '../context/KairoContext';
import {
  ALL_BRAND_NAMES,
  COLLECTION_CATEGORIES,
  getModelsForBrand,
} from '../data/brandsAndModels';
import { VehicleCard } from '../components/VehicleCard';

type SortOption =
  | 'newest'
  | 'oldest'
  | 'price-asc'
  | 'price-desc'
  | 'km-asc'
  | 'performance-desc';

export const InventoryPage: React.FC = () => {
  const { vehicles, vehiclesLoading, openEnquiryModal } = useKairo();
  const [searchParams, setSearchParams] = useSearchParams();

  const [queryText, setQueryText] = useState(searchParams.get('q') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [model, setModel] = useState(searchParams.get('model') || '');
  const [variant, setVariant] = useState(searchParams.get('variant') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [mfgYear, setMfgYear] = useState(searchParams.get('year') || '');
  const [regYear, setRegYear] = useState('');
  const [maxMileage, setMaxMileage] = useState('');
  const [fuelType, setFuelType] = useState(searchParams.get('fuelType') || '');
  const [transmission, setTransmission] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [owners, setOwners] = useState('');
  const [exteriorColour, setExteriorColour] = useState('');
  const [availability, setAvailability] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [visibleCount, setVisibleCount] = useState(8);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setQueryText(searchParams.get('q') || '');
    setBrand(searchParams.get('brand') || '');
    setModel(searchParams.get('model') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setMfgYear(searchParams.get('year') || '');
    setFuelType(searchParams.get('fuelType') || '');
    setCategory(searchParams.get('category') || '');
  }, [searchParams]);

  const modelOptions = useMemo(() => {
    if (!brand) return Array.from(new Set(vehicles.map((v) => v.model)));
    return getModelsForBrand(brand);
  }, [brand, vehicles]);

  const bodyTypeOptions = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.bodyType))).sort(),
    [vehicles]
  );

  const colourOptions = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.exteriorColour))).sort(),
    [vehicles]
  );

  const clearAllFilters = () => {
    setQueryText('');
    setBrand('');
    setModel('');
    setVariant('');
    setMinPrice('');
    setMaxPrice('');
    setMfgYear('');
    setRegYear('');
    setMaxMileage('');
    setFuelType('');
    setTransmission('');
    setBodyType('');
    setCategory('');
    setOwners('');
    setExteriorColour('');
    setAvailability('');
    setSortBy('newest');
    setSearchParams({});
  };

  const filteredVehicles = useMemo(() => {
    const q = queryText.trim().toLowerCase();

    const filtered = vehicles.filter((v) => {
      if (q) {
        const hay = `${v.brand} ${v.model} ${v.variant} ${v.stockId} ${v.bodyType} ${v.exteriorColour}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (brand && v.brand.toLowerCase() !== brand.toLowerCase()) return false;
      if (model && !v.model.toLowerCase().includes(model.toLowerCase())) return false;
      if (variant && !v.variant.toLowerCase().includes(variant.toLowerCase())) return false;
      if (minPrice && v.askingPrice < Number(minPrice)) return false;
      if (maxPrice && v.askingPrice > Number(maxPrice)) return false;
      if (mfgYear && v.manufacturingYear < Number(mfgYear)) return false;
      if (regYear && v.registrationYear !== Number(regYear)) return false;
      if (maxMileage && v.mileage > Number(maxMileage)) return false;
      if (fuelType && v.fuelType.toLowerCase() !== fuelType.toLowerCase()) return false;
      if (
        transmission &&
        !v.transmission.toLowerCase().includes(transmission.toLowerCase())
      ) {
        return false;
      }
      if (bodyType && v.bodyType !== bodyType) return false;
      if (
        category &&
        category !== 'All Cars' &&
        v.category !== category &&
        !v.categories.includes(category as never)
      ) {
        return false;
      }
      if (owners && v.ownershipCount !== Number(owners)) return false;
      if (exteriorColour && v.exteriorColour !== exteriorColour) return false;
      if (availability && v.availability !== availability) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.askingPrice - b.askingPrice;
        case 'price-desc':
          return b.askingPrice - a.askingPrice;
        case 'oldest':
          return a.manufacturingYear - b.manufacturingYear;
        case 'km-asc':
          return a.mileage - b.mileage;
        case 'performance-desc':
          return (b.engineSpecs?.horsepowerNumeric || 0) - (a.engineSpecs?.horsepowerNumeric || 0);
        case 'newest':
        default:
          return b.manufacturingYear - a.manufacturingYear;
      }
    });
  }, [
    vehicles,
    queryText,
    brand,
    model,
    variant,
    minPrice,
    maxPrice,
    mfgYear,
    regYear,
    maxMileage,
    fuelType,
    transmission,
    bodyType,
    category,
    owners,
    exteriorColour,
    availability,
    sortBy,
  ]);

  const displayedVehicles = filteredVehicles.slice(0, visibleCount);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#080808]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Page Header */}
        <div className="pb-8 border-b border-[#303030] flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <span className="font-nav text-xs tracking-[0.22em] uppercase text-[#C6A76B]">
              KAIRO Showroom Inventory
            </span>
            <h1 className="font-display text-3xl sm:text-5xl text-white mt-2">
              Curated Luxury Automobiles
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-[#A5A5A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Search marque, model, stock ID..."
                className="w-full bg-[#111111] border border-[#303030] pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#707070] focus:border-[#C6A76B] focus:outline-none"
              />
            </div>

            <select
              aria-label="Sort inventory"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-[#111111] border border-[#303030] px-3.5 py-2.5 text-xs font-nav uppercase tracking-wider text-white focus:border-[#C6A76B] focus:outline-none"
            >
              <option value="newest">Sort: Newest Arrivals</option>
              <option value="oldest">Sort: Oldest Vehicles</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="km-asc">Lowest Kilometres</option>
              <option value="performance-desc">Highest Performance (BHP)</option>
            </select>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen((v) => !v)}
              className="lg:hidden px-4 py-2.5 bg-[#181818] border border-[#303030] text-xs font-nav uppercase tracking-wider text-white inline-flex items-center gap-2 cursor-pointer"
            >
              <Filter className="w-4 h-4 text-[#C6A76B]" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Main Layout: Sidebar Filters + Results */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`lg:col-span-3 ${
              mobileFiltersOpen ? 'block' : 'hidden lg:block'
            } bg-[#111111] border border-[#303030] p-6 h-fit`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#303030]">
              <div className="flex items-center gap-2 font-nav text-xs uppercase tracking-[0.16em] text-white">
                <SlidersHorizontal className="w-4 h-4 text-[#C6A76B]" />
                <span>Refine Search</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-[11px] font-nav uppercase tracking-wider text-[#C6A76B] hover:text-[#E1C995] inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="lg:hidden text-[#A5A5A5] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-nav uppercase tracking-wider text-[#A5A5A5] mb-1.5">
                  Brand
                </label>
                <select
                  value={brand}
                  onChange={(e) => {
                    setBrand(e.target.value);
                    setModel('');
                  }}
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2.5 text-white focus:border-[#C6A76B] focus:outline-none"
                >
                  <option value="">All Brands</option>
                  {ALL_BRAND_NAMES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-nav uppercase tracking-wider text-[#A5A5A5] mb-1.5">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2.5 text-white focus:border-[#C6A76B] focus:outline-none"
                >
                  <option value="">All Models</option>
                  {modelOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-nav uppercase tracking-wider text-[#A5A5A5] mb-1.5">
                  Variant Keyword
                </label>
                <input
                  type="text"
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  placeholder="e.g. M60i, Autobiography, 4S"
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2.5 text-white placeholder-[#606060] focus:border-[#C6A76B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-nav uppercase tracking-wider text-[#A5A5A5] mb-1.5">
                    Min Price (₹)
                  </label>
                  <input
                    type="number"
                    step={500000}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="2500000"
                    className="w-full bg-[#181818] border border-[#303030] px-2.5 py-2 text-white font-mono-tabular focus:border-[#C6A76B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-nav uppercase tracking-wider text-[#A5A5A5] mb-1.5">
                    Max Price (₹)
                  </label>
                  <input
                    type="number"
                    step={500000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="40000000"
                    className="w-full bg-[#181818] border border-[#303030] px-2.5 py-2 text-white font-mono-tabular focus:border-[#C6A76B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-nav uppercase tracking-wider text-[#A5A5A5] mb-1.5">
                    Min Mfg Year
                  </label>
                  <select
                    value={mfgYear}
                    onChange={(e) => setMfgYear(e.target.value)}
                    className="w-full bg-[#181818] border border-[#303030] px-2.5 py-2 text-white focus:border-[#C6A76B] focus:outline-none"
                  >
                    <option value="">Any</option>
                    {[2025, 2024, 2023, 2022, 2021, 2020, 2019].map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}+
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-nav uppercase tracking-wider text-[#A5A5A5] mb-1.5">
                    Reg. Year
                  </label>
                  <select
                    value={regYear}
                    onChange={(e) => setRegYear(e.target.value)}
                    className="w-full bg-[#181818] border border-[#303030] px-2.5 py-2 text-white focus:border-[#C6A76B] focus:outline-none"
                  >
                    <option value="">Any</option>
                    {[2025, 2024, 2023, 2022, 2021, 2020].map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-nav uppercase tracking-wider text-[#A5A5A5] mb-1.5">
                  Max Kilometres Driven
                </label>
                <select
                  value={maxMileage}
                  onChange={(e) => setMaxMileage(e.target.value)}
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2.5 text-white focus:border-[#C6A76B] focus:outline-none"
                >
                  <option value="">Any Kilometres</option>
                  <option value="5000">Under 5,000 km</option>
                  <option value="10000">Under 10,000 km</option>
                  <option value="20000">Under 20,000 km</option>
                  <option value="35000">Under 35,000 km</option>
                </select>
              </div>

              <div>
                <label className="block font-nav uppercase tracking-wider text-[#A5A5A5] mb-1.5">
                  Vehicle Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2.5 text-white focus:border-[#C6A76B] focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {COLLECTION_CATEGORIES.filter((c) => c !== 'All Cars').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-nav uppercase tracking-wider text-[#A5A5A5] mb-1.5">
                  Fuel Type
                </label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2.5 text-white focus:border-[#C6A76B] focus:outline-none"
                >
                  <option value="">All Fuel Types</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block font-nav uppercase tracking-wider text-[#A5A5A5] mb-1.5">
                  Transmission
                </label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2.5 text-white focus:border-[#C6A76B] focus:outline-none"
                >
                  <option value="">All Transmissions</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Dual-Clutch">Dual-Clutch (DCT / PDK / F1)</option>
                  <option value="Single-Speed">Electric Single-Speed / 2-Speed</option>
                </select>
              </div>

              <div>
                <label className="block font-nav uppercase tracking-wider text-[#A5A5A5] mb-1.5">
                  Body Type
                </label>
                <select
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value)}
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2.5 text-white focus:border-[#C6A76B] focus:outline-none"
                >
                  <option value="">All Body Styles</option>
                  {bodyTypeOptions.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-nav uppercase tracking-wider text-[#A5A5A5] mb-1.5">
                    Owners
                  </label>
                  <select
                    value={owners}
                    onChange={(e) => setOwners(e.target.value)}
                    className="w-full bg-[#181818] border border-[#303030] px-2.5 py-2 text-white focus:border-[#C6A76B] focus:outline-none"
                  >
                    <option value="">Any</option>
                    <option value="1">1st Owner</option>
                    <option value="2">2nd Owner</option>
                    <option value="3">3rd Owner</option>
                  </select>
                </div>
                <div>
                  <label className="block font-nav uppercase tracking-wider text-[#A5A5A5] mb-1.5">
                    Availability
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full bg-[#181818] border border-[#303030] px-2.5 py-2 text-white focus:border-[#C6A76B] focus:outline-none"
                  >
                    <option value="">All</option>
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                    <option value="In Inspection">In Inspection</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-nav uppercase tracking-wider text-[#A5A5A5] mb-1.5">
                  Exterior Colour
                </label>
                <select
                  value={exteriorColour}
                  onChange={(e) => setExteriorColour(e.target.value)}
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2.5 text-white focus:border-[#C6A76B] focus:outline-none"
                >
                  <option value="">Any Exterior Colour</option>
                  {colourOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="lg:col-span-9">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <p className="text-sm text-[#A5A5A5] tabular-nums">
                Showing <span className="text-white font-semibold">{displayedVehicles.length}</span>{' '}
                of <span className="text-white font-semibold">{filteredVehicles.length}</span>{' '}
                matching vehicles
              </p>
              <p className="text-xs text-[#707070]">
                Sample demonstration inventory · Prices &amp; availability editable in Admin Console
              </p>
            </div>

            {vehiclesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="bg-[#181818] border border-[#303030] h-[420px] animate-pulse"
                  />
                ))}
              </div>
            ) : displayedVehicles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayedVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>

                {visibleCount < filteredVehicles.length && (
                  <div className="mt-10 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 8)}
                      className="px-8 py-3.5 border border-[#C6A76B] text-[#E1C995] hover:bg-[#C6A76B] hover:text-[#080808] font-nav text-xs font-semibold tracking-[0.18em] uppercase transition-colors cursor-pointer"
                    >
                      Load More Vehicles ({filteredVehicles.length - visibleCount} Remaining)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-[#111111] border border-[#303030] p-12 text-center">
                <h2 className="font-display text-2xl text-white">No Matching Automobiles Found</h2>
                <p className="text-sm text-[#A5A5A5] mt-2 max-w-lg mx-auto">
                  No inventory records match your active filter combination. Reset filters or
                  submit a private sourcing request to our acquisitions team.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="px-6 py-3 bg-[#C6A76B] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openEnquiryModal({
                        mode: 'enquiry',
                        category: 'Buy a Car',
                        vehicleName: `${brand || 'Custom'} ${model || 'Sourcing Mandate'}`.trim(),
                      })
                    }
                    className="px-6 py-3 border border-[#C6A76B] text-[#E1C995] font-nav text-xs tracking-[0.16em] uppercase cursor-pointer"
                  >
                    Commission Sourcing
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  GitCompare,
  Heart,
  Info,
  Maximize2,
  MessageCircle,
  PhoneCall,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useKairo } from '../context/KairoContext';
import { KAIRO_WHATSAPP_NUMBER } from '../data/showroomsSeed';
import {
  displayOrFallback,
  downloadVehicleBrochure,
  formatINR,
  formatKm,
} from '../utils/formatters';
import { EmiCalculatorWidget } from '../components/EmiCalculatorWidget';
import type { FeatureEntry } from '../types/kairo';

const GALLERY_VIEWS = [
  '1. Front Exterior',
  '2. Rear Exterior',
  '3. Left-Side Exterior',
  '4. Right-Side Exterior',
  '5. Front Three-Quarter View',
  '6. Rear Three-Quarter View',
  '7. Dashboard',
  '8. Steering Wheel',
  '9. Front Seats',
  '10. Rear Seats',
  '11. Infotainment System',
  '12. Engine Compartment',
  '13. Boot Space',
  '14. Alloy Wheels',
  '15. Interior Details',
];

const FeatureListGrid: React.FC<{ features: Record<string, FeatureEntry> }> = ({ features }) => {
  const entries = Object.values(features);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {entries.map((item) => (
        <div
          key={item.label}
          className="bg-[#111111] border border-[#303030] px-4 py-3 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {item.included ? (
              <Check className="w-4 h-4 text-[#C6A76B] shrink-0" />
            ) : (
              <X className="w-4 h-4 text-[#555555] shrink-0" />
            )}
            <span className={`text-xs truncate ${item.included ? 'text-white' : 'text-[#707070]'}`}>
              {item.label}
            </span>
          </div>
          {item.included && item.tier && (
            <span className="text-[10px] font-nav uppercase tracking-wider text-[#A5A5A5] shrink-0">
              {item.tier === 'Optional Package' ? 'Optional' : 'Std'}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const SpecTable: React.FC<{ rows: { label: string; value: string | number | null | undefined }[] }> = ({
  rows,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 border-t border-[#303030]">
    {rows.map((row) => (
      <div
        key={row.label}
        className="flex items-baseline justify-between gap-4 py-3 border-b border-[#242424] text-sm"
      >
        <span className="text-[#A5A5A5]">{row.label}</span>
        <span className="text-white font-medium text-right tabular-nums">
          {displayOrFallback(row.value)}
        </span>
      </div>
    ))}
  </div>
);

export const VehicleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    vehicles,
    wishlistIds,
    compareIds,
    toggleWishlist,
    toggleCompare,
    openEnquiryModal,
    showToast,
  } = useKairo();

  const vehicle = useMemo(() => vehicles.find((v) => v.id === id), [vehicles, id]);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  if (!vehicle) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#080808] text-center px-4">
        <h1 className="font-display text-3xl text-white">Vehicle Record Not Found</h1>
        <p className="text-sm text-[#A5A5A5] mt-3">
          The requested automobile may have been archived or removed from the showcase.
        </p>
        <Link
          to="/inventory"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-[#C6A76B] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Inventory</span>
        </Link>
      </div>
    );
  }

  const gallery =
    vehicle.galleryImages && vehicle.galleryImages.length > 0
      ? vehicle.galleryImages
      : [
          {
            url: vehicle.primaryImage,
            label: `${vehicle.brand} ${vehicle.model} Exterior View`,
            category: 'Exterior' as const,
          },
        ];

  const activeImage = gallery[activeImageIdx] || gallery[0];
  const isWishlisted = wishlistIds.includes(vehicle.id);
  const isCompared = compareIds.includes(vehicle.id);

  const whatsappUrl = `https://wa.me/${KAIRO_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hello KAIRO Concierge, I am interested in the ${vehicle.manufacturingYear} ${vehicle.brand} ${vehicle.model} ${vehicle.variant} (Stock ID: ${vehicle.stockId}).`
  )}`;

  return (
    <div className="pt-24 pb-24 min-h-screen bg-[#080808]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#303030]">
          <Link
            to="/inventory"
            className="inline-flex items-center gap-2 font-nav text-xs tracking-[0.14em] uppercase text-[#A5A5A5] hover:text-[#E1C995]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inventory</span>
          </Link>
          <div className="text-xs font-nav tracking-[0.14em] uppercase text-[#A5A5A5]">
            Stock ID: <span className="text-[#C6A76B] font-mono-tabular">{vehicle.stockId}</span> ·{' '}
            <span className="text-white">{vehicle.availability}</span>
          </div>
        </div>

        {/* Top Split: Gallery + Contiguous Purchase Module */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Vehicle Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/3] bg-[#111111] border border-[#303030] overflow-hidden group">
              <img
                src={activeImage.url}
                alt={`${vehicle.brand} ${vehicle.model} — ${activeImage.label}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />

              <button
                type="button"
                onClick={() => {
                  setZoomScale(1);
                  setLightboxOpen(true);
                }}
                aria-label="Open full-screen viewer"
                className="absolute top-4 right-4 px-3 py-2 bg-[#080808]/85 border border-[#303030] hover:border-[#C6A76B] text-white text-xs font-nav uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#C6A76B]" />
                <span>Full-Screen</span>
              </button>

              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIdx((i) => (i - 1 + gallery.length) % gallery.length)
                    }
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#080808]/80 border border-[#303030] text-white hover:border-[#C6A76B] flex items-center justify-center cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImageIdx((i) => (i + 1) % gallery.length)}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#080808]/80 border border-[#303030] text-white hover:border-[#C6A76B] flex items-center justify-center cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 to-transparent px-5 py-3 flex items-center justify-between text-xs">
                <span className="text-white">{activeImage.label}</span>
                <span className="text-[#A5A5A5] font-mono-tabular">
                  {activeImageIdx + 1} / {gallery.length}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {gallery.map((img, idx) => (
                <button
                  key={`${img.url}-${idx}`}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-24 aspect-[4/3] border shrink-0 overflow-hidden cursor-pointer ${
                    idx === activeImageIdx
                      ? 'border-[#C6A76B]'
                      : 'border-[#303030] opacity-65 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Inspection Gallery Angles Coverage Checklist */}
            <div className="bg-[#111111] border border-[#303030] p-5">
              <p className="font-nav text-[11px] uppercase tracking-[0.16em] text-[#C6A76B] mb-2">
                15-Angle Showroom Photography Protocol
              </p>
              <p className="text-xs text-[#A5A5A5] mb-3">
                Authentic model-specific gallery shots are displayed as verified in the vehicle
                record. Additional angle inspections can be requested directly from our showroom
                specialists.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-[11px] text-[#A5A5A5]">
                {GALLERY_VIEWS.map((view, idx) => {
                  const hasPhoto = idx < gallery.length;
                  return (
                    <div key={view} className="flex items-center justify-between gap-2">
                      <span className={hasPhoto ? 'text-white' : 'text-[#707070]'}>{view}</span>
                      <span className="text-[10px] text-[#C6A76B]">
                        {hasPhoto ? 'Loaded' : 'On Request'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Contiguous Purchase & Action Module */}
          <div className="lg:col-span-5 bg-[#181818] border border-[#303030] p-6 sm:p-8 lg:sticky lg:top-24">
            <div className="flex items-center justify-between text-xs font-nav uppercase tracking-[0.16em] text-[#C6A76B]">
              <span>{vehicle.brand}</span>
              <span className="text-[#A5A5A5]">{vehicle.category}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl text-white mt-2">
              {vehicle.manufacturingYear} {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-sm text-[#A5A5A5] mt-1">{vehicle.variant}</p>

            <div className="mt-5 pt-5 border-t border-[#303030]">
              <span className="block font-nav text-[10px] uppercase tracking-[0.16em] text-[#A5A5A5]">
                Asking Price (Illustrative Demo Record)
              </span>
              <div className="font-mono-tabular text-3xl sm:text-4xl font-semibold text-[#E1C995] mt-1">
                {formatINR(vehicle.askingPrice)}
              </div>
              <p className="text-xs text-[#A5A5A5] mt-1">{vehicle.pricingSpecs.negotiableStatus}</p>
            </div>

            {/* Key Quick Specs */}
            <div className="mt-5 pt-5 border-t border-[#303030] grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#707070] block uppercase tracking-wider text-[10px]">
                  Kilometres
                </span>
                <span className="text-white font-mono-tabular text-sm">
                  {formatKm(vehicle.mileage)}
                </span>
              </div>
              <div>
                <span className="text-[#707070] block uppercase tracking-wider text-[10px]">
                  Power / Torque
                </span>
                <span className="text-white text-sm">
                  {vehicle.engineSpecs.horsepower.split('@')[0].trim()}
                </span>
              </div>
              <div>
                <span className="text-[#707070] block uppercase tracking-wider text-[10px]">
                  Fuel &amp; Transmission
                </span>
                <span className="text-white text-sm">
                  {vehicle.fuelType} · {vehicle.drivetrainSpecs.driveType.split('(')[0].trim()}
                </span>
              </div>
              <div>
                <span className="text-[#707070] block uppercase tracking-wider text-[10px]">
                  0–100 km/h
                </span>
                <span className="text-white font-mono-tabular text-sm">
                  {vehicle.engineSpecs.acceleration0To100}
                </span>
              </div>
            </div>

            <p className="mt-5 text-sm text-[#A5A5A5] leading-relaxed">{vehicle.description}</p>

            {/* Primary & Secondary Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() =>
                  openEnquiryModal({
                    mode: 'enquiry',
                    category: 'Buy a Car',
                    vehicleId: vehicle.id,
                    vehicleName: `${vehicle.manufacturingYear} ${vehicle.brand} ${vehicle.model} ${vehicle.variant}`,
                  })
                }
                className="w-full py-3.5 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-xs font-semibold tracking-[0.18em] uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Enquire Now</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    openEnquiryModal({
                      mode: 'test-drive',
                      vehicleId: vehicle.id,
                      vehicleName: `${vehicle.manufacturingYear} ${vehicle.brand} ${vehicle.model} ${vehicle.variant}`,
                    })
                  }
                  className="py-3 border border-[#C6A76B] text-[#E1C995] hover:bg-[#C6A76B] hover:text-[#080808] font-nav text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Test Drive</span>
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 border border-[#303030] hover:border-[#C6A76B] text-white font-nav text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-[#C6A76B]" />
                  <span>WhatsApp Enquiry</span>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => toggleWishlist(vehicle.id)}
                  className={`py-2.5 border font-nav text-[11px] tracking-[0.12em] uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    isWishlisted
                      ? 'border-[#C6A76B] bg-[#C6A76B]/15 text-[#E1C995]'
                      : 'border-[#303030] text-[#A5A5A5] hover:text-white hover:border-[#C6A76B]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#C6A76B]' : ''}`} />
                  <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleCompare(vehicle.id)}
                  className={`py-2.5 border font-nav text-[11px] tracking-[0.12em] uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    isCompared
                      ? 'border-[#C6A76B] bg-[#C6A76B]/15 text-[#E1C995]'
                      : 'border-[#303030] text-[#A5A5A5] hover:text-white hover:border-[#C6A76B]'
                  }`}
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>{isCompared ? 'Comparing' : 'Compare Vehicle'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    openEnquiryModal({
                      mode: 'enquiry',
                      category: 'General Enquiry',
                      vehicleId: vehicle.id,
                      vehicleName: `Information Request: ${vehicle.brand} ${vehicle.model} (${vehicle.stockId})`,
                    })
                  }
                  className="py-2.5 border border-[#303030] hover:border-[#C6A76B] text-[#A5A5A5] hover:text-white font-nav text-[11px] tracking-[0.12em] uppercase flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-[#C6A76B]" />
                  <span>Request More Info</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    downloadVehicleBrochure(vehicle);
                    showToast('Vehicle specification dossier downloaded.');
                  }}
                  className="py-2.5 border border-[#303030] hover:border-[#C6A76B] text-[#A5A5A5] hover:text-white font-nav text-[11px] tracking-[0.12em] uppercase flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#C6A76B]" />
                  <span>Download Brochure</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Complete A–J Technical Specifications */}
        <div className="mt-16 space-y-12">
          {/* A. Vehicle Overview */}
          <section className="bg-[#181818] border border-[#303030] p-6 sm:p-8">
            <h2 className="font-display text-2xl text-white mb-6">A. Vehicle Overview</h2>
            <SpecTable
              rows={[
                { label: 'Brand', value: vehicle.brand },
                { label: 'Model', value: vehicle.model },
                { label: 'Variant', value: vehicle.variant },
                { label: 'Manufacturing Year', value: vehicle.manufacturingYear },
                { label: 'Registration Year', value: vehicle.registrationYear },
                { label: 'Vehicle Category', value: vehicle.category },
                { label: 'Registration State', value: vehicle.registrationState },
                { label: 'Registration Number', value: vehicle.registrationNumber },
                { label: 'VIN / Chassis Reference', value: vehicle.vin },
                { label: 'Kilometres Driven', value: formatKm(vehicle.mileage) },
                { label: 'Fuel Type', value: vehicle.fuelType },
                { label: 'Transmission', value: vehicle.transmission },
                { label: 'Exterior Colour', value: vehicle.exteriorColour },
                { label: 'Interior Colour', value: vehicle.interiorColour },
                { label: 'Number of Recorded Owners', value: vehicle.ownershipCount },
                { label: 'Availability Status', value: vehicle.availability },
                { label: 'Stock ID', value: vehicle.stockId },
                { label: 'Asking Price (Illustrative)', value: formatINR(vehicle.askingPrice) },
              ]}
            />
          </section>

          {/* B. Engine Specifications */}
          <section className="bg-[#181818] border border-[#303030] p-6 sm:p-8">
            <h2 className="font-display text-2xl text-white mb-6">B. Engine Specifications</h2>
            <SpecTable
              rows={[
                { label: 'Engine Type', value: vehicle.engineSpecs.engineType },
                { label: 'Engine Displacement', value: vehicle.engineSpecs.displacement },
                { label: 'Engine Configuration', value: vehicle.engineSpecs.configuration },
                { label: 'Number of Cylinders', value: vehicle.engineSpecs.cylinders },
                { label: 'Maximum Horsepower', value: vehicle.engineSpecs.horsepower },
                { label: 'Maximum Torque', value: vehicle.engineSpecs.torque },
                { label: 'Aspiration / Turbocharger', value: vehicle.engineSpecs.forcedInduction },
                { label: 'Fuel System', value: vehicle.engineSpecs.fuelSystem },
                { label: 'Hybrid System Information', value: vehicle.engineSpecs.hybridSystem },
                { label: 'Electric Motor Power', value: vehicle.engineSpecs.electricMotorPower },
                { label: 'Battery Capacity', value: vehicle.engineSpecs.batteryCapacity },
                { label: 'Electric Driving Range', value: vehicle.engineSpecs.electricRange },
                { label: 'Acceleration (0–100 km/h)', value: vehicle.engineSpecs.acceleration0To100 },
                { label: 'Maximum Speed', value: vehicle.engineSpecs.topSpeed },
              ]}
            />
          </section>

          {/* C. Transmission & Drivetrain */}
          <section className="bg-[#181818] border border-[#303030] p-6 sm:p-8">
            <h2 className="font-display text-2xl text-white mb-6">
              C. Transmission and Drivetrain
            </h2>
            <SpecTable
              rows={[
                { label: 'Transmission Type', value: vehicle.drivetrainSpecs.transmissionType },
                { label: 'Number of Gears', value: vehicle.drivetrainSpecs.gears },
                { label: 'Drivetrain Configuration', value: vehicle.drivetrainSpecs.driveType },
                { label: 'Differential', value: vehicle.drivetrainSpecs.differential },
                { label: 'Driving Modes', value: vehicle.drivetrainSpecs.drivingModes },
                { label: 'Suspension System', value: vehicle.drivetrainSpecs.suspensionSystem },
                { label: 'Steering System', value: vehicle.drivetrainSpecs.steeringSystem },
                { label: 'Braking System', value: vehicle.drivetrainSpecs.brakingSystem },
              ]}
            />
          </section>

          {/* D. Dimensions & Capacity */}
          <section className="bg-[#181818] border border-[#303030] p-6 sm:p-8">
            <h2 className="font-display text-2xl text-white mb-6">D. Dimensions and Capacity</h2>
            <SpecTable
              rows={[
                { label: 'Overall Length', value: vehicle.dimensionsSpecs.length },
                { label: 'Overall Width', value: vehicle.dimensionsSpecs.width },
                { label: 'Overall Height', value: vehicle.dimensionsSpecs.height },
                { label: 'Wheelbase', value: vehicle.dimensionsSpecs.wheelbase },
                { label: 'Ground Clearance', value: vehicle.dimensionsSpecs.groundClearance },
                { label: 'Kerb Weight', value: vehicle.dimensionsSpecs.kerbWeight },
                { label: 'Boot Capacity', value: vehicle.dimensionsSpecs.bootCapacity },
                { label: 'Fuel Tank / Battery Capacity', value: vehicle.dimensionsSpecs.fuelTankCapacity },
                { label: 'Seating Capacity', value: `${vehicle.dimensionsSpecs.seatingCapacity} Persons` },
                { label: 'Number of Doors', value: `${vehicle.dimensionsSpecs.doors} Doors` },
                { label: 'Wheel Size', value: vehicle.dimensionsSpecs.wheelSize },
                { label: 'Tyre Specifications', value: vehicle.dimensionsSpecs.tyreSpecifications },
              ]}
            />
          </section>

          {/* E. Exterior Features */}
          <section className="bg-[#181818] border border-[#303030] p-6 sm:p-8">
            <h2 className="font-display text-2xl text-white mb-2">E. Exterior Features</h2>
            <p className="text-xs text-[#A5A5A5] mb-6">
              Standard factory equipment and optional package installations verified per model specification.
            </p>
            <FeatureListGrid features={vehicle.exteriorFeatures as unknown as Record<string, FeatureEntry>} />
          </section>

          {/* F. Interior Features */}
          <section className="bg-[#181818] border border-[#303030] p-6 sm:p-8">
            <h2 className="font-display text-2xl text-white mb-6">F. Interior Features</h2>
            <FeatureListGrid features={vehicle.interiorFeatures as unknown as Record<string, FeatureEntry>} />
          </section>

          {/* G. Infotainment & Connectivity */}
          <section className="bg-[#181818] border border-[#303030] p-6 sm:p-8">
            <h2 className="font-display text-2xl text-white mb-6">
              G. Infotainment and Connectivity
            </h2>
            <div className="mb-6">
              <SpecTable
                rows={[
                  { label: 'Audio System', value: vehicle.infotainmentFeatures.premiumSoundSystem },
                  { label: 'Speaker Configuration', value: vehicle.infotainmentFeatures.speakerCount },
                ]}
              />
            </div>
            <FeatureListGrid
              features={{
                touchscreenInfotainment: vehicle.infotainmentFeatures.touchscreenInfotainment,
                appleCarPlay: vehicle.infotainmentFeatures.appleCarPlay,
                androidAuto: vehicle.infotainmentFeatures.androidAuto,
                bluetooth: vehicle.infotainmentFeatures.bluetooth,
                navigation: vehicle.infotainmentFeatures.navigation,
                voiceControl: vehicle.infotainmentFeatures.voiceControl,
                subwoofer: vehicle.infotainmentFeatures.subwoofer,
                digitalCockpit: vehicle.infotainmentFeatures.digitalCockpit,
                rearEntertainmentDisplay: vehicle.infotainmentFeatures.rearEntertainmentDisplay,
              }}
            />
          </section>

          {/* H. Safety Features */}
          <section className="bg-[#181818] border border-[#303030] p-6 sm:p-8">
            <h2 className="font-display text-2xl text-white mb-6">H. Safety Features</h2>
            <div className="mb-6">
              <SpecTable
                rows={[
                  { label: 'Airbags', value: vehicle.safetyFeatures.airbagsCount },
                  { label: 'Driver Assistance Systems', value: vehicle.safetyFeatures.adasSummary },
                ]}
              />
            </div>
            <FeatureListGrid
              features={{
                abs: vehicle.safetyFeatures.abs,
                ebd: vehicle.safetyFeatures.ebd,
                esc: vehicle.safetyFeatures.esc,
                tractionControl: vehicle.safetyFeatures.tractionControl,
                hillHoldAssist: vehicle.safetyFeatures.hillHoldAssist,
                hillDescentControl: vehicle.safetyFeatures.hillDescentControl,
                parkingSensors: vehicle.safetyFeatures.parkingSensors,
                camera360: vehicle.safetyFeatures.camera360,
                rearCamera: vehicle.safetyFeatures.rearCamera,
                blindSpotMonitoring: vehicle.safetyFeatures.blindSpotMonitoring,
                laneKeepAssist: vehicle.safetyFeatures.laneKeepAssist,
                adaptiveCruiseControl: vehicle.safetyFeatures.adaptiveCruiseControl,
                autonomousEmergencyBraking: vehicle.safetyFeatures.autonomousEmergencyBraking,
                tpms: vehicle.safetyFeatures.tpms,
                isofixMounts: vehicle.safetyFeatures.isofixMounts,
              }}
            />
          </section>

          {/* I. Ownership & Documentation */}
          <section className="bg-[#181818] border border-[#303030] p-6 sm:p-8">
            <h2 className="font-display text-2xl text-white mb-2">
              I. Ownership and Documentation
            </h2>
            <p className="text-xs text-[#A5A5A5] mb-6">
              Only verified or recorded facts are displayed. Items marked &ldquo;Not Provided&rdquo; or
              &ldquo;Pending Verification&rdquo; are confirmed during physical inspection.
            </p>
            <SpecTable
              rows={[
                { label: 'Ownership History', value: vehicle.documentationSpecs.ownershipHistory },
                { label: 'Registration Certificate (RC)', value: vehicle.documentationSpecs.rcStatus },
                { label: 'Insurance Status', value: vehicle.documentationSpecs.insuranceStatus },
                { label: 'Insurance Expiry Date', value: vehicle.documentationSpecs.insuranceExpiry },
                { label: 'Pollution Certificate (PUC)', value: vehicle.documentationSpecs.pucStatus },
                { label: 'Road Tax Status', value: vehicle.documentationSpecs.roadTaxStatus },
                { label: 'Service History', value: vehicle.documentationSpecs.serviceHistory },
                { label: 'Manufacturer Warranty', value: vehicle.documentationSpecs.manufacturerWarranty },
                { label: 'Extended Warranty', value: vehicle.documentationSpecs.extendedWarranty },
                { label: 'Loan / Hypothecation Status', value: vehicle.documentationSpecs.hypothecationStatus },
                { label: 'Accident History Disclosure', value: vehicle.documentationSpecs.accidentHistoryDisclosure },
                { label: 'Vehicle Inspection Report', value: vehicle.documentationSpecs.inspectionReportStatus },
                { label: 'RC Transfer Assistance', value: vehicle.documentationSpecs.rcTransferAssistance },
              ]}
            />
          </section>

          {/* J. Pricing Information & EMI Calculator */}
          <section className="bg-[#181818] border border-[#303030] p-6 sm:p-8">
            <h2 className="font-display text-2xl text-white mb-2">
              J. Pricing Information &amp; Finance Estimate
            </h2>
            <p className="text-xs text-[#A5A5A5] mb-6">
              All sample prices, market values, insurance, and transfer charges are illustrative estimates.
            </p>
            <SpecTable
              rows={[
                {
                  label: 'Original Ex-Showroom Reference',
                  value: formatINR(vehicle.pricingSpecs.exShowroomOriginal),
                },
                {
                  label: 'Current Asking Price (Illustrative)',
                  value: formatINR(vehicle.askingPrice),
                },
                { label: 'Negotiable Status', value: vehicle.pricingSpecs.negotiableStatus },
                {
                  label: 'Estimated Market Value',
                  value: formatINR(vehicle.pricingSpecs.estimatedMarketValue),
                },
                {
                  label: 'Finance Availability',
                  value: vehicle.pricingSpecs.financeAvailable ? 'Available (Subject to Approval)' : 'Cash / Direct Only',
                },
                {
                  label: 'Estimated Annual Insurance',
                  value: formatINR(vehicle.pricingSpecs.insuranceEstimate),
                },
                {
                  label: 'Estimated Transfer Charges',
                  value: formatINR(vehicle.pricingSpecs.transferChargesEstimate),
                },
              ]}
            />

            <div className="mt-8">
              <EmiCalculatorWidget
                initialPrice={vehicle.askingPrice}
                initialDownPaymentPercent={vehicle.pricingSpecs.estimatedDownPaymentPercent}
                initialRate={vehicle.pricingSpecs.defaultInterestRate}
                initialTenureMonths={vehicle.pricingSpecs.defaultTenureMonths}
                compact
              />
            </div>
          </section>
        </div>
      </div>

      {/* Full-Screen Zoomable Image Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#303030]">
            <div>
              <p className="font-display text-lg text-white">
                {vehicle.brand} {vehicle.model} — {activeImage.label}
              </p>
              <p className="text-xs text-[#A5A5A5]">
                Zoom: {Math.round(zoomScale * 100)}%
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomScale((s) => Math.max(1, s - 0.5))}
                aria-label="Zoom out"
                className="w-10 h-10 border border-[#303030] text-white hover:border-[#C6A76B] flex items-center justify-center cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale((s) => Math.min(2.5, s + 0.5))}
                aria-label="Zoom in"
                className="w-10 h-10 border border-[#303030] text-white hover:border-[#C6A76B] flex items-center justify-center cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close lightbox"
                className="w-10 h-10 border border-[#303030] text-white hover:border-[#C6A76B] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-6">
            <img
              src={activeImage.url}
              alt={activeImage.label}
              referrerPolicy="no-referrer"
              style={{ transform: `scale(${zoomScale})`, transition: 'transform 0.2s ease' }}
              className="max-h-[80vh] max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

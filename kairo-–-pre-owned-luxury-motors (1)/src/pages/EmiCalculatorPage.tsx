import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, FileCheck2, Shield } from 'lucide-react';
import { useKairo } from '../context/KairoContext';
import { EmiCalculatorWidget } from '../components/EmiCalculatorWidget';
import { formatINR } from '../utils/formatters';

export const EmiCalculatorPage: React.FC = () => {
  const { vehicles, openEnquiryModal } = useKairo();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0],
    [vehicles, selectedVehicleId]
  );

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="border-b border-[#303030] pb-8 mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <span className="font-nav text-xs tracking-[0.22em] uppercase text-[#C6A76B]">
              KAIRO Bespoke Finance Desk
            </span>
            <h1 className="font-display text-3xl sm:text-5xl text-white mt-2">
              Luxury Automobile EMI Calculator
            </h1>
            <p className="text-sm text-[#A5A5A5] mt-3 max-w-2xl leading-relaxed">
              Structure your ownership plan using our standard reducing-balance EMI calculator.
              Select a vehicle from the KAIRO showcase to pre-fill illustrative pricing or enter custom
              terms below.
            </p>
          </div>
          <Link
            to="/inventory"
            className="inline-flex items-center gap-2 font-nav text-xs tracking-[0.16em] uppercase text-[#E1C995] hover:text-white shrink-0"
          >
            <span>Browse Full Inventory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Vehicle Pre-Fill Selector */}
        <div className="bg-[#111111] border border-[#303030] p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-[#C6A76B] shrink-0" />
            <div>
              <p className="font-nav text-xs tracking-[0.14em] uppercase text-white">
                Pre-Fill From Showcase Vehicle
              </p>
              <p className="text-xs text-[#A5A5A5] mt-0.5">
                Populate asking price and baseline down-payment parameters from our current catalog.
              </p>
            </div>
          </div>

          <div className="w-full md:w-[420px]">
            <select
              value={selectedVehicle?.id || ''}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              aria-label="Select vehicle for EMI pre-fill"
              className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.manufacturingYear} {v.brand} {v.model} {v.variant} — {formatINR(v.askingPrice)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calculator Widget */}
        <EmiCalculatorWidget
          initialPrice={selectedVehicle?.askingPrice || 11500000}
          initialDownPaymentPercent={selectedVehicle?.pricingSpecs.estimatedDownPaymentPercent || 20}
          initialRate={selectedVehicle?.pricingSpecs.defaultInterestRate || 9.25}
          initialTenureMonths={selectedVehicle?.pricingSpecs.defaultTenureMonths || 60}
        />

        {/* Finance Advisory Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="bg-[#111111] border border-[#303030] p-6">
            <FileCheck2 className="w-5 h-5 text-[#C6A76B] mb-4" />
            <h2 className="font-display text-xl text-white">Tailored Structuring</h2>
            <p className="text-sm text-[#A5A5A5] mt-2 leading-relaxed">
              Corporate lease, balloon-residual, and standard reducing-balance facilities are coordinated
              through partner private banks subject to eligibility and credit review.
            </p>
          </div>

          <div className="bg-[#111111] border border-[#303030] p-6">
            <Shield className="w-5 h-5 text-[#C6A76B] mb-4" />
            <h2 className="font-display text-xl text-white">Documentation Readiness</h2>
            <p className="text-sm text-[#A5A5A5] mt-2 leading-relaxed">
              Our finance specialists assist with KYC, hypothecation coordination, RTO transfer
              paperwork, and comprehensive motor insurance structuring.
            </p>
          </div>

          <div className="bg-[#181818] border border-[#C6A76B]/40 p-6 flex flex-col justify-between">
            <div>
              <span className="font-nav text-[11px] tracking-[0.18em] uppercase text-[#C6A76B]">
                Personalised Quote
              </span>
              <h2 className="font-display text-xl text-white mt-2">
                Speak With KAIRO Finance Desk
              </h2>
              <p className="text-sm text-[#A5A5A5] mt-2 leading-relaxed">
                Request an illustrative sanction sheet tailored to your selected automobile and
                preferred tenure.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                openEnquiryModal({
                  mode: 'enquiry',
                  category: 'Buy a Car',
                  vehicleId: selectedVehicle?.id,
                  vehicleName: selectedVehicle
                    ? `${selectedVehicle.manufacturingYear} ${selectedVehicle.brand} ${selectedVehicle.model} ${selectedVehicle.variant}`
                    : undefined,
                })
              }
              className="mt-6 w-full py-3 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase transition-colors cursor-pointer"
            >
              Request Finance Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

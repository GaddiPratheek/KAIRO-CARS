import React from 'react';
import { Calendar } from 'lucide-react';
import { ShowroomsMapSection } from '../components/ShowroomsMapSection';
import { useKairo } from '../context/KairoContext';

export const ShowroomsPage: React.FC = () => {
  const { openEnquiryModal } = useKairo();

  return (
    <div className="min-h-screen bg-[#080808] pt-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pb-12 border-b border-[#303030]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <span className="font-nav text-xs tracking-[0.22em] uppercase text-[#C6A76B]">
              Private Viewing Salons
            </span>
            <h1 className="font-display text-3xl sm:text-5xl text-white mt-2">
              KAIRO Showrooms Across India
            </h1>
            <p className="text-sm text-[#A5A5A5] mt-3 max-w-2xl leading-relaxed">
              Experience our curated collection in an architectural private salon environment across
              Delhi-NCR, Mumbai, Hyderabad, and Bengaluru.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              openEnquiryModal({
                mode: 'enquiry',
                category: 'Buy a Car',
                vehicleName: 'Private Showroom Appointment',
              })
            }
            className="px-7 py-3.5 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase inline-flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Private Salon Visit</span>
          </button>
        </div>
      </div>

      <ShowroomsMapSection />
    </div>
  );
};

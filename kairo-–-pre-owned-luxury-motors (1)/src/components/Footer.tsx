import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { KAIRO_CONCIERGE_EMAIL, KAIRO_CONCIERGE_PHONE } from '../data/showroomsSeed';
import { useKairo } from '../context/KairoContext';

export const Footer: React.FC = () => {
  const { isAdmin } = useKairo();

  return (
    <footer className="bg-[#080808] border-t border-[#303030] text-[#A5A5A5]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div>
            <Link to="/" className="inline-block">
              <span className="font-display text-2xl tracking-[0.26em] text-white">KAIRO</span>
              <span className="block font-nav text-[10px] tracking-[0.26em] text-[#C6A76B] mt-1">
                PRE-OWNED LUXURY MOTORS
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-[#A5A5A5] mt-5">
              Where Luxury Meets Performance. Curating collector-grade pre-owned supercars, grand
              tourers, flagship sedans, and luxury SUVs with transparent documentation and
              concierge precision.
            </p>
          </div>

          {/* Marketplace Links */}
          <div>
            <h3 className="font-nav text-xs tracking-[0.18em] uppercase text-white mb-5">
              Marketplace
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/inventory" className="hover:text-[#E1C995] transition-colors">
                  Explore Inventory
                </Link>
              </li>
              <li>
                <Link to="/sell-your-car" className="hover:text-[#E1C995] transition-colors">
                  Sell Your Car
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-[#E1C995] transition-colors">
                  Compare Vehicles
                </Link>
              </li>
              <li>
                <Link to="/emi-calculator" className="hover:text-[#E1C995] transition-colors">
                  Finance &amp; EMI Calculator
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-[#E1C995] transition-colors">
                  Customer Account &amp; Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Atelier & Divisions */}
          <div>
            <h3 className="font-nav text-xs tracking-[0.18em] uppercase text-white mb-5">
              Atelier &amp; Divisions
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/services" className="hover:text-[#E1C995] transition-colors">
                  Modification, Servicing &amp; Detailing
                </Link>
              </li>
              <li>
                <Link to="/realty" className="hover:text-[#E1C995] transition-colors">
                  KAIRO Realty
                </Link>
              </li>
              <li>
                <Link to="/showrooms" className="hover:text-[#E1C995] transition-colors">
                  Showroom Lounges
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#E1C995] transition-colors">
                  About KAIRO &amp; Inspection Standards
                </Link>
              </li>
              <li>
                <Link
                  to={isAdmin ? '/admin' : '/account'}
                  className="hover:text-[#E1C995] transition-colors"
                >
                  {isAdmin ? 'Admin Console' : 'Administration Portal'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge Contact */}
          <div>
            <h3 className="font-nav text-xs tracking-[0.18em] uppercase text-white mb-5">
              Private Concierge
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#C6A76B] shrink-0 mt-0.5" />
                <a
                  href={`tel:${KAIRO_CONCIERGE_PHONE.replace(/\s+/g, '')}`}
                  className="hover:text-white transition-colors tabular-nums"
                >
                  {KAIRO_CONCIERGE_PHONE}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#C6A76B] shrink-0 mt-0.5" />
                <a
                  href={`mailto:${KAIRO_CONCIERGE_EMAIL}`}
                  className="hover:text-white transition-colors"
                >
                  {KAIRO_CONCIERGE_EMAIL}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C6A76B] shrink-0 mt-0.5" />
                <span>Delhi-NCR · Mumbai · Hyderabad · Bengaluru</span>
              </div>
            </div>
            <Link
              to="/contact"
              className="inline-block mt-6 px-5 py-2.5 border border-[#C6A76B] text-[#E1C995] hover:bg-[#C6A76B] hover:text-[#080808] font-nav text-[11px] tracking-[0.16em] uppercase transition-colors"
            >
              Contact Specialists
            </Link>
          </div>
        </div>

        <div className="border-t border-[#303030] mt-12 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[#A5A5A5]">
          <p>
            © {new Date().getFullYear()} KAIRO Pre-Owned Luxury Motors. All rights reserved.
          </p>
          <p className="max-w-2xl md:text-right">
            Sample vehicle prices, showroom locations, and finance figures are illustrative
            demonstration records editable via the KAIRO admin console and subject to physical
            inspection and verification.
          </p>
        </div>
      </div>
    </footer>
  );
};

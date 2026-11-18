/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { KairoProvider, useKairo } from './context/KairoContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { EnquiryModal } from './components/EnquiryModal';
import { CompareDock } from './components/CompareDock';
import { HomePage } from './pages/HomePage';
import { InventoryPage } from './pages/InventoryPage';
import { VehicleDetailsPage } from './pages/VehicleDetailsPage';
import { ComparePage } from './pages/ComparePage';
import { EmiCalculatorPage } from './pages/EmiCalculatorPage';
import { SellCarPage } from './pages/SellCarPage';
import { ServicesPage } from './pages/ServicesPage';
import { RealtyPage } from './pages/RealtyPage';
import { ShowroomsPage } from './pages/ShowroomsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AccountPage } from './pages/AccountPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const ScrollManager: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [pathname, hash]);

  return null;
};

const KairoShell: React.FC = () => {
  const { toastMessage } = useKairo();
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col">
      <ScrollManager />

      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/vehicle/:id" element={<VehicleDetailsPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/emi-calculator" element={<EmiCalculatorPage />} />
          <Route path="/sell-your-car" element={<SellCarPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/realty" element={<RealtyPage />} />
          <Route path="/showrooms" element={<ShowroomsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      <Footer />
      <CompareDock />
      <EnquiryModal />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-22 right-4 sm:right-6 z-50 max-w-sm bg-[#111111] border border-[#C6A76B] px-5 py-3.5 text-xs sm:text-sm text-white shadow-2xl"
        >
          <span className="font-nav text-[10px] tracking-[0.18em] uppercase text-[#C6A76B] block mb-0.5">
            KAIRO Concierge
          </span>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <KairoProvider>
          <KairoShell />
        </KairoProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

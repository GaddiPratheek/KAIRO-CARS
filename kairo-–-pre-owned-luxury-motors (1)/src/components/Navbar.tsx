import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, Menu, Search, ShieldCheck, User, X } from 'lucide-react';
import { useKairo } from '../context/KairoContext';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Buy Cars', to: '/inventory' },
  { label: 'Sell Your Car', to: '/sell-your-car' },
  { label: 'Collections', to: '/#collections' },
  { label: 'Services', to: '/services' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export const Navbar: React.FC = () => {
  const { wishlistIds, user, isAdmin, openEnquiryModal } = useKairo();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.hash]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    setSearchOpen(false);
    navigate(q ? `/inventory?q=${encodeURIComponent(q)}` : '/inventory');
  };

  const handleNavClick = (to: string) => {
    if (to === '/#collections') {
      if (location.pathname === '/') {
        document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/#collections');
      }
    }
  };

  const isTransparentTop = !scrolled && location.pathname === '/';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-200 ${
          isTransparentTop
            ? 'bg-gradient-to-b from-[#080808]/90 via-[#080808]/60 to-transparent border-b border-transparent'
            : 'bg-[#080808]/95 backdrop-blur-md border-b border-[#303030]'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-18 flex items-center justify-between gap-4 lg:gap-8">
          {/* Left: Brand Lockup */}
          <Link to="/" className="flex flex-col shrink-0 group focus:outline-none">
            <span className="font-display text-xl sm:text-2xl tracking-[0.26em] text-white group-hover:text-[#E1C995] transition-colors whitespace-nowrap">
              KAIRO
            </span>
            <span className="font-nav text-[9px] tracking-[0.28em] text-[#C6A76B] uppercase whitespace-nowrap">
              PRE-OWNED LUXURY MOTORS
            </span>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6 font-nav text-xs tracking-[0.14em] uppercase">
            {NAV_LINKS.map((item) => {
              if (item.to === '/#collections') {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleNavClick(item.to)}
                    className="whitespace-nowrap shrink-0 py-1 text-[#A5A5A5] hover:text-[#E1C995] transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                );
              }
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `whitespace-nowrap shrink-0 py-1 border-b transition-colors ${
                      isActive
                        ? 'text-[#E1C995] border-[#C6A76B]'
                        : 'text-[#A5A5A5] border-transparent hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search vehicles"
              className="w-10 h-10 flex items-center justify-center text-[#A5A5A5] hover:text-[#E1C995] transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            <Link
              to="/account#wishlist"
              aria-label="Saved wishlist vehicles"
              className="relative w-10 h-10 flex items-center justify-center text-[#A5A5A5] hover:text-[#E1C995] transition-colors"
            >
              <Heart className="w-4 h-4" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1.5 right-1 min-w-[16px] h-4 px-1 bg-[#C6A76B] text-[#080808] text-[10px] font-semibold flex items-center justify-center rounded-full tabular-nums">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            <Link
              to={isAdmin ? '/admin' : '/account'}
              aria-label={user ? 'Customer Account' : 'Sign In'}
              className="w-10 h-10 flex items-center justify-center text-[#A5A5A5] hover:text-[#E1C995] transition-colors"
              title={isAdmin ? 'Admin Dashboard' : user ? 'My Account' : 'Sign In'}
            >
              {isAdmin ? (
                <ShieldCheck className="w-4 h-4 text-[#C6A76B]" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </Link>

            <button
              type="button"
              onClick={() =>
                openEnquiryModal({
                  mode: 'enquiry',
                  category: 'Buy a Car',
                })
              }
              className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-[11px] font-semibold tracking-[0.15em] uppercase transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Enquire Now
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="xl:hidden w-10 h-10 flex items-center justify-center text-white hover:text-[#E1C995] cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Inline Quick Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="bg-[#111111] border-t border-b border-[#303030]"
            >
              <form
                onSubmit={handleSearchSubmit}
                className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center gap-3"
              >
                <Search className="w-4 h-4 text-[#C6A76B] shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by marque, model, variant, or stock ID (e.g., Ferrari, Ghost, Taycan)..."
                  className="w-full bg-transparent text-sm text-white placeholder-[#A5A5A5] focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-[11px] font-semibold tracking-[0.14em] uppercase whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-[#080808]/98 backdrop-blur-md pt-22 px-6 pb-8 overflow-y-auto xl:hidden"
          >
            <nav className="flex flex-col divide-y divide-[#303030] border-t border-b border-[#303030]">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => handleNavClick(item.to)}
                  className="py-4 font-nav text-sm tracking-[0.18em] uppercase text-white hover:text-[#E1C995] flex items-center justify-between"
                >
                  <span>{item.label}</span>
                </Link>
              ))}
              <Link
                to="/compare"
                className="py-4 font-nav text-sm tracking-[0.18em] uppercase text-white hover:text-[#E1C995]"
              >
                Compare Vehicles
              </Link>
              <Link
                to="/emi-calculator"
                className="py-4 font-nav text-sm tracking-[0.18em] uppercase text-white hover:text-[#E1C995]"
              >
                EMI Calculator
              </Link>
              <Link
                to="/realty"
                className="py-4 font-nav text-sm tracking-[0.18em] uppercase text-white hover:text-[#E1C995]"
              >
                KAIRO Realty
              </Link>
              <Link
                to="/account"
                className="py-4 font-nav text-sm tracking-[0.18em] uppercase text-white hover:text-[#E1C995]"
              >
                {user ? 'My Account & Wishlist' : 'Sign In / Account'}
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="py-4 font-nav text-sm tracking-[0.18em] uppercase text-[#C6A76B]"
                >
                  Admin Dashboard
                </Link>
              )}
            </nav>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openEnquiryModal({ mode: 'enquiry', category: 'Buy a Car' });
                }}
                className="w-full py-3.5 bg-[#C6A76B] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase cursor-pointer"
              >
                Enquire Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

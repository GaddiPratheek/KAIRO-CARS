import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, GitCompare, X } from 'lucide-react';
import { useKairo } from '../context/KairoContext';

export const CompareDock: React.FC = () => {
  const { compareIds, vehicles, toggleCompare, clearCompare } = useKairo();
  const location = useLocation();

  if (compareIds.length === 0 || location.pathname === '/compare') {
    return null;
  }

  const selectedVehicles = compareIds
    .map((id) => vehicles.find((v) => v.id === id))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));

  if (selectedVehicles.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-4xl bg-[#111111]/95 backdrop-blur-md border border-[#C6A76B]/60 shadow-2xl px-4 py-3 sm:px-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-[#C6A76B] font-nav text-xs uppercase tracking-[0.14em]">
              <GitCompare className="w-4 h-4" />
              <span className="tabular-nums">Compare ({selectedVehicles.length}/3)</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {selectedVehicles.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-2 bg-[#181818] border border-[#303030] px-2.5 py-1 text-xs text-white"
                >
                  <span className="truncate max-w-[140px]">
                    {v.brand} {v.model}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCompare(v.id)}
                    aria-label={`Remove ${v.model} from comparison`}
                    className="text-[#A5A5A5] hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
            <button
              type="button"
              onClick={clearCompare}
              className="text-xs font-nav uppercase tracking-wider text-[#A5A5A5] hover:text-white cursor-pointer"
            >
              Clear
            </button>
            <Link
              to="/compare"
              className="px-4 py-2 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-[11px] font-semibold tracking-[0.14em] uppercase inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Compare Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

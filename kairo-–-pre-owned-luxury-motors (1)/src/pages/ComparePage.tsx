import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GitCompare, Plus, Trash2, X } from 'lucide-react';
import { useKairo } from '../context/KairoContext';
import { formatINR, formatKm } from '../utils/formatters';
import type { FeatureEntry, Vehicle } from '../types/kairo';

export const ComparePage: React.FC = () => {
  const { vehicles, compareIds, toggleCompare, clearCompare } = useKairo();
  const [highlightDiffs, setHighlightDiffs] = useState(true);

  const selectedVehicles = useMemo(
    () =>
      compareIds
        .map((id) => vehicles.find((v) => v.id === id))
        .filter((v): v is Vehicle => Boolean(v)),
    [compareIds, vehicles]
  );

  const summarizeActiveFeatures = (obj: Record<string, FeatureEntry>) =>
    Object.values(obj)
      .filter((f) => f.included)
      .map((f) => f.label)
      .slice(0, 6)
      .join(', ') || 'Not Provided';

  const comparisonRows: { label: string; getValue: (v: Vehicle) => string }[] = [
    { label: 'Asking Price (Illustrative)', getValue: (v) => formatINR(v.askingPrice) },
    { label: 'Brand & Model', getValue: (v) => `${v.brand} ${v.model} ${v.variant}` },
    { label: 'Manufacturing Year', getValue: (v) => String(v.manufacturingYear) },
    { label: 'Kilometres Driven', getValue: (v) => formatKm(v.mileage) },
    { label: 'Engine Capacity / Type', getValue: (v) => `${v.engineSpecs.displacement} (${v.engineSpecs.engineType})` },
    { label: 'Maximum Horsepower', getValue: (v) => v.engineSpecs.horsepower },
    { label: 'Maximum Torque', getValue: (v) => v.engineSpecs.torque },
    { label: 'Acceleration (0–100 km/h)', getValue: (v) => v.engineSpecs.acceleration0To100 },
    { label: 'Top Speed', getValue: (v) => v.engineSpecs.topSpeed },
    { label: 'Fuel Type', getValue: (v) => v.fuelType },
    { label: 'Transmission', getValue: (v) => v.transmission },
    { label: 'Drive Type', getValue: (v) => v.drivetrainSpecs.driveType },
    { label: 'Seating Capacity', getValue: (v) => `${v.dimensionsSpecs.seatingCapacity} Persons` },
    { label: 'Boot Capacity', getValue: (v) => v.dimensionsSpecs.bootCapacity },
    {
      label: 'Safety Highlights',
      getValue: (v) => `${v.safetyFeatures.airbagsCount} · ${v.safetyFeatures.adasSummary}`,
    },
    {
      label: 'Interior Highlights',
      getValue: (v) => summarizeActiveFeatures(v.interiorFeatures as unknown as Record<string, FeatureEntry>),
    },
    {
      label: 'Exterior Highlights',
      getValue: (v) => summarizeActiveFeatures(v.exteriorFeatures as unknown as Record<string, FeatureEntry>),
    },
    {
      label: 'Infotainment & Audio',
      getValue: (v) =>
        `${v.infotainmentFeatures.premiumSoundSystem} (${v.infotainmentFeatures.speakerCount})`,
    },
  ];

  const availableToAdd = vehicles.filter((v) => !compareIds.includes(v.id));

  return (
    <div className="pt-24 pb-24 min-h-screen bg-[#080808]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[#303030]">
          <div>
            <span className="font-nav text-xs tracking-[0.22em] uppercase text-[#C6A76B]">
              Side-by-Side Specification Matrix
            </span>
            <h1 className="font-display text-3xl sm:text-5xl text-white mt-2">
              Compare Luxury Vehicles
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-xs text-[#A5A5A5] cursor-pointer">
              <input
                type="checkbox"
                checked={highlightDiffs}
                onChange={(e) => setHighlightDiffs(e.target.checked)}
                className="accent-[#C6A76B]"
              />
              <span>Highlight Differences</span>
            </label>

            {selectedVehicles.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="px-4 py-2 border border-[#303030] hover:border-[#C6A76B] text-xs font-nav uppercase tracking-wider text-[#A5A5A5] hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Comparison</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Comparison Slots */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((slotIdx) => {
            const v = selectedVehicles[slotIdx];
            if (v) {
              return (
                <div key={v.id} className="bg-[#181818] border border-[#303030] p-5 relative">
                  <button
                    type="button"
                    onClick={() => toggleCompare(v.id)}
                    aria-label={`Remove ${v.model}`}
                    className="absolute top-3 right-3 w-8 h-8 bg-[#080808]/90 border border-[#303030] hover:border-[#C6A76B] text-white flex items-center justify-center cursor-pointer z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="aspect-[4/3] bg-[#111111] overflow-hidden mb-4">
                    <img
                      src={v.primaryImage}
                      alt={`${v.brand} ${v.model}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-nav text-[11px] uppercase tracking-[0.16em] text-[#C6A76B]">
                    {v.brand} · {v.manufacturingYear}
                  </p>
                  <h2 className="font-display text-xl text-white mt-1">{v.model}</h2>
                  <p className="text-xs text-[#A5A5A5]">{v.variant}</p>
                  <p className="font-mono-tabular text-lg text-[#E1C995] font-semibold mt-3">
                    {formatINR(v.askingPrice)}
                  </p>
                  <Link
                    to={`/vehicle/${v.id}`}
                    className="mt-4 inline-flex items-center gap-1.5 font-nav text-[11px] uppercase tracking-wider text-white hover:text-[#E1C995]"
                  >
                    <span>View Full Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            }

            return (
              <div
                key={`slot-${slotIdx}`}
                className="bg-[#111111] border border-dashed border-[#303030] p-6 flex flex-col justify-center items-center text-center min-h-[280px]"
              >
                <Plus className="w-8 h-8 text-[#C6A76B] mb-3" />
                <p className="font-display text-lg text-white">Add Vehicle #{slotIdx + 1}</p>
                <p className="text-xs text-[#A5A5A5] mt-1 mb-4">
                  Select any vehicle from the KAIRO showcase
                </p>
                <select
                  aria-label={`Select vehicle for comparison slot ${slotIdx + 1}`}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) toggleCompare(e.target.value);
                  }}
                  className="w-full max-w-xs bg-[#181818] border border-[#303030] px-3 py-2.5 text-xs text-white focus:border-[#C6A76B] focus:outline-none"
                >
                  <option value="">Choose an automobile...</option>
                  {availableToAdd.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.manufacturingYear} {item.brand} {item.model} ({formatINR(item.askingPrice)})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        {selectedVehicles.length > 0 ? (
          <div className="mt-10 overflow-x-auto border border-[#303030]">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="bg-[#111111] border-b border-[#303030]">
                  <th className="p-4 font-nav text-xs uppercase tracking-[0.16em] text-[#C6A76B] w-64">
                    Specification
                  </th>
                  {selectedVehicles.map((v) => (
                    <th key={v.id} className="p-4 font-display text-base text-white">
                      {v.brand} {v.model}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242424] text-sm">
                {comparisonRows.map((row) => {
                  const vals = selectedVehicles.map((v) => row.getValue(v));
                  const hasDiff = vals.length > 1 && new Set(vals).size > 1;
                  return (
                    <tr
                      key={row.label}
                      className={
                        highlightDiffs && hasDiff ? 'bg-[#C6A76B]/[0.07]' : 'bg-[#080808]'
                      }
                    >
                      <td className="p-4 text-[#A5A5A5] font-medium align-top">
                        {row.label}
                        {highlightDiffs && hasDiff && (
                          <span className="block text-[10px] font-nav uppercase tracking-wider text-[#C6A76B] mt-0.5">
                            Differs
                          </span>
                        )}
                      </td>
                      {vals.map((val, i) => (
                        <td
                          key={`${row.label}-${i}`}
                          className="p-4 text-white tabular-nums align-top"
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-10 bg-[#111111] border border-[#303030] p-10 text-center">
            <GitCompare className="w-8 h-8 text-[#C6A76B] mx-auto mb-3" />
            <p className="text-sm text-[#A5A5A5]">
              Select up to 3 vehicles above or from the inventory grid to compare specifications
              side by side.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

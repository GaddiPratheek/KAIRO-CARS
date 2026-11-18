import React, { useEffect, useMemo, useState } from 'react';
import { calculateReducingBalanceEmi, formatINR } from '../utils/formatters';

interface EmiCalculatorWidgetProps {
  initialPrice?: number;
  initialDownPaymentPercent?: number;
  initialRate?: number;
  initialTenureMonths?: number;
  compact?: boolean;
}

export const EmiCalculatorWidget: React.FC<EmiCalculatorWidgetProps> = ({
  initialPrice = 11500000,
  initialDownPaymentPercent = 20,
  initialRate = 9.25,
  initialTenureMonths = 60,
  compact = false,
}) => {
  const [vehiclePrice, setVehiclePrice] = useState(initialPrice);
  const [downPayment, setDownPayment] = useState(
    Math.round((initialPrice * initialDownPaymentPercent) / 100)
  );
  const [interestRate, setInterestRate] = useState(initialRate);
  const [tenureMonths, setTenureMonths] = useState(initialTenureMonths);

  useEffect(() => {
    setVehiclePrice(initialPrice);
    setDownPayment(Math.round((initialPrice * initialDownPaymentPercent) / 100));
  }, [initialPrice, initialDownPaymentPercent]);

  const result = useMemo(
    () => calculateReducingBalanceEmi(vehiclePrice, downPayment, interestRate, tenureMonths),
    [vehiclePrice, downPayment, interestRate, tenureMonths]
  );

  const principalShare =
    result.totalRepayment > 0
      ? Math.round((result.principal / result.totalRepayment) * 100)
      : 100;

  return (
    <div className="bg-[#181818] border border-[#303030] p-6 sm:p-8">
      <div className={`grid grid-cols-1 ${compact ? 'lg:grid-cols-2' : 'lg:grid-cols-12'} gap-8`}>
        {/* Controls */}
        <div className={`${compact ? '' : 'lg:col-span-7'} space-y-6`}>
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="font-nav text-xs uppercase tracking-[0.14em] text-[#A5A5A5]">
                Vehicle Asking Price
              </label>
              <span className="font-mono-tabular text-sm text-white font-semibold">
                {formatINR(vehiclePrice)}
              </span>
            </div>
            <input
              type="range"
              min={2000000}
              max={60000000}
              step={100000}
              value={vehiclePrice}
              onChange={(e) => {
                const nextPrice = Number(e.target.value);
                setVehiclePrice(nextPrice);
                if (downPayment > nextPrice * 0.85) {
                  setDownPayment(Math.round(nextPrice * 0.2));
                }
              }}
              className="w-full accent-[#C6A76B] cursor-pointer"
            />
            <div className="mt-2">
              <input
                type="number"
                min={500000}
                step={50000}
                value={vehiclePrice}
                onChange={(e) => setVehiclePrice(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-[#111111] border border-[#303030] px-3 py-2 text-sm font-mono-tabular text-white focus:border-[#C6A76B] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="font-nav text-xs uppercase tracking-[0.14em] text-[#A5A5A5]">
                Down Payment ({vehiclePrice > 0 ? Math.round((downPayment / vehiclePrice) * 100) : 0}%)
              </label>
              <span className="font-mono-tabular text-sm text-white font-semibold">
                {formatINR(downPayment)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(0, Math.round(vehiclePrice * 0.85))}
              step={50000}
              value={Math.min(downPayment, vehiclePrice)}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full accent-[#C6A76B] cursor-pointer"
            />
            <div className="mt-2">
              <input
                type="number"
                min={0}
                max={vehiclePrice}
                step={50000}
                value={downPayment}
                onChange={(e) =>
                  setDownPayment(Math.min(vehiclePrice, Math.max(0, Number(e.target.value) || 0)))
                }
                className="w-full bg-[#111111] border border-[#303030] px-3 py-2 text-sm font-mono-tabular text-white focus:border-[#C6A76B] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="font-nav text-xs uppercase tracking-[0.14em] text-[#A5A5A5]">
                  Interest Rate (p.a.)
                </label>
                <span className="font-mono-tabular text-sm text-white font-semibold">
                  {interestRate.toFixed(2)}%
                </span>
              </div>
              <input
                type="range"
                min={6.5}
                max={15}
                step={0.25}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-[#C6A76B] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="font-nav text-xs uppercase tracking-[0.14em] text-[#A5A5A5]">
                  Loan Duration
                </label>
                <span className="font-mono-tabular text-sm text-white font-semibold">
                  {tenureMonths} Months ({(tenureMonths / 12).toFixed(1)} Yrs)
                </span>
              </div>
              <input
                type="range"
                min={12}
                max={84}
                step={6}
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                className="w-full accent-[#C6A76B] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div
          className={`${
            compact ? '' : 'lg:col-span-5'
          } bg-[#111111] border border-[#303030] p-6 flex flex-col justify-between`}
        >
          <div>
            <span className="font-nav text-[11px] uppercase tracking-[0.18em] text-[#C6A76B]">
              Estimated Monthly EMI
            </span>
            <div className="font-mono-tabular text-3xl sm:text-4xl font-semibold text-[#E1C995] mt-2">
              {formatINR(result.monthlyEmi)}
              <span className="text-sm text-[#A5A5A5] font-normal"> / mo</span>
            </div>

            {/* Visual Ratio Bar */}
            <div className="mt-6">
              <div className="h-2 w-full bg-[#303030] overflow-hidden flex">
                <div
                  className="bg-[#C6A76B] h-full transition-all duration-300"
                  style={{ width: `${principalShare}%` }}
                />
                <div
                  className="bg-[#525252] h-full transition-all duration-300"
                  style={{ width: `${100 - principalShare}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#A5A5A5] mt-2">
                <span>Principal ({principalShare}%)</span>
                <span>Interest ({100 - principalShare}%)</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#303030] space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#A5A5A5]">Loan Principal Amount</span>
                <span className="font-mono-tabular text-white">{formatINR(result.principal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A5A5A5]">Total Interest Payable</span>
                <span className="font-mono-tabular text-white">
                  {formatINR(result.totalInterest)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#303030] font-semibold">
                <span className="text-white">Total Repayment</span>
                <span className="font-mono-tabular text-[#E1C995]">
                  {formatINR(result.totalRepayment)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#A5A5A5] mt-6 leading-relaxed">
            Calculated using the standard reducing-balance EMI formula. Figures shown are
            illustrative estimates; actual interest rates, processing fees, and sanctioned loan
            terms depend on lender approval and customer credit underwriting.
          </p>
        </div>
      </div>
    </div>
  );
};

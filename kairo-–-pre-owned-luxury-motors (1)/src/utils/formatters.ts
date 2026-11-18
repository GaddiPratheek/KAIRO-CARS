import type { Vehicle } from '../types/kairo';

/**
 * Format numeric rupee amount into standard Indian numbering format (e.g. ₹1,15,00,000)
 */
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return 'Not Provided';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/**
 * Format compact Indian currency label (e.g. ₹1.15 Cr / ₹49.00 L)
 */
export function formatCompactINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return 'Not Provided';
  }
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return formatINR(amount);
}

export function formatKm(km: number | null | undefined): string {
  if (km === null || km === undefined || Number.isNaN(km)) {
    return 'Not Provided';
  }
  return `${new Intl.NumberFormat('en-IN').format(km)} km`;
}

export function displayOrFallback(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return 'Not Provided';
  }
  return String(value);
}

/**
 * Standard reducing-balance EMI calculation
 * EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]
 */
export interface EmiCalculationResult {
  principal: number;
  monthlyEmi: number;
  totalInterest: number;
  totalRepayment: number;
}

export function calculateReducingBalanceEmi(
  vehiclePrice: number,
  downPayment: number,
  annualRatePercent: number,
  tenureMonths: number
): EmiCalculationResult {
  const principal = Math.max(0, vehiclePrice - downPayment);
  if (principal <= 0 || tenureMonths <= 0) {
    return { principal: 0, monthlyEmi: 0, totalInterest: 0, totalRepayment: 0 };
  }

  if (annualRatePercent <= 0) {
    const monthlyEmi = principal / tenureMonths;
    return {
      principal,
      monthlyEmi,
      totalInterest: 0,
      totalRepayment: principal,
    };
  }

  const monthlyRate = annualRatePercent / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const monthlyEmi = (principal * monthlyRate * factor) / (factor - 1);
  const totalRepayment = monthlyEmi * tenureMonths;
  const totalInterest = Math.max(0, totalRepayment - principal);

  return {
    principal: Math.round(principal),
    monthlyEmi: Math.round(monthlyEmi),
    totalInterest: Math.round(totalInterest),
    totalRepayment: Math.round(totalRepayment),
  };
}

/**
 * Generate a downloadable specification dossier file for a vehicle
 */
export function downloadVehicleBrochure(vehicle: Vehicle): void {
  const htmlContent = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>KAIRO Vehicle Dossier — ${vehicle.brand} ${vehicle.model} (${vehicle.stockId})</title>
<style>
  body { font-family: Georgia, serif; background: #080808; color: #ffffff; margin: 0; padding: 48px; line-height: 1.6; }
  .header { border-bottom: 1px solid #C6A76B; padding-bottom: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; }
  .brand { font-size: 28px; letter-spacing: 0.25em; color: #C6A76B; margin: 0; }
  .sub { font-family: sans-serif; font-size: 11px; letter-spacing: 0.2em; color: #A5A5A5; margin-top: 4px; }
  .title { font-size: 34px; margin: 0 0 8px 0; }
  .price { font-family: monospace; font-size: 24px; color: #E1C995; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px 32px; margin-bottom: 32px; }
  .section-title { font-family: sans-serif; font-size: 12px; letter-spacing: 0.18em; color: #C6A76B; text-transform: uppercase; border-bottom: 1px solid #303030; padding-bottom: 8px; margin: 32px 0 16px; }
  .row { display: flex; justify-content: space-between; border-bottom: 1px solid #1e1e1e; padding: 8px 0; font-family: sans-serif; font-size: 13px; }
  .label { color: #A5A5A5; }
  .val { color: #FFFFFF; font-weight: 500; text-align: right; }
  .note { font-family: sans-serif; font-size: 11px; color: #A5A5A5; margin-top: 40px; border-top: 1px solid #303030; padding-top: 16px; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <p class="brand">KAIRO</p>
      <div class="sub">PRE-OWNED LUXURY MOTORS · DRIVE THE EXTRAORDINARY</div>
    </div>
    <div style="text-align:right;">
      <div class="sub">STOCK ID: ${vehicle.stockId}</div>
      <div class="price">${formatINR(vehicle.askingPrice)}</div>
    </div>
  </div>
  <h1 class="title">${vehicle.manufacturingYear} ${vehicle.brand} ${vehicle.model} ${vehicle.variant}</h1>
  <p style="font-family:sans-serif; color:#A5A5A5; max-width:760px;">${vehicle.description}</p>

  <div class="section-title">Vehicle Overview</div>
  <div class="grid">
    <div class="row"><span class="label">Manufacturing / Registration Year</span><span class="val">${vehicle.manufacturingYear} / ${vehicle.registrationYear}</span></div>
    <div class="row"><span class="label">Kilometres Driven</span><span class="val">${formatKm(vehicle.mileage)}</span></div>
    <div class="row"><span class="label">Fuel / Transmission</span><span class="val">${vehicle.fuelType} · ${vehicle.transmission}</span></div>
    <div class="row"><span class="label">Exterior / Interior</span><span class="val">${vehicle.exteriorColour} / ${vehicle.interiorColour}</span></div>
    <div class="row"><span class="label">Registration State</span><span class="val">${vehicle.registrationState}</span></div>
    <div class="row"><span class="label">Availability Status</span><span class="val">${vehicle.availability}</span></div>
  </div>

  <div class="section-title">Powertrain &amp; Performance</div>
  <div class="grid">
    <div class="row"><span class="label">Engine</span><span class="val">${vehicle.engineSpecs.engineType} (${vehicle.engineSpecs.displacement})</span></div>
    <div class="row"><span class="label">Power / Torque</span><span class="val">${vehicle.engineSpecs.horsepower} / ${vehicle.engineSpecs.torque}</span></div>
    <div class="row"><span class="label">0–100 km/h</span><span class="val">${vehicle.engineSpecs.acceleration0To100}</span></div>
    <div class="row"><span class="label">Top Speed</span><span class="val">${vehicle.engineSpecs.topSpeed}</span></div>
    <div class="row"><span class="label">Drivetrain</span><span class="val">${vehicle.drivetrainSpecs.driveType}</span></div>
    <div class="row"><span class="label">Suspension</span><span class="val">${vehicle.drivetrainSpecs.suspensionSystem}</span></div>
  </div>

  <div class="section-title">Dimensions &amp; Ownership</div>
  <div class="grid">
    <div class="row"><span class="label">L × W × H</span><span class="val">${vehicle.dimensionsSpecs.length} × ${vehicle.dimensionsSpecs.width} × ${vehicle.dimensionsSpecs.height}</span></div>
    <div class="row"><span class="label">Wheelbase / Boot</span><span class="val">${vehicle.dimensionsSpecs.wheelbase} / ${vehicle.dimensionsSpecs.bootCapacity}</span></div>
    <div class="row"><span class="label">Ownership History</span><span class="val">${vehicle.documentationSpecs.ownershipHistory}</span></div>
    <div class="row"><span class="label">Inspection Report</span><span class="val">${vehicle.documentationSpecs.inspectionReportStatus}</span></div>
  </div>

  <div class="note">
    Generated by KAIRO Pre-Owned Luxury Motors. Sample inventory prices and finance figures are illustrative estimates subject to physical verification and showroom confirmation.
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `KAIRO_${vehicle.brand}_${vehicle.model}_${vehicle.stockId}.html`.replace(/\s+/g, '_');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

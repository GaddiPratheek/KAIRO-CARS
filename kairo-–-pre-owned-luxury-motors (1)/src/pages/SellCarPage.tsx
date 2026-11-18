import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  ImagePlus,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useKairo } from '../context/KairoContext';
import { ALL_BRAND_NAMES, getModelsForBrand } from '../data/brandsAndModels';
import { submitSellCarRequest } from '../services/kairoDb';
import { formatINR } from '../utils/formatters';

const sellCarSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name'),
  mobile: z.string().min(8, 'Please enter a valid mobile number'),
  email: z.string().email('Please enter a valid email address'),
  brand: z.string().min(1, 'Please select the car brand'),
  model: z.string().min(1, 'Please select or enter the model'),
  variant: z.string().min(1, 'Please enter the variant or trim'),
  manufacturingYear: z
    .number()
    .int()
    .min(1980, 'Enter a valid year')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the distant future'),
  registrationYear: z
    .number()
    .int()
    .min(1980, 'Enter a valid registration year')
    .max(new Date().getFullYear() + 1),
  mileage: z.number().min(0, 'Kilometres cannot be negative'),
  fuelType: z.string().min(1, 'Select fuel type'),
  transmission: z.string().min(1, 'Select transmission'),
  exteriorColour: z.string().min(1, 'Enter exterior colour'),
  previousOwners: z.number().int().min(1, 'Minimum 1 owner').max(10),
  expectedPrice: z.number().min(100000, 'Enter expected price in INR'),
  location: z.string().min(2, 'Please enter your city / location'),
  description: z.string().max(2000).optional(),
});

type SellCarFormValues = z.infer<typeof sellCarSchema>;

export const SellCarPage: React.FC = () => {
  const { user, customerProfile, showToast } = useKairo();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{
    referenceId: string;
    brand: string;
    model: string;
    expectedPrice: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SellCarFormValues>({
    resolver: zodResolver(sellCarSchema),
    defaultValues: {
      fullName: customerProfile?.displayName || user?.displayName || '',
      email: customerProfile?.email || user?.email || '',
      mobile: customerProfile?.phone || '',
      brand: 'Mercedes-Benz',
      model: 'S-Class',
      variant: '',
      manufacturingYear: 2022,
      registrationYear: 2022,
      mileage: 12000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      exteriorColour: '',
      previousOwners: 1,
      expectedPrice: 8500000,
      location: customerProfile?.city || 'Mumbai',
      description: '',
    },
  });

  const watchedBrand = watch('brand');
  const brandModels = useMemo(() => getModelsForBrand(watchedBrand), [watchedBrand]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files || []);
    if (incoming.length === 0) return;
    const combined = [...selectedFiles, ...incoming].slice(0, 6);
    setSelectedFiles(combined);
    const urls = combined.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => {
      prev.forEach((u) => URL.revokeObjectURL(u));
      return urls;
    });
  };

  const removeFile = (index: number) => {
    const nextFiles = selectedFiles.filter((_, idx) => idx !== index);
    setSelectedFiles(nextFiles);
    setPreviewUrls((prev) => {
      if (prev[index]) URL.revokeObjectURL(prev[index]);
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const onSubmit = async (values: SellCarFormValues) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitSellCarRequest(
        {
          fullName: values.fullName,
          mobile: values.mobile,
          email: values.email,
          brand: values.brand,
          model: values.model,
          variant: values.variant,
          manufacturingYear: values.manufacturingYear,
          registrationYear: values.registrationYear,
          mileage: values.mileage,
          fuelType: values.fuelType,
          transmission: values.transmission,
          exteriorColour: values.exteriorColour,
          previousOwners: values.previousOwners,
          expectedPrice: values.expectedPrice,
          location: values.location,
          description: values.description || '',
        },
        selectedFiles,
        user?.uid || null
      );
      setSubmittedResult({
        referenceId: res.referenceId,
        brand: values.brand,
        model: values.model,
        expectedPrice: values.expectedPrice,
      });
      showToast(`Valuation request ${res.referenceId} received.`);
      reset();
      setSelectedFiles([]);
      setPreviewUrls([]);
    } catch (err) {
      console.error(err);
      setSubmitError('Unable to submit your valuation request right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Hero / Header */}
        <div className="border-b border-[#303030] pb-10 mb-12">
          <span className="font-nav text-xs tracking-[0.22em] uppercase text-[#C6A76B]">
            KAIRO Acquisition &amp; Consignment Desk
          </span>
          <h1 className="font-display text-3xl sm:text-5xl text-white mt-3 max-w-4xl">
            YOUR CAR DESERVES THE RIGHT BUYER
          </h1>
          <p className="text-sm sm:text-base text-[#A5A5A5] mt-4 max-w-2xl leading-relaxed">
            Submit your luxury or performance automobile for a private acquisition quote or bespoke
            consignment placement across KAIRO&apos;s verified collector network.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
            <div className="bg-[#111111] border border-[#303030] p-5 flex items-start gap-3.5">
              <Sparkles className="w-5 h-5 text-[#C6A76B] shrink-0 mt-0.5" />
              <div>
                <h2 className="font-display text-lg text-white">Direct Acquisition or Consignment</h2>
                <p className="text-xs text-[#A5A5A5] mt-1 leading-relaxed">
                  Choose immediate outright purchase or curated showroom consignment representation.
                </p>
              </div>
            </div>
            <div className="bg-[#111111] border border-[#303030] p-5 flex items-start gap-3.5">
              <ClipboardCheck className="w-5 h-5 text-[#C6A76B] shrink-0 mt-0.5" />
              <div>
                <h2 className="font-display text-lg text-white">On-Site Technical Appraisal</h2>
                <p className="text-xs text-[#A5A5A5] mt-1 leading-relaxed">
                  Paint-depth, diagnostic scan, and service dossier verification arranged at your
                  residence or showroom.
                </p>
              </div>
            </div>
            <div className="bg-[#111111] border border-[#303030] p-5 flex items-start gap-3.5">
              <ShieldCheck className="w-5 h-5 text-[#C6A76B] shrink-0 mt-0.5" />
              <div>
                <h2 className="font-display text-lg text-white">Transparent RTO &amp; Settlement</h2>
                <p className="text-xs text-[#A5A5A5] mt-1 leading-relaxed">
                  Structured bank settlement and documented ownership transfer coordination.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form or Confirmation */}
        {submittedResult ? (
          <div className="max-w-2xl mx-auto bg-[#111111] border border-[#C6A76B] p-8 sm:p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-[#C6A76B] mx-auto mb-4" />
            <span className="font-nav text-xs tracking-[0.2em] uppercase text-[#C6A76B]">
              Valuation Request Logged
            </span>
            <h2 className="font-display text-3xl text-white mt-2">
              {submittedResult.brand} {submittedResult.model}
            </h2>
            <p className="text-sm text-[#A5A5A5] mt-3">
              Your KAIRO Valuation Reference ID is{' '}
              <span className="font-mono-tabular text-[#E1C995] font-semibold">
                {submittedResult.referenceId}
              </span>
              . Expected valuation noted at{' '}
              <span className="font-mono-tabular text-white">
                {formatINR(submittedResult.expectedPrice)}
              </span>
              .
            </p>
            <p className="text-xs text-[#A5A5A5] mt-3">
              Our acquisition specialist will review your vehicle dossier and reach out to arrange an
              in-person appraisal.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setSubmittedResult(null)}
                className="px-6 py-3 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase cursor-pointer"
              >
                Submit Another Vehicle
              </button>
              <Link
                to={user ? '/account' : '/inventory'}
                className="px-6 py-3 border border-[#303030] hover:border-[#C6A76B] text-white font-nav text-xs tracking-[0.16em] uppercase inline-flex items-center gap-2"
              >
                <span>{user ? 'Track Request in Account' : 'Explore Showcase'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-[#111111] border border-[#303030] p-6 sm:p-10 space-y-10"
          >
            {/* 1. Owner Contact Details */}
            <div>
              <h2 className="font-display text-2xl text-white border-b border-[#303030] pb-3 mb-6">
                1. Owner Contact Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    {...register('fullName')}
                    placeholder="Owner full name"
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-400 mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Mobile Number *
                  </label>
                  <input
                    {...register('mobile')}
                    placeholder="+91 98XXX XXXXX"
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                  />
                  {errors.mobile && (
                    <p className="text-xs text-red-400 mt-1">{errors.mobile.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="owner@domain.com"
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Vehicle Specifications */}
            <div>
              <h2 className="font-display text-2xl text-white border-b border-[#303030] pb-3 mb-6">
                2. Vehicle Identification &amp; Specifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Car Brand *
                  </label>
                  <select
                    {...register('brand')}
                    onChange={(e) => {
                      const nextBrand = e.target.value;
                      setValue('brand', nextBrand);
                      const models = getModelsForBrand(nextBrand);
                      setValue('model', models[0] || '');
                    }}
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                  >
                    {ALL_BRAND_NAMES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  {errors.brand && (
                    <p className="text-xs text-red-400 mt-1">{errors.brand.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Car Model *
                  </label>
                  <select
                    {...register('model')}
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                  >
                    {brandModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  {errors.model && (
                    <p className="text-xs text-red-400 mt-1">{errors.model.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Variant / Trim *
                  </label>
                  <input
                    {...register('variant')}
                    placeholder="e.g. S580 4MATIC / Competition / SV"
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                  />
                  {errors.variant && (
                    <p className="text-xs text-red-400 mt-1">{errors.variant.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Manufacturing Year *
                  </label>
                  <input
                    {...register('manufacturingYear', { valueAsNumber: true })}
                    type="number"
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm font-mono-tabular text-white focus:border-[#C6A76B] focus:outline-none"
                  />
                  {errors.manufacturingYear && (
                    <p className="text-xs text-red-400 mt-1">{errors.manufacturingYear.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Registration Year *
                  </label>
                  <input
                    {...register('registrationYear', { valueAsNumber: true })}
                    type="number"
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm font-mono-tabular text-white focus:border-[#C6A76B] focus:outline-none"
                  />
                  {errors.registrationYear && (
                    <p className="text-xs text-red-400 mt-1">{errors.registrationYear.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Kilometres Driven *
                  </label>
                  <input
                    {...register('mileage', { valueAsNumber: true })}
                    type="number"
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm font-mono-tabular text-white focus:border-[#C6A76B] focus:outline-none"
                  />
                  {errors.mileage && (
                    <p className="text-xs text-red-400 mt-1">{errors.mileage.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Fuel Type *
                  </label>
                  <select
                    {...register('fuelType')}
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Transmission *
                  </label>
                  <select
                    {...register('transmission')}
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Dual-Clutch (DCT / PDK)">Dual-Clutch (DCT / PDK)</option>
                    <option value="Single-Speed Electric">Single-Speed Electric</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Exterior Colour *
                  </label>
                  <input
                    {...register('exteriorColour')}
                    placeholder="e.g. Obsidian Black Metallic"
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                  />
                  {errors.exteriorColour && (
                    <p className="text-xs text-red-400 mt-1">{errors.exteriorColour.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Number of Previous Owners *
                  </label>
                  <input
                    {...register('previousOwners', { valueAsNumber: true })}
                    type="number"
                    min={1}
                    max={10}
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm font-mono-tabular text-white focus:border-[#C6A76B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Expected Price (INR) *
                  </label>
                  <input
                    {...register('expectedPrice', { valueAsNumber: true })}
                    type="number"
                    step={50000}
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm font-mono-tabular text-white focus:border-[#C6A76B] focus:outline-none"
                  />
                  {errors.expectedPrice && (
                    <p className="text-xs text-red-400 mt-1">{errors.expectedPrice.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Location / City *
                  </label>
                  <input
                    {...register('location')}
                    placeholder="e.g. Mumbai, Delhi-NCR, Hyderabad, Bengaluru"
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                  />
                  {errors.location && (
                    <p className="text-xs text-red-400 mt-1">{errors.location.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Photos & Condition Notes */}
            <div>
              <h2 className="font-display text-2xl text-white border-b border-[#303030] pb-3 mb-6">
                3. Photographs &amp; Condition Summary
              </h2>

              <div className="mb-6">
                <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-2">
                  Upload Vehicle Photographs (Up to 6 Images)
                </label>
                <label className="border border-dashed border-[#303030] hover:border-[#C6A76B] bg-[#181818] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
                  <ImagePlus className="w-7 h-7 text-[#C6A76B] mb-2" />
                  <span className="text-sm text-white">
                    Click to select exterior, interior, and odometer photographs
                  </span>
                  <span className="text-xs text-[#A5A5A5] mt-1">
                    JPG, PNG, or WEBP accepted · Maximum 6 files
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-4">
                    {previewUrls.map((url, idx) => (
                      <div key={url} className="relative border border-[#303030] aspect-square bg-[#080808]">
                        <img
                          src={url}
                          alt={`Vehicle upload ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          aria-label="Remove uploaded image"
                          className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/80 text-white hover:text-red-400 flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                  Vehicle Description, Service History &amp; Factory Options
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Share authorized service history, PPF/ceramic coating, warranty status, factory packages, or special specifications..."
                  className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                />
              </div>
            </div>

            {submitError && <p className="text-xs text-red-400">{submitError}</p>}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#303030]">
              <p className="text-xs text-[#A5A5A5]">
                Every submission receives a tracked KAIRO valuation reference ID and confidential review.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="px-10 py-4 bg-[#C6A76B] hover:bg-[#E1C995] disabled:opacity-50 text-[#080808] font-nav text-xs font-semibold tracking-[0.18em] uppercase transition-colors cursor-pointer shrink-0"
              >
                {submitting ? 'Submitting Valuation Dossier...' : 'Submit For Valuation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

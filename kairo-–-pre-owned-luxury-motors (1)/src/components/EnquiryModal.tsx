import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';
import { useKairo } from '../context/KairoContext';
import {
  submitEnquiry,
  submitServiceRequest,
  submitTestDriveRequest,
} from '../services/kairoDb';

const modalSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email address'),
  mobile: z.string().min(8, 'Please enter a valid mobile number'),
  category: z.string().min(1, 'Please select an enquiry category'),
  vehicleName: z.string().optional(),
  showroomCity: z.string().optional(),
  preferredDate: z.string().optional(),
  message: z.string().max(1500).optional(),
});

type ModalFormValues = z.infer<typeof modalSchema>;

export const EnquiryModal: React.FC = () => {
  const {
    enquiryModal,
    closeEnquiryModal,
    user,
    customerProfile,
    showrooms,
    vehicles,
    showToast,
  } = useKairo();

  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const mode = enquiryModal.mode || 'enquiry';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ModalFormValues>({
    resolver: zodResolver(modalSchema),
  });

  useEffect(() => {
    if (enquiryModal.open) {
      setSubmittedRef(null);
      setSubmitError(null);
      reset({
        fullName: customerProfile?.displayName || user?.displayName || '',
        email: customerProfile?.email || user?.email || '',
        mobile: customerProfile?.phone || '',
        category:
          enquiryModal.category ||
          (mode === 'service' ? enquiryModal.serviceCategory || 'Car Servicing' : 'Buy a Car'),
        vehicleName: enquiryModal.vehicleName || '',
        showroomCity: showrooms[0]?.city || 'DELHI-NCR',
        preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        message: '',
      });
    }
  }, [enquiryModal, customerProfile, user, mode, showrooms, reset]);

  const onSubmit = async (values: ModalFormValues) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const uid = user?.uid || null;
      let refId = '';

      if (mode === 'test-drive' && enquiryModal.vehicleId) {
        refId = await submitTestDriveRequest(
          {
            vehicleId: enquiryModal.vehicleId,
            vehicleName: values.vehicleName || enquiryModal.vehicleName || 'Selected Vehicle',
            fullName: values.fullName,
            email: values.email,
            mobile: values.mobile,
            showroomCity: values.showroomCity,
            preferredDate: values.preferredDate || new Date().toISOString().split('T')[0],
            notes: values.message,
          },
          uid
        );
      } else if (mode === 'service') {
        refId = await submitServiceRequest(
          {
            serviceCategory: enquiryModal.serviceCategory || 'Car Servicing',
            serviceName: enquiryModal.serviceName || values.category,
            vehicleBrandModel: values.vehicleName,
            fullName: values.fullName,
            email: values.email,
            mobile: values.mobile,
            preferredDate: values.preferredDate,
            notes: values.message,
          },
          uid
        );
      } else {
        refId = await submitEnquiry(
          {
            fullName: values.fullName,
            email: values.email,
            mobile: values.mobile,
            category: values.category,
            vehicleId: enquiryModal.vehicleId,
            vehicleName: values.vehicleName,
            message: values.message,
          },
          uid
        );
      }

      setSubmittedRef(refId);
      showToast(`Request ${refId} registered with KAIRO Concierge.`);
    } catch (err) {
      console.error(err);
      setSubmitError('Unable to submit your request right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {enquiryModal.open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeEnquiryModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-[#111111] border border-[#303030] p-6 sm:p-8 relative my-8"
          >
            <button
              type="button"
              onClick={closeEnquiryModal}
              aria-label="Close modal"
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center text-[#A5A5A5] hover:text-white border border-[#303030] hover:border-[#C6A76B] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="font-nav text-[11px] tracking-[0.2em] uppercase text-[#C6A76B]">
              {mode === 'test-drive'
                ? 'Private Test Drive Appointment'
                : mode === 'service'
                ? `KAIRO Atelier · ${enquiryModal.serviceCategory || 'Service Booking'}`
                : 'KAIRO Concierge Enquiry'}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-white mt-2 pr-8">
              {mode === 'test-drive'
                ? 'Schedule a Private Viewing & Drive'
                : mode === 'service'
                ? enquiryModal.serviceName || 'Book Bespoke Automotive Care'
                : 'Connect With Our Specialists'}
            </h2>

            {submittedRef ? (
              <div className="mt-8 py-8 px-6 bg-[#181818] border border-[#C6A76B]/50 text-center">
                <CheckCircle2 className="w-10 h-10 text-[#C6A76B] mx-auto mb-3" />
                <h3 className="font-display text-xl text-white">Request Confirmed</h3>
                <p className="text-sm text-[#A5A5A5] mt-2">
                  Your reference ID is{' '}
                  <span className="font-mono-tabular text-[#E1C995] font-semibold">
                    {submittedRef}
                  </span>
                  . A dedicated KAIRO specialist will contact you shortly.
                </p>
                <button
                  type="button"
                  onClick={closeEnquiryModal}
                  className="mt-6 px-6 py-2.5 bg-[#C6A76B] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      {...register('fullName')}
                      placeholder="Your full name"
                      className="w-full bg-[#181818] border border-[#303030] px-3.5 py-2.5 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
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
                      className="w-full bg-[#181818] border border-[#303030] px-3.5 py-2.5 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                    />
                    {errors.mobile && (
                      <p className="text-xs text-red-400 mt-1">{errors.mobile.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="name@domain.com"
                      className="w-full bg-[#181818] border border-[#303030] px-3.5 py-2.5 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  {mode === 'enquiry' && (
                    <div>
                      <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                        Enquiry Category
                      </label>
                      <select
                        {...register('category')}
                        className="w-full bg-[#181818] border border-[#303030] px-3.5 py-2.5 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                      >
                        <option value="Buy a Car">Buy a Car</option>
                        <option value="Sell a Car">Sell a Car</option>
                        <option value="Car Modification">Car Modification</option>
                        <option value="Car Servicing">Car Servicing</option>
                        <option value="Car Detailing">Car Detailing</option>
                        <option value="KAIRO Realty">KAIRO Realty</option>
                        <option value="General Enquiry">General Enquiry</option>
                      </select>
                    </div>
                  )}

                  {(mode === 'test-drive' || mode === 'service') && (
                    <div>
                      <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                        Preferred Date
                      </label>
                      <input
                        {...register('preferredDate')}
                        type="date"
                        className="w-full bg-[#181818] border border-[#303030] px-3.5 py-2.5 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {mode === 'test-drive' && (
                  <div>
                    <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                      Preferred Showroom Lounge
                    </label>
                    <select
                      {...register('showroomCity')}
                      className="w-full bg-[#181818] border border-[#303030] px-3.5 py-2.5 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                    >
                      {showrooms.map((s) => (
                        <option key={s.id} value={s.city}>
                          {s.city} — {s.regionLabel}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    {mode === 'service' ? 'Your Vehicle (Brand & Model)' : 'Selected Vehicle'}
                  </label>
                  {mode === 'enquiry' && !enquiryModal.vehicleName ? (
                    <select
                      {...register('vehicleName')}
                      className="w-full bg-[#181818] border border-[#303030] px-3.5 py-2.5 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                    >
                      <option value="">General / Not Vehicle-Specific</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={`${v.manufacturingYear} ${v.brand} ${v.model} ${v.variant}`}>
                          {v.manufacturingYear} {v.brand} {v.model} {v.variant} ({v.stockId})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      {...register('vehicleName')}
                      placeholder="e.g. Porsche 911 Carrera / Rolls-Royce Ghost"
                      className="w-full bg-[#181818] border border-[#303030] px-3.5 py-2.5 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Additional Notes
                  </label>
                  <textarea
                    {...register('message')}
                    rows={3}
                    placeholder="Preferred viewing time, trade-in inquiry, or specific specification questions..."
                    className="w-full bg-[#181818] border border-[#303030] px-3.5 py-2.5 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                  />
                </div>

                {submitError && <p className="text-xs text-red-400">{submitError}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#C6A76B] hover:bg-[#E1C995] disabled:opacity-50 text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase transition-colors cursor-pointer"
                >
                  {submitting ? 'Submitting Request...' : 'Submit Private Request'}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

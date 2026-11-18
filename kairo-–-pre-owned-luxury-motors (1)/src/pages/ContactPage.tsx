import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Mail, MessageCircle, Phone } from 'lucide-react';
import { useKairo } from '../context/KairoContext';
import { submitEnquiry } from '../services/kairoDb';
import {
  KAIRO_CONCIERGE_EMAIL,
  KAIRO_CONCIERGE_PHONE,
  KAIRO_WHATSAPP_NUMBER,
} from '../data/showroomsSeed';
import { ShowroomsMapSection } from '../components/ShowroomsMapSection';

const contactSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email address'),
  mobile: z.string().min(8, 'Please enter a valid mobile number'),
  category: z.string().min(1, 'Please select a category'),
  vehicleName: z.string().optional(),
  message: z.string().min(5, 'Please include a brief message').max(2000),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export const ContactPage: React.FC = () => {
  const { user, customerProfile, vehicles, showToast } = useKairo();
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: customerProfile?.displayName || user?.displayName || '',
      email: customerProfile?.email || user?.email || '',
      mobile: customerProfile?.phone || '',
      category: 'Buy a Car',
      vehicleName: '',
      message: '',
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const matchedVehicle = vehicles.find(
        (v) => `${v.manufacturingYear} ${v.brand} ${v.model} ${v.variant}` === values.vehicleName
      );
      const id = await submitEnquiry(
        {
          fullName: values.fullName,
          email: values.email,
          mobile: values.mobile,
          category: values.category,
          vehicleId: matchedVehicle?.id,
          vehicleName: values.vehicleName,
          message: values.message,
        },
        user?.uid || null
      );
      setSubmittedRef(id);
      showToast(`Enquiry ${id} submitted to KAIRO Concierge.`);
      reset();
    } catch (err) {
      console.error(err);
      setErrorMsg('Unable to send enquiry at the moment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] pt-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pb-20">
        {/* Header */}
        <div className="border-b border-[#303030] pb-10 mb-12">
          <span className="font-nav text-xs tracking-[0.22em] uppercase text-[#C6A76B]">
            Private Concierge Desk
          </span>
          <h1 className="font-display text-3xl sm:text-5xl text-white mt-3 max-w-4xl">
            LET&apos;S FIND YOUR NEXT EXTRAORDINARY DRIVE
          </h1>
          <p className="text-sm sm:text-base text-[#A5A5A5] mt-4 max-w-2xl leading-relaxed">
            Reach our specialists for vehicle sourcing, showroom appointments, valuations, bespoke
            servicing, or KAIRO Realty consultations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Channels */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#111111] border border-[#303030] p-7">
              <Phone className="w-5 h-5 text-[#C6A76B] mb-3" />
              <span className="font-nav text-[11px] tracking-[0.16em] uppercase text-[#A5A5A5]">
                Concierge Telephone
              </span>
              <a
                href={`tel:${KAIRO_CONCIERGE_PHONE.replace(/\s+/g, '')}`}
                className="block font-mono-tabular text-xl text-white hover:text-[#E1C995] mt-1.5"
              >
                {KAIRO_CONCIERGE_PHONE}
              </a>
              <p className="text-xs text-[#A5A5A5] mt-2">
                Monday – Sunday · 10:00 AM to 8:00 PM IST
              </p>
            </div>

            <div className="bg-[#111111] border border-[#303030] p-7">
              <Mail className="w-5 h-5 text-[#C6A76B] mb-3" />
              <span className="font-nav text-[11px] tracking-[0.16em] uppercase text-[#A5A5A5]">
                Direct Email Desk
              </span>
              <a
                href={`mailto:${KAIRO_CONCIERGE_EMAIL}`}
                className="block text-lg text-white hover:text-[#E1C995] mt-1.5 break-all"
              >
                {KAIRO_CONCIERGE_EMAIL}
              </a>
              <p className="text-xs text-[#A5A5A5] mt-2">
                For formal dossiers, fleet sourcing &amp; corporate lease documentation.
              </p>
            </div>

            <div className="bg-[#181818] border border-[#C6A76B]/40 p-7">
              <MessageCircle className="w-5 h-5 text-[#C6A76B] mb-3" />
              <span className="font-nav text-[11px] tracking-[0.16em] uppercase text-[#C6A76B]">
                Instant WhatsApp Concierge
              </span>
              <p className="text-sm text-[#A5A5A5] mt-2 leading-relaxed">
                Connect immediately with a KAIRO showcase advisor for live walk-around media or
                appointment scheduling.
              </p>
              <a
                href={`https://wa.me/${KAIRO_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  'Hello KAIRO Concierge, I would like to enquire about your luxury showcase.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Enquiry Form */}
          <div className="lg:col-span-7 bg-[#111111] border border-[#303030] p-7 sm:p-10">
            <h2 className="font-display text-2xl text-white mb-2">Send a Private Enquiry</h2>
            <p className="text-xs text-[#A5A5A5] mb-6">
              All messages are logged with our concierge team and tracked in your KAIRO account.
            </p>

            {submittedRef ? (
              <div className="py-10 px-6 bg-[#181818] border border-[#C6A76B]/50 text-center">
                <CheckCircle2 className="w-10 h-10 text-[#C6A76B] mx-auto mb-3" />
                <h3 className="font-display text-2xl text-white">Enquiry Received</h3>
                <p className="text-sm text-[#A5A5A5] mt-2">
                  Reference ID:{' '}
                  <span className="font-mono-tabular text-[#E1C995] font-semibold">
                    {submittedRef}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedRef(null)}
                  className="mt-6 px-6 py-3 bg-[#C6A76B] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      {...register('fullName')}
                      placeholder="Your full name"
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
                      className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                      Enquiry Category *
                    </label>
                    <select
                      {...register('category')}
                      className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
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
                </div>

                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Vehicle of Interest (Optional)
                  </label>
                  <select
                    {...register('vehicleName')}
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                  >
                    <option value="">General / Not Vehicle-Specific</option>
                    {vehicles.map((v) => (
                      <option
                        key={v.id}
                        value={`${v.manufacturingYear} ${v.brand} ${v.model} ${v.variant}`}
                      >
                        {v.manufacturingYear} {v.brand} {v.model} {v.variant} ({v.stockId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Message *
                  </label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    placeholder="Tell us how KAIRO can assist you..."
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-3 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                  />
                  {errors.message && (
                    <p className="text-xs text-red-400 mt-1">{errors.message.message}</p>
                  )}
                </div>

                {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#C6A76B] hover:bg-[#E1C995] disabled:opacity-50 text-[#080808] font-nav text-xs font-semibold tracking-[0.18em] uppercase transition-colors cursor-pointer"
                >
                  {submitting ? 'Submitting Enquiry...' : 'Submit Enquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <ShowroomsMapSection />
    </div>
  );
};

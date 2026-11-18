import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Car,
  Heart,
  LogIn,
  LogOut,
  MessageSquare,
  Save,
  ShieldCheck,
  Trash2,
  User as UserIcon,
  Wrench,
} from 'lucide-react';
import { useKairo } from '../context/KairoContext';
import {
  cancelOwnTestDrive,
  fetchUserActivity,
  updateCustomerProfile,
} from '../services/kairoDb';
import { VehicleCard } from '../components/VehicleCard';
import { formatINR } from '../utils/formatters';
import type {
  EnquiryRecord,
  SellCarRequestRecord,
  ServiceRequestRecord,
  TestDriveRequestRecord,
} from '../types/kairo';

export const AccountPage: React.FC = () => {
  const {
    user,
    authReady,
    customerProfile,
    isAdmin,
    vehicles,
    wishlistIds,
    toggleWishlist,
    signInWithGoogle,
    logout,
    showToast,
    refreshProfile,
  } = useKairo();

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [activityLoading, setActivityLoading] = useState(false);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [testDrives, setTestDrives] = useState<TestDriveRequestRecord[]>([]);
  const [sellRequests, setSellRequests] = useState<SellCarRequestRecord[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestRecord[]>([]);

  useEffect(() => {
    if (customerProfile) {
      setDisplayName(customerProfile.displayName || '');
      setPhone(customerProfile.phone || '');
      setCity(customerProfile.city || '');
    }
  }, [customerProfile]);

  const loadActivity = useCallback(async (uid: string) => {
    setActivityLoading(true);
    try {
      const data = await fetchUserActivity(uid);
      setEnquiries(data.enquiries);
      setTestDrives(data.testDrives);
      setSellRequests(data.sellRequests);
      setServiceRequests(data.serviceRequests);
    } catch (err) {
      console.error('Could not load user activity:', err);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadActivity(user.uid);
    } else {
      setEnquiries([]);
      setTestDrives([]);
      setSellRequests([]);
      setServiceRequests([]);
    }
  }, [user, loadActivity]);

  const savedVehicles = useMemo(
    () => vehicles.filter((v) => wishlistIds.includes(v.id)),
    [vehicles, wishlistIds]
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !customerProfile) return;
    setSavingProfile(true);
    try {
      await updateCustomerProfile(user.uid, { displayName, phone, city });
      refreshProfile({ ...customerProfile, displayName, phone, city });
      showToast('Profile details updated.');
    } catch (err) {
      console.error(err);
      showToast('Could not save profile updates.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelTestDrive = async (id: string) => {
    try {
      await cancelOwnTestDrive(id);
      setTestDrives((prev) =>
        prev.map((td) => (td.id === id ? { ...td, status: 'Cancelled' } : td))
      );
      showToast('Test drive request cancelled.');
    } catch (err) {
      console.error(err);
      showToast('Unable to cancel test drive request.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="border-b border-[#303030] pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-nav text-xs tracking-[0.22em] uppercase text-[#C6A76B]">
              KAIRO Client Portal
            </span>
            <h1 className="font-display text-3xl sm:text-5xl text-white mt-2">
              {user ? `Welcome, ${customerProfile?.displayName || user.displayName || 'Collector'}` : 'Account & Saved Collection'}
            </h1>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-5 py-2.5 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase inline-flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Open Admin Console</span>
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="px-5 py-2.5 border border-[#303030] hover:border-[#C6A76B] text-white font-nav text-xs tracking-[0.16em] uppercase inline-flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Sign-In Card when Logged Out */}
        {authReady && !user && (
          <div className="bg-[#111111] border border-[#303030] p-8 sm:p-10 mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <span className="font-nav text-xs tracking-[0.18em] uppercase text-[#C6A76B]">
                Private Collector Access
              </span>
              <h2 className="font-display text-2xl sm:text-3xl text-white mt-2">
                Sign In to Sync Your Wishlist &amp; Concierge Requests
              </h2>
              <p className="text-sm text-[#A5A5A5] mt-2 max-w-2xl leading-relaxed">
                Authenticate securely with Google to synchronize saved automobiles across devices,
                track test drive appointments, monitor sell-car valuations, and manage service
                bookings.
              </p>
            </div>
            <button
              type="button"
              onClick={signInWithGoogle}
              className="px-8 py-4 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase inline-flex items-center justify-center gap-2.5 shrink-0 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In With Google</span>
            </button>
          </div>
        )}

        {/* Saved Wishlist Section (works both guest & signed-in) */}
        <section id="wishlist" className="mb-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-[#C6A76B]">
                <Heart className="w-4 h-4" />
                <span className="font-nav text-xs tracking-[0.2em] uppercase">
                  Saved Garage ({savedVehicles.length})
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl text-white mt-1">
                Your Wishlisted Automobiles
              </h2>
            </div>
            <Link
              to="/inventory"
              className="font-nav text-xs tracking-[0.15em] uppercase text-[#E1C995] hover:text-white"
            >
              Browse Inventory →
            </Link>
          </div>

          {savedVehicles.length === 0 ? (
            <div className="bg-[#111111] border border-[#303030] p-10 text-center">
              <p className="font-display text-xl text-white">No Saved Vehicles Yet</p>
              <p className="text-sm text-[#A5A5A5] mt-2">
                Select the heart icon on any vehicle in the KAIRO showcase to save it here.
              </p>
              <Link
                to="/inventory"
                className="inline-block mt-6 px-6 py-3 bg-[#C6A76B] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase"
              >
                Explore Automobiles
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedVehicles.map((vehicle) => (
                <div key={vehicle.id} className="relative">
                  <VehicleCard vehicle={vehicle} />
                  <button
                    type="button"
                    onClick={() => toggleWishlist(vehicle.id)}
                    className="mt-2 w-full py-2 border border-[#303030] hover:border-red-500/50 text-xs text-[#A5A5A5] hover:text-red-400 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove From Wishlist</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Signed-In Customer Profile & Tracked Activity */}
        {user && (
          <div className="space-y-12">
            {/* Profile Details */}
            <section className="bg-[#111111] border border-[#303030] p-6 sm:p-8">
              <div className="flex items-center gap-2.5 text-[#C6A76B] mb-2">
                <UserIcon className="w-4 h-4" />
                <span className="font-nav text-xs tracking-[0.2em] uppercase">
                  Client Profile
                </span>
              </div>
              <h2 className="font-display text-2xl text-white mb-6">Personal Contact Details</h2>

              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Full Name
                  </label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-2.5 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98XXX XXXXX"
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-2.5 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-nav text-[11px] uppercase tracking-[0.12em] text-[#A5A5A5] mb-1.5">
                    City
                  </label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai / Delhi / Bengaluru"
                    className="w-full bg-[#181818] border border-[#303030] px-4 py-2.5 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="py-2.5 px-6 bg-[#C6A76B] hover:bg-[#E1C995] disabled:opacity-50 text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </form>
            </section>

            {/* Activity Grids */}
            {activityLoading ? (
              <p className="text-sm text-[#A5A5A5]">Synchronizing your concierge requests...</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enquiries */}
                <div className="bg-[#111111] border border-[#303030] p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#303030]">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#C6A76B]" />
                      <h3 className="font-display text-xl text-white">
                        Previous Enquiries ({enquiries.length})
                      </h3>
                    </div>
                  </div>
                  {enquiries.length === 0 ? (
                    <p className="text-xs text-[#A5A5A5]">No enquiries submitted under this account yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {enquiries.map((enq) => (
                        <div key={enq.id} className="bg-[#181818] border border-[#303030] p-4">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-mono-tabular text-xs text-[#C6A76B]">{enq.id}</span>
                            <span className="text-xs text-[#E1C995] font-medium">{enq.status}</span>
                          </div>
                          <p className="text-sm text-white font-medium mt-1">
                            {enq.category} {enq.vehicleName ? `· ${enq.vehicleName}` : ''}
                          </p>
                          {enq.message && (
                            <p className="text-xs text-[#A5A5A5] mt-1 line-clamp-2">{enq.message}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Test Drives */}
                <div className="bg-[#111111] border border-[#303030] p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#303030]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#C6A76B]" />
                      <h3 className="font-display text-xl text-white">
                        Test Drive Appointments ({testDrives.length})
                      </h3>
                    </div>
                  </div>
                  {testDrives.length === 0 ? (
                    <p className="text-xs text-[#A5A5A5]">No test drive appointments scheduled yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {testDrives.map((td) => (
                        <div key={td.id} className="bg-[#181818] border border-[#303030] p-4">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-mono-tabular text-xs text-[#C6A76B]">{td.id}</span>
                            <span className="text-xs text-[#E1C995] font-medium">{td.status}</span>
                          </div>
                          <p className="text-sm text-white font-medium mt-1">{td.vehicleName}</p>
                          <p className="text-xs text-[#A5A5A5] mt-1">
                            {td.showroomCity || 'Showroom'} · Preferred Date: {td.preferredDate}
                          </p>
                          {td.status === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => handleCancelTestDrive(td.id)}
                              className="mt-2.5 text-[11px] text-red-400 hover:text-red-300 underline cursor-pointer"
                            >
                              Cancel Request
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sell Car Requests */}
                <div className="bg-[#111111] border border-[#303030] p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#303030]">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-[#C6A76B]" />
                      <h3 className="font-display text-xl text-white">
                        Sell Car Submissions ({sellRequests.length})
                      </h3>
                    </div>
                  </div>
                  {sellRequests.length === 0 ? (
                    <p className="text-xs text-[#A5A5A5]">No valuation requests submitted yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {sellRequests.map((sr) => (
                        <div key={sr.id} className="bg-[#181818] border border-[#303030] p-4">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-mono-tabular text-xs text-[#C6A76B]">
                              {sr.referenceId}
                            </span>
                            <span className="text-xs text-[#E1C995] font-medium">{sr.status}</span>
                          </div>
                          <p className="text-sm text-white font-medium mt-1">
                            {sr.manufacturingYear} {sr.brand} {sr.model} {sr.variant}
                          </p>
                          <p className="text-xs text-[#A5A5A5] mt-1">
                            Expected: {formatINR(sr.expectedPrice)} · {sr.location}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Service Bookings */}
                <div className="bg-[#111111] border border-[#303030] p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#303030]">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-[#C6A76B]" />
                      <h3 className="font-display text-xl text-white">
                        Atelier Service Bookings ({serviceRequests.length})
                      </h3>
                    </div>
                  </div>
                  {serviceRequests.length === 0 ? (
                    <p className="text-xs text-[#A5A5A5]">No modification, servicing, or detailing bookings yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {serviceRequests.map((srv) => (
                        <div key={srv.id} className="bg-[#181818] border border-[#303030] p-4">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-mono-tabular text-xs text-[#C6A76B]">{srv.id}</span>
                            <span className="text-xs text-[#E1C995] font-medium">{srv.status}</span>
                          </div>
                          <p className="text-sm text-white font-medium mt-1">
                            {srv.serviceCategory} · {srv.serviceName}
                          </p>
                          <p className="text-xs text-[#A5A5A5] mt-1">
                            {srv.vehicleBrandModel || 'Vehicle TBD'} · {srv.preferredDate || 'Date TBD'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

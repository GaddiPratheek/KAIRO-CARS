import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Car,
  CheckCircle2,
  ClipboardList,
  Edit3,
  FileCheck2,
  LogIn,
  Plus,
  RefreshCw,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useKairo } from '../context/KairoContext';
import {
  adminDeleteVehicle,
  adminFetchAllOperations,
  adminSaveInspectionReport,
  adminSaveShowroom,
  adminSaveSiteContent,
  adminSaveVehicle,
  adminUpdateRequestStatus,
  seedInitialDatabase,
} from '../services/kairoDb';
import { ALL_BRAND_NAMES, COLLECTION_CATEGORIES, getModelsForBrand } from '../data/brandsAndModels';
import { INITIAL_VEHICLES } from '../data/vehiclesSeed';
import { formatINR, formatKm } from '../utils/formatters';
import type {
  CollectionCategory,
  CustomerProfile,
  EnquiryRecord,
  InspectionReportRecord,
  SellCarRequestRecord,
  ServiceRequestRecord,
  Showroom,
  TestDriveRequestRecord,
  Vehicle,
  VehicleAvailability,
} from '../types/kairo';

type AdminTab = 'inventory' | 'requests' | 'showrooms' | 'inspections' | 'content' | 'customers';
type RequestSubTab = 'enquiries' | 'testDrives' | 'sellCars' | 'services';

function createBlankVehicleTemplate(): Vehicle {
  const base = JSON.parse(JSON.stringify(INITIAL_VEHICLES[0])) as Vehicle;
  const suffix = Date.now().toString(36).toUpperCase().slice(-5);
  return {
    ...base,
    id: `kairo-veh-${suffix.toLowerCase()}`,
    stockId: `KRO-2025-${suffix}`,
    brand: 'Mercedes-Benz',
    model: 'S-Class',
    variant: 'S 450 4MATIC',
    manufacturingYear: 2024,
    registrationYear: 2024,
    registrationState: 'Maharashtra',
    registrationNumber: 'Not Provided',
    vin: 'Not Provided',
    bodyType: 'Flagship Luxury Sedan',
    category: 'Luxury Sedans',
    categories: ['All Cars', 'Luxury Sedans', 'Newly Arrived'],
    mileage: 4500,
    fuelType: 'Petrol',
    transmission: '9G-TRONIC 9-Speed Automatic',
    exteriorColour: 'Obsidian Black Metallic',
    interiorColour: 'Sienna Brown Nappa Leather',
    ownershipCount: 1,
    askingPrice: 14500000,
    availability: 'Available',
    featured: false,
    description: '',
    primaryImage: '/src/assets/images/car_mercedes_amg_c43_1794981556697.jpg',
    galleryImages: [
      {
        url: '/src/assets/images/car_mercedes_amg_c43_1794981556697.jpg',
        label: 'Primary Showcase View',
        category: 'Exterior',
      },
    ],
  };
}

export const AdminDashboardPage: React.FC = () => {
  const {
    user,
    authReady,
    isAdmin,
    vehicles,
    showrooms,
    siteContent,
    signInWithGoogle,
    showToast,
  } = useKairo();

  const [activeTab, setActiveTab] = useState<AdminTab>('inventory');
  const [reqSubTab, setReqSubTab] = useState<RequestSubTab>('enquiries');
  const [loadingOps, setLoadingOps] = useState(false);

  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [testDrives, setTestDrives] = useState<TestDriveRequestRecord[]>([]);
  const [sellRequests, setSellRequests] = useState<SellCarRequestRecord[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [inspections, setInspections] = useState<InspectionReportRecord[]>([]);

  const [searchInv, setSearchInv] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Vehicle Editor Modal State
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isNewVehicle, setIsNewVehicle] = useState(false);
  const [galleryUrlsText, setGalleryUrlsText] = useState('');
  const [savingVehicle, setSavingVehicle] = useState(false);

  // Showrooms Editor State
  const [showroomDrafts, setShowroomDrafts] = useState<Showroom[]>([]);

  // Inspection Form State
  const [inspVehicleId, setInspVehicleId] = useState(vehicles[0]?.id || '');
  const [inspStatus, setInspStatus] = useState('Showroom Inspected');
  const [inspSummary, setInspSummary] = useState('');
  const [inspInspector, setInspInspector] = useState('');
  const [inspDate, setInspDate] = useState(new Date().toISOString().split('T')[0]);

  // Homepage Content Editor State
  const [heroTitleDraft, setHeroTitleDraft] = useState(
    siteContent.heroTitle || 'DRIVE THE EXTRAORDINARY'
  );
  const [heroSubtitleDraft, setHeroSubtitleDraft] = useState(
    siteContent.heroSubtitle ||
      'Discover an exceptional collection of pre-owned luxury automobiles, curated for individuals who appreciate timeless design, superior engineering and extraordinary performance.'
  );
  const [offersTextDraft, setOffersTextDraft] = useState(
    (siteContent.specialOffers || []).join('\n')
  );
  const [featuredIdsDraft, setFeaturedIdsDraft] = useState<string[]>(
    siteContent.featuredVehicleIds || []
  );

  useEffect(() => {
    setShowroomDrafts(showrooms);
  }, [showrooms]);

  useEffect(() => {
    if (siteContent.heroTitle) setHeroTitleDraft(siteContent.heroTitle);
    if (siteContent.heroSubtitle) setHeroSubtitleDraft(siteContent.heroSubtitle);
    if (siteContent.specialOffers) setOffersTextDraft(siteContent.specialOffers.join('\n'));
    if (siteContent.featuredVehicleIds) setFeaturedIdsDraft(siteContent.featuredVehicleIds);
  }, [siteContent]);

  const loadOperations = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingOps(true);
    try {
      const data = await adminFetchAllOperations();
      setEnquiries(data.enquiries);
      setTestDrives(data.testDrives);
      setSellRequests(data.sellRequests);
      setServiceRequests(data.serviceRequests);
      setCustomers(data.customers);
      setInspections(data.inspections);
    } catch (err) {
      console.error('Admin fetch error:', err);
      showToast('Could not fetch live operations data.');
    } finally {
      setLoadingOps(false);
    }
  }, [isAdmin, showToast]);

  useEffect(() => {
    if (isAdmin) {
      loadOperations();
    }
  }, [isAdmin, loadOperations]);

  const kpis = useMemo(() => {
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter((v) => v.availability === 'Available').length;
    const soldVehicles = vehicles.filter((v) => v.availability === 'Sold').length;
    const reservedOrInspect = vehicles.filter(
      (v) => v.availability === 'Reserved' || v.availability === 'In Inspection'
    ).length;
    const totalEnquiries = enquiries.length;
    const pendingEnquiries = enquiries.filter((e) => e.status === 'Pending').length;
    return [
      { label: 'Total Vehicles', value: totalVehicles },
      { label: 'Available Vehicles', value: availableVehicles },
      { label: 'Sold Vehicles', value: soldVehicles },
      { label: 'Reserved / Inspection', value: reservedOrInspect },
      { label: 'Total Enquiries', value: totalEnquiries },
      { label: 'Pending Enquiries', value: pendingEnquiries },
      { label: 'Test Drive Requests', value: testDrives.length },
      { label: 'Sell Car Requests', value: sellRequests.length },
      { label: 'Service Bookings', value: serviceRequests.length },
    ];
  }, [vehicles, enquiries, testDrives, sellRequests, serviceRequests]);

  const filteredVehicles = useMemo(() => {
    const q = searchInv.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((v) =>
      `${v.stockId} ${v.brand} ${v.model} ${v.variant} ${v.availability}`
        .toLowerCase()
        .includes(q)
    );
  }, [vehicles, searchInv]);

  const openAddVehicle = () => {
    const tpl = createBlankVehicleTemplate();
    setEditingVehicle(tpl);
    setGalleryUrlsText(tpl.galleryImages.map((g) => g.url).join('\n'));
    setIsNewVehicle(true);
  };

  const openEditVehicle = (vehicle: Vehicle) => {
    const clone = JSON.parse(JSON.stringify(vehicle)) as Vehicle;
    setEditingVehicle(clone);
    setGalleryUrlsText(clone.galleryImages.map((g) => g.url).join('\n'));
    setIsNewVehicle(false);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    setSavingVehicle(true);
    try {
      const parsedUrls = galleryUrlsText
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean);
      const primary = editingVehicle.primaryImage.trim() || parsedUrls[0] || INITIAL_VEHICLES[0].primaryImage;
      const gallery =
        parsedUrls.length > 0
          ? parsedUrls.map((url, idx) => ({
              url,
              label: `Showcase View ${idx + 1}`,
              category: 'Exterior' as const,
            }))
          : [{ url: primary, label: 'Primary Showcase View', category: 'Exterior' as const }];

      await adminSaveVehicle(
        {
          ...editingVehicle,
          primaryImage: primary,
          galleryImages: gallery,
        },
        isNewVehicle
      );
      showToast(
        isNewVehicle
          ? `Added ${editingVehicle.brand} ${editingVehicle.model} to inventory.`
          : `Updated ${editingVehicle.brand} ${editingVehicle.model}.`
      );
      setEditingVehicle(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to save vehicle.');
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      await adminDeleteVehicle(id);
      setConfirmDeleteId(null);
      showToast('Vehicle removed from showcase.');
    } catch (err) {
      console.error(err);
      showToast('Unable to delete vehicle.');
    }
  };

  const handleStatusChange = async (
    collectionName: 'enquiries' | 'test_drive_requests' | 'sell_car_requests' | 'service_requests',
    id: string,
    nextStatus: string
  ) => {
    try {
      await adminUpdateRequestStatus(collectionName, id, nextStatus);
      if (collectionName === 'enquiries') {
        setEnquiries((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: nextStatus as EnquiryRecord['status'] } : item
          )
        );
      } else if (collectionName === 'test_drive_requests') {
        setTestDrives((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: nextStatus as TestDriveRequestRecord['status'] }
              : item
          )
        );
      } else if (collectionName === 'sell_car_requests') {
        setSellRequests((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: nextStatus as SellCarRequestRecord['status'] }
              : item
          )
        );
      } else {
        setServiceRequests((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: nextStatus as ServiceRequestRecord['status'] }
              : item
          )
        );
      }
      showToast(`Updated ${id} status to ${nextStatus}.`);
    } catch (err) {
      console.error(err);
      showToast('Failed to update status.');
    }
  };

  const handleSaveShowroom = async (showroom: Showroom) => {
    try {
      await adminSaveShowroom(showroom);
      showToast(`Saved ${showroom.city} showroom details.`);
    } catch (err) {
      console.error(err);
      showToast('Could not save showroom update.');
    }
  };

  const handleSaveInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspVehicleId || !inspSummary.trim()) {
      showToast('Select a vehicle and enter an inspection summary.');
      return;
    }
    try {
      const id = `INSP-${inspVehicleId}`;
      const record: InspectionReportRecord = {
        id,
        vehicleId: inspVehicleId,
        status: inspStatus,
        summary: inspSummary.trim(),
        inspectorName: inspInspector.trim(),
        inspectedDate: inspDate,
      };
      await adminSaveInspectionReport(record);
      setInspections((prev) => {
        const filtered = prev.filter((r) => r.id !== id);
        return [record, ...filtered];
      });
      setInspSummary('');
      showToast(`Saved inspection report for ${inspVehicleId}.`);
    } catch (err) {
      console.error(err);
      showToast('Failed to save inspection report.');
    }
  };

  const handleSaveSiteContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminSaveSiteContent({
        heroTitle: heroTitleDraft.trim(),
        heroSubtitle: heroSubtitleDraft.trim(),
        specialOffers: offersTextDraft
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        featuredVehicleIds: featuredIdsDraft,
      });
      showToast('Homepage curation & copy updated.');
    } catch (err) {
      console.error(err);
      showToast('Failed to save homepage content.');
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#080808] pt-32 px-6 text-center text-[#A5A5A5]">
        Verifying KAIRO Console credentials...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#080808] pt-32 pb-20 px-4">
        <div className="max-w-lg mx-auto bg-[#111111] border border-[#303030] p-10 text-center">
          <ShieldAlert className="w-10 h-10 text-[#C6A76B] mx-auto mb-4" />
          <h1 className="font-display text-3xl text-white">KAIRO Admin Console</h1>
          <p className="text-sm text-[#A5A5A5] mt-3">
            Sign in with an authorized administrator Google account to manage inventory, client
            requests, showrooms, and homepage curation.
          </p>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="mt-8 px-8 py-3.5 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase inline-flex items-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In With Google</span>
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#080808] pt-32 pb-20 px-4">
        <div className="max-w-lg mx-auto bg-[#111111] border border-[#303030] p-10 text-center">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h1 className="font-display text-3xl text-white">Administrator Access Required</h1>
          <p className="text-sm text-[#A5A5A5] mt-3">
            Signed in as <span className="text-white">{user.email}</span>. This account does not
            hold KAIRO administrator permissions.
          </p>
          <Link
            to="/account"
            className="inline-block mt-7 px-7 py-3 bg-[#C6A76B] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase"
          >
            Return to Client Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="border-b border-[#303030] pb-6 mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <span className="font-nav text-xs tracking-[0.22em] uppercase text-[#C6A76B]">
              KAIRO Operations Suite · {user.email}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl text-white mt-2">
              Showroom Management Console
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={async () => {
                await seedInitialDatabase();
                await loadOperations();
                showToast('Synchronized showcase seed records with Cloud Firestore.');
              }}
              className="px-4 py-2.5 border border-[#303030] hover:border-[#C6A76B] text-white font-nav text-[11px] tracking-[0.14em] uppercase inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#C6A76B]" />
              <span>Sync Seed Data</span>
            </button>
            <button
              type="button"
              onClick={openAddVehicle}
              className="px-5 py-2.5 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-[11px] font-semibold tracking-[0.14em] uppercase inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          </div>
        </div>

        {/* 9 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3 mb-8">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-[#111111] border border-[#303030] p-4">
              <div className="font-mono-tabular text-2xl font-semibold text-[#E1C995]">
                {kpi.value}
              </div>
              <div className="font-nav text-[10px] tracking-[0.12em] uppercase text-[#A5A5A5] mt-1">
                {kpi.label}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-[#303030] mb-8 gap-2">
          {[
            { id: 'inventory', label: 'Inventory', icon: Car },
            { id: 'requests', label: 'Enquiries & Requests', icon: ClipboardList },
            { id: 'showrooms', label: 'Showrooms', icon: Building2 },
            { id: 'inspections', label: 'Inspection Reports', icon: FileCheck2 },
            { id: 'content', label: 'Homepage Content', icon: Sparkles },
            { id: 'customers', label: 'Customers', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`px-5 py-3 font-nav text-xs tracking-[0.14em] uppercase inline-flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                  active
                    ? 'border-[#C6A76B] text-[#E1C995] bg-[#111111]'
                    : 'border-transparent text-[#A5A5A5] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <input
                type="text"
                value={searchInv}
                onChange={(e) => setSearchInv(e.target.value)}
                placeholder="Filter inventory by Stock ID, brand, model, or availability..."
                className="w-full sm:w-96 bg-[#111111] border border-[#303030] px-4 py-2.5 text-sm text-white focus:border-[#C6A76B] focus:outline-none"
              />
              <span className="text-xs text-[#A5A5A5]">
                Showing {filteredVehicles.length} of {vehicles.length} listings
              </span>
            </div>

            <div className="bg-[#111111] border border-[#303030] overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[820px]">
                <thead>
                  <tr className="border-b border-[#303030] font-nav text-[11px] tracking-[0.14em] uppercase text-[#A5A5A5]">
                    <th className="py-3.5 px-4">Vehicle</th>
                    <th className="py-3.5 px-4">Stock ID</th>
                    <th className="py-3.5 px-4">Year / Km</th>
                    <th className="py-3.5 px-4">Asking Price</th>
                    <th className="py-3.5 px-4">Availability</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#303030] text-sm">
                  {filteredVehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-[#181818]">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={v.primaryImage}
                            alt={`${v.brand} ${v.model}`}
                            className="w-14 h-10 object-cover border border-[#303030] shrink-0"
                          />
                          <div>
                            <div className="font-medium text-white">
                              {v.brand} {v.model}
                            </div>
                            <div className="text-xs text-[#A5A5A5]">{v.variant}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono-tabular text-xs text-[#C6A76B]">
                        {v.stockId}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#A5A5A5] tabular-nums">
                        {v.manufacturingYear} · {formatKm(v.mileage)}
                      </td>
                      <td className="py-3.5 px-4 font-mono-tabular text-white">
                        {formatINR(v.askingPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#E1C995]">
                        {v.availability}
                        {v.featured ? ' · Featured' : ''}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditVehicle(v)}
                            className="px-3 py-1.5 border border-[#303030] hover:border-[#C6A76B] text-xs text-white inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#C6A76B]" />
                            <span>Edit</span>
                          </button>

                          {confirmDeleteId === v.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteVehicle(v.id)}
                                className="px-2.5 py-1.5 bg-red-600 text-white text-xs cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1.5 border border-[#303030] text-xs text-[#A5A5A5] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(v.id)}
                              aria-label="Delete vehicle"
                              className="p-1.5 border border-[#303030] hover:border-red-500/60 text-[#A5A5A5] hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: REQUESTS */}
        {activeTab === 'requests' && (
          <div>
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: 'enquiries', label: `Enquiries (${enquiries.length})` },
                { id: 'testDrives', label: `Test Drives (${testDrives.length})` },
                { id: 'sellCars', label: `Sell Car Requests (${sellRequests.length})` },
                { id: 'services', label: `Service Bookings (${serviceRequests.length})` },
              ].map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setReqSubTab(sub.id as RequestSubTab)}
                  className={`px-4 py-2 border font-nav text-[11px] tracking-[0.14em] uppercase cursor-pointer ${
                    reqSubTab === sub.id
                      ? 'bg-[#C6A76B] text-[#080808] border-[#C6A76B] font-semibold'
                      : 'bg-[#111111] text-[#A5A5A5] border-[#303030] hover:text-white'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {loadingOps ? (
              <p className="text-sm text-[#A5A5A5]">Loading concierge records...</p>
            ) : (
              <div className="space-y-4">
                {reqSubTab === 'enquiries' &&
                  (enquiries.length === 0 ? (
                    <p className="text-sm text-[#A5A5A5]">No enquiries found.</p>
                  ) : (
                    enquiries.map((enq) => (
                      <div
                        key={enq.id}
                        className="bg-[#111111] border border-[#303030] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="font-mono-tabular text-[#C6A76B]">{enq.id}</span>
                            <span className="text-[#A5A5A5]">{enq.category}</span>
                          </div>
                          <h3 className="text-base text-white font-medium mt-1">
                            {enq.fullName} · {enq.mobile} · {enq.email}
                          </h3>
                          {enq.vehicleName && (
                            <p className="text-xs text-[#E1C995] mt-1">Vehicle: {enq.vehicleName}</p>
                          )}
                          {enq.message && (
                            <p className="text-xs text-[#A5A5A5] mt-1">{enq.message}</p>
                          )}
                        </div>
                        <select
                          value={enq.status}
                          onChange={(e) => handleStatusChange('enquiries', enq.id, e.target.value)}
                          className="bg-[#181818] border border-[#303030] px-3 py-2 text-xs text-white focus:border-[#C6A76B] focus:outline-none shrink-0"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </div>
                    ))
                  ))}

                {reqSubTab === 'testDrives' &&
                  (testDrives.length === 0 ? (
                    <p className="text-sm text-[#A5A5A5]">No test drive requests found.</p>
                  ) : (
                    testDrives.map((td) => (
                      <div
                        key={td.id}
                        className="bg-[#111111] border border-[#303030] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div>
                          <span className="font-mono-tabular text-xs text-[#C6A76B]">{td.id}</span>
                          <h3 className="text-base text-white font-medium mt-1">
                            {td.vehicleName} — {td.fullName}
                          </h3>
                          <p className="text-xs text-[#A5A5A5] mt-1">
                            {td.mobile} · {td.email} · {td.showroomCity || 'Showroom TBD'} · Date:{' '}
                            {td.preferredDate}
                          </p>
                          {td.notes && <p className="text-xs text-[#A5A5A5] mt-1">{td.notes}</p>}
                        </div>
                        <select
                          value={td.status}
                          onChange={(e) =>
                            handleStatusChange('test_drive_requests', td.id, e.target.value)
                          }
                          className="bg-[#181818] border border-[#303030] px-3 py-2 text-xs text-white focus:border-[#C6A76B] focus:outline-none shrink-0"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    ))
                  ))}

                {reqSubTab === 'sellCars' &&
                  (sellRequests.length === 0 ? (
                    <p className="text-sm text-[#A5A5A5]">No sell-car submissions found.</p>
                  ) : (
                    sellRequests.map((sr) => (
                      <div
                        key={sr.id}
                        className="bg-[#111111] border border-[#303030] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="font-mono-tabular text-[#C6A76B]">
                              {sr.referenceId}
                            </span>
                            <span className="text-[#A5A5A5]">{sr.location}</span>
                          </div>
                          <h3 className="text-base text-white font-medium mt-1">
                            {sr.manufacturingYear} {sr.brand} {sr.model} {sr.variant} — Expected{' '}
                            {formatINR(sr.expectedPrice)}
                          </h3>
                          <p className="text-xs text-[#A5A5A5] mt-1">
                            Owner: {sr.fullName} · {sr.mobile} · {sr.email} ·{' '}
                            {sr.mileage ? formatKm(sr.mileage) : ''}
                          </p>
                          {sr.description && (
                            <p className="text-xs text-[#A5A5A5] mt-1">{sr.description}</p>
                          )}
                          {sr.imageUrls && sr.imageUrls.length > 0 && (
                            <p className="text-[11px] text-[#E1C995] mt-1.5">
                              Attached Files: {sr.imageUrls.length} image(s)
                            </p>
                          )}
                        </div>
                        <select
                          value={sr.status}
                          onChange={(e) =>
                            handleStatusChange('sell_car_requests', sr.id, e.target.value)
                          }
                          className="bg-[#181818] border border-[#303030] px-3 py-2 text-xs text-white focus:border-[#C6A76B] focus:outline-none shrink-0"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Valuation Sent">Valuation Sent</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    ))
                  ))}

                {reqSubTab === 'services' &&
                  (serviceRequests.length === 0 ? (
                    <p className="text-sm text-[#A5A5A5]">No service bookings found.</p>
                  ) : (
                    serviceRequests.map((srv) => (
                      <div
                        key={srv.id}
                        className="bg-[#111111] border border-[#303030] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div>
                          <span className="font-mono-tabular text-xs text-[#C6A76B]">{srv.id}</span>
                          <h3 className="text-base text-white font-medium mt-1">
                            {srv.serviceCategory} · {srv.serviceName}
                          </h3>
                          <p className="text-xs text-[#A5A5A5] mt-1">
                            {srv.fullName} · {srv.mobile} · {srv.vehicleBrandModel || 'Car TBD'} ·{' '}
                            {srv.preferredDate || 'Date TBD'}
                          </p>
                          {srv.notes && <p className="text-xs text-[#A5A5A5] mt-1">{srv.notes}</p>}
                        </div>
                        <select
                          value={srv.status}
                          onChange={(e) =>
                            handleStatusChange('service_requests', srv.id, e.target.value)
                          }
                          className="bg-[#181818] border border-[#303030] px-3 py-2 text-xs text-white focus:border-[#C6A76B] focus:outline-none shrink-0"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    ))
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SHOWROOMS */}
        {activeTab === 'showrooms' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {showroomDrafts.map((room, idx) => (
              <div key={room.id} className="bg-[#111111] border border-[#303030] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#303030] pb-3">
                  <h3 className="font-display text-xl text-white">{room.city}</h3>
                  <label className="inline-flex items-center gap-2 text-xs text-[#A5A5A5] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(room.isSample)}
                      onChange={(e) => {
                        const next = [...showroomDrafts];
                        next[idx] = { ...room, isSample: e.target.checked };
                        setShowroomDrafts(next);
                      }}
                      className="accent-[#C6A76B]"
                    />
                    <span>Mark as Sample Location</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                      Lounge Name
                    </label>
                    <input
                      value={room.regionLabel}
                      onChange={(e) => {
                        const next = [...showroomDrafts];
                        next[idx] = { ...room, regionLabel: e.target.value };
                        setShowroomDrafts(next);
                      }}
                      className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                      Phone
                    </label>
                    <input
                      value={room.phone}
                      onChange={(e) => {
                        const next = [...showroomDrafts];
                        next[idx] = { ...room, phone: e.target.value };
                        setShowroomDrafts(next);
                      }}
                      className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                    Street Address
                  </label>
                  <input
                    value={room.address}
                    onChange={(e) => {
                      const next = [...showroomDrafts];
                      next[idx] = { ...room, address: e.target.value };
                      setShowroomDrafts(next);
                    }}
                    className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">Hours</label>
                    <input
                      value={room.hours}
                      onChange={(e) => {
                        const next = [...showroomDrafts];
                        next[idx] = { ...room, hours: e.target.value };
                        setShowroomDrafts(next);
                      }}
                      className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={room.lat}
                      onChange={(e) => {
                        const next = [...showroomDrafts];
                        next[idx] = { ...room, lat: Number(e.target.value) };
                        setShowroomDrafts(next);
                      }}
                      className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm font-mono-tabular text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={room.lng}
                      onChange={(e) => {
                        const next = [...showroomDrafts];
                        next[idx] = { ...room, lng: Number(e.target.value) };
                        setShowroomDrafts(next);
                      }}
                      className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm font-mono-tabular text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveShowroom(room)}
                  className="px-5 py-2.5 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-xs font-semibold tracking-[0.14em] uppercase inline-flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save {room.city}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: INSPECTION REPORTS */}
        {activeTab === 'inspections' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form
              onSubmit={handleSaveInspection}
              className="lg:col-span-5 bg-[#111111] border border-[#303030] p-6 space-y-4 h-fit"
            >
              <h2 className="font-display text-2xl text-white">Log Vehicle Inspection Report</h2>
              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">Vehicle</label>
                <select
                  value={inspVehicleId}
                  onChange={(e) => setInspVehicleId(e.target.value)}
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2.5 text-sm text-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.stockId} — {v.brand} {v.model}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                  Inspection Status
                </label>
                <select
                  value={inspStatus}
                  onChange={(e) => setInspStatus(e.target.value)}
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2.5 text-sm text-white"
                >
                  <option value="Showroom Inspected">Showroom Inspected</option>
                  <option value="Certified Pre-Owned">Certified Pre-Owned</option>
                  <option value="In Inspection">In Inspection</option>
                  <option value="Pending Telemetry Audit">Pending Telemetry Audit</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                    Inspector Name
                  </label>
                  <input
                    value={inspInspector}
                    onChange={(e) => setInspInspector(e.target.value)}
                    placeholder="Lead Technician"
                    className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">Date</label>
                  <input
                    type="date"
                    value={inspDate}
                    onChange={(e) => setInspDate(e.target.value)}
                    className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                  Technical Findings Summary
                </label>
                <textarea
                  rows={4}
                  value={inspSummary}
                  onChange={(e) => setInspSummary(e.target.value)}
                  placeholder="Paint-depth readings, ECU health, brake pad thickness, tyre tread..."
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase cursor-pointer"
              >
                Save Inspection Record
              </button>
            </form>

            <div className="lg:col-span-7 space-y-4">
              <h2 className="font-display text-2xl text-white">
                Recorded Inspection Reports ({inspections.length})
              </h2>
              {inspections.length === 0 ? (
                <p className="text-sm text-[#A5A5A5]">
                  No standalone inspection records saved in Firestore yet.
                </p>
              ) : (
                inspections.map((rep) => (
                  <div key={rep.id} className="bg-[#111111] border border-[#303030] p-5">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-mono-tabular text-[#C6A76B]">{rep.vehicleId}</span>
                      <span className="text-[#E1C995]">{rep.status}</span>
                    </div>
                    <p className="text-sm text-white mt-1">{rep.summary}</p>
                    <p className="text-xs text-[#A5A5A5] mt-2">
                      {rep.inspectorName || 'KAIRO Technical Desk'} · {rep.inspectedDate || 'Recent'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: HOMEPAGE CONTENT */}
        {activeTab === 'content' && (
          <form
            onSubmit={handleSaveSiteContent}
            className="bg-[#111111] border border-[#303030] p-6 sm:p-8 space-y-6 max-w-4xl"
          >
            <h2 className="font-display text-2xl text-white">
              Homepage Curation, Copy &amp; Offers
            </h2>

            <div>
              <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1.5">
                Hero Headline
              </label>
              <input
                value={heroTitleDraft}
                onChange={(e) => setHeroTitleDraft(e.target.value)}
                className="w-full bg-[#181818] border border-[#303030] px-4 py-2.5 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1.5">
                Hero Subtitle
              </label>
              <textarea
                rows={3}
                value={heroSubtitleDraft}
                onChange={(e) => setHeroSubtitleDraft(e.target.value)}
                className="w-full bg-[#181818] border border-[#303030] px-4 py-2.5 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1.5">
                Special Concierge Announcements (One per line)
              </label>
              <textarea
                rows={3}
                value={offersTextDraft}
                onChange={(e) => setOffersTextDraft(e.target.value)}
                className="w-full bg-[#181818] border border-[#303030] px-4 py-2.5 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase text-[#A5A5A5] mb-2">
                Featured Homepage Vehicles
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {vehicles.map((v) => {
                  const checked = featuredIdsDraft.includes(v.id);
                  return (
                    <label
                      key={v.id}
                      className="flex items-center gap-2.5 bg-[#181818] border border-[#303030] px-3.5 py-2.5 text-xs text-white cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFeaturedIdsDraft((prev) => [...prev, v.id]);
                          } else {
                            setFeaturedIdsDraft((prev) => prev.filter((id) => id !== v.id));
                          }
                        }}
                        className="accent-[#C6A76B]"
                      />
                      <span>
                        {v.manufacturingYear} {v.brand} {v.model} ({v.stockId})
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="px-8 py-3 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase inline-flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Homepage Updates</span>
            </button>
          </form>
        )}

        {/* TAB 6: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="bg-[#111111] border border-[#303030] overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-[#303030] font-nav text-[11px] tracking-[0.14em] uppercase text-[#A5A5A5]">
                  <th className="py-3.5 px-4">Client Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">City</th>
                  <th className="py-3.5 px-4">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#303030] text-sm">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-4 text-center text-[#A5A5A5] text-xs">
                      No registered client profiles loaded yet.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.uid}>
                      <td className="py-3.5 px-4 text-white font-medium">{c.displayName}</td>
                      <td className="py-3.5 px-4 text-[#A5A5A5]">{c.email}</td>
                      <td className="py-3.5 px-4 text-[#A5A5A5]">{c.phone || 'Not Provided'}</td>
                      <td className="py-3.5 px-4 text-[#A5A5A5]">{c.city || 'Not Provided'}</td>
                      <td className="py-3.5 px-4 text-xs text-[#C6A76B] uppercase">{c.role}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT VEHICLE MODAL */}
      {editingVehicle && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
          onClick={() => setEditingVehicle(null)}
        >
          <form
            onSubmit={handleSaveVehicle}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-[#111111] border border-[#303030] p-6 sm:p-8 my-8 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-[#303030] pb-4">
              <div>
                <span className="font-nav text-[11px] tracking-[0.18em] uppercase text-[#C6A76B]">
                  {isNewVehicle ? 'Create Inventory Listing' : `Edit ${editingVehicle.stockId}`}
                </span>
                <h2 className="font-display text-2xl text-white mt-1">
                  {editingVehicle.brand} {editingVehicle.model} {editingVehicle.variant}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingVehicle(null)}
                className="w-9 h-9 border border-[#303030] flex items-center justify-center text-[#A5A5A5] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Core Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">Brand</label>
                <select
                  value={editingVehicle.brand}
                  onChange={(e) => {
                    const b = e.target.value;
                    const models = getModelsForBrand(b);
                    setEditingVehicle({
                      ...editingVehicle,
                      brand: b,
                      model: models[0] || editingVehicle.model,
                    });
                  }}
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                >
                  {ALL_BRAND_NAMES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">Model</label>
                <input
                  value={editingVehicle.model}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">Variant</label>
                <input
                  value={editingVehicle.variant}
                  onChange={(e) =>
                    setEditingVehicle({ ...editingVehicle, variant: e.target.value })
                  }
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">Stock ID</label>
                <input
                  value={editingVehicle.stockId}
                  onChange={(e) =>
                    setEditingVehicle({ ...editingVehicle, stockId: e.target.value })
                  }
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm font-mono-tabular text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                  Asking Price (INR)
                </label>
                <input
                  type="number"
                  value={editingVehicle.askingPrice}
                  onChange={(e) =>
                    setEditingVehicle({ ...editingVehicle, askingPrice: Number(e.target.value) })
                  }
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm font-mono-tabular text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                  Availability
                </label>
                <select
                  value={editingVehicle.availability}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      availability: e.target.value as VehicleAvailability,
                    })
                  }
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                >
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Sold">Sold</option>
                  <option value="In Inspection">In Inspection</option>
                  <option value="Newly Arrived">Newly Arrived</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                  Manufacturing Year
                </label>
                <input
                  type="number"
                  value={editingVehicle.manufacturingYear}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      manufacturingYear: Number(e.target.value),
                    })
                  }
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm font-mono-tabular text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                  Mileage (km)
                </label>
                <input
                  type="number"
                  value={editingVehicle.mileage}
                  onChange={(e) =>
                    setEditingVehicle({ ...editingVehicle, mileage: Number(e.target.value) })
                  }
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm font-mono-tabular text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                  Fuel Type
                </label>
                <select
                  value={editingVehicle.fuelType}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      fuelType: e.target.value as Vehicle['fuelType'],
                    })
                  }
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                  Primary Category
                </label>
                <select
                  value={editingVehicle.category}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      category: e.target.value as CollectionCategory,
                    })
                  }
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                >
                  {COLLECTION_CATEGORIES.filter((c) => c !== 'All Cars').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                  Exterior Colour
                </label>
                <input
                  value={editingVehicle.exteriorColour}
                  onChange={(e) =>
                    setEditingVehicle({ ...editingVehicle, exteriorColour: e.target.value })
                  }
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                  Interior Colour
                </label>
                <input
                  value={editingVehicle.interiorColour}
                  onChange={(e) =>
                    setEditingVehicle({ ...editingVehicle, interiorColour: e.target.value })
                  }
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            {/* Technical Specs Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#303030]">
              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                  Engine Type
                </label>
                <input
                  value={editingVehicle.engineSpecs.engineType}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      engineSpecs: { ...editingVehicle.engineSpecs, engineType: e.target.value },
                    })
                  }
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                  Horsepower
                </label>
                <input
                  value={editingVehicle.engineSpecs.horsepower}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      engineSpecs: { ...editingVehicle.engineSpecs, horsepower: e.target.value },
                    })
                  }
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">Torque</label>
                <input
                  value={editingVehicle.engineSpecs.torque}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      engineSpecs: { ...editingVehicle.engineSpecs, torque: e.target.value },
                    })
                  }
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                  0–100 km/h
                </label>
                <input
                  value={editingVehicle.engineSpecs.acceleration0To100}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      engineSpecs: {
                        ...editingVehicle.engineSpecs,
                        acceleration0To100: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            {/* Images & Description */}
            <div className="space-y-4 pt-4 border-t border-[#303030]">
              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                  Primary Image URL
                </label>
                <input
                  value={editingVehicle.primaryImage}
                  onChange={(e) =>
                    setEditingVehicle({ ...editingVehicle, primaryImage: e.target.value })
                  }
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                  Gallery Image URLs (One per line)
                </label>
                <textarea
                  rows={2}
                  value={galleryUrlsText}
                  onChange={(e) => setGalleryUrlsText(e.target.value)}
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase text-[#A5A5A5] mb-1">
                  Vehicle Editorial Description
                </label>
                <textarea
                  rows={3}
                  value={editingVehicle.description}
                  onChange={(e) =>
                    setEditingVehicle({ ...editingVehicle, description: e.target.value })
                  }
                  className="w-full bg-[#181818] border border-[#303030] px-3 py-2 text-sm text-white"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingVehicle.featured}
                  onChange={(e) =>
                    setEditingVehicle({ ...editingVehicle, featured: e.target.checked })
                  }
                  className="accent-[#C6A76B]"
                />
                <span>Feature on Homepage Showcase</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#303030]">
              <button
                type="button"
                onClick={() => setEditingVehicle(null)}
                className="px-6 py-2.5 border border-[#303030] text-xs uppercase text-[#A5A5A5] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingVehicle}
                className="px-8 py-2.5 bg-[#C6A76B] hover:bg-[#E1C995] text-[#080808] font-nav text-xs font-semibold tracking-[0.16em] uppercase cursor-pointer"
              >
                {savingVehicle ? 'Saving...' : 'Save Vehicle'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

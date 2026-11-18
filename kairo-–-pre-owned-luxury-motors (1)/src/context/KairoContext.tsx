import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider, testFirestoreConnection } from '../lib/firebase';
import {
  checkIsAdmin,
  seedInitialDatabase,
  setWishlistVehicle,
  subscribeShowrooms,
  subscribeSiteContent,
  subscribeUserWishlist,
  subscribeVehicles,
  syncCustomerProfile,
} from '../services/kairoDb';
import { INITIAL_VEHICLES } from '../data/vehiclesSeed';
import { INITIAL_SHOWROOMS } from '../data/showroomsSeed';
import type {
  CustomerProfile,
  Showroom,
  SiteContentRecord,
  Vehicle,
} from '../types/kairo';

export interface EnquiryModalPreset {
  open: boolean;
  category?: string;
  vehicleId?: string;
  vehicleName?: string;
  mode?: 'enquiry' | 'test-drive' | 'service';
  serviceCategory?: 'Car Modification' | 'Car Servicing' | 'Car Detailing';
  serviceName?: string;
}

interface KairoContextValue {
  vehicles: Vehicle[];
  vehiclesLoading: boolean;
  isCloudSynced: boolean;
  showrooms: Showroom[];
  siteContent: SiteContentRecord;
  user: User | null;
  authReady: boolean;
  customerProfile: CustomerProfile | null;
  isAdmin: boolean;
  wishlistIds: string[];
  compareIds: string[];
  toastMessage: string | null;
  enquiryModal: EnquiryModalPreset;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  toggleWishlist: (vehicleId: string) => Promise<void>;
  toggleCompare: (vehicleId: string) => void;
  clearCompare: () => void;
  openEnquiryModal: (preset: Omit<EnquiryModalPreset, 'open'>) => void;
  closeEnquiryModal: () => void;
  showToast: (msg: string) => void;
  refreshProfile: (profile: CustomerProfile) => void;
}

const KairoContext = createContext<KairoContextValue | undefined>(undefined);

const COMPARE_STORAGE_KEY = 'kairo_compare_ids';
const GUEST_WISHLIST_KEY = 'kairo_guest_wishlist_ids';

export const KairoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [showrooms, setShowrooms] = useState<Showroom[]>(INITIAL_SHOWROOMS);
  const [siteContent, setSiteContent] = useState<SiteContentRecord>({});

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(GUEST_WISHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [compareIds, setCompareIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(COMPARE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [enquiryModal, setEnquiryModal] = useState<EnquiryModalPreset>({ open: false });

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  useEffect(() => {
    testFirestoreConnection();
    const unsubVehicles = subscribeVehicles((list, fromCloud) => {
      setVehicles(list);
      setIsCloudSynced(fromCloud);
      setVehiclesLoading(false);
    });
    const unsubShowrooms = subscribeShowrooms(setShowrooms);
    const unsubContent = subscribeSiteContent(setSiteContent);

    return () => {
      unsubVehicles();
      unsubShowrooms();
      unsubContent();
    };
  }, []);

  useEffect(() => {
    let unsubWishlist: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (unsubWishlist) {
        unsubWishlist();
        unsubWishlist = undefined;
      }

      if (currentUser) {
        try {
          const [profile, adminFlag] = await Promise.all([
            syncCustomerProfile(currentUser),
            checkIsAdmin(currentUser),
          ]);
          setCustomerProfile(profile);
          setIsAdmin(adminFlag);
          if (adminFlag) {
            seedInitialDatabase();
          }
          unsubWishlist = subscribeUserWishlist(currentUser.uid, (ids) => {
            setWishlistIds(ids);
          });
        } catch (err) {
          console.error('Auth sync error:', err);
        }
      } else {
        setCustomerProfile(null);
        setIsAdmin(false);
        try {
          const saved = localStorage.getItem(GUEST_WISHLIST_KEY);
          setWishlistIds(saved ? JSON.parse(saved) : []);
        } catch {
          setWishlistIds([]);
        }
      }
      setAuthReady(true);
    });

    return () => {
      unsubAuth();
      if (unsubWishlist) unsubWishlist();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('Signed in to KAIRO Private Concierge.');
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      showToast('Sign-in cancelled or popup blocked. Please allow popups and try again.');
    }
  }, [showToast]);

  const logout = useCallback(async () => {
    await signOut(auth);
    showToast('Signed out successfully.');
  }, [showToast]);

  const toggleWishlist = useCallback(
    async (vehicleId: string) => {
      const exists = wishlistIds.includes(vehicleId);
      if (user) {
        try {
          await setWishlistVehicle(user.uid, vehicleId, !exists);
          showToast(exists ? 'Removed from your Saved Collection.' : 'Added to your Saved Collection.');
        } catch (err) {
          console.error(err);
          showToast('Could not update wishlist. Please ensure your account is verified.');
        }
      } else {
        const next = exists
          ? wishlistIds.filter((id) => id !== vehicleId)
          : [...wishlistIds, vehicleId];
        setWishlistIds(next);
        try {
          localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(next));
        } catch {
          // ignore storage quota errors
        }
        showToast(
          exists
            ? 'Removed from your Saved Collection.'
            : 'Saved locally. Sign in anytime to sync across devices.'
        );
      }
    },
    [user, wishlistIds, showToast]
  );

  const toggleCompare = useCallback(
    (vehicleId: string) => {
      setCompareIds((prev) => {
        let next: string[];
        if (prev.includes(vehicleId)) {
          next = prev.filter((id) => id !== vehicleId);
          showToast('Removed vehicle from comparison.');
        } else {
          if (prev.length >= 3) {
            showToast('Maximum 3 vehicles can be compared simultaneously.');
            return prev;
          }
          next = [...prev, vehicleId];
          showToast(`Added to comparison (${next.length}/3).`);
        }
        try {
          localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [showToast]
  );

  const clearCompare = useCallback(() => {
    setCompareIds([]);
    try {
      localStorage.removeItem(COMPARE_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const openEnquiryModal = useCallback((preset: Omit<EnquiryModalPreset, 'open'>) => {
    setEnquiryModal({ ...preset, open: true });
  }, []);

  const closeEnquiryModal = useCallback(() => {
    setEnquiryModal({ open: false });
  }, []);

  const value = useMemo<KairoContextValue>(
    () => ({
      vehicles,
      vehiclesLoading,
      isCloudSynced,
      showrooms,
      siteContent,
      user,
      authReady,
      customerProfile,
      isAdmin,
      wishlistIds,
      compareIds,
      toastMessage,
      enquiryModal,
      signInWithGoogle,
      logout,
      toggleWishlist,
      toggleCompare,
      clearCompare,
      openEnquiryModal,
      closeEnquiryModal,
      showToast,
      refreshProfile: setCustomerProfile,
    }),
    [
      vehicles,
      vehiclesLoading,
      isCloudSynced,
      showrooms,
      siteContent,
      user,
      authReady,
      customerProfile,
      isAdmin,
      wishlistIds,
      compareIds,
      toastMessage,
      enquiryModal,
      signInWithGoogle,
      logout,
      toggleWishlist,
      toggleCompare,
      clearCompare,
      openEnquiryModal,
      closeEnquiryModal,
      showToast,
    ]
  );

  return <KairoContext.Provider value={value}>{children}</KairoContext.Provider>;
};

export function useKairo(): KairoContextValue {
  const ctx = useContext(KairoContext);
  if (!ctx) throw new Error('useKairo must be used within KairoProvider');
  return ctx;
}

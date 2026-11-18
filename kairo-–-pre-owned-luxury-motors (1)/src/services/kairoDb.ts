import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import type { User } from 'firebase/auth';
import {
  db,
  handleFirestoreError,
  OperationType,
  storage,
} from '../lib/firebase';
import { INITIAL_VEHICLES } from '../data/vehiclesSeed';
import { INITIAL_SHOWROOMS } from '../data/showroomsSeed';
import { LUXURY_BRANDS_CATALOG } from '../data/brandsAndModels';
import type {
  CustomerProfile,
  EnquiryRecord,
  InspectionReportRecord,
  SellCarRequestRecord,
  ServiceRequestRecord,
  Showroom,
  SiteContentRecord,
  TestDriveRequestRecord,
  Vehicle,
} from '../types/kairo';

function makeSafeId(prefix: string): string {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

export function subscribeVehicles(
  onData: (vehicles: Vehicle[], fromCloud: boolean) => void
): Unsubscribe {
  const q = query(collection(db, 'vehicles'));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData(INITIAL_VEHICLES, false);
        return;
      }
      const list: Vehicle[] = snapshot.docs.map((d) => ({
        ...(d.data() as Vehicle),
        id: d.id,
      }));
      onData(list, true);
    },
    (error) => {
      console.warn('Vehicles listener fallback to local catalog:', error.message);
      onData(INITIAL_VEHICLES, false);
    }
  );
}

export function subscribeShowrooms(onData: (showrooms: Showroom[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, 'showrooms'),
    (snapshot) => {
      if (snapshot.empty) {
        onData(INITIAL_SHOWROOMS);
        return;
      }
      const items = snapshot.docs.map((d) => ({
        ...(d.data() as Showroom),
        id: d.id,
      }));
      onData(items);
    },
    (error) => {
      console.warn('Showrooms listener fallback:', error.message);
      onData(INITIAL_SHOWROOMS);
    }
  );
}

export function subscribeSiteContent(
  onData: (content: SiteContentRecord) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, 'site_content', 'homepage'),
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as SiteContentRecord);
      } else {
        onData({
          heroTitle: 'DRIVE THE EXTRAORDINARY',
          heroSubtitle:
            'Discover an exceptional collection of pre-owned luxury automobiles, curated for individuals who appreciate timeless design, superior engineering and extraordinary performance.',
          featuredVehicleIds: INITIAL_VEHICLES.filter((v) => v.featured).map((v) => v.id),
          specialOffers: [
            'Bespoke Concierge Viewing Available Across Delhi-NCR, Mumbai, Hyderabad & Bengaluru',
          ],
        });
      }
    },
    () => {
      onData({});
    }
  );
}

export async function syncCustomerProfile(user: User): Promise<CustomerProfile> {
  const path = `customers/${user.uid}`;
  try {
    const refDoc = doc(db, 'customers', user.uid);
    const snap = await getDoc(refDoc);
    if (snap.exists()) {
      return snap.data() as CustomerProfile;
    }
    const profile: CustomerProfile = {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'KAIRO Guest',
      email: user.email || '',
      phone: '',
      city: '',
      role: 'customer',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(refDoc, profile);
    return profile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateCustomerProfile(
  uid: string,
  updates: { displayName: string; phone: string; city: string }
): Promise<void> {
  const path = `customers/${uid}`;
  try {
    await updateDoc(doc(db, 'customers', uid), {
      displayName: updates.displayName.slice(0, 120),
      phone: updates.phone.slice(0, 30),
      city: updates.city.slice(0, 80),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function checkIsAdmin(user: User): Promise<boolean> {
  if (user.email === 'abhiramkalakota06@gmail.com' && user.emailVerified) {
    return true;
  }
  try {
    const adminSnap = await getDoc(doc(db, 'admins', user.uid));
    return adminSnap.exists();
  } catch {
    return false;
  }
}

export function subscribeUserWishlist(
  uid: string,
  onData: (vehicleIds: string[]) => void
): Unsubscribe {
  const path = `customers/${uid}/wishlists`;
  return onSnapshot(
    collection(db, 'customers', uid, 'wishlists'),
    (snapshot) => {
      onData(snapshot.docs.map((d) => d.id));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function setWishlistVehicle(
  uid: string,
  vehicleId: string,
  add: boolean
): Promise<void> {
  const path = `customers/${uid}/wishlists/${vehicleId}`;
  try {
    const itemRef = doc(db, 'customers', uid, 'wishlists', vehicleId);
    if (add) {
      await setDoc(itemRef, {
        vehicleId,
        userId: uid,
        createdAt: serverTimestamp(),
      });
    } else {
      await deleteDoc(itemRef);
    }
  } catch (error) {
    handleFirestoreError(error, add ? OperationType.CREATE : OperationType.DELETE, path);
  }
}

export async function submitEnquiry(
  payload: {
    fullName: string;
    email: string;
    mobile: string;
    category: string;
    vehicleId?: string;
    vehicleName?: string;
    message?: string;
  },
  userId: string | null
): Promise<string> {
  const id = makeSafeId('ENQ');
  const path = `enquiries/${id}`;
  try {
    await setDoc(doc(db, 'enquiries', id), {
      userId: userId || 'guest',
      fullName: payload.fullName.trim().slice(0, 120),
      email: payload.email.trim().slice(0, 160),
      mobile: payload.mobile.trim().slice(0, 30),
      category: payload.category.trim().slice(0, 80),
      ...(payload.vehicleId ? { vehicleId: payload.vehicleId.slice(0, 128) } : {}),
      ...(payload.vehicleName ? { vehicleName: payload.vehicleName.slice(0, 200) } : {}),
      ...(payload.message ? { message: payload.message.trim().slice(0, 2000) } : {}),
      status: 'Pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function submitTestDriveRequest(
  payload: {
    vehicleId: string;
    vehicleName: string;
    stockId?: string;
    fullName: string;
    email: string;
    mobile: string;
    showroomCity?: string;
    preferredDate: string;
    notes?: string;
  },
  userId: string | null
): Promise<string> {
  const id = makeSafeId('TD');
  const path = `test_drive_requests/${id}`;
  try {
    await setDoc(doc(db, 'test_drive_requests', id), {
      userId: userId || 'guest',
      vehicleId: payload.vehicleId.slice(0, 128),
      vehicleName: payload.vehicleName.slice(0, 200),
      ...(payload.stockId ? { stockId: payload.stockId.slice(0, 64) } : {}),
      fullName: payload.fullName.trim().slice(0, 120),
      email: payload.email.trim().slice(0, 160),
      mobile: payload.mobile.trim().slice(0, 30),
      ...(payload.showroomCity ? { showroomCity: payload.showroomCity.slice(0, 80) } : {}),
      preferredDate: payload.preferredDate.slice(0, 40),
      ...(payload.notes ? { notes: payload.notes.trim().slice(0, 1000) } : {}),
      status: 'Pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function cancelOwnTestDrive(requestId: string): Promise<void> {
  const path = `test_drive_requests/${requestId}`;
  try {
    await updateDoc(doc(db, 'test_drive_requests', requestId), {
      status: 'Cancelled',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function submitServiceRequest(
  payload: {
    serviceCategory: 'Car Modification' | 'Car Servicing' | 'Car Detailing';
    serviceName: string;
    vehicleBrandModel?: string;
    fullName: string;
    email: string;
    mobile: string;
    preferredDate?: string;
    notes?: string;
  },
  userId: string | null
): Promise<string> {
  const id = makeSafeId('SRV');
  const path = `service_requests/${id}`;
  try {
    await setDoc(doc(db, 'service_requests', id), {
      userId: userId || 'guest',
      serviceCategory: payload.serviceCategory,
      serviceName: payload.serviceName.slice(0, 140),
      ...(payload.vehicleBrandModel
        ? { vehicleBrandModel: payload.vehicleBrandModel.slice(0, 160) }
        : {}),
      fullName: payload.fullName.trim().slice(0, 120),
      email: payload.email.trim().slice(0, 160),
      mobile: payload.mobile.trim().slice(0, 30),
      ...(payload.preferredDate ? { preferredDate: payload.preferredDate.slice(0, 40) } : {}),
      ...(payload.notes ? { notes: payload.notes.trim().slice(0, 1500) } : {}),
      status: 'Pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

async function uploadImageFilesOrFallback(files: File[], referenceId: string): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < Math.min(files.length, 6); i++) {
    const file = files[i];
    try {
      const storageRef = ref(
        storage,
        `sell_cars/${referenceId}/${i}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      );
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    } catch {
      // Fallback: compact metadata tag when Firebase Storage bucket rules are not yet activated
      urls.push(`uploaded-file://${file.name}`);
    }
  }
  return urls;
}

export async function submitSellCarRequest(
  payload: {
    fullName: string;
    mobile: string;
    email: string;
    brand: string;
    model: string;
    variant: string;
    manufacturingYear: number;
    registrationYear: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    exteriorColour: string;
    previousOwners: number;
    expectedPrice: number;
    location: string;
    description: string;
  },
  files: File[],
  userId: string | null
): Promise<{ id: string; referenceId: string }> {
  const id = makeSafeId('SELL');
  const referenceId = `KAIRO-VAL-${Date.now().toString().slice(-6)}`;
  const path = `sell_car_requests/${id}`;
  try {
    const imageUrls = await uploadImageFilesOrFallback(files, referenceId);
    await setDoc(doc(db, 'sell_car_requests', id), {
      referenceId,
      userId: userId || 'guest',
      fullName: payload.fullName.trim().slice(0, 120),
      mobile: payload.mobile.trim().slice(0, 30),
      email: payload.email.trim().slice(0, 160),
      brand: payload.brand.slice(0, 80),
      model: payload.model.slice(0, 120),
      variant: payload.variant.slice(0, 120),
      manufacturingYear: Number(payload.manufacturingYear),
      registrationYear: Number(payload.registrationYear),
      mileage: Number(payload.mileage),
      fuelType: payload.fuelType.slice(0, 40),
      transmission: payload.transmission.slice(0, 60),
      exteriorColour: payload.exteriorColour.slice(0, 60),
      previousOwners: Number(payload.previousOwners),
      expectedPrice: Number(payload.expectedPrice),
      location: payload.location.slice(0, 120),
      description: payload.description.trim().slice(0, 2000),
      imageUrls,
      status: 'Pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id, referenceId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchUserActivity(uid: string): Promise<{
  enquiries: EnquiryRecord[];
  testDrives: TestDriveRequestRecord[];
  sellRequests: SellCarRequestRecord[];
  serviceRequests: ServiceRequestRecord[];
}> {
  try {
    const [enqSnap, tdSnap, sellSnap, srvSnap] = await Promise.all([
      getDocs(query(collection(db, 'enquiries'), where('userId', '==', uid))),
      getDocs(query(collection(db, 'test_drive_requests'), where('userId', '==', uid))),
      getDocs(query(collection(db, 'sell_car_requests'), where('userId', '==', uid))),
      getDocs(query(collection(db, 'service_requests'), where('userId', '==', uid))),
    ]);

    return {
      enquiries: enqSnap.docs.map((d) => ({ ...(d.data() as EnquiryRecord), id: d.id })),
      testDrives: tdSnap.docs.map((d) => ({ ...(d.data() as TestDriveRequestRecord), id: d.id })),
      sellRequests: sellSnap.docs.map((d) => ({ ...(d.data() as SellCarRequestRecord), id: d.id })),
      serviceRequests: srvSnap.docs.map((d) => ({ ...(d.data() as ServiceRequestRecord), id: d.id })),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `user_activity/${uid}`);
  }
}

// ==========================================
// ADMIN OPERATIONS
// ==========================================

export async function seedInitialDatabase(): Promise<void> {
  try {
    const existingVehicles = await getDocs(collection(db, 'vehicles'));
    if (existingVehicles.empty) {
      await Promise.all(
        INITIAL_VEHICLES.map((v) =>
          setDoc(doc(db, 'vehicles', v.id), {
            ...v,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        )
      );
    }

    const existingShowrooms = await getDocs(collection(db, 'showrooms'));
    if (existingShowrooms.empty) {
      await Promise.all(
        INITIAL_SHOWROOMS.map((s) =>
          setDoc(doc(db, 'showrooms', s.id), {
            ...s,
            updatedAt: serverTimestamp(),
          })
        )
      );
    }

    const existingBrands = await getDocs(collection(db, 'brands'));
    if (existingBrands.empty) {
      await Promise.all(
        LUXURY_BRANDS_CATALOG.map((b) =>
          setDoc(doc(db, 'brands', b.id), {
            id: b.id,
            name: b.name,
            country: b.country,
            models: b.models,
            featured: Boolean(b.featured),
            updatedAt: serverTimestamp(),
          })
        )
      );
    }
  } catch (error) {
    console.warn('Seed sync warning:', error);
  }
}

export async function adminSaveVehicle(vehicle: Vehicle, isNew: boolean): Promise<void> {
  const path = `vehicles/${vehicle.id}`;
  try {
    if (isNew) {
      await setDoc(doc(db, 'vehicles', vehicle.id), {
        ...vehicle,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const existingSnap = await getDoc(doc(db, 'vehicles', vehicle.id));
      const createdAt = existingSnap.exists()
        ? existingSnap.data().createdAt || serverTimestamp()
        : serverTimestamp();
      await setDoc(doc(db, 'vehicles', vehicle.id), {
        ...vehicle,
        createdAt,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function adminDeleteVehicle(vehicleId: string): Promise<void> {
  const path = `vehicles/${vehicleId}`;
  try {
    await deleteDoc(doc(db, 'vehicles', vehicleId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function adminSaveShowroom(showroom: Showroom): Promise<void> {
  const path = `showrooms/${showroom.id}`;
  try {
    await setDoc(doc(db, 'showrooms', showroom.id), {
      ...showroom,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function adminSaveInspectionReport(report: InspectionReportRecord): Promise<void> {
  const path = `inspection_reports/${report.id}`;
  try {
    await setDoc(doc(db, 'inspection_reports', report.id), {
      vehicleId: report.vehicleId,
      status: report.status,
      summary: report.summary,
      ...(report.inspectorName ? { inspectorName: report.inspectorName } : {}),
      ...(report.inspectedDate ? { inspectedDate: report.inspectedDate } : {}),
      ...(report.documentUrl ? { documentUrl: report.documentUrl } : {}),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function adminSaveSiteContent(content: SiteContentRecord): Promise<void> {
  const path = `site_content/homepage`;
  try {
    await setDoc(doc(db, 'site_content', 'homepage'), {
      ...content,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function adminFetchAllOperations(): Promise<{
  enquiries: EnquiryRecord[];
  testDrives: TestDriveRequestRecord[];
  sellRequests: SellCarRequestRecord[];
  serviceRequests: ServiceRequestRecord[];
  customers: CustomerProfile[];
  inspections: InspectionReportRecord[];
}> {
  try {
    const [enqSnap, tdSnap, sellSnap, srvSnap, custSnap, inspSnap] = await Promise.all([
      getDocs(query(collection(db, 'enquiries'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'test_drive_requests'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'sell_car_requests'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'service_requests'), orderBy('createdAt', 'desc'))),
      getDocs(collection(db, 'customers')),
      getDocs(collection(db, 'inspection_reports')),
    ]);

    return {
      enquiries: enqSnap.docs.map((d) => ({ ...(d.data() as EnquiryRecord), id: d.id })),
      testDrives: tdSnap.docs.map((d) => ({ ...(d.data() as TestDriveRequestRecord), id: d.id })),
      sellRequests: sellSnap.docs.map((d) => ({ ...(d.data() as SellCarRequestRecord), id: d.id })),
      serviceRequests: srvSnap.docs.map((d) => ({ ...(d.data() as ServiceRequestRecord), id: d.id })),
      customers: custSnap.docs.map((d) => d.data() as CustomerProfile),
      inspections: inspSnap.docs.map((d) => ({ ...(d.data() as InspectionReportRecord), id: d.id })),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'admin_operations');
  }
}

export async function adminUpdateRequestStatus(
  collectionName: 'enquiries' | 'test_drive_requests' | 'sell_car_requests' | 'service_requests',
  id: string,
  status: string
): Promise<void> {
  const path = `${collectionName}/${id}`;
  try {
    await updateDoc(doc(db, collectionName, id), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

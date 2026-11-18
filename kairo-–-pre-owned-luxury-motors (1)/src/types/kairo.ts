export type VehicleAvailability =
  | 'Available'
  | 'Reserved'
  | 'Sold'
  | 'In Inspection'
  | 'Newly Arrived';

export type CollectionCategory =
  | 'All Cars'
  | 'Luxury Sedans'
  | 'Luxury SUVs'
  | 'Sports Cars'
  | 'Supercars'
  | 'Electric Vehicles'
  | 'Hybrid Vehicles'
  | 'Performance Cars'
  | 'Luxury MPVs'
  | 'Limited Editions'
  | 'Certified Pre-Owned'
  | 'Newly Arrived';

export interface EngineSpecs {
  engineType: string;
  displacement: string;
  configuration: string;
  cylinders: string;
  horsepower: string;
  horsepowerNumeric: number;
  torque: string;
  forcedInduction: string;
  fuelSystem: string;
  hybridSystem: string;
  electricMotorPower: string;
  batteryCapacity: string;
  electricRange: string;
  acceleration0To100: string;
  topSpeed: string;
}

export interface DrivetrainSpecs {
  transmissionType: string;
  gears: string;
  driveType: 'All-Wheel Drive (AWD)' | 'Rear-Wheel Drive (RWD)' | 'Front-Wheel Drive (FWD)' | 'Four-Wheel Drive (4WD)';
  differential: string;
  drivingModes: string;
  suspensionSystem: string;
  steeringSystem: string;
  brakingSystem: string;
}

export interface DimensionsSpecs {
  length: string;
  width: string;
  height: string;
  wheelbase: string;
  groundClearance: string;
  kerbWeight: string;
  bootCapacity: string;
  fuelTankCapacity: string;
  seatingCapacity: number;
  doors: number;
  wheelSize: string;
  tyreSpecifications: string;
}

export interface FeatureEntry {
  label: string;
  included: boolean;
  tier?: 'Standard' | 'Optional Package';
  detail?: string;
}

export interface ExteriorFeatures {
  ledHeadlights: FeatureEntry;
  adaptiveHeadlights: FeatureEntry;
  drls: FeatureEntry;
  ledTailLamps: FeatureEntry;
  panoramicSunroof: FeatureEntry;
  moonroof: FeatureEntry;
  alloyWheels: FeatureEntry;
  sportAlloyWheels: FeatureEntry;
  powerFoldingOrvms: FeatureEntry;
  electricallyAdjustableMirrors: FeatureEntry;
  rainSensingWipers: FeatureEntry;
  automaticHeadlamps: FeatureEntry;
  rearSpoiler: FeatureEntry;
  carbonFibrePackage: FeatureEntry;
  chromePackage: FeatureEntry;
  softCloseDoors: FeatureEntry;
  powerTailgate: FeatureEntry;
}

export interface InteriorFeatures {
  leatherUpholstery: FeatureEntry;
  electricSeats: FeatureEntry;
  memorySeats: FeatureEntry;
  heatedSeats: FeatureEntry;
  ventilatedSeats: FeatureEntry;
  massageSeats: FeatureEntry;
  multiZoneClimate: FeatureEntry;
  ambientLighting: FeatureEntry;
  digitalInstrumentCluster: FeatureEntry;
  headsUpDisplay: FeatureEntry;
  premiumSteeringWheel: FeatureEntry;
  rearSeatEntertainment: FeatureEntry;
  rearSeatRecliner: FeatureEntry;
  wirelessCharging: FeatureEntry;
  usbPorts: FeatureEntry;
  electricSunshade: FeatureEntry;
  premiumInteriorTrim: FeatureEntry;
}

export interface InfotainmentFeatures {
  touchscreenInfotainment: FeatureEntry;
  appleCarPlay: FeatureEntry;
  androidAuto: FeatureEntry;
  bluetooth: FeatureEntry;
  navigation: FeatureEntry;
  voiceControl: FeatureEntry;
  premiumSoundSystem: string;
  speakerCount: string;
  subwoofer: FeatureEntry;
  digitalCockpit: FeatureEntry;
  rearEntertainmentDisplay: FeatureEntry;
}

export interface SafetyFeatures {
  airbagsCount: string;
  abs: FeatureEntry;
  ebd: FeatureEntry;
  esc: FeatureEntry;
  tractionControl: FeatureEntry;
  hillHoldAssist: FeatureEntry;
  hillDescentControl: FeatureEntry;
  parkingSensors: FeatureEntry;
  camera360: FeatureEntry;
  rearCamera: FeatureEntry;
  blindSpotMonitoring: FeatureEntry;
  laneKeepAssist: FeatureEntry;
  adaptiveCruiseControl: FeatureEntry;
  autonomousEmergencyBraking: FeatureEntry;
  tpms: FeatureEntry;
  isofixMounts: FeatureEntry;
  adasSummary: string;
}

export interface DocumentationSpecs {
  ownershipHistory: string;
  rcStatus: string;
  insuranceStatus: string;
  insuranceExpiry: string;
  pucStatus: string;
  roadTaxStatus: string;
  serviceHistory: string;
  manufacturerWarranty: string;
  extendedWarranty: string;
  hypothecationStatus: string;
  accidentHistoryDisclosure: string;
  inspectionReportStatus: string;
  rcTransferAssistance: string;
}

export interface PricingSpecs {
  exShowroomOriginal: number | null;
  negotiableStatus: string;
  estimatedMarketValue: number | null;
  financeAvailable: boolean;
  estimatedDownPaymentPercent: number;
  defaultTenureMonths: number;
  defaultInterestRate: number;
  insuranceEstimate: number | null;
  transferChargesEstimate: number | null;
  isDemoPricing: boolean;
}

export interface GalleryImageItem {
  url: string;
  label: string;
  category: 'Exterior' | 'Interior' | 'Details' | 'Mechanical';
}

export interface Vehicle {
  id: string;
  stockId: string;
  brand: string;
  model: string;
  variant: string;
  manufacturingYear: number;
  registrationYear: number;
  registrationState: string;
  registrationNumber: string;
  vin: string;
  bodyType: string;
  category: CollectionCategory;
  categories: CollectionCategory[];
  mileage: number;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'Plug-in Hybrid';
  transmission: string;
  exteriorColour: string;
  interiorColour: string;
  ownershipCount: number;
  askingPrice: number;
  availability: VehicleAvailability;
  featured: boolean;
  description: string;
  primaryImage: string;
  galleryImages: GalleryImageItem[];
  engineSpecs: EngineSpecs;
  drivetrainSpecs: DrivetrainSpecs;
  dimensionsSpecs: DimensionsSpecs;
  exteriorFeatures: ExteriorFeatures;
  interiorFeatures: InteriorFeatures;
  infotainmentFeatures: InfotainmentFeatures;
  safetyFeatures: SafetyFeatures;
  documentationSpecs: DocumentationSpecs;
  pricingSpecs: PricingSpecs;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BrandCatalogItem {
  id: string;
  name: string;
  country: string;
  tagline: string;
  models: string[];
  featured?: boolean;
}

export interface Showroom {
  id: string;
  city: string;
  regionLabel: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  lat: number;
  lng: number;
  isSample?: boolean;
}

export interface CustomerProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  city?: string;
  role: 'customer' | 'admin';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface EnquiryRecord {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  mobile: string;
  category: string;
  vehicleId?: string;
  vehicleName?: string;
  message?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Archived';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SellCarRequestRecord {
  id: string;
  referenceId: string;
  userId: string;
  fullName: string;
  mobile: string;
  email: string;
  brand: string;
  model: string;
  variant?: string;
  manufacturingYear: number;
  registrationYear?: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  exteriorColour?: string;
  previousOwners?: number;
  expectedPrice: number;
  location?: string;
  description?: string;
  imageUrls?: string[];
  status: 'Pending' | 'Under Review' | 'Valuation Sent' | 'Completed';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface TestDriveRequestRecord {
  id: string;
  userId: string;
  vehicleId: string;
  vehicleName: string;
  stockId?: string;
  fullName: string;
  email: string;
  mobile: string;
  showroomCity?: string;
  preferredDate: string;
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ServiceRequestRecord {
  id: string;
  userId: string;
  serviceCategory: 'Car Modification' | 'Car Servicing' | 'Car Detailing';
  serviceName: string;
  vehicleBrandModel?: string;
  fullName: string;
  email: string;
  mobile: string;
  preferredDate?: string;
  notes?: string;
  status: 'Pending' | 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface InspectionReportRecord {
  id: string;
  vehicleId: string;
  status: string;
  summary: string;
  inspectorName?: string;
  inspectedDate?: string;
  documentUrl?: string;
  updatedAt?: unknown;
}

export interface SiteContentRecord {
  featuredVehicleIds?: string[];
  specialOffers?: string[];
  heroTitle?: string;
  heroSubtitle?: string;
}

import type { Showroom } from '../types/kairo';

export const KairoMediaAssets = {
  heroShowroom: '/src/assets/images/hero_kairo_showroom_1794981553421.jpg',
  serviceModification: '/src/assets/images/service_modification_1794981559045.jpg',
  serviceServicing: '/src/assets/images/service_servicing_1794981559325.jpg',
  serviceDetailing: '/src/assets/images/service_detailing_1794981559481.jpg',
  realtyVilla: '/src/assets/images/kairo_realty_villa_1794981560824.jpg',
} as const;

export const INITIAL_SHOWROOMS: Showroom[] = [
  {
    id: 'delhi-ncr',
    city: 'DELHI-NCR',
    regionLabel: 'Gurugram Flagship Lounge',
    address: 'Plot 14, Golf Course Road, Sector 54, Gurugram 122002',
    phone: '+91 124 555 0101',
    email: 'delhi@kairomotors.example',
    hours: 'Mon – Sun · 10:00 AM – 8:00 PM',
    lat: 28.4392,
    lng: 77.1055,
    isSample: true,
  },
  {
    id: 'mumbai',
    city: 'MUMBAI',
    regionLabel: 'Worli Sea Face Gallery',
    address: 'Ground Floor, Worli Sea Face, Worli, Mumbai 400018',
    phone: '+91 22 555 0102',
    email: 'mumbai@kairomotors.example',
    hours: 'Mon – Sun · 10:30 AM – 8:30 PM',
    lat: 19.0096,
    lng: 72.8156,
    isSample: true,
  },
  {
    id: 'hyderabad',
    city: 'HYDERABAD',
    regionLabel: 'Jubilee Hills Atelier',
    address: 'Road No. 36, Jubilee Hills, Hyderabad 500033',
    phone: '+91 40 555 0103',
    email: 'hyderabad@kairomotors.example',
    hours: 'Mon – Sun · 10:00 AM – 8:00 PM',
    lat: 17.4326,
    lng: 78.4071,
    isSample: true,
  },
  {
    id: 'bengaluru',
    city: 'BENGALURU',
    regionLabel: 'UB City Private Salon',
    address: 'UB City Annexe, Vittal Mallya Road, Bengaluru 560001',
    phone: '+91 80 555 0104',
    email: 'bengaluru@kairomotors.example',
    hours: 'Mon – Sun · 10:00 AM – 8:00 PM',
    lat: 12.9716,
    lng: 77.5963,
    isSample: true,
  },
];

export const KAIRO_WHATSAPP_NUMBER = '919800000100';
export const KAIRO_CONCIERGE_PHONE = '+91 124 555 0100';
export const KAIRO_CONCIERGE_EMAIL = 'concierge@kairomotors.example';

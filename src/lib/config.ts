export const APP_NAME = 'TruSight';
export const API_BASE = '/api';
export const PAYMENT_MODE = 'sandbox';

export const PRICING = {
  standard: 299000,
  'fast-track': 499000
} as const;

export const ALLOWED_CITIES = ['Jakarta', 'Bogor', 'Depok', 'Tangerang', 'Bekasi'];

export type OrderType = keyof typeof PRICING;
export type Role = 'buyer' | 'seller' | 'inspector' | 'admin';
export type Recommendation = 'beli' | 'nego' | 'hindari';

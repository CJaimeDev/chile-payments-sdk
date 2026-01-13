import { PaymentProvider } from '../types';

// Lista de proveedores soportados
export const SUPPORTED_PROVIDERS: PaymentProvider[] = ['webpay', 'getnet'];

// Nombres legibles de proveedores
export const PROVIDER_NAMES: Record<PaymentProvider, string> = {
  webpay: 'Webpay (Transbank)',
  getnet: 'Getnet (Santander)',
};
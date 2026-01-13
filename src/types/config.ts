import { PaymentProvider, Environment } from './common';

// Configuración base del SDK
export interface SDKConfig {
  // Proveedor de pago a utilizar
  provider: PaymentProvider;
  
  // Ambiente (test o production)
  environment: Environment;
  
  // Credenciales del proveedor (opcional si usa credenciales públicas de test)
  credentials?: ProviderCredentials;
  
  // Timeout para requests HTTP (en ms) - default: 30000
  timeout?: number;
}

// Credenciales para Webpay
export interface WebpayCredentials {
  commerceCode: string;
  apiKey: string;
}

// Credenciales para Getnet
export interface GetnetCredentials {
  login: string;
  secretKey: string;
}

// Unión de credenciales de todos los proveedores
export type ProviderCredentials = WebpayCredentials | GetnetCredentials;
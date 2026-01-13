// Proveedores de pago soportados
export type PaymentProvider = 'webpay' | 'getnet';

// Ambientes disponibles
export type Environment = 'test' | 'production';

// Estado de una transacción
export type TransactionStatus = 
  | 'pending'    // Transacción creada, esperando pago
  | 'approved'   // Pago aprobado
  | 'rejected'   // Pago rechazado
  | 'failed'     // Error en el proceso
  | 'cancelled'  // Cancelada por el usuario
  | 'expired';   // Expiró el tiempo de pago

// Moneda (solo CLP por ahora)
export type Currency = 'CLP';

// Información de monto
export interface Amount {
  currency: Currency;
  total: number;
}
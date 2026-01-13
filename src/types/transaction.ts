import { Amount, TransactionStatus } from './common';

// Parámetros para crear una transacción
export interface CreateTransactionParams {
  // Monto de la transacción
  amount: number;
  
  // ID único de la orden en tu sistema
  orderId: string;
  
  // URL a donde vuelve el usuario después del pago
  returnUrl: string;
  
  // Descripción de la transacción (opcional)
  description?: string;
  
  // Email del comprador (opcional)
  email?: string;
  
  // Datos adicionales (opcional)
  metadata?: Record<string, any>;
}

// Transacción creada (response de createTransaction)
export interface Transaction {
  // Token único de la transacción
  token: string;
  
  // URL donde se redirige al usuario para pagar
  paymentUrl: string;
  
  // ID de la transacción en el sistema del proveedor
  transactionId: string;
  
  // Monto de la transacción
  amount: Amount;
  
  // ID de la orden original
  orderId: string;
  
  // Estado actual
  status: TransactionStatus;
  
  // Fecha de creación
  createdAt: Date;
  
  // Fecha de expiración (si aplica)
  expiresAt?: Date;
}

// Resultado de una transacción confirmada
export interface TransactionResult {
  // Token de la transacción
  token: string;
  
  // ID de la transacción
  transactionId: string;
  
  // Estado final
  status: TransactionStatus;
  
  // Monto procesado
  amount: Amount;
  
  // ID de la orden
  orderId: string;
  
  // Código de autorización (si fue aprobado)
  authorizationCode?: string;
  
  // Mensaje del resultado
  message?: string;
  
  // Fecha de procesamiento
  processedAt: Date;
  
  // Información adicional del proveedor
  providerData?: Record<string, any>;
}

// Parámetros para reembolso
export interface RefundParams {
  // ID de la transacción a reembolsar
  transactionId: string;
  
  // Monto a reembolsar (opcional, si no se envía es reembolso total)
  amount?: number;
}

// Resultado de un reembolso
export interface Refund {
  // ID del reembolso
  refundId: string;
  
  // ID de la transacción original
  transactionId: string;
  
  // Monto reembolsado
  amount: Amount;
  
  // Estado del reembolso
  status: 'pending' | 'approved' | 'rejected';
  
  // Fecha del reembolso
  refundedAt: Date;
}
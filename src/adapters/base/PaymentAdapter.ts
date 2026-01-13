import {
  CreateTransactionParams,
  Transaction,
  TransactionResult,
  RefundParams,
  Refund,
  TransactionStatus,
} from '../../types';

// Interfaz que deben implementar todos los adaptadores de pago
export interface PaymentAdapter {
  // Nombre del proveedor
  readonly providerName: string;

  // Crear una nueva transacción
  createTransaction(params: CreateTransactionParams): Promise<Transaction>;

  // Confirmar una transacción (cuando el usuario vuelve del pago)
  confirmTransaction(token: string): Promise<TransactionResult>;

  // Consultar el estado de una transacción
  getTransactionStatus(transactionId: string): Promise<TransactionStatus>;

  // Reembolsar una transacción
  refundTransaction(params: RefundParams): Promise<Refund>;

  // Validar webhook (notificaciones del proveedor)
  validateWebhook(payload: any, signature?: string): boolean;
}
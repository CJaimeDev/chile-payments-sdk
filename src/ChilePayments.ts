import {
  SDKConfig,
  CreateTransactionParams,
  Transaction,
  TransactionResult,
  RefundParams,
  Refund,
  TransactionStatus,
  ValidationError,
} from './types';
import { PaymentAdapter } from './adapters/base/PaymentAdapter';
import { AdapterFactory } from './adapters/AdapterFactory';

// SDK Principal - Chile Payments
export class ChilePayments {
  private adapter: PaymentAdapter;
  private config: SDKConfig;

  constructor(config: SDKConfig) {
    this.validateConfig(config);
    this.config = config;
    this.adapter = AdapterFactory.create(config);
  }

  // Crear una transacción de pago
  async createTransaction(params: CreateTransactionParams): Promise<Transaction> {
    this.validateTransactionParams(params);
    return this.adapter.createTransaction(params);
  }

  // Confirmar una transacción (después de que el usuario pague)
  async confirmTransaction(token: string): Promise<TransactionResult> {
    if (!token || token.trim() === '') {
      throw new ValidationError('Token is required');
    }
    return this.adapter.confirmTransaction(token);
  }

  // Consultar estado de una transacción
  async getTransactionStatus(transactionId: string): Promise<TransactionStatus> {
    if (!transactionId || transactionId.trim() === '') {
      throw new ValidationError('Transaction ID is required');
    }
    return this.adapter.getTransactionStatus(transactionId);
  }

  // Reembolsar una transacción
  async refundTransaction(params: RefundParams): Promise<Refund> {
    this.validateRefundParams(params);
    return this.adapter.refundTransaction(params);
  }

  // Validar webhook
  validateWebhook(payload: any, signature?: string): boolean {
    return this.adapter.validateWebhook(payload, signature);
  }

  // Obtener nombre del proveedor actual
  getProvider(): string {
    return this.adapter.providerName;
  }

  // Validar configuración
  private validateConfig(config: SDKConfig): void {
    if (!config.provider) {
      throw new ValidationError('Provider is required');
    }

    if (!config.environment) {
      throw new ValidationError('Environment is required');
    }

    const validProviders = ['webpay', 'getnet'];
    if (!validProviders.includes(config.provider)) {
      throw new ValidationError(
        `Invalid provider. Must be one of: ${validProviders.join(', ')}`
      );
    }

    const validEnvironments = ['test', 'production'];
    if (!validEnvironments.includes(config.environment)) {
      throw new ValidationError(
        `Invalid environment. Must be one of: ${validEnvironments.join(', ')}`
      );
    }
  }

  // Validar parámetros de transacción
  private validateTransactionParams(params: CreateTransactionParams): void {
    if (!params.amount || params.amount <= 0) {
      throw new ValidationError('Amount must be greater than 0');
    }

    if (!params.orderId || params.orderId.trim() === '') {
      throw new ValidationError('Order ID is required');
    }

    if (!params.returnUrl || params.returnUrl.trim() === '') {
      throw new ValidationError('Return URL is required');
    }

    // Validar que returnUrl sea una URL válida
    try {
      new URL(params.returnUrl);
    } catch {
      throw new ValidationError('Return URL must be a valid URL');
    }
  }

  // Validar parámetros de reembolso
  private validateRefundParams(params: RefundParams): void {
    if (!params.transactionId || params.transactionId.trim() === '') {
      throw new ValidationError('Transaction ID is required');
    }

    if (params.amount !== undefined && params.amount <= 0) {
      throw new ValidationError('Refund amount must be greater than 0');
    }
  }
}
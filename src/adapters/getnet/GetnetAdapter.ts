import { BaseAdapter } from '../base/BaseAdapter';
import {
  SDKConfig,
  CreateTransactionParams,
  Transaction,
  TransactionResult,
  RefundParams,
  Refund,
  TransactionStatus,
  GetnetCredentials,
  AuthenticationError,
  ProviderError,
} from '../../types';
import { GETNET_ENDPOINTS, TEST_CREDENTIALS } from '../../constants/endpoints';
import { formatAmount } from '../../utils/formatters';
import {
  GetnetCreateRequest,
  GetnetCreateResponse,
  GetnetTransactionResponse,
  GetnetReverseResponse,
} from './types';
import { generateGetnetAuth, mapGetnetStatus, generateExpirationDate } from './utils';

export class GetnetAdapter extends BaseAdapter {
  readonly providerName = 'Getnet';
  private credentials: GetnetCredentials;

  constructor(config: SDKConfig) {
    const baseURL = config.environment === 'test'
      ? GETNET_ENDPOINTS.test
      : GETNET_ENDPOINTS.production;

    super(baseURL, config.environment, config.timeout);

    // Usar credenciales públicas de test si no se proveen
    if (config.environment === 'test' && !config.credentials) {
      this.credentials = TEST_CREDENTIALS.getnet;
    } else if (config.credentials && 'login' in config.credentials) {
      this.credentials = config.credentials as GetnetCredentials;
    } else {
      throw new AuthenticationError('Getnet credentials are required for production environment');
    }

    this.log('Getnet adapter initialized', { environment: config.environment });
  }

  async createTransaction(params: CreateTransactionParams): Promise<Transaction> {
    this.log('Creating transaction', params);

    const auth = generateGetnetAuth(this.credentials.login, this.credentials.secretKey);

    const request: GetnetCreateRequest = {
      locale: 'es_CL',
      auth,
      payment: {
        reference: params.orderId,
        description: params.description || 'Pago',
        amount: {
          currency: 'CLP',
          total: formatAmount(params.amount),
        },
      },
      expiration: generateExpirationDate(),
      returnUrl: params.returnUrl,
      ipAddress: '127.0.0.1',
      userAgent: 'ChilePaymentsSDK/1.0',
    };

    // Agregar buyer si se provee email
    if (params.email) {
      request.buyer = {
        email: params.email,
      };
    }

    try {
      const response = await this.httpClient.post<GetnetCreateResponse>(
        '/api/session/',
        request
      );

      const transaction: Transaction = {
        token: response.requestId.toString(),
        paymentUrl: response.processUrl,
        transactionId: response.requestId.toString(),
        amount: {
          currency: 'CLP',
          total: params.amount,
        },
        orderId: params.orderId,
        status: 'pending',
        createdAt: new Date(),
      };

      this.log('Transaction created', transaction);
      return transaction;
    } catch (error) {
      this.log('Error creating transaction', error);
      throw new ProviderError(
        'Failed to create Getnet transaction',
        this.providerName,
        undefined,
        error
      );
    }
  }

  async confirmTransaction(token: string): Promise<TransactionResult> {
    this.log('Confirming transaction', { token });

    try {
      const auth = generateGetnetAuth(this.credentials.login, this.credentials.secretKey);

      const response = await this.httpClient.post<GetnetTransactionResponse>(
        `/api/session/${token}`,
        { auth }
      );

      const status = mapGetnetStatus(response.status.status);
      const payment = response.payment?.[0];

      const result: TransactionResult = {
        token,
        transactionId: token,
        status,
        amount: {
          currency: 'CLP',
          total: response.request.payment.amount.total,
        },
        orderId: response.request.payment.reference,
        authorizationCode: payment?.authorization,
        message: response.status.message,
        processedAt: new Date(response.status.date),
        providerData: {
          requestId: response.requestId,
          internalReference: payment?.internalReference,
          receipt: payment?.receipt,
        },
      };

      this.log('Transaction confirmed', result);
      return result;
    } catch (error) {
      this.log('Error confirming transaction', error);
      throw new ProviderError(
        'Failed to confirm Getnet transaction',
        this.providerName,
        undefined,
        error
      );
    }
  }

  async getTransactionStatus(transactionId: string): Promise<TransactionStatus> {
    this.log('Getting transaction status', { transactionId });

    try {
      const auth = generateGetnetAuth(this.credentials.login, this.credentials.secretKey);

      const response = await this.httpClient.post<GetnetTransactionResponse>(
        `/api/session/${transactionId}`,
        { auth }
      );

      const status = mapGetnetStatus(response.status.status);
      this.log('Transaction status retrieved', { status });

      return status;
    } catch (error) {
      this.log('Error getting transaction status', error);
      throw new ProviderError(
        'Failed to get Getnet transaction status',
        this.providerName,
        undefined,
        error
      );
    }
  }

  async refundTransaction(params: RefundParams): Promise<Refund> {
    this.log('Refunding transaction', params);

    // Getnet usa "reverse" para anulaciones (mismo día)
    // El campo transactionId en Getnet es el internalReference del pago
    const auth = generateGetnetAuth(this.credentials.login, this.credentials.secretKey);

    try {
      const response = await this.httpClient.post<GetnetReverseResponse>(
        '/api/reverse',
        {
          auth,
          internalReference: params.transactionId,
        }
      );

      const refund: Refund = {
        refundId: response.payment.internalReference.toString(),
        transactionId: params.transactionId,
        amount: {
          currency: 'CLP',
          total: Math.abs(response.payment.amount.from.total),
        },
        status: mapGetnetStatus(response.payment.status.status) === 'approved' ? 'approved' : 'rejected',
        refundedAt: new Date(response.payment.status.date),
      };

      this.log('Transaction refunded', refund);
      return refund;
    } catch (error) {
      this.log('Error refunding transaction', error);
      throw new ProviderError(
        'Failed to refund Getnet transaction',
        this.providerName,
        undefined,
        error
      );
    }
  }

  validateWebhook(payload: any, signature?: string): boolean {
    // Getnet envía notificaciones pero la validación requiere
    // comparar la firma con SHA-1(requestId + status + date + secretKey)
    if (!signature || !payload.requestId || !payload.status) {
      this.log('Invalid webhook payload');
      return false;
    }

    try {
      const crypto = require('crypto');
      const toSign = `${payload.requestId}${payload.status.status}${payload.status.date}${this.credentials.secretKey}`;
      const calculatedSignature = crypto.createHash('sha1').update(toSign).digest('hex');

      const isValid = calculatedSignature === signature;
      this.log('Webhook validation', { isValid });

      return isValid;
    } catch (error) {
      this.log('Error validating webhook', error);
      return false;
    }
  }
}
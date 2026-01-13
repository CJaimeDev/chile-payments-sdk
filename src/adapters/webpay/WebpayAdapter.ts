import { BaseAdapter } from '../base/BaseAdapter';
import {
  SDKConfig,
  CreateTransactionParams,
  Transaction,
  TransactionResult,
  RefundParams,
  Refund,
  TransactionStatus,
  WebpayCredentials,
  AuthenticationError,
  ProviderError,
} from '../../types';
import { WEBPAY_ENDPOINTS, TEST_CREDENTIALS } from '../../constants/endpoints';
import { formatAmount } from '../../utils/formatters';
import {
  WebpayCreateRequest,
  WebpayCreateResponse,
  WebpayTransactionResponse,
  WebpayRefundResponse,
} from './types';
import { mapWebpayStatus, mapWebpayStatusString, generateSessionId } from './utils';

export class WebpayAdapter extends BaseAdapter {
  readonly providerName = 'Webpay';
  private credentials: WebpayCredentials;

  constructor(config: SDKConfig) {
    const baseURL = config.environment === 'test' 
      ? WEBPAY_ENDPOINTS.test 
      : WEBPAY_ENDPOINTS.production;
    
    super(baseURL, config.environment, config.timeout);

    // Usar credenciales públicas de test si no se proveen
    if (config.environment === 'test' && !config.credentials) {
      this.credentials = TEST_CREDENTIALS.webpay;
    } else if (config.credentials && 'commerceCode' in config.credentials) {
      this.credentials = config.credentials as WebpayCredentials;
    } else {
      throw new AuthenticationError('Webpay credentials are required for production environment');
    }

    // Configurar headers de autenticación
    this.httpClient.setHeaders({
      'Tbk-Api-Key-Id': this.credentials.commerceCode,
      'Tbk-Api-Key-Secret': this.credentials.apiKey,
    });

    this.log('Webpay adapter initialized', { environment: config.environment });
  }

  async createTransaction(params: CreateTransactionParams): Promise<Transaction> {
    this.log('Creating transaction', params);

    const request: WebpayCreateRequest = {
      buy_order: params.orderId,
      session_id: generateSessionId(),
      amount: formatAmount(params.amount),
      return_url: params.returnUrl,
    };

    try {
      const response = await this.httpClient.post<WebpayCreateResponse>(
        '/rswebpaytransaction/api/webpay/v1.2/transactions',
        request
      );

      const transaction: Transaction = {
        token: response.token,
        paymentUrl: response.url,
        transactionId: response.token,
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
        'Failed to create Webpay transaction',
        this.providerName,
        undefined,
        error
      );
    }
  }

  async confirmTransaction(token: string): Promise<TransactionResult> {
    this.log('Confirming transaction', { token });

    try {
      const response = await this.httpClient.put<WebpayTransactionResponse>(
        `/rswebpaytransaction/api/webpay/v1.2/transactions/${token}`
      );

      const status = mapWebpayStatus(response.response_code);

      const result: TransactionResult = {
        token,
        transactionId: token,
        status,
        amount: {
          currency: 'CLP',
          total: response.amount,
        },
        orderId: response.buy_order,
        authorizationCode: response.authorization_code,
        message: status === 'approved' ? 'Transaction approved' : 'Transaction rejected',
        processedAt: new Date(response.transaction_date),
        providerData: {
          vci: response.vci,
          paymentType: response.payment_type_code,
          installments: response.installments_number,
          cardNumber: response.card_detail?.card_number,
        },
      };

      this.log('Transaction confirmed', result);
      return result;
    } catch (error) {
      this.log('Error confirming transaction', error);
      throw new ProviderError(
        'Failed to confirm Webpay transaction',
        this.providerName,
        undefined,
        error
      );
    }
  }

  async getTransactionStatus(transactionId: string): Promise<TransactionStatus> {
    this.log('Getting transaction status', { transactionId });

    try {
      const response = await this.httpClient.get<WebpayTransactionResponse>(
        `/rswebpaytransaction/api/webpay/v1.2/transactions/${transactionId}`
      );

      const status = mapWebpayStatus(response.response_code);
      this.log('Transaction status retrieved', { status });
      
      return status;
    } catch (error) {
      this.log('Error getting transaction status', error);
      throw new ProviderError(
        'Failed to get Webpay transaction status',
        this.providerName,
        undefined,
        error
      );
    }
  }

  async refundTransaction(params: RefundParams): Promise<Refund> {
    this.log('Refunding transaction', params);

    const refundAmount = params.amount || undefined;

    try {
      const response = await this.httpClient.post<WebpayRefundResponse>(
        `/rswebpaytransaction/api/webpay/v1.2/transactions/${params.transactionId}/refunds`,
        refundAmount ? { amount: formatAmount(refundAmount) } : {}
      );

      const refund: Refund = {
        refundId: response.authorization_code,
        transactionId: params.transactionId,
        amount: {
          currency: 'CLP',
          total: response.nullified_amount,
        },
        status: response.response_code === 0 ? 'approved' : 'rejected',
        refundedAt: new Date(response.authorization_date),
      };

      this.log('Transaction refunded', refund);
      return refund;
    } catch (error) {
      this.log('Error refunding transaction', error);
      throw new ProviderError(
        'Failed to refund Webpay transaction',
        this.providerName,
        undefined,
        error
      );
    }
  }

  validateWebhook(payload: any, signature?: string): boolean {
    // Webpay no usa webhooks de la misma forma que otros proveedores
    // La confirmación se hace mediante el flujo de returnUrl
    this.log('Webhook validation not implemented for Webpay');
    return true;
  }
}
import { Environment } from '../../types';
import { HttpClient } from '../../utils/http';
import { PaymentAdapter } from './PaymentAdapter';

// Clase base abstracta para todos los adaptadores
export abstract class BaseAdapter implements PaymentAdapter {
  protected httpClient: HttpClient;
  protected environment: Environment;
  
  abstract readonly providerName: string;

  constructor(baseURL: string, environment: Environment, timeout?: number) {
    this.httpClient = new HttpClient(baseURL, timeout);
    this.environment = environment;
  }

  // Métodos abstractos que deben implementar las clases hijas
  abstract createTransaction(params: any): Promise<any>;
  abstract confirmTransaction(token: string): Promise<any>;
  abstract getTransactionStatus(transactionId: string): Promise<any>;
  abstract refundTransaction(params: any): Promise<any>;
  abstract validateWebhook(payload: any, signature?: string): boolean;

  // Helper: Verificar si estamos en ambiente de pruebas
  protected isTestEnvironment(): boolean {
    return this.environment === 'test';
  }

  // Helper: Log de debug (solo en test)
  protected log(message: string, data?: any): void {
    if (this.isTestEnvironment()) {
      console.log(`[${this.providerName}] ${message}`, data || '');
    }
  }
}
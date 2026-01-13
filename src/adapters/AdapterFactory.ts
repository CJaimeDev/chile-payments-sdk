import { SDKConfig, ValidationError } from '../types';
import { PaymentAdapter } from './base/PaymentAdapter';
import { WebpayAdapter } from './webpay/WebpayAdapter';
import { GetnetAdapter } from './getnet/GetnetAdapter';

// Factory para crear adaptadores de pago
export class AdapterFactory {
  // Crear adaptador según el proveedor configurado
  static create(config: SDKConfig): PaymentAdapter {
    switch (config.provider) {
      case 'webpay':
        return new WebpayAdapter(config);
      
      case 'getnet':
        return new GetnetAdapter(config);
      
      default:
        throw new ValidationError(
          `Unsupported payment provider: ${config.provider}`
        );
    }
  }
}
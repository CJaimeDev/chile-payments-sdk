import { TransactionStatus } from '../../types';

// Mapear código de respuesta de Webpay a nuestro TransactionStatus
export function mapWebpayStatus(responseCode: number): TransactionStatus {
  if (responseCode === 0) {
    return 'approved';
  }
  return 'rejected';
}

// Mapear status string de Webpay
export function mapWebpayStatusString(status: string): TransactionStatus {
  const statusUpper = status.toUpperCase();
  
  if (statusUpper === 'AUTHORIZED') {
    return 'approved';
  }
  
  if (statusUpper === 'FAILED' || statusUpper === 'REJECTED') {
    return 'rejected';
  }
  
  return 'pending';
}

// Generar session_id único
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
import crypto from 'crypto';
import { TransactionStatus } from '../../types';

// Generar autenticación para Getnet
export function generateGetnetAuth(login: string, secretKey: string): {
  login: string;
  tranKey: string;
  nonce: string;
  seed: string;
} {
  // Generar nonce (valor aleatorio)
  const nonceRaw = crypto.randomBytes(16).toString('hex');
  const nonce = Buffer.from(nonceRaw).toString('base64');

  // Generar seed (fecha actual ISO)
  const seed = new Date().toISOString();

  // Generar tranKey: Base64(SHA-256(nonce + seed + secretKey))
  const tranKeyRaw = crypto
    .createHash('sha256')
    .update(nonceRaw + seed + secretKey)
    .digest();
  const tranKey = tranKeyRaw.toString('base64');

  return {
    login,
    tranKey,
    nonce,
    seed,
  };
}

// Mapear status de Getnet a nuestro TransactionStatus
export function mapGetnetStatus(status: string): TransactionStatus {
  const statusUpper = status.toUpperCase();

  switch (statusUpper) {
    case 'APPROVED':
      return 'approved';
    case 'REJECTED':
      return 'rejected';
    case 'PENDING':
      return 'pending';
    case 'FAILED':
      return 'failed';
    default:
      return 'pending';
  }
}

// Generar fecha de expiración (15 minutos desde ahora)
export function generateExpirationDate(): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 15);
  return date.toISOString();
}
// Error base del SDK
export class ChilePaymentsError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ChilePaymentsError';
  }
}

// Error de validación de parámetros
export class ValidationError extends ChilePaymentsError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

// Error de autenticación
export class AuthenticationError extends ChilePaymentsError {
  constructor(message: string, details?: any) {
    super(message, 'AUTHENTICATION_ERROR', details);
    this.name = 'AuthenticationError';
  }
}

// Error de la API del proveedor
export class ProviderError extends ChilePaymentsError {
  constructor(
    message: string,
    public provider: string,
    public statusCode?: number,
    details?: any
  ) {
    super(message, 'PROVIDER_ERROR', details);
    this.name = 'ProviderError';
  }
}

// Error de timeout
export class TimeoutError extends ChilePaymentsError {
  constructor(message: string = 'Request timeout') {
    super(message, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}

// Error de transacción no encontrada
export class TransactionNotFoundError extends ChilePaymentsError {
  constructor(transactionId: string) {
    super(
      `Transaction ${transactionId} not found`,
      'TRANSACTION_NOT_FOUND'
    );
    this.name = 'TransactionNotFoundError';
  }
}
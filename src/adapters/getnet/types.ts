// Tipos específicos de Getnet

// Estructura de autenticación
export interface GetnetAuth {
  login: string;
  tranKey: string;
  nonce: string;
  seed: string;
}

// Request para crear sesión
export interface GetnetCreateRequest {
  locale: string;
  auth: GetnetAuth;
  buyer?: {
    name?: string;
    surname?: string;
    email?: string;
    document?: string;
    documentType?: string;
    mobile?: number;
  };
  payment: {
    reference: string;
    description: string;
    amount: {
      currency: string;
      total: number;
    };
  };
  expiration: string;
  returnUrl: string;
  ipAddress: string;
  userAgent: string;
}

// Response de crear sesión
export interface GetnetCreateResponse {
  status: {
    status: string;
    reason: string;
    message: string;
    date: string;
  };
  requestId: number;
  processUrl: string;
}

// Response de consultar transacción
export interface GetnetTransactionResponse {
  requestId: number;
  status: {
    status: string;
    reason: string;
    message: string;
    date: string;
  };
  request: {
    locale: string;
    payment: {
      reference: string;
      description: string;
      amount: {
        currency: string;
        total: number;
      };
    };
  };
  payment?: Array<{
    status: {
      status: string;
      reason: string;
      message: string;
      date: string;
    };
    internalReference: number;
    reference: string;
    amount: {
      from: {
        currency: string;
        total: number;
      };
      to: {
        currency: string;
        total: number;
      };
    };
    authorization?: string;
    receipt?: string;
  }>;
}

// Response de reversa (anulación)
export interface GetnetReverseResponse {
  status: {
    status: string;
    reason: string;
    message: string;
    date: string;
  };
  payment: {
    status: {
      status: string;
      reason: string;
      message: string;
      date: string;
    };
    internalReference: number;
    amount: {
      from: {
        currency: string;
        total: number;
      };
    };
  };
}
// Tipos específicos de Webpay (Transbank)

// Request para crear transacción
export interface WebpayCreateRequest {
  buy_order: string;
  session_id: string;
  amount: number;
  return_url: string;
}

// Response de crear transacción
export interface WebpayCreateResponse {
  token: string;
  url: string;
}

// Response de confirmar/consultar transacción
export interface WebpayTransactionResponse {
  vci: string;
  amount: number;
  status: string;
  buy_order: string;
  session_id: string;
  card_detail?: {
    card_number: string;
  };
  accounting_date: string;
  transaction_date: string;
  authorization_code: string;
  payment_type_code: string;
  response_code: number;
  installments_number: number;
}

// Response de reembolso
export interface WebpayRefundResponse {
  type: string;
  authorization_code: string;
  authorization_date: string;
  nullified_amount: number;
  balance: number;
  response_code: number;
}
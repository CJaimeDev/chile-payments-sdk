// URLs base para cada proveedor en diferentes ambientes

// Webpay (Transbank)
export const WEBPAY_ENDPOINTS = {
  test: 'https://webpay3gint.transbank.cl',
  production: 'https://webpay3g.transbank.cl',
};

// Getnet
export const GETNET_ENDPOINTS = {
  test: 'https://checkout.test.getnet.cl',
  production: 'https://checkout.getnet.cl',
};

// Credenciales públicas de TEST (solo para ambiente de pruebas)
export const TEST_CREDENTIALS = {
  webpay: {
    commerceCode: '597055555532',
    apiKey: '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C',
  },
  getnet: {
    login: '7ffbb7bf1f7361b1200b2e8d74e1d76f',
    secretKey: 'SnZP3D63n3I9dH9O',
  },
};
package cl.payments.constants

import cl.payments.types.Environment
import cl.payments.types.GetnetCredentials
import cl.payments.types.WebpayCredentials

// URLs base para Webpay (Transbank)
val WEBPAY_ENDPOINTS = mapOf(
    Environment.TEST to "https://webpay3gint.transbank.cl",
    Environment.PRODUCTION to "https://webpay3g.transbank.cl"
)

// URLs base para Getnet
val GETNET_ENDPOINTS = mapOf(
    Environment.TEST to "https://checkout.test.getnet.cl",
    Environment.PRODUCTION to "https://checkout.getnet.cl"
)

// Credenciales públicas de TEST (solo para ambiente de pruebas)
object TestCredentials {
    val WEBPAY = WebpayCredentials(
        commerceCode = "597055555532",
        apiKey = "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C"
    )
    
    val GETNET = GetnetCredentials(
        login = "7ffbb7bf1f7361b1200b2e8d74e1d76f",
        secretKey = "SnZP3D63n3I9dH9O"
    )
}
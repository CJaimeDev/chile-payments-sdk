package cl.payments.adapters

import cl.payments.adapters.base.PaymentAdapter
import cl.payments.adapters.webpay.WebpayAdapter
import cl.payments.adapters.getnet.GetnetAdapter
import cl.payments.types.PaymentProvider
import cl.payments.types.SDKConfig

// Factory para crear adaptadores de pago
object AdapterFactory {
    // Crear adaptador según el proveedor configurado
    fun create(config: SDKConfig): PaymentAdapter {
        return when (config.provider) {
            PaymentProvider.WEBPAY -> WebpayAdapter(config)
            PaymentProvider.GETNET -> GetnetAdapter(config)
        }
    }
}
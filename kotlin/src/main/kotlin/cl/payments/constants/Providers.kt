package cl.payments.constants

import cl.payments.types.PaymentProvider

// Lista de proveedores soportados
val SUPPORTED_PROVIDERS = listOf(
    PaymentProvider.WEBPAY,
    PaymentProvider.GETNET
)

// Nombres legibles de proveedores
val PROVIDER_NAMES = mapOf(
    PaymentProvider.WEBPAY to "Webpay (Transbank)",
    PaymentProvider.GETNET to "Getnet (Santander)"
)
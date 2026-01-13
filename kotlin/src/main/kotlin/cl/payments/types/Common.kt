package cl.payments.types

// Proveedores de pago soportados
enum class PaymentProvider {
    WEBPAY,
    GETNET
}

// Ambientes disponibles
enum class Environment {
    TEST,
    PRODUCTION
}

// Estado de una transacción
enum class TransactionStatus {
    PENDING,    // Transacción creada, esperando pago
    APPROVED,   // Pago aprobado
    REJECTED,   // Pago rechazado
    FAILED,     // Error en el proceso
    CANCELLED,  // Cancelada por el usuario
    EXPIRED     // Expiró el tiempo de pago
}

// Moneda (solo CLP por ahora)
enum class Currency {
    CLP
}

// Información de monto
data class Amount(
    val currency: Currency,
    val total: Int
)
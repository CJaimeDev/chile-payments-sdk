package cl.payments.types

// Error base del SDK
open class ChilePaymentsException(
    message: String,
    val code: String,
    val details: Any? = null,
    cause: Throwable? = null
) : Exception(message, cause)

// Error de validación de parámetros
class ValidationException(
    message: String,
    details: Any? = null
) : ChilePaymentsException(message, "VALIDATION_ERROR", details)

// Error de autenticación
class AuthenticationException(
    message: String,
    details: Any? = null
) : ChilePaymentsException(message, "AUTHENTICATION_ERROR", details)

// Error de la API del proveedor
class ProviderException(
    message: String,
    val provider: String,
    val statusCode: Int? = null,
    details: Any? = null
) : ChilePaymentsException(message, "PROVIDER_ERROR", details)

// Error de timeout
class TimeoutException(
    message: String = "Request timeout"
) : ChilePaymentsException(message, "TIMEOUT_ERROR")

// Error de transacción no encontrada
class TransactionNotFoundException(
    transactionId: String
) : ChilePaymentsException(
    "Transaction $transactionId not found",
    "TRANSACTION_NOT_FOUND"
)
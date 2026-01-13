package cl.payments.types

import java.time.LocalDateTime

// Parámetros para crear una transacción
data class CreateTransactionParams(
    // Monto de la transacción
    val amount: Int,
    
    // ID único de la orden en tu sistema
    val orderId: String,
    
    // URL a donde vuelve el usuario después del pago
    val returnUrl: String,
    
    // Descripción de la transacción (opcional)
    val description: String? = null,
    
    // Email del comprador (opcional)
    val email: String? = null,
    
    // Datos adicionales (opcional)
    val metadata: Map<String, Any>? = null
)

// Transacción creada (response de createTransaction)
data class Transaction(
    // Token único de la transacción
    val token: String,
    
    // URL donde se redirige al usuario para pagar
    val paymentUrl: String,
    
    // ID de la transacción en el sistema del proveedor
    val transactionId: String,
    
    // Monto de la transacción
    val amount: Amount,
    
    // ID de la orden original
    val orderId: String,
    
    // Estado actual
    val status: TransactionStatus,
    
    // Fecha de creación
    val createdAt: LocalDateTime,
    
    // Fecha de expiración (si aplica)
    val expiresAt: LocalDateTime? = null
)

// Resultado de una transacción confirmada
data class TransactionResult(
    // Token de la transacción
    val token: String,
    
    // ID de la transacción
    val transactionId: String,
    
    // Estado final
    val status: TransactionStatus,
    
    // Monto procesado
    val amount: Amount,
    
    // ID de la orden
    val orderId: String,
    
    // Código de autorización (si fue aprobado)
    val authorizationCode: String? = null,
    
    // Mensaje del resultado
    val message: String? = null,
    
    // Fecha de procesamiento
    val processedAt: LocalDateTime,
    
    // Información adicional del proveedor
    val providerData: Map<String, Any>? = null
)

// Parámetros para reembolso
data class RefundParams(
    // ID de la transacción a reembolsar
    val transactionId: String,
    
    // Monto a reembolsar (opcional, si no se envía es reembolso total)
    val amount: Int? = null
)

// Resultado de un reembolso
data class Refund(
    // ID del reembolso
    val refundId: String,
    
    // ID de la transacción original
    val transactionId: String,
    
    // Monto reembolsado
    val amount: Amount,
    
    // Estado del reembolso
    val status: RefundStatus,
    
    // Fecha del reembolso
    val refundedAt: LocalDateTime
)

// Estado de reembolso
enum class RefundStatus {
    PENDING,
    APPROVED,
    REJECTED
}
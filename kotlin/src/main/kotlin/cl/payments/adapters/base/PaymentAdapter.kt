package cl.payments.adapters.base

import cl.payments.types.*

// Interfaz que deben implementar todos los adaptadores de pago
interface PaymentAdapter {
    // Nombre del proveedor
    val providerName: String

    // Crear una nueva transacción
    suspend fun createTransaction(params: CreateTransactionParams): Transaction

    // Confirmar una transacción (cuando el usuario vuelve del pago)
    suspend fun confirmTransaction(token: String): TransactionResult

    // Consultar el estado de una transacción
    suspend fun getTransactionStatus(transactionId: String): TransactionStatus

    // Reembolsar una transacción
    suspend fun refundTransaction(params: RefundParams): Refund

    // Validar webhook (notificaciones del proveedor)
    fun validateWebhook(payload: Map<String, Any>, signature: String?): Boolean
}
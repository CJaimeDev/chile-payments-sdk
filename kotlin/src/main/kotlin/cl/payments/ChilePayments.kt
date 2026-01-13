package cl.payments

import cl.payments.adapters.AdapterFactory
import cl.payments.adapters.base.PaymentAdapter
import cl.payments.types.*
import cl.payments.utils.validatePositiveNumber
import cl.payments.utils.validateRequired
import cl.payments.utils.validateUrl

// SDK Principal - Chile Payments
class ChilePayments(config: SDKConfig) {
    private val adapter: PaymentAdapter
    private val config: SDKConfig

    init {
        validateConfig(config)
        this.config = config
        this.adapter = AdapterFactory.create(config)
    }

    // Crear una transacción de pago
    suspend fun createTransaction(params: CreateTransactionParams): Transaction {
        validateTransactionParams(params)
        return adapter.createTransaction(params)
    }

    // Sobrecarga con parámetros individuales para facilidad de uso
    suspend fun createTransaction(
        amount: Int,
        orderId: String,
        returnUrl: String,
        description: String? = null,
        email: String? = null,
        metadata: Map<String, Any>? = null
    ): Transaction {
        val params = CreateTransactionParams(
            amount = amount,
            orderId = orderId,
            returnUrl = returnUrl,
            description = description,
            email = email,
            metadata = metadata
        )
        return createTransaction(params)
    }

    // Confirmar una transacción (después de que el usuario pague)
    suspend fun confirmTransaction(token: String): TransactionResult {
        if (token.isBlank()) {
            throw ValidationException("Token is required")
        }
        return adapter.confirmTransaction(token)
    }

    // Consultar estado de una transacción
    suspend fun getTransactionStatus(transactionId: String): TransactionStatus {
        if (transactionId.isBlank()) {
            throw ValidationException("Transaction ID is required")
        }
        return adapter.getTransactionStatus(transactionId)
    }

    // Reembolsar una transacción
    suspend fun refundTransaction(params: RefundParams): Refund {
        validateRefundParams(params)
        return adapter.refundTransaction(params)
    }

    // Sobrecarga para reembolso
    suspend fun refundTransaction(transactionId: String, amount: Int? = null): Refund {
        val params = RefundParams(transactionId, amount)
        return refundTransaction(params)
    }

    // Validar webhook
    fun validateWebhook(payload: Map<String, Any>, signature: String? = null): Boolean {
        return adapter.validateWebhook(payload, signature)
    }

    // Obtener nombre del proveedor actual
    fun getProvider(): String {
        return adapter.providerName
    }

    // Validar configuración
    private fun validateConfig(config: SDKConfig) {
        val validProviders = listOf(PaymentProvider.WEBPAY, PaymentProvider.GETNET)
        if (config.provider !in validProviders) {
            throw ValidationException(
                "Invalid provider. Must be one of: ${validProviders.joinToString(", ")}"
            )
        }

        val validEnvironments = listOf(Environment.TEST, Environment.PRODUCTION)
        if (config.environment !in validEnvironments) {
            throw ValidationException(
                "Invalid environment. Must be one of: ${validEnvironments.joinToString(", ")}"
            )
        }
    }

    // Validar parámetros de transacción
    private fun validateTransactionParams(params: CreateTransactionParams) {
        validatePositiveNumber(params.amount, "Amount")
        validateRequired(params.orderId, "Order ID")
        validateRequired(params.returnUrl, "Return URL")
        validateUrl(params.returnUrl, "Return URL")
    }

    // Validar parámetros de reembolso
    private fun validateRefundParams(params: RefundParams) {
        validateRequired(params.transactionId, "Transaction ID")
        
        if (params.amount != null && params.amount <= 0) {
            throw ValidationException("Refund amount must be greater than 0")
        }
    }
}

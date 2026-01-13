package cl.payments.adapters.webpay

import cl.payments.adapters.base.BaseAdapter
import cl.payments.constants.TestCredentials
import cl.payments.constants.WEBPAY_ENDPOINTS
import cl.payments.types.*
import cl.payments.utils.formatAmount
import java.time.LocalDateTime

class WebpayAdapter(config: SDKConfig) : BaseAdapter(
    baseURL = WEBPAY_ENDPOINTS[config.environment]
        ?: throw ValidationException("Invalid environment for Webpay"),
    environment = config.environment
) {
    override val providerName = "Webpay"
    
    private val credentials: WebpayCredentials
    
    init {
        // Si es ambiente test y no hay credentials, usar las públicas
        credentials = if (environment == Environment.TEST && config.credentials == null) {
            log("Using public test credentials")
            TestCredentials.WEBPAY
        } else {
            when (config.credentials) {
                is ProviderCredentials.Webpay -> config.credentials.credentials
                else -> throw AuthenticationException("Invalid credentials for Webpay")
            }
        }
        
        // Configurar headers de autenticación
        httpClient.setHeaders(mapOf(
            "Tbk-Api-Key-Id" to credentials.commerceCode,
            "Tbk-Api-Key-Secret" to credentials.apiKey
        ))
        
        log("Webpay adapter initialized", mapOf("environment" to environment))
    }
    
    override suspend fun createTransaction(params: CreateTransactionParams): Transaction {
        log("Creating transaction", params)
        
        val request = WebpayCreateRequest(
            buyOrder = params.orderId,
            sessionId = generateSessionId(),
            amount = formatAmount(params.amount),
            returnUrl = params.returnUrl
        )
        
        val response: WebpayCreateResponse = httpClient.post(
            url = "/rswebpaytransaction/api/webpay/v1.2/transactions",
            data = request
        )
        
        val transaction = Transaction(
            token = response.token,
            paymentUrl = response.url,
            transactionId = response.token,
            amount = Amount(Currency.CLP, params.amount),
            orderId = params.orderId,
            status = TransactionStatus.PENDING,
            createdAt = LocalDateTime.now()
        )
        
        log("Transaction created", transaction)
        return transaction
    }
    
    override suspend fun confirmTransaction(token: String): TransactionResult {
        log("Confirming transaction", mapOf("token" to token))
        
        val response: WebpayTransactionResponse = httpClient.put(
            url = "/rswebpaytransaction/api/webpay/v1.2/transactions/$token"
        )
        
        val status = mapWebpayStatus(response.responseCode)
        
        val result = TransactionResult(
            token = token,
            transactionId = token,
            status = status,
            amount = Amount(Currency.CLP, response.amount),
            orderId = response.buyOrder,
            authorizationCode = response.authorizationCode,
            message = if (status == TransactionStatus.APPROVED) {
                "Transaction approved"
            } else {
                "Transaction rejected (code: ${response.responseCode})"
            },
            processedAt = LocalDateTime.now(),
            providerData = mapOf(
                "vci" to (response.vci ?: ""),
                "paymentTypeCode" to (response.paymentTypeCode ?: ""),
                "responseCode" to response.responseCode,
                "cardNumber" to (response.cardDetail?.cardNumber ?: "")
            )
        )
        
        log("Transaction confirmed", result)
        return result
    }
    
    override suspend fun getTransactionStatus(transactionId: String): TransactionStatus {
        log("Getting transaction status", mapOf("transactionId" to transactionId))
        
        val response: WebpayTransactionResponse = httpClient.get(
            url = "/rswebpaytransaction/api/webpay/v1.2/transactions/$transactionId"
        )
        
        return mapWebpayStatus(response.responseCode)
    }
    
    override suspend fun refundTransaction(params: RefundParams): Refund {
        log("Refunding transaction", params)
        
        val refundAmount = params.amount ?: 0 // Si es null, la API hace reembolso total
        
        val requestData = if (refundAmount > 0) {
            mapOf("amount" to refundAmount)
        } else {
            emptyMap()
        }
        
        val response: WebpayRefundResponse = httpClient.post(
            url = "/rswebpaytransaction/api/webpay/v1.2/transactions/${params.transactionId}/refunds",
            data = requestData
        )
        
        val refund = Refund(
            refundId = response.authorizationCode,
            transactionId = params.transactionId,
            amount = Amount(Currency.CLP, response.nullifiedAmount.toInt()),
            status = if (response.responseCode == 0) {
                RefundStatus.APPROVED
            } else {
                RefundStatus.REJECTED
            },
            refundedAt = LocalDateTime.now()
        )
        
        log("Transaction refunded", refund)
        return refund
    }
    
    override fun validateWebhook(payload: Map<String, Any>, signature: String?): Boolean {
        // Webpay no usa webhooks tradicionales, siempre retorna true
        return true
    }
}

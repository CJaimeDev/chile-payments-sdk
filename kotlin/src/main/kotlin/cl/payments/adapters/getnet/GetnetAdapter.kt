package cl.payments.adapters.getnet

import cl.payments.adapters.base.BaseAdapter
import cl.payments.constants.GETNET_ENDPOINTS
import cl.payments.constants.TestCredentials
import cl.payments.types.*
import cl.payments.utils.formatAmount
import java.time.LocalDateTime

class GetnetAdapter(config: SDKConfig) : BaseAdapter(
    baseURL = GETNET_ENDPOINTS[config.environment]
        ?: throw ValidationException("Invalid environment for Getnet"),
    environment = config.environment
) {
    override val providerName = "Getnet"
    
    private val credentials: GetnetCredentials
    
    init {
        // Si es ambiente test y no hay credentials, usar las públicas
        credentials = if (environment == Environment.TEST && config.credentials == null) {
            log("Using public test credentials")
            TestCredentials.GETNET
        } else {
            when (config.credentials) {
                is ProviderCredentials.Getnet -> config.credentials.credentials
                else -> throw AuthenticationException("Invalid credentials for Getnet")
            }
        }
        
        log("Getnet adapter initialized", mapOf("environment" to environment))
    }
    
    override suspend fun createTransaction(params: CreateTransactionParams): Transaction {
        log("Creating transaction", params)
        
        val auth = generateGetnetAuth(credentials.login, credentials.secretKey)
        
        val request = GetnetCreateRequest(
            locale = "es_CL",
            auth = auth,
            buyer = params.email?.let {
                GetnetBuyer(email = it)
            },
            payment = GetnetPayment(
                reference = params.orderId,
                description = params.description ?: "Payment",
                amount = GetnetAmount(
                    currency = "CLP",
                    total = formatAmount(params.amount)
                )
            ),
            expiration = generateExpirationDate(),
            returnUrl = params.returnUrl,
            ipAddress = "127.0.0.1",
            userAgent = "ChilePaymentsSDK/1.0"
        )
        
        val response: GetnetCreateResponse = httpClient.post(
            url = "/api/session/",
            data = request
        )
        
        val transaction = Transaction(
            token = response.requestId.toString(),
            paymentUrl = response.processUrl,
            transactionId = response.requestId.toString(),
            amount = Amount(Currency.CLP, params.amount),
            orderId = params.orderId,
            status = mapGetnetStatus(response.status.status),
            createdAt = LocalDateTime.now()
        )
        
        log("Transaction created", transaction)
        return transaction
    }
    
    override suspend fun confirmTransaction(token: String): TransactionResult {
        log("Confirming transaction", mapOf("token" to token))
        
        val auth = generateGetnetAuth(credentials.login, credentials.secretKey)
        
        val requestData = mapOf("auth" to auth)
        
        val response: GetnetTransactionResponse = httpClient.post(
            url = "/api/session/$token",
            data = requestData
        )
        
        val status = mapGetnetStatus(response.status.status)
        val paymentInfo = response.payment?.firstOrNull()
        
        val result = TransactionResult(
            token = token,
            transactionId = response.requestId.toString(),
            status = status,
            amount = Amount(Currency.CLP, response.request.payment.amount.total),
            orderId = response.request.payment.reference,
            authorizationCode = paymentInfo?.authorization,
            message = response.status.message ?: response.status.reason ?: "Transaction processed",
            processedAt = LocalDateTime.now(),
            providerData = mapOf(
                "requestId" to response.requestId,
                "statusReason" to (response.status.reason ?: ""),
                "paymentMethod" to (paymentInfo?.paymentMethod ?: ""),
                "franchise" to (paymentInfo?.franchise ?: ""),
                "receipt" to (paymentInfo?.receipt ?: "")
            )
        )
        
        log("Transaction confirmed", result)
        return result
    }
    
    override suspend fun getTransactionStatus(transactionId: String): TransactionStatus {
        log("Getting transaction status", mapOf("transactionId" to transactionId))
        
        val auth = generateGetnetAuth(credentials.login, credentials.secretKey)
        
        val requestData = mapOf("auth" to auth)
        
        val response: GetnetTransactionResponse = httpClient.post(
            url = "/api/session/$transactionId",
            data = requestData
        )
        
        return mapGetnetStatus(response.status.status)
    }
    
    override suspend fun refundTransaction(params: RefundParams): Refund {
        log("Refunding transaction", params)
        
        // Primero necesitamos obtener el internalReference
        val auth = generateGetnetAuth(credentials.login, credentials.secretKey)
        
        val requestData = mapOf("auth" to auth)
        
        val infoResponse: GetnetTransactionResponse = httpClient.post(
            url = "/api/session/${params.transactionId}",
            data = requestData
        )
        
        val paymentInfo = infoResponse.payment?.firstOrNull()
            ?: throw TransactionNotFoundException(params.transactionId)
        
        val internalReference = paymentInfo.internalReference
        
        // Ahora hacemos la reversa
        val reverseRequest = GetnetReverseRequest(
            auth = generateGetnetAuth(credentials.login, credentials.secretKey),
            internalReference = internalReference
        )
        
        val response: GetnetReverseResponse = httpClient.post(
            url = "/api/reverse",
            data = reverseRequest
        )
        
        val refundAmount = params.amount ?: paymentInfo.amount.total
        
        val refund = Refund(
            refundId = internalReference.toString(),
            transactionId = params.transactionId,
            amount = Amount(Currency.CLP, refundAmount),
            status = if (mapGetnetStatus(response.status.status) == TransactionStatus.APPROVED) {
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
        if (signature == null) return false
        
        val requestId = payload["requestId"]?.toString() ?: return false
        val status = (payload["status"] as? Map<*, *>)?.get("status")?.toString() ?: return false
        val date = (payload["status"] as? Map<*, *>)?.get("date")?.toString() ?: return false
        
        return validateGetnetSignature(
            requestId = requestId,
            status = status,
            date = date,
            signature = signature,
            secretKey = credentials.secretKey
        )
    }
}

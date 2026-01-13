package cl.payments.adapters.getnet

import com.google.gson.annotations.SerializedName

// Autenticación de Getnet
data class GetnetAuth(
    val login: String,
    val tranKey: String,
    val nonce: String,
    val seed: String
)

// Información del comprador
data class GetnetBuyer(
    val name: String? = null,
    val surname: String? = null,
    val email: String? = null,
    val documentType: String? = null,
    val document: String? = null,
    val mobile: String? = null
)

// Información de pago
data class GetnetPayment(
    val reference: String,
    val description: String,
    val amount: GetnetAmount
)

// Monto
data class GetnetAmount(
    val currency: String = "CLP",
    val total: Int
)

// Request para crear sesión
data class GetnetCreateRequest(
    val locale: String = "es_CL",
    val auth: GetnetAuth,
    val buyer: GetnetBuyer? = null,
    val payment: GetnetPayment,
    val expiration: String,
    val returnUrl: String,
    val ipAddress: String = "127.0.0.1",
    val userAgent: String = "ChilePaymentsSDK/1.0"
)

// Response al crear sesión
data class GetnetCreateResponse(
    val status: GetnetStatus,
    val requestId: Int,
    val processUrl: String
)

// Estado de Getnet
data class GetnetStatus(
    val status: String,
    val reason: String? = null,
    val message: String? = null,
    val date: String
)

// Response de información de transacción
data class GetnetTransactionResponse(
    val requestId: Int,
    val status: GetnetStatus,
    val request: GetnetRequestInfo,
    val payment: List<GetnetPaymentInfo>? = null
)

// Información de la request
data class GetnetRequestInfo(
    val locale: String,
    val payer: GetnetPayerInfo? = null,
    val payment: GetnetPayment,
    val returnUrl: String,
    val ipAddress: String,
    val userAgent: String
)

// Información del pagador
data class GetnetPayerInfo(
    val document: String? = null,
    val documentType: String? = null,
    val name: String? = null,
    val surname: String? = null,
    val email: String? = null,
    val mobile: String? = null
)

// Información de pago procesado
data class GetnetPaymentInfo(
    val status: GetnetStatus,
    val internalReference: Int,
    val paymentMethod: String? = null,
    val paymentMethodName: String? = null,
    val issuerName: String? = null,
    val amount: GetnetAmount,
    val authorization: String? = null,
    val reference: String,
    val receipt: String? = null,
    val franchise: String? = null,
    val refunded: Boolean? = null
)

// Request para reversar/reembolsar
data class GetnetReverseRequest(
    val auth: GetnetAuth,
    val internalReference: Int
)

// Response de reversa
data class GetnetReverseResponse(
    val status: GetnetStatus,
    val payment: GetnetPaymentInfo? = null
)
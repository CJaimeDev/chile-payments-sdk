package cl.payments.adapters.webpay

import com.google.gson.annotations.SerializedName

// Request para crear transacción en Webpay
data class WebpayCreateRequest(
    @SerializedName("buy_order")
    val buyOrder: String,
    
    @SerializedName("session_id")
    val sessionId: String,
    
    val amount: Int,
    
    @SerializedName("return_url")
    val returnUrl: String
)

// Response al crear transacción
data class WebpayCreateResponse(
    val token: String,
    val url: String
)

// Response de transacción confirmada
data class WebpayTransactionResponse(
    val vci: String?,
    val amount: Int,
    val status: String,
    
    @SerializedName("buy_order")
    val buyOrder: String,
    
    @SerializedName("session_id")
    val sessionId: String,
    
    @SerializedName("card_detail")
    val cardDetail: WebpayCardDetail?,
    
    @SerializedName("accounting_date")
    val accountingDate: String?,
    
    @SerializedName("transaction_date")
    val transactionDate: String,
    
    @SerializedName("authorization_code")
    val authorizationCode: String?,
    
    @SerializedName("payment_type_code")
    val paymentTypeCode: String?,
    
    @SerializedName("response_code")
    val responseCode: Int,
    
    @SerializedName("installments_amount")
    val installmentsAmount: Int?,
    
    @SerializedName("installments_number")
    val installmentsNumber: Int?
)

// Detalle de tarjeta
data class WebpayCardDetail(
    @SerializedName("card_number")
    val cardNumber: String
)

// Response de reembolso
data class WebpayRefundResponse(
    @SerializedName("authorization_code")
    val authorizationCode: String,
    
    @SerializedName("authorization_date")
    val authorizationDate: String,
    
    @SerializedName("nullified_amount")
    val nullifiedAmount: Double,
    
    val balance: Double,
    
    @SerializedName("response_code")
    val responseCode: Int
)
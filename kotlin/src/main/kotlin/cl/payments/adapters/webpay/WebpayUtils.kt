package cl.payments.adapters.webpay

import cl.payments.types.TransactionStatus
import kotlin.random.Random

// Mapear response_code de Webpay a TransactionStatus
fun mapWebpayStatus(responseCode: Int): TransactionStatus {
    return when (responseCode) {
        0 -> TransactionStatus.APPROVED  // Transacción aprobada
        else -> TransactionStatus.REJECTED  // Cualquier otro código = rechazada
    }
}

// Mapear status string de Webpay a TransactionStatus
fun mapWebpayStatusString(status: String): TransactionStatus {
    return when (status.uppercase()) {
        "AUTHORIZED" -> TransactionStatus.APPROVED
        "FAILED" -> TransactionStatus.FAILED
        else -> TransactionStatus.REJECTED
    }
}

// Generar session_id único para Webpay
fun generateSessionId(): String {
    val timestamp = System.currentTimeMillis()
    val random = Random.nextInt(100000, 999999)
    return "session_${timestamp}_${random}"
}
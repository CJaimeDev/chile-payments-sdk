package cl.payments.adapters.getnet

import cl.payments.types.TransactionStatus
import java.security.MessageDigest
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*

// Generar autenticación de Getnet
fun generateGetnetAuth(login: String, secretKey: String): GetnetAuth {
    // Generar nonce (número aleatorio en base64)
    val nonceBytes = ByteArray(16)
    Random().nextBytes(nonceBytes)
    val nonce = Base64.getEncoder().encodeToString(nonceBytes)
    
    // Generar seed (fecha actual en ISO 8601 con offset)
    val seed = LocalDateTime.now()
        .atZone(java.time.ZoneId.systemDefault())
        .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
    
    // Generar tranKey: Base64(SHA-256(nonce + seed + secretKey))
    // IMPORTANTE: nonce debe estar sin el Base64 para el hash
    val nonceRaw = Base64.getDecoder().decode(nonce)
    val tranKeyInput = nonceRaw + seed.toByteArray() + secretKey.toByteArray()
    
    val digest = MessageDigest.getInstance("SHA-256")
    val hash = digest.digest(tranKeyInput)
    val tranKey = Base64.getEncoder().encodeToString(hash)
    
    return GetnetAuth(
        login = login,
        tranKey = tranKey,
        nonce = nonce,
        seed = seed
    )
}

// Mapear status de Getnet a TransactionStatus
fun mapGetnetStatus(status: String): TransactionStatus {
    return when (status.uppercase()) {
        "APPROVED", "APPROVED_PARTIAL" -> TransactionStatus.APPROVED
        "REJECTED" -> TransactionStatus.REJECTED
        "PENDING", "PENDING_VALIDATION", "PENDING_PROCESS" -> TransactionStatus.PENDING
        "FAILED", "ERROR" -> TransactionStatus.FAILED
        else -> TransactionStatus.PENDING
    }
}

// Generar fecha de expiración (ISO 8601 con offset)
fun generateExpirationDate(minutesFromNow: Long = 15): String {
    return LocalDateTime.now()
        .plusMinutes(minutesFromNow)
        .atZone(java.time.ZoneId.systemDefault())
        .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
}

// Validar signature de webhook
fun validateGetnetSignature(
    requestId: String,
    status: String,
    date: String,
    signature: String,
    secretKey: String
): Boolean {
    // Signature: SHA-1(requestId + status + date + secretKey)
    val signatureInput = requestId + status + date + secretKey
    val digest = MessageDigest.getInstance("SHA-1")
    val hash = digest.digest(signatureInput.toByteArray())
    val expectedSignature = hash.joinToString("") { "%02x".format(it) }
    
    return expectedSignature.equals(signature, ignoreCase = true)
}
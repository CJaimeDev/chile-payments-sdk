package cl.payments.types

// Configuración base del SDK
data class SDKConfig(
    // Proveedor de pago a utilizar
    val provider: PaymentProvider,
    
    // Ambiente (test o production)
    val environment: Environment,
    
    // Credenciales del proveedor (opcional si usa credenciales públicas de test)
    val credentials: ProviderCredentials? = null,
    
    // Timeout para requests HTTP (en ms) - default: 30000
    val timeout: Long = 30000
)

// Credenciales para Webpay
data class WebpayCredentials(
    val commerceCode: String,
    val apiKey: String
)

// Credenciales para Getnet
data class GetnetCredentials(
    val login: String,
    val secretKey: String
)

// Tipo sellado para credenciales (union type en Kotlin)
sealed class ProviderCredentials {
    data class Webpay(val credentials: WebpayCredentials) : ProviderCredentials()
    data class Getnet(val credentials: GetnetCredentials) : ProviderCredentials()
}
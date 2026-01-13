package cl.payments.adapters.base

import cl.payments.types.Environment
import cl.payments.utils.HttpClient

// Clase base abstracta para todos los adaptadores
abstract class BaseAdapter(
    baseURL: String,
    protected val environment: Environment,
    timeout: Long = 30000
) : PaymentAdapter {
    
    protected val httpClient = HttpClient(baseURL, timeout)

    // Helper: Verificar si estamos en ambiente de pruebas
    protected fun isTestEnvironment(): Boolean {
        return environment == Environment.TEST
    }

    // Helper: Log de debug (solo en test)
    protected fun log(message: String, data: Any? = null) {
        if (isTestEnvironment()) {
            println("[$providerName] $message ${data ?: ""}")
        }
    }
}
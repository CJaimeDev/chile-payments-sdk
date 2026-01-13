package cl.payments.utils

import cl.payments.types.ValidationException
import java.net.URL

// Validar que un valor no sea nulo o vacío
fun validateRequired(value: String?, fieldName: String) {
    if (value.isNullOrBlank()) {
        throw ValidationException("$fieldName is required")
    }
}

// Validar que un número sea positivo
fun validatePositiveNumber(value: Int, fieldName: String) {
    if (value <= 0) {
        throw ValidationException("$fieldName must be a positive number")
    }
}

// Validar que sea una URL válida
fun validateUrl(url: String, fieldName: String) {
    try {
        URL(url)
    } catch (e: Exception) {
        throw ValidationException("$fieldName must be a valid URL")
    }
}

// Validar email
fun validateEmail(email: String): Boolean {
    val emailRegex = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$".toRegex()
    return emailRegex.matches(email)
}

// Validar RUT chileno (formato básico)
fun validateRut(rut: String): Boolean {
    val rutRegex = "^[0-9]{1,2}\\.[0-9]{3}\\.[0-9]{3}-[0-9kK]$".toRegex()
    return rutRegex.matches(rut)
}
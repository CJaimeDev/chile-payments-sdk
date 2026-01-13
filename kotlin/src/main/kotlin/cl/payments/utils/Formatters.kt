package cl.payments.utils

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

// Formatear monto a entero (las APIs chilenas usan montos sin decimales)
fun formatAmount(amount: Int): Int {
    return amount
}

// Formatear fecha a ISO string
fun formatDate(date: LocalDateTime): String {
    return date.format(DateTimeFormatter.ISO_DATE_TIME)
}

// Parsear fecha desde string
fun parseDate(dateString: String): LocalDateTime {
    return LocalDateTime.parse(dateString, DateTimeFormatter.ISO_DATE_TIME)
}

// Generar ID único simple
fun generateId(): String {
    return "${System.currentTimeMillis()}-${(0..999999).random()}"
}

// Limpiar objeto de valores null
fun <K, V> cleanMap(map: Map<K, V?>): Map<K, V> {
    return map.filterValues { it != null }.mapValues { it.value!! }
}
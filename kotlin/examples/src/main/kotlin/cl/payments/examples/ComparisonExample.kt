package cl.payments.examples.comparison

import cl.payments.ChilePayments
import cl.payments.types.Environment
import cl.payments.types.PaymentProvider
import cl.payments.types.SDKConfig
import kotlinx.coroutines.runBlocking

fun main() = runBlocking {
    println("=== API Unificada - Mismo código, diferentes proveedores ===\n")

    val providers = listOf(PaymentProvider.WEBPAY, PaymentProvider.GETNET)

    for (provider in providers) {
        println("\n--- Probando ${provider.name} ---")

        val payments = ChilePayments(
            SDKConfig(
                provider = provider,
                environment = Environment.TEST
            )
        )

        try {
            val transaction = payments.createTransaction(
                amount = 5000,
                orderId = "ORDEN-${provider.name}-${System.currentTimeMillis()}",
                returnUrl = "http://localhost:3000/return",
                description = "Pago de prueba con ${provider.name}"
            )

            println("✅ Transacción creada exitosamente")
            println("Proveedor: ${payments.getProvider()}")
            println("Token: ${transaction.token}")
            println("URL de pago: ${transaction.paymentUrl}")
            println("Estado: ${transaction.status}")

        } catch (e: Exception) {
            println("❌ Error: ${e.message}")
        }
    }

    println("\n✨ ¡El mismo código funciona con ambos proveedores!")
}

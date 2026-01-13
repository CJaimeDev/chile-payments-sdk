package cl.payments.examples.getnet

import cl.payments.ChilePayments
import cl.payments.types.Environment
import cl.payments.types.PaymentProvider
import cl.payments.types.SDKConfig
import kotlinx.coroutines.runBlocking

fun main() = runBlocking {
    println("==========================================================")
    println("      SDK Chile Payments - Getnet Interactivo")
    println("==========================================================\n")

    val payments = ChilePayments(
        SDKConfig(
            provider = PaymentProvider.GETNET,
            environment = Environment.TEST
        )
    )

    try {
        // PASO 1: Crear transacción
        println("PASO 1: Creando transaccion...\n")
        
        val transaction = payments.createTransaction(
            amount = 1000,
            orderId = "ORDEN-${System.currentTimeMillis()}",
            returnUrl = "http://localhost:3000/payment/return",
            description = "Compra de prueba Getnet",
            email = "test@example.com"
        )

        println("[OK] Transaccion creada:")
        println("   Token (Request ID): ${transaction.token}")
        println("   Monto: ${transaction.amount.total} ${transaction.amount.currency}")
        println("   Estado: ${transaction.status}")

        // PASO 2: Mostrar instrucciones
        println("\n==========================================================")
        println("          PASO 2: Realizar el pago")
        println("==========================================================\n")

        println("Datos de prueba Getnet:")
        println("   VISA (APROBADA): 4111111111111111")
        println("   Mastercard (RECHAZADA): 5367680000000013")
        println("   CVV: 123")
        println("   Expiracion: Cualquier fecha futura\n")

        println("URL de pago:")
        println("----------------------------------------------------------")
        println(transaction.paymentUrl)
        println("----------------------------------------------------------\n")

        println("Copia y pega la URL en tu navegador para pagar.\n")

        // PASO 3: Esperar confirmación
        println("==========================================================")
        println("     PASO 3: Confirmar transaccion")
        println("==========================================================\n")

        println("Despues de pagar, Getnet te redirigira a:")
        println("   http://localhost:3000/payment/return\n")

        print("Ya completaste el pago? (presiona Enter para confirmar): ")
        readLine()

        println("\nConfirmando transaccion...")
        println("Por favor espera...\n")

        // PASO 4: Confirmar transacción
        val result = payments.confirmTransaction(transaction.token)

        println("==========================================================")
        println("          TRANSACCION CONFIRMADA")
        println("==========================================================\n")

        println("RESULTADO DEL PAGO:")
        println("----------------------------------------------------------")
        val statusText = when (result.status.name) {
            "APPROVED" -> "[OK] APROBADO"
            "REJECTED" -> "[X] RECHAZADO"
            else -> "[?] ${result.status.name}"
        }
        println("Estado: $statusText")
        println("Monto: ${result.amount.total} ${result.amount.currency}")
        println("Orden: ${result.orderId}")
        
        if (result.authorizationCode != null) {
            println("Autorizacion: ${result.authorizationCode}")
        }
        
        println("Mensaje: ${result.message}")
        println("Procesado: ${result.processedAt}")
        println("----------------------------------------------------------")

        val providerData = result.providerData
        if (providerData != null) {
            println("\nDatos adicionales del proveedor:")
            providerData.forEach { (key, value) ->
                println("   $key: $value")
            }
        }

        println("\nProceso completado exitosamente!\n")

    } catch (e: Exception) {
        println("\n[ERROR]: ${e.message}")
        e.printStackTrace()
    }
}
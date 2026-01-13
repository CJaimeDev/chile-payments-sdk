package cl.payments.examples.webpay

import cl.payments.ChilePayments
import cl.payments.types.Environment
import cl.payments.types.PaymentProvider
import cl.payments.types.SDKConfig
import kotlinx.coroutines.runBlocking

fun main() = runBlocking {
    println("==========================================================")
    println("     SDK Chile Payments - Webpay Interactivo")
    println("==========================================================\n")

    val payments = ChilePayments(
        SDKConfig(
            provider = PaymentProvider.WEBPAY,
            environment = Environment.TEST
        )
    )

    try {
        // PASO 1: Crear transacción
        println("PASO 1: Creando transaccion...\n")
        
        val transaction = payments.createTransaction(
            amount = 10000,
            orderId = "ORDEN-${System.currentTimeMillis()}",
            returnUrl = "http://localhost:3000/payment/return",
            description = "Compra de prueba interactiva",
            email = "test@example.com"
        )

        println("[OK] Transaccion creada:")
        println("   Token: ${transaction.token}")
        println("   Monto: ${transaction.amount.total} ${transaction.amount.currency}")
        println("   Estado: ${transaction.status}")

        // PASO 2: Mostrar instrucciones
        println("\n==========================================================")
        println("          PASO 2: Realizar el pago")
        println("==========================================================\n")

        println("Datos de prueba Webpay:")
        println("   Tarjeta: 4051885600446623")
        println("   CVV: 123")
        println("   RUT: 11.111.111-1")
        println("   Clave: 123\n")

        println("Para pagar, haz un POST a:")
        println("   URL: ${transaction.paymentUrl}")
        println("   Parametro: token_ws=${transaction.token}\n")

        println("Puedes usar este formulario HTML:")
        println("----------------------------------------------------------")
        
        val html = """
<!DOCTYPE html>
<html>
<head><title>Pago Webpay</title></head>
<body>
    <h2>Pago con Webpay</h2>
    <p>Redirigiendo automaticamente...</p>
    <form id="form" method="POST" action="${transaction.paymentUrl}">
        <input type="hidden" name="token_ws" value="${transaction.token}">
        <button type="submit">Ir a Webpay</button>
    </form>
    <script>
        setTimeout(() => document.getElementById('form').submit(), 2000);
    </script>
</body>
</html>
        """.trimIndent()
        
        println(html)
        println("----------------------------------------------------------\n")

        // PASO 3: Esperar confirmación
        println("==========================================================")
        println("     PASO 3: Confirmar transaccion")
        println("==========================================================\n")

        println("Despues de pagar, Webpay te redirigira a:")
        println("   http://localhost:3000/payment/return?token_ws=...\n")
        println("Copia el TOKEN de la URL y pegalo aqui.\n")

        print("Ingresa el TOKEN (o presiona Enter para usar el actual): ")
        val tokenInput = readLine()?.trim()

        val tokenToConfirm = if (tokenInput.isNullOrEmpty()) {
            println("\n[!] Usando el token de la transaccion creada (solo para demostracion)")
            println("    En produccion, debes usar el token que retorna Webpay.\n")
            transaction.token
        } else {
            tokenInput
        }

        println("\nConfirmando transaccion con token: $tokenToConfirm")
        println("Por favor espera...\n")

        // PASO 4: Confirmar transacción
        val result = payments.confirmTransaction(tokenToConfirm)

        println("==========================================================")
        println("          TRANSACCION CONFIRMADA")
        println("==========================================================\n")

        println("RESULTADO DEL PAGO:")
        println("----------------------------------------------------------")
        println("Estado: ${if (result.status.name == "APPROVED") "[OK] APROBADO" else "[X] RECHAZADO"}")
        println("Monto: ${result.amount.total} ${result.amount.currency}")
        println("Orden: ${result.orderId}")
        println("Autorizacion: ${result.authorizationCode ?: "N/A"}")
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
import { ChilePayments } from '../src';
import * as readline from 'readline';
import * as http from 'http';
import open from 'open';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function interactiveGetnetTest() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║      🔐 SDK Chile Payments - Getnet Interactivo     ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  const payments = new ChilePayments({
    provider: 'getnet',
    environment: 'test',
  });

  let server: http.Server | null = null;

  try {
    // PASO 0: Crear servidor temporal
    const PORT = 3001;
    
    server = http.createServer((req, res) => {
      // Getnet no envía el token como query param, solo redirige
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Getnet - Pago Completado</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #00b4d8 0%, #0077b6 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            max-width: 600px;
            width: 100%;
            text-align: center;
        }
        .success-icon { font-size: 80px; margin: 20px 0; }
        h1 { color: #0077b6; margin: 20px 0; font-size: 32px; }
        .message {
            background: #d4edda;
            color: #155724;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
        }
        .instructions {
            background: #fff3cd;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
            text-align: left;
        }
        .instructions p { margin: 8px 0; color: #856404; }
        button {
            background: #0077b6;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
        }
        button:hover { background: #005f8a; }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">✅</div>
        <h1>¡Pago Completado!</h1>
        
        <div class="message">
            <h3>Has sido redirigido desde Getnet</h3>
            <p>Tu pago ha sido procesado</p>
        </div>

        <div class="instructions">
            <h3>📋 Próximos Pasos:</h3>
            <p><strong>1.</strong> Vuelve a la terminal</p>
            <p><strong>2.</strong> Presiona Enter para confirmar el pago</p>
            <p><strong>3.</strong> El SDK consultará el estado automáticamente</p>
        </div>


        <p style="color: #666; margin-top: 30px; font-size: 14px;">
            Chile Payments SDK - Ejemplo de Integración
        </p>
    </div>
</body>
</html>
      `);
    });

    await new Promise<void>((resolve) => {
      server!.listen(PORT, () => {
        console.log(`🌐 Servidor temporal iniciado en http://localhost:${PORT}`);
        resolve();
      });
    });

    // PASO 1: Crear transacción
    console.log('\n📝 PASO 1: Creando transacción...\n');
    
    const transaction = await payments.createTransaction({
      amount: 1000,
      orderId: `ORDEN-${Date.now()}`,
      returnUrl: `http://localhost:${PORT}/payment/return`,
      description: 'Compra de prueba Getnet',
      email: 'test@example.com',
    });

    console.log('✅ Transacción creada:');
    console.log('   Token (Request ID):', transaction.token);
    console.log('   Monto:', transaction.amount.total, transaction.amount.currency);
    console.log('   Estado:', transaction.status);

    // PASO 2: Mostrar instrucciones
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║          📱 PASO 2: Realizar el pago                 ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    console.log('💡 Datos de prueba Getnet:');
    console.log('   VISA (APROBADA): 4111111111111111');
    console.log('   Mastercard (RECHAZADA): 5367680000000013');
    console.log('   CVV: 123');
    console.log('   Expiración: Cualquier fecha futura\n');

    console.log('🌐 URL de pago:');
    console.log('   ', transaction.paymentUrl);

    console.log('\n🚀 Abriendo página de pago en el navegador...\n');
    await open(transaction.paymentUrl);

    // PASO 3: Esperar confirmación
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║     ⏳ PASO 3: Confirmar transacción                 ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    console.log('⏳ Esperando que completes el pago...');
    console.log('💡 Después del pago, Getnet te redirigirá automáticamente.\n');

    await askQuestion('¿Ya completaste el pago? (presiona Enter para confirmar): ');

    console.log('\n🔍 Confirmando transacción...');
    console.log('⏳ Por favor espera...\n');

    // PASO 4: Confirmar transacción
    const result = await payments.confirmTransaction(transaction.token);

    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║          ✅ TRANSACCIÓN CONFIRMADA                    ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    console.log('📊 RESULTADO DEL PAGO:');
    console.log('─────────────────────────────────────────────────────────');
    console.log('Estado:', result.status === 'approved' ? '✅ APROBADO' : 
                          result.status === 'rejected' ? '❌ RECHAZADO' : 
                          '⏳ ' + result.status.toUpperCase());
    console.log('Monto:', result.amount.total, result.amount.currency);
    console.log('Orden:', result.orderId);
    
    if (result.authorizationCode) {
      console.log('Autorización:', result.authorizationCode);
    }
    
    console.log('Mensaje:', result.message);
    console.log('Procesado:', result.processedAt.toLocaleString('es-CL'));
    console.log('─────────────────────────────────────────────────────────');

    if (result.providerData) {
      console.log('\n📋 Datos adicionales del proveedor:');
      console.log(JSON.stringify(result.providerData, null, 2));
    }

    console.log('\n✨ ¡Proceso completado exitosamente!\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.details) {
      console.error('Detalles:', JSON.stringify(error.details, null, 2));
    }
  } finally {
    if (server) {
      server.close(() => {
        console.log('🔒 Servidor temporal cerrado');
      });
    }
    rl.close();
    
    // Salir del script
    setTimeout(() => {
      process.exit(0);
    }, 500);
  }
}

interactiveGetnetTest();
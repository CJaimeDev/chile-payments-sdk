import { ChilePayments } from '../src';
import * as readline from 'readline';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
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

async function interactiveWebpayTest() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║     🔐 SDK Chile Payments - Webpay Interactivo      ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  const payments = new ChilePayments({
    provider: 'webpay',
    environment: 'test',
  });

  let server: http.Server | null = null;

  try {
    // PASO 0: Crear servidor temporal
    const PORT = 3000;
    
    server = http.createServer((req, res) => {
      const url = new URL(req.url || '', `http://localhost:${PORT}`);
      const token = url.searchParams.get('token_ws');

      if (token) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Webpay - Pago Completado</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        h1 { color: #667eea; margin: 20px 0; font-size: 32px; }
        .message {
            background: #d4edda;
            color: #155724;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
        }
        .token-box {
            background: #f0f0f0;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .token {
            font-family: 'Courier New', monospace;
            background: white;
            padding: 15px;
            border-radius: 5px;
            word-break: break-all;
            font-size: 14px;
            color: #667eea;
            border: 2px solid #667eea;
            margin-top: 10px;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
        }
        button:hover { background: #5568d3; }
        .instructions {
            background: #fff3cd;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
            text-align: left;
        }
        .instructions p { margin: 8px 0; color: #856404; }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">✅</div>
        <h1>¡Pago Exitoso!</h1>
        
        <div class="message">
            <h3>Tu pago ha sido procesado correctamente</h3>
            <p>Webpay ha confirmado la transacción</p>
        </div>

        <div class="instructions">
            <h3>📋 Próximos Pasos:</h3>
            <p><strong>1.</strong> Copia el token de abajo (botón copiar)</p>
            <p><strong>2.</strong> Vuelve a la terminal</p>
            <p><strong>3.</strong> Pega el token cuando se te solicite</p>
            <p><strong>4.</strong> El SDK confirmará tu pago automáticamente</p>
        </div>

        <div class="token-box">
            <h3>🔑 Token de Transacción:</h3>
            <div class="token" id="token">${token}</div>
        </div>

        <button onclick="copyToken()">📋 Copiar Token</button>

        <p style="color: #666; margin-top: 30px; font-size: 14px;">
            Chile Payments SDK - Ejemplo de Integración
        </p>
    </div>

    <script>
        function copyToken() {
            const tokenText = document.getElementById('token').textContent;
            navigator.clipboard.writeText(tokenText).then(() => {
                alert('✅ Token copiado al portapapeles!\\n\\nAhora vuelve a la terminal y pégalo.');
            }).catch(err => {
                prompt('Copia este token manualmente:', tokenText);
            });
        }
    </script>
</body>
</html>
        `);
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Token no encontrado');
      }
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
      amount: 10000,
      orderId: `ORDEN-${Date.now()}`,
      returnUrl: `http://localhost:${PORT}/payment/return`,
      description: 'Compra de prueba interactiva',
      email: 'test@example.com',
    });

    console.log('✅ Transacción creada:');
    console.log('   Token:', transaction.token);
    console.log('   Monto:', transaction.amount.total, transaction.amount.currency);
    console.log('   Estado:', transaction.status);

    // PASO 2: Crear archivo HTML temporal
    const paymentHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Webpay - Redirigiendo...</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
        .box { background: white; padding: 30px; border-radius: 10px; max-width: 400px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h2 { color: #667eea; }
        .info { background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: left; }
        .info p { margin: 5px 0; font-size: 14px; }
        button { background: #667eea; color: white; border: none; padding: 12px 30px; border-radius: 5px; cursor: pointer; font-size: 16px; }
        button:hover { background: #5568d3; }
        .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #667eea; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="box">
        <h2>🔐 Pago con Webpay</h2>
        <div class="spinner"></div>
        <p>Redirigiendo en 2 segundos...</p>
        <div class="info">
            <p><strong>📋 Datos de Prueba:</strong></p>
            <p>Tarjeta: 4051885600446623</p>
            <p>CVV: 123</p>
            <p>RUT: 11.111.111-1</p>
            <p>Clave: 123</p>
        </div>
        <form id="form" method="POST" action="${transaction.paymentUrl}">
            <input type="hidden" name="token_ws" value="${transaction.token}">
            <button type="submit">Ir a Webpay ➜</button>
        </form>
    </div>
    <script>
        setTimeout(() => document.getElementById('form').submit(), 2000);
    </script>
</body>
</html>`;

    const htmlPath = path.join(__dirname, 'webpay-payment.html');
    fs.writeFileSync(htmlPath, paymentHtml);

    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║          📱 PASO 2: Realizar el pago                 ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    console.log('💡 Datos de prueba Webpay:');
    console.log('   Tarjeta: 4051885600446623');
    console.log('   CVV: 123');
    console.log('   RUT: 11.111.111-1');
    console.log('   Clave: 123\n');

    console.log('🚀 Abriendo página de pago...\n');
    await open(htmlPath);

    // PASO 3: Esperar token
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║     ⏳ PASO 3: Confirmar transacción                 ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    console.log('⏳ Esperando que completes el pago...');
    console.log('💡 Después del pago, copia el token de la página de retorno.\n');

    const tokenInput = await askQuestion('Pega aquí el TOKEN: ');

    if (!tokenInput || tokenInput.trim() === '') {
      console.log('\n❌ No ingresaste ningún token. Saliendo...');
      return;
    }

    const tokenToConfirm = tokenInput.trim();

    console.log('\n🔍 Confirmando transacción...');
    console.log('⏳ Por favor espera...\n');

    // PASO 4: Confirmar
    const result = await payments.confirmTransaction(tokenToConfirm);

    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║          ✅ TRANSACCIÓN CONFIRMADA                    ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    console.log('📊 RESULTADO DEL PAGO:');
    console.log('─────────────────────────────────────────────────────────');
    console.log('Estado:', result.status === 'approved' ? '✅ APROBADO' : '❌ RECHAZADO');
    console.log('Monto:', result.amount.total, result.amount.currency);
    console.log('Orden:', result.orderId);
    console.log('Autorización:', result.authorizationCode);
    console.log('Mensaje:', result.message);
    console.log('Procesado:', result.processedAt.toLocaleString('es-CL'));
    console.log('─────────────────────────────────────────────────────────');

    if (result.providerData) {
      console.log('\n📋 Datos adicionales:');
      console.log(JSON.stringify(result.providerData, null, 2));
    }

    console.log('\n✨ ¡Proceso completado exitosamente!\n');

    // Limpiar archivo
    if (fs.existsSync(htmlPath)) {
      fs.unlinkSync(htmlPath);
      console.log('🗑️  Archivo temporal eliminado');
    }

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
  setTimeout(() => {
      process.exit(0);
    }, 500);
  }
}

interactiveWebpayTest();
import { ChilePayments } from '../src';

// Ejemplo mostrando cómo usar ambos proveedores con el mismo código
async function comparisonExample() {
  console.log('=== API Unificada - Mismo código, diferentes proveedores ===\n');

  const providers: Array<'webpay' | 'getnet'> = ['webpay', 'getnet'];

  for (const provider of providers) {
    console.log(`\n--- Probando ${provider.toUpperCase()} ---`);

    const payments = new ChilePayments({
      provider,
      environment: 'test',
    });

    try {
      const transaction = await payments.createTransaction({
        amount: 5000,
        orderId: `ORDEN-${provider}-${Date.now()}`,
        returnUrl: 'http://localhost:3000/return',
        description: `Pago de prueba con ${provider}`,
      });

      console.log('✅ Transacción creada exitosamente');
      console.log('Proveedor:', payments.getProvider());
      console.log('Token:', transaction.token);
      console.log('URL de pago:', transaction.paymentUrl);
      console.log('Estado:', transaction.status);

    } catch (error: any) {
      console.error('❌ Error:', error.message);
    }
  }

  console.log('\n✨ ¡El mismo código funciona con ambos proveedores!');
}

comparisonExample();
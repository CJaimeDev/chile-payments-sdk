![Banner Chile Payments SDK](./screenshots/banner.png)

# 🇨🇱 Chile Payments SDK

SDK unificado para integrar pasarelas de pago chilenas (Webpay y Getnet) con una API consistente. Disponible en **TypeScript/JavaScript** y **Kotlin/JVM**.

![Estado del Proyecto](https://img.shields.io/badge/Status-Stable-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![Kotlin](https://img.shields.io/badge/Kotlin-1.9-7F52FF?style=flat-square&logo=kotlin)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![Android](https://img.shields.io/badge/Android-7.0+-3DDC84?style=flat-square&logo=android)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

---

## 📖 Descripción

**Chile Payments SDK** unifica la integración de múltiples pasarelas de pago chilenas bajo una **API consistente**. Escribe el código una vez y cambia de proveedor modificando solo la configuración.
```typescript
// Mismo código para Webpay, Getnet, o cualquier proveedor futuro
const payments = new ChilePayments({
  provider: 'webpay',  // Cambia solo esto
  environment: 'test'
});

const transaction = await payments.createTransaction({
  amount: 10000,
  orderId: 'ORDER-123',
  returnUrl: 'https://mitienda.com/return'
});
```

---

## ✨ Características

- ✅ **API unificada** - Mismo código, diferentes proveedores
- ✅ **Type-safe** - TypeScript con tipos completos y Kotlin con type safety
- ✅ **Validaciones automáticas** - Montos, URLs, IDs requeridos
- ✅ **Manejo de errores consistente** - Mismas excepciones para todos los proveedores
- ✅ **Credenciales de test públicas** - Prueba sin registro
- ✅ **Multiplataforma** - TypeScript/JavaScript (Web, Node.js) y Kotlin/JVM (Android, Spring Boot)

---

## 🏦 Pasarelas Soportadas

| Pasarela | Nombre Comercial | Provider | TypeScript | Kotlin | Test Credentials |
|----------|------------------|----------|------------|--------|------------------|
| **Webpay** | Transbank | `webpay` | ✅ | ✅ | ✅ Públicas |
| **Getnet** | Santander | `getnet` | ✅ | ✅ | ✅ Públicas |

---

## 📦 Instalación

### Clonar el repositorio
```bash
git clone https://github.com/CJaimeDev/chile-payments-sdk.git
cd chile-payments-sdk
```

### TypeScript/JavaScript
```bash
# Instalar dependencias
npm install

# Compilar
npm run build
```

### Kotlin/JVM
```bash
# Navegar a la carpeta Kotlin
cd kotlin

# Compilar
./gradlew build
```

---

## 🚀 Uso Rápido

### TypeScript/JavaScript

**Ver ejemplos completos en:** [`examples/`](./examples/)
```bash
npm install
npm run build
npm run example:webpay    # Ejemplo completo Webpay
npm run example:getnet    # Ejemplo completo Getnet
```

**Código básico:**
```typescript
import { ChilePayments } from './src';

const payments = new ChilePayments({
  provider: 'webpay',
  environment: 'test'
});

const transaction = await payments.createTransaction({
  amount: 10000,
  orderId: `ORDER-${Date.now()}`,
  returnUrl: 'https://mitienda.com/payment/return',
  description: 'Compra de productos'
});

console.log('Token:', transaction.token);
console.log('URL:', transaction.paymentUrl);

// Confirmar después del pago
const result = await payments.confirmTransaction(transaction.token);
console.log('Estado:', result.status);
```

---

### Kotlin/JVM

**Ver ejemplos completos en:** [`kotlin/examples/`](./kotlin/examples/)
```bash
cd kotlin
./gradlew :examples:runWebpay    # Ejemplo Webpay
./gradlew :examples:runGetnet    # Ejemplo Getnet
```

**Código básico:**
```kotlin
import cl.payments.ChilePayments
import cl.payments.types.*
import kotlinx.coroutines.runBlocking

fun main() = runBlocking {
    val payments = ChilePayments(
        SDKConfig(
            provider = PaymentProvider.GETNET,
            environment = Environment.TEST
        )
    )

    val transaction = payments.createTransaction(
        amount = 1000,
        orderId = "ORDER-${System.currentTimeMillis()}",
        returnUrl = "https://miapp.com/return"
    )

    println("Token: ${transaction.token}")
    println("URL: ${transaction.paymentUrl}")

    // Confirmar después del pago
    val result = payments.confirmTransaction(transaction.token)
    println("Estado: ${result.status}")
}
```

---

## 💡 Ejemplos Interactivos

### TypeScript

Los ejemplos incluyen servidor HTTP temporal y flujo completo de pago:
```bash
npm run example:webpay       # Webpay con servidor HTTP
npm run example:getnet       # Getnet interactivo
npm run example:comparison   # Compara ambos proveedores
```

**Datos de prueba Webpay:**
- Tarjeta: `4051885600446623`
- CVV: `123`
- RUT: `11.111.111-1`
- Clave: `123`

**Datos de prueba Getnet:**
- VISA (aprobada): `4111111111111111`
- Mastercard (rechazada): `5367680000000013`
- CVV: `123`

---

### Kotlin
```bash
cd kotlin
./gradlew :examples:runWebpay       # Webpay interactivo
./gradlew :examples:runGetnet       # Getnet interactivo
./gradlew :examples:runComparison   # Comparación
```

---

## 📚 API Reference

### Constructor
```typescript
new ChilePayments(config: SDKConfig)
```
```kotlin
ChilePayments(config: SDKConfig)
```

**Configuración:**
```typescript
interface SDKConfig {
  provider: 'webpay' | 'getnet';
  environment: 'test' | 'production';
  credentials?: ProviderCredentials;  // Opcional en test
  timeout?: number;  // default: 30000ms
}
```

---

### Métodos Principales

#### **createTransaction()**

Crea una nueva transacción de pago.
```typescript
await payments.createTransaction({
  amount: 10000,           // Monto en CLP
  orderId: 'ORDER-123',    // ID único
  returnUrl: 'https://...' // URL de retorno
})
```

**Retorna:** `Transaction` con `token`, `paymentUrl`, `status`, etc.

---

#### **confirmTransaction()**

Confirma una transacción después del pago.
```typescript
const result = await payments.confirmTransaction(token);
// result.status: 'approved' | 'rejected' | 'failed' | 'cancelled'
```

---

#### **getTransactionStatus()**

Consulta el estado de una transacción.
```typescript
const status = await payments.getTransactionStatus(transactionId);
```

---

#### **refundTransaction()**

Reembolsa una transacción (total o parcial).
```typescript
await payments.refundTransaction({
  transactionId: 'TXN-123',
  amount: 5000  // Opcional para reembolso parcial
})
```

---

### Manejo de Errores
```typescript
try {
  const result = await payments.confirmTransaction(token);
} catch (error) {
  if (error instanceof ValidationException) {
    // Error de validación
  } else if (error instanceof ProviderException) {
    // Error del proveedor
  } else if (error instanceof TimeoutException) {
    // Timeout de conexión
  }
}
```
```kotlin
try {
    val result = payments.confirmTransaction(token)
} catch (e: ValidationException) {
    // Error de validación
} catch (e: ProviderException) {
    // Error del proveedor
}
```

---

## 🛠️ Tecnologías

### TypeScript/JavaScript
- TypeScript 5.0
- Axios
- Node.js 18+

### Kotlin/JVM
- Kotlin 1.9
- OkHttp
- Gson
- Coroutines
- Gradle 9.2

---

## 📁 Estructura del Proyecto
```
chile-payments-sdk/
├── src/                    # SDK TypeScript
│   ├── ChilePayments.ts
│   ├── types/
│   ├── adapters/
│   ├── utils/
│   └── constants/
├── examples/               # Ejemplos TypeScript
├── kotlin/                # SDK Kotlin
│   ├── src/
│   └── examples/
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE)

---

⭐ **Si este proyecto te fue útil, considera darle una estrella en GitHub!**

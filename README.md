# Essensse PosVentas — Sistema de Facturación, Inventarios & Punto de Venta (Clean Architecture)

> **Propiedad Intelectual & Licencia:**  
> Sistema desarrollado y de la propiedad de **Maxwell Chacón (Cédula: 201-290495-0006A)**.  
> Libre para su uso en negocios comerciales y pequeñas empresas. Prohibida su venta, redistribución o comercialización no autorizada sin el consentimiento expreso del autor.  
>  
> **Apoyo al Proyecto (Invítame un Café - Donaciones LAFISE Bancentro Digital):**  
> - **Cuenta Amigo en Córdobas:** `138027529`  
> - **Cuenta Amigo en Dólares:** `133258435`  
> - **Cuenta Digital LAFISE:** `133238477`  

---

## 🌟 Características Principales

1. **Clean Architecture desacoplada:**  
   - `domain/`: Entidades de negocio puras, tipos, contratos e interfaces. Sin dependencias de frameworks ni UI.
   - `infrastructure/`: Implementaciones concretas de persistencia multi-base de datos, drivers de hardware, generador de PDF, hojas de Excel y API OpenAPI 3.0.
   - `context/`: Casos de uso centralizados y orquestación de estado reactivo.
   - `components/`: Vistas de usuario responsivas con soporte nativo de Modo Día y Modo Noche (Dark Mode).

2. **Multi-Motor de Base de Datos (SQLite, PostgreSQL, MySQL):**  
   - Arquitectura Offline-First con persistencia local y soporte de esquemas DDL nativos para SQLite (`.sqlite3` / `sqflite`), PostgreSQL (Cloud Run / Supabase / Neon) y MySQL.
   - Generación instantánea de scripts SQL con llaves foráneas e índices optimizados.

3. **Compatibilidad con Hardware de Punto de Venta:**  
   - **Pistolas Escáner de Código de Barras y QR (USB / Bluetooth / Inalámbricas):** Detección global de ráfaga de pulsaciones a alta velocidad (<60ms) con descarte de tipeo manual humano. Compatible con Honeywell, Zebra, Netum, Datalogic y modelos genéricos.
   - **Cámara Web / Dispositivo Móvil:** Escáner integrado para lectura óptica sin periféricos externos.
   - **Básculas y Balanzas Digitales de Mostrador:** Protocolo serie RS-232 / USB HID con lectura continua, botón de tara, reseteo a cero y cálculo automático de precio por peso (kg / lb). Compatible con Torrey, CAS, Toledo y Cardinal.

4. **Facturación Electrónica Fiscal DGI (Dirección General de Ingresos):**  
   - Generación de código **CUFE** (Código Único de Factura Electrónica) con firma digital SHA-256.
   - Generación de comprobante fiscal en formato **XML UBL 2.1** con especificación de firma digital XMLDSig.
   - Código QR fiscal con enlace de consulta DGI directo.

5. **10 Reportes Estratégicos y Fiscales (Exportables a PDF y Excel):**  
   1. **Ventas Diarias y por Método de Pago:** Efectivo, Tarjeta, Transferencia y Crédito.
   2. **Top Productos Más Vendidos y Rotación:** Artículos de mayor demanda y unidades vendidas.
   3. **Valoración Total de Inventario y Stock Bajo:** Valuación monetaria al costo de compra y alertas de reposición.
   4. **Semáforo de Vencimiento de Lotes:** Alerta a 30 días y productos expirados.
   5. **Margen de Ganancia y Utilidad Bruta:** Ingresos netos vs costo de mercancía vendida (CMV).
   6. **Antigüedad de Cuentas por Cobrar (Clientes):** Saldos pendientes, abonos parciales y límites de crédito.
   7. **Cuentas por Pagar a Proveedores:** Facturas de compras a crédito y compromisos financieros.
   8. **Histórico de Arqueos y Cierres de Caja Chica:** Cuadres Z/X, sobrantes y faltantes de dinero.
   9. **Liquidación de IVA Fiscal y Facturas DGI:** Base gravada, débito fiscal y reporte mensual impositivo.
   10. **Auditoría de Movimientos por Usuario y Cajero:** Trazabilidad completa de operaciones.

6. **Control de Caja Chica & Arqueo de Turno (Cortes X y Z):**  
   - Apertura de turno con fondo inicial en efectivo.
   - Registro de gastos menores y retiros de bóveda.
   - Arqueo ciego con conteo físico vs dinero esperado en sistema.

7. **Multiusuario & Roles Granulares (RBAC):**  
   - Roles: `SuperAdmin`, `Admin`, `Cajero`, `Bodeguero` y `Contador`.
   - Permisos independientes por módulo (Lectura, Creación, Actualización, Eliminación y Exportación).

8. **Sincronización en la Nube & Backup en Google Drive:**  
   - Descarga de copias de seguridad encriptadas en `.json` y sincronización en segundo plano.

9. **API Swagger / OpenAPI 3.0 en Red Local:**  
   - Consola interactiva de pruebas y especificación lista para integrar aplicaciones móviles Flutter, ecommerce o sistemas ERP externos.

---

## 🚀 Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en puerto 3000
npm run dev

# Construir para producción
npm run build
```

---

## 📱 Equivalencia y Guía de Migración a Flutter

La estructura de Clean Architecture implementada en este proyecto se mapea 1:1 con un proyecto Flutter profesional:

```
lib/
├── core/
│   ├── network/             # Dio / HTTP client
│   ├── hardware/            # usb_serial, bluetooth_print, mobile_scanner
│   └── database/            # drift / sqflite database manager
├── features/
│   ├── pos/
│   │   ├── domain/          # Entities: Sale, CartItem, Product
│   │   ├── data/            # Local & Remote Datasources, Repositories
│   │   └── presentation/    # Bloc / Riverpod State, POSScreen
│   ├── inventory/
│   ├── purchases/
│   ├── credits/
│   ├── cash_register/
│   └── reports/
└── main.dart
```

---

## 🛠️ Personalización y Desarrollo a Medida

Si quieres que agregue o personalice funciones exclusivas para tu negocio, contáctame a mi correo: **ing.chacon.maxwell@gmail.com**. Te hago el presupuesto y ¡manos a la obra! Además, si necesitas la versión instalable `.exe` para Windows, te la proporciono lista para usar.

---

© 2026 Maxwell Chacón. Todos los derechos reservados.

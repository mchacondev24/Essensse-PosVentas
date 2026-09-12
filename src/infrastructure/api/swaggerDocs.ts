export interface SwaggerEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  tags: string[];
  parameters?: {
    name: string;
    in: 'query' | 'path' | 'header';
    required: boolean;
    description: string;
    type: string;
    example?: string;
  }[];
  requestBody?: {
    description: string;
    example: any;
  };
  responses: {
    code: number;
    description: string;
    example: any;
  }[];
}

export const SWAGGER_SPEC = {
  openapi: '3.0.3',
  info: {
    title: 'FactuPro Invoicing & Inventory REST API',
    version: '1.0.0',
    description: 'API REST para integración con sistemas externos (ERP, E-commerce, Apps móviles en Flutter, Balanzas y Terminales POS en red local o nube). Compatible con JSON y autenticación por API Token.',
    contact: {
      name: 'Maxwell Chacón (Cédula: 2012904950006A)',
      email: 'ing.chacon.maxwell@gmail.com',
    },
    license: {
      name: 'Propiedad de Maxwell Chacón - Libre uso en negocios',
      url: 'https://factupro.local/license',
    },
  },
  servers: [
    { url: 'http://localhost:3000/api/v1', description: 'Servidor Local (LAN / Contenedor)' },
    { url: 'https://factupro.cloud/api/v1', description: 'Servidor Nube Sincronizado' },
  ],
  endpoints: [
    {
      method: 'GET',
      path: '/api/v1/products',
      summary: 'Obtener catálogo de productos y stock en tiempo real',
      description: 'Devuelve la lista de productos filtrables por categoría, código de barras o alertas de stock.',
      tags: ['Inventario & Productos'],
      parameters: [
        { name: 'category', in: 'query', required: false, description: 'Filtrar por categoría', type: 'string', example: 'Bebidas & Licores' },
        { name: 'lowStockOnly', in: 'query', required: false, description: 'Solo productos bajo stock mínimo', type: 'boolean', example: 'false' },
      ],
      responses: [
        {
          code: 200,
          description: 'Catálogo obtenido exitosamente',
          example: {
            success: true,
            count: 2,
            data: [
              {
                id: 'prod-001',
                code: '7501055310884',
                name: 'Coca Cola Original 2.5 Litros',
                type: 'producto',
                unit: 'UND',
                salePrice: 65.0,
                currentStock: 48,
                minStock: 15,
                expirationDate: '2026-11-20',
              },
            ],
          },
        },
      ],
    },
    {
      method: 'POST',
      path: '/api/v1/sales',
      summary: 'Emitir nueva venta y generar Factura Electrónica',
      description: 'Registra una venta de contado o crédito, descuenta inventario en tiempo real, genera CUFE fiscal y actualiza el Kardex.',
      tags: ['Ventas & Facturación Electrónica'],
      requestBody: {
        description: 'Datos de la venta',
        example: {
          customerId: 'cust-002',
          paymentMethod: 'credito',
          isCredit: true,
          creditDays: 30,
          items: [
            { productId: 'prod-001', quantity: 2, unitPrice: 65.0 },
            { productId: 'prod-002', quantity: 10, unitPrice: 24.0 },
          ],
        },
      },
      responses: [
        {
          code: 201,
          description: 'Factura Electrónica emitida con éxito',
          example: {
            success: true,
            invoiceSeries: 'FAC-01',
            invoiceNumber: '00001044',
            total: 370.0,
            cufe: 'CUFE-9901AC8490BFF41209381289AEBC',
            cae: 'CAE-2026-9048-A984',
            status: 'completada',
          },
        },
      ],
    },
    {
      method: 'GET',
      path: '/api/v1/kardex',
      summary: 'Consultar Kardex y movimientos por producto',
      description: 'Devuelve el historial cronológico de entradas, salidas y costo promedio ponderado.',
      tags: ['Kardex & Movimientos'],
      parameters: [
        { name: 'productId', in: 'query', required: true, description: 'ID del producto a auditar', type: 'string', example: 'prod-002' },
      ],
      responses: [
        {
          code: 200,
          description: 'Historial de Kardex',
          example: {
            productId: 'prod-002',
            productName: 'Arroz Grano de Oro Especial 96/4',
            initialStock: 50,
            currentStock: 350,
            entriesCount: 3,
          },
        },
      ],
    },
    {
      method: 'GET',
      path: '/api/v1/cash-register/current',
      summary: 'Estado actual de Caja Chica y Arqueo',
      description: 'Retorna el arqueo de la caja abierta actual, ventas en efectivo, ingresos y gastos registrados.',
      tags: ['Caja Chica'],
      responses: [
        {
          code: 200,
          description: 'Caja actual activa',
          example: {
            status: 'abierta',
            code: 'CAJA-PRINCIPAL-01',
            initialCash: 1500.0,
            totalCashSales: 281.75,
            totalCashIngresos: 500.0,
            totalCashGastos: 150.0,
            expectedCashInDrawer: 2131.75,
          },
        },
      ],
    },
    {
      method: 'GET',
      path: '/api/v1/health',
      summary: 'Health Check y Estado de Sincronización en la Nube',
      description: 'Verifica la conectividad del motor SQLite/Postgres y estado de backup en Drive.',
      tags: ['Sistema & Sincronización'],
      responses: [
        {
          code: 200,
          description: 'Sistema operativo y sincronizado',
          example: {
            status: 'healthy',
            cloudSync: 'synchronized',
            database: 'SQLite 3 (Portable Active)',
            lastBackup: '2026-09-12T08:00:00.000Z',
            creator: 'Maxwell Chacón (2012904950006A)',
          },
        },
      ],
    },
  ] as SwaggerEndpoint[],
};

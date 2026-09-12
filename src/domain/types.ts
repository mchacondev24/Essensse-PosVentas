export type RoleType = 'superadmin' | 'admin' | 'cajero' | 'bodeguero' | 'contador';

export interface UserPermission {
  module: 'pos' | 'inventory' | 'kardex' | 'purchases' | 'credits' | 'cash' | 'contacts' | 'reports' | 'users' | 'settings' | 'api';
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: RoleType;
  avatar?: string;
  active: boolean;
  status?: 'active' | 'inactive';
  phone?: string;
  lastLogin?: string;
  createdAt?: string;
  permissions?: UserPermission[];
}

export type ItemType = 'producto' | 'servicio';

export type UnitOfMeasure = 'UND' | 'KG' | 'LB' | 'LT' | 'MT' | 'CAJA' | 'DOC' | 'PAQ';

export interface Product {
  id: string;
  code: string; // Barcode or SKU
  name: string;
  type: ItemType;
  category: string;
  brand: string;
  supplierId?: string;
  unit: UnitOfMeasure;
  purchasePrice: number;
  salePrice: number;
  minPrice?: number;
  wholesalePrice?: number;
  currentStock: number;
  minStock: number;
  lotNumber?: string;
  expirationDate?: string; // YYYY-MM-DD
  isScaleProduct?: boolean; // Requires weighing scale
  taxPercent: number; // e.g. 15% IVA
  description?: string;
  image?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  identification: string; // Cédula o RUC
  email: string;
  phone: string;
  address: string;
  creditLimit: number;
  currentCredit: number;
  allowCredit: boolean;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  identification: string; // RUC
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  categoriesSupplied: string[];
  bankAccount?: string;
  createdAt: string;
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'credito' | 'mixto';

export interface SaleItem {
  productId: string;
  code: string;
  name: string;
  unit: UnitOfMeasure;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  weightGrams?: number;
}

export interface ElectronicInvoiceData {
  invoiceNumber: string;
  electronicAuthorization: string; // CAE or Fiscal UUID
  cufe: string; // Código Único de Factura Electrónica
  qrData: string;
  digitalSignature: string;
  emissionDate: string;
  securityCode: string;
}

export interface Sale {
  id: string;
  invoiceSeries: string;
  invoiceNumber: string;
  date: string; // ISO
  customerId?: string;
  customerName: string;
  customerIdentification?: string;
  userId: string;
  userName: string;
  items: SaleItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  isCredit: boolean;
  creditDueDate?: string;
  creditBalance?: number;
  creditPaid?: number;
  creditStatus?: 'pendiente' | 'pagado' | 'vencido';
  electronicInvoice?: ElectronicInvoiceData;
  notes?: string;
  status: 'completada' | 'anulada';
}

export interface PurchaseItem {
  productId: string;
  code: string;
  name: string;
  unit?: UnitOfMeasure;
  quantity: number;
  unitCost: number;
  subtotal: number;
  taxAmount?: number;
  total?: number;
  lotNumber?: string;
  expirationDate?: string;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  invoiceSupplierNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  userId: string;
  userName: string;
  items: PurchaseItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  paymentMethod: 'contado' | 'credito';
  isCredit: boolean;
  creditDueDate?: string;
  creditBalance?: number;
  creditPaid?: number;
  creditStatus?: 'pendiente' | 'pagado' | 'vencido';
  status: 'recibido' | 'anulado';
  notes?: string;
}

export type MovementType = 'entrada_compra' | 'salida_venta' | 'ajuste_positivo' | 'ajuste_negativo' | 'devolucion_cliente' | 'devolucion_proveedor' | 'apertura_inicial';

export interface InventoryMovement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  productCode: string;
  type: MovementType;
  quantity: number;
  costPrice: number;
  salePrice?: number;
  previousStock: number;
  newStock: number;
  referenceDoc: string; // e.g. FAC-001 or COM-045
  userId: string;
  userName: string;
  reason?: string;
}

export interface KardexEntry {
  date: string;
  reference: string;
  type: MovementType;
  // Entradas
  inQty: number;
  inCost: number;
  inTotal: number;
  // Salidas
  outQty: number;
  outCost: number;
  outTotal: number;
  // Saldo
  balanceQty: number;
  balanceCost: number; // Weighted average cost
  balanceTotal: number;
  userId: string;
}

export interface CashMovement {
  id: string;
  cashRegisterId: string;
  date: string;
  type: 'ingreso' | 'gasto';
  category: string; // e.g. 'Pago servicios', 'Adelanto sueldo', 'Compra insumos', 'Ingreso extraordinario'
  amount: number;
  description: string;
  referenceReceipt?: string;
  userId: string;
  userName: string;
}

export interface CashDenomination {
  value: number;
  count: number;
  total: number;
}

export interface CashRegister {
  id: string;
  code: string;
  openedAt: string;
  closedAt?: string;
  openedByUserId: string;
  openedByUserName: string;
  closedByUserId?: string;
  closedByUserName?: string;
  initialCash: number;
  totalCashSales: number;
  totalCardSales: number;
  totalTransferSales: number;
  totalCreditSales: number;
  totalCashIngresos: number;
  totalCashGastos: number;
  expectedCashInDrawer: number;
  actualCashCounted?: number;
  difference?: number; // actual - expected
  status: 'abierta' | 'cerrada';
  denominations?: CashDenomination[];
  closingNotes?: string;
}

export interface CreditPayment {
  id: string;
  type: 'cliente' | 'proveedor';
  referenceId: string; // Sale ID or Purchase ID
  date: string;
  amount: number;
  paymentMethod: 'efectivo' | 'transferencia' | 'tarjeta';
  notes?: string;
  userId: string;
  userName: string;
}

export interface BusinessConfig {
  name: string;
  commercialName: string;
  taxId: string; // RUC o Cédula
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  currencySymbol: string; // 'C$' o '$'
  currencyName: string; // 'Córdobas' o 'Dólares'
  exchangeRateUsd: number; // Córdoba to USD rate e.g. 36.62
  taxRatePercent: number; // 15% IVA
  logoUrl?: string;
  invoiceSeries: string;
  resolutionNumber: string;
  resolutionDate: string;
  invoiceHeaderMessage: string;
  invoiceFooterMessage: string;
  autoCloudSync: boolean;
  driveBackupEnabled: boolean;
  lastBackupDate?: string;
  creatorCopyright: string;
  creatorCedula: string;
  creatorEmail: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
}

export type UserRole = RoleType;

export type DatabaseDialect = 'sqlite' | 'postgresql' | 'mysql';

export type CashMovementType = 'ingreso' | 'gasto' | 'retiro' | 'venta_efectivo';

export interface CreditAccount {
  id: string;
  type: 'por_cobrar' | 'por_pagar';
  referenceId: string;
  invoiceNumber: string;
  contactName: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  status: 'pendiente' | 'pagado' | 'vencido';
  phone?: string;
}

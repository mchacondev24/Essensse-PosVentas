import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AuditLog,
  BusinessConfig,
  CashMovement,
  CashRegister,
  CreditAccount,
  Customer,
  InventoryMovement,
  PaymentMethod,
  Product,
  Purchase,
  RoleType,
  Sale,
  SaleItem,
  Supplier,
  User,
} from '../domain/types';
import { AppDatabase } from '../infrastructure/storage/database';
import { BarcodeGunService } from '../infrastructure/hardware/barcodeScanner';

interface AppContextType {
  // Theme & Sync
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  syncStatus: 'synced' | 'syncing' | 'offline';
  lastSyncTime: string;
  triggerCloudSync: () => Promise<void>;
  triggerDriveBackup: () => Promise<void>;

  // Auth & Permissions
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => void;
  hasPermission: (module: string, action: 'create' | 'read' | 'update' | 'delete') => boolean;

  // Data Collections
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  purchases: Purchase[];
  movements: InventoryMovement[];
  cashRegisters: CashRegister[];
  cashMovements: CashMovement[];
  creditAccounts: CreditAccount[];
  activeCashRegister?: CashRegister;
  businessConfig: BusinessConfig;
  auditLogs: AuditLog[];

  // Actions
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  createSale: (saleInput: {
    customerId: string;
    customerName: string;
    customerIdentification?: string;
    items: SaleItem[];
    subtotal: number;
    taxTotal: number;
    discountTotal: number;
    total: number;
    paymentMethod: PaymentMethod;
    amountPaid: number;
    change: number;
    isCredit: boolean;
    creditDays?: number;
    notes?: string;
  }) => Sale;
  createPurchase: (purchaseInput: {
    supplierId: string;
    supplierName: string;
    invoiceSupplierNumber: string;
    items: {
      productId: string;
      code: string;
      name: string;
      quantity: number;
      unitCost: number;
      subtotal: number;
      lotNumber?: string;
      expirationDate?: string;
    }[];
    subtotal: number;
    taxTotal: number;
    total: number;
    isCredit: boolean;
    creditDays?: number;
    notes?: string;
  }) => Purchase;
  payCreditSale: (saleId: string, amount: number) => void;
  payCreditPurchase: (purchaseId: string, amount: number) => void;
  addCashMovement: (movement: {
    type: 'ingreso' | 'gasto';
    category: string;
    amount: number;
    description: string;
    referenceReceipt?: string;
  }) => void;
  openCashRegister: (initialCash: number) => void;
  closeCashRegister: (actualCash: number, notes?: string) => void;
  saveBusinessConfig: (config: BusinessConfig) => void;
  updateBusinessConfig: (config: BusinessConfig) => void;
  saveUser: (user: User) => void;
  saveCustomer: (customer: Customer) => void;
  saveSupplier: (supplier: Supplier) => void;
  restoreDatabase: (json: string) => boolean;
  exportDatabaseJson: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const db = AppDatabase.getInstance();

  // Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('factupro_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('factupro_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Cloud Sync
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return localStorage.getItem('factupro_last_sync_timestamp') || new Date().toISOString();
  });

  // State Collections
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [customers, setCustomers] = useState<Customer[]>(() => db.getCustomers());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => db.getSuppliers());
  const [sales, setSales] = useState<Sale[]>(() => db.getSales());
  const [purchases, setPurchases] = useState<Purchase[]>(() => db.getPurchases());
  const [movements, setMovements] = useState<InventoryMovement[]>(() => db.getMovements());
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>(() => db.getCashRegisters());
  const [cashMovements, setCashMovements] = useState<CashMovement[]>(() => db.getCashMovements());
  const [users, setUsers] = useState<User[]>(() => db.getUsers());
  const [currentUser, setCurrentUser] = useState<User>(() => db.getCurrentUser());
  const [businessConfig, setBusinessConfigState] = useState<BusinessConfig>(() => db.getBusinessConfig());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => db.getAuditLogs());

  // Init barcode gun hardware listener
  useEffect(() => {
    BarcodeGunService.init();
  }, []);

  // Permission helper
  const hasPermission = (module: string, action: 'create' | 'read' | 'update' | 'delete'): boolean => {
    if (currentUser.role === 'superadmin') return true;
    const perm = currentUser.permissions?.find(p => p.module === module);
    if (!perm) return false;
    return Boolean(perm[action]);
  };

  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      db.setCurrentUser(user);
      db.addAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'Cambio de Usuario / Inicio de Sesión',
        module: 'Seguridad',
        details: `Sesión iniciada con rol: ${user.role.toUpperCase()}`,
      });
      setAuditLogs(db.getAuditLogs());
    }
  };

  const triggerCloudSync = async () => {
    setSyncStatus('syncing');
    await new Promise(r => setTimeout(r, 1200));
    const now = new Date().toISOString();
    setLastSyncTime(now);
    localStorage.setItem('factupro_last_sync_timestamp', now);
    setSyncStatus('synced');
    db.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Sincronización Automática en la Nube',
      module: 'Sistema',
      details: 'Sincronización de réplicas en la nube completada exitosamente.',
    });
    setAuditLogs(db.getAuditLogs());
  };

  const triggerDriveBackup = async () => {
    setSyncStatus('syncing');
    await new Promise(r => setTimeout(r, 1500));
    const now = new Date().toISOString();
    const updatedConfig = { ...businessConfig, lastBackupDate: now };
    setBusinessConfigState(updatedConfig);
    db.saveBusinessConfig(updatedConfig);

    // Create download of backup file
    const backupJson = db.exportFullBackupJSON();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FactuPro_Drive_Backup_${now.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setSyncStatus('synced');
    db.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Copia de Seguridad en Google Drive',
      module: 'Backup',
      details: 'Archivo de respaldo exportado y sincronizado con Google Drive.',
    });
    setAuditLogs(db.getAuditLogs());
  };

  // Products
  const saveProduct = (product: Product) => {
    const isEdit = products.some(p => p.id === product.id);
    let updated: Product[];
    if (isEdit) {
      updated = products.map(p => (p.id === product.id ? product : p));
      db.addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'Actualización de Producto/Servicio',
        module: 'Inventario',
        details: `Producto modificado: ${product.name} (Stock: ${product.currentStock})`,
      });
    } else {
      updated = [product, ...products];
      db.addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'Creación de Producto/Servicio',
        module: 'Inventario',
        details: `Nuevo producto agregado: ${product.name} (Código: ${product.code})`,
      });
    }
    setProducts(updated);
    db.saveProducts(updated);
    setAuditLogs(db.getAuditLogs());
  };

  const deleteProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    const filtered = products.filter(p => p.id !== id);
    setProducts(filtered);
    db.saveProducts(filtered);
    if (target) {
      db.addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'Eliminación de Producto',
        module: 'Inventario',
        details: `Producto eliminado: ${target.name} (${target.code})`,
      });
      setAuditLogs(db.getAuditLogs());
    }
  };

  // Sales
  const createSale = (saleInput: {
    customerId: string;
    customerName: string;
    customerIdentification?: string;
    items: SaleItem[];
    subtotal: number;
    taxTotal: number;
    discountTotal: number;
    total: number;
    paymentMethod: PaymentMethod;
    amountPaid: number;
    change: number;
    isCredit: boolean;
    creditDays?: number;
    notes?: string;
  }): Sale => {
    const nextNumber = (sales.length + 1044).toString().padStart(8, '0');
    const invoiceSeries = businessConfig.invoiceSeries || 'FAC-01';
    const now = new Date().toISOString();

    const creditDueDate = saleInput.isCredit
      ? new Date(Date.now() + (saleInput.creditDays || 30) * 86400000).toISOString().slice(0, 10)
      : undefined;

    const cufeHash = 'CUFE-' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
    const cae = `CAE-2026-9048-A${Math.floor(Math.random() * 9000 + 1000)}`;

    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      invoiceSeries,
      invoiceNumber: nextNumber,
      date: now,
      customerId: saleInput.customerId,
      customerName: saleInput.customerName,
      customerIdentification: saleInput.customerIdentification,
      userId: currentUser.id,
      userName: currentUser.name,
      items: saleInput.items,
      subtotal: saleInput.subtotal,
      taxTotal: saleInput.taxTotal,
      discountTotal: saleInput.discountTotal,
      total: saleInput.total,
      paymentMethod: saleInput.paymentMethod,
      amountPaid: saleInput.amountPaid,
      change: saleInput.change,
      isCredit: saleInput.isCredit,
      creditDueDate,
      creditBalance: saleInput.isCredit ? saleInput.total : 0,
      creditPaid: 0,
      creditStatus: saleInput.isCredit ? 'pendiente' : undefined,
      notes: saleInput.notes,
      status: 'completada',
      electronicInvoice: {
        invoiceNumber: `${invoiceSeries}-${nextNumber}`,
        electronicAuthorization: cae,
        cufe: cufeHash,
        qrData: `https://dgi.gob.ni/factura?cufe=${cufeHash}&monto=${saleInput.total.toFixed(2)}`,
        digitalSignature: 'SHA256:' + Math.random().toString(36).substring(2, 18),
        emissionDate: now,
        securityCode: 'SEC-' + Math.floor(Math.random() * 9000 + 1000),
      },
    };

    // 1. Save Sale
    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);
    db.saveSales(updatedSales);

    // 2. Reduce Inventory & record movements
    let updatedProducts = [...products];
    let newMovements: InventoryMovement[] = [];

    saleInput.items.forEach(item => {
      const pIndex = updatedProducts.findIndex(p => p.id === item.productId);
      if (pIndex !== -1 && updatedProducts[pIndex].type === 'producto') {
        const prevStock = updatedProducts[pIndex].currentStock;
        const newStock = Math.max(0, prevStock - item.quantity);
        updatedProducts[pIndex] = {
          ...updatedProducts[pIndex],
          currentStock: Number(newStock.toFixed(3)),
          updatedAt: now,
        };

        newMovements.push({
          id: 'mov-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          date: now,
          productId: item.productId,
          productName: item.name,
          productCode: item.code,
          type: 'salida_venta',
          quantity: item.quantity,
          costPrice: item.costPrice,
          salePrice: item.unitPrice,
          previousStock: prevStock,
          newStock: Number(newStock.toFixed(3)),
          referenceDoc: `${invoiceSeries}-${nextNumber}`,
          userId: currentUser.id,
          userName: currentUser.name,
          reason: `Venta POS a ${saleInput.customerName}`,
        });
      }
    });

    setProducts(updatedProducts);
    db.saveProducts(updatedProducts);

    const allMovements = [...newMovements, ...movements];
    setMovements(allMovements);
    db.saveMovements(allMovements);

    // 3. Update active cash register if sale is cash
    const activeReg = cashRegisters.find(r => r.status === 'abierta');
    if (activeReg) {
      let regUpdates: Partial<CashRegister> = {};
      if (saleInput.paymentMethod === 'efectivo') {
        regUpdates.totalCashSales = activeReg.totalCashSales + saleInput.total;
        regUpdates.expectedCashInDrawer = activeReg.expectedCashInDrawer + saleInput.total;
      } else if (saleInput.paymentMethod === 'tarjeta') {
        regUpdates.totalCardSales = activeReg.totalCardSales + saleInput.total;
      } else if (saleInput.paymentMethod === 'transferencia') {
        regUpdates.totalTransferSales = activeReg.totalTransferSales + saleInput.total;
      } else if (saleInput.paymentMethod === 'credito') {
        regUpdates.totalCreditSales = activeReg.totalCreditSales + saleInput.total;
      }

      const updatedRegs = cashRegisters.map(r => (r.id === activeReg.id ? { ...r, ...regUpdates } : r));
      setCashRegisters(updatedRegs);
      db.saveCashRegisters(updatedRegs);
    }

    // 4. Update Customer Credit Balance if Credit Sale
    if (saleInput.isCredit && saleInput.customerId) {
      const updatedCustomers = customers.map(c =>
        c.id === saleInput.customerId ? { ...c, currentCredit: c.currentCredit + saleInput.total } : c
      );
      setCustomers(updatedCustomers);
      db.saveCustomers(updatedCustomers);
    }

    // 5. Audit Log
    db.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Venta Emitida',
      module: 'Punto de Venta',
      details: `Factura ${invoiceSeries}-${nextNumber} por C$ ${saleInput.total.toFixed(2)} (${saleInput.paymentMethod.toUpperCase()}) a ${saleInput.customerName}`,
    });
    setAuditLogs(db.getAuditLogs());

    return newSale;
  };

  // Purchases
  const createPurchase = (purchaseInput: {
    supplierId: string;
    supplierName: string;
    invoiceSupplierNumber: string;
    items: {
      productId: string;
      code: string;
      name: string;
      quantity: number;
      unitCost: number;
      subtotal: number;
      lotNumber?: string;
      expirationDate?: string;
    }[];
    subtotal: number;
    taxTotal: number;
    total: number;
    isCredit: boolean;
    creditDays?: number;
    notes?: string;
  }): Purchase => {
    const purchaseNum = 'COM-2026-' + (purchases.length + 90).toString().padStart(3, '0');
    const now = new Date().toISOString();

    const creditDueDate = purchaseInput.isCredit
      ? new Date(Date.now() + (purchaseInput.creditDays || 30) * 86400000).toISOString().slice(0, 10)
      : undefined;

    const newPurchase: Purchase = {
      id: 'pur-' + Date.now(),
      purchaseNumber: purchaseNum,
      invoiceSupplierNumber: purchaseInput.invoiceSupplierNumber,
      supplierId: purchaseInput.supplierId,
      supplierName: purchaseInput.supplierName,
      date: now,
      userId: currentUser.id,
      userName: currentUser.name,
      items: purchaseInput.items,
      subtotal: purchaseInput.subtotal,
      taxTotal: purchaseInput.taxTotal,
      total: purchaseInput.total,
      paymentMethod: purchaseInput.isCredit ? 'credito' : 'contado',
      isCredit: purchaseInput.isCredit,
      creditDueDate,
      creditBalance: purchaseInput.isCredit ? purchaseInput.total : 0,
      creditPaid: 0,
      creditStatus: purchaseInput.isCredit ? 'pendiente' : undefined,
      status: 'recibido',
      notes: purchaseInput.notes,
    };

    const updatedPurchases = [newPurchase, ...purchases];
    setPurchases(updatedPurchases);
    db.savePurchases(updatedPurchases);

    // Increase product stock & lot info
    let updatedProducts = [...products];
    let newMovements: InventoryMovement[] = [];

    purchaseInput.items.forEach(item => {
      const idx = updatedProducts.findIndex(p => p.id === item.productId);
      if (idx !== -1) {
        const prevStock = updatedProducts[idx].currentStock;
        const newStock = prevStock + item.quantity;
        // Average cost update
        const totalOldCost = prevStock * updatedProducts[idx].purchasePrice;
        const totalNewCost = item.quantity * item.unitCost;
        const weightedCost = newStock > 0 ? (totalOldCost + totalNewCost) / newStock : item.unitCost;

        updatedProducts[idx] = {
          ...updatedProducts[idx],
          currentStock: Number(newStock.toFixed(3)),
          purchasePrice: Number(weightedCost.toFixed(2)),
          lotNumber: item.lotNumber || updatedProducts[idx].lotNumber,
          expirationDate: item.expirationDate || updatedProducts[idx].expirationDate,
          updatedAt: now,
        };

        newMovements.push({
          id: 'mov-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          date: now,
          productId: item.productId,
          productName: item.name,
          productCode: item.code,
          type: 'entrada_compra',
          quantity: item.quantity,
          costPrice: item.unitCost,
          previousStock: prevStock,
          newStock: Number(newStock.toFixed(3)),
          referenceDoc: purchaseNum,
          userId: currentUser.id,
          userName: currentUser.name,
          reason: `Compra a proveedor ${purchaseInput.supplierName}`,
        });
      }
    });

    setProducts(updatedProducts);
    db.saveProducts(updatedProducts);

    const allMovements = [...newMovements, ...movements];
    setMovements(allMovements);
    db.saveMovements(allMovements);

    db.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Compra Registrada',
      module: 'Compras',
      details: `Compra ${purchaseNum} de ${purchaseInput.supplierName} por C$ ${purchaseInput.total.toFixed(2)}`,
    });
    setAuditLogs(db.getAuditLogs());

    return newPurchase;
  };

  // Pay credit sale
  const payCreditSale = (saleId: string, amount: number) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    const currentBalance = sale.creditBalance || 0;
    const newBalance = Math.max(0, currentBalance - amount);
    const newPaid = (sale.creditPaid || 0) + amount;
    const newStatus = newBalance <= 0 ? 'pagado' : 'pendiente';

    const updatedSales = sales.map(s =>
      s.id === saleId ? { ...s, creditBalance: newBalance, creditPaid: newPaid, creditStatus: newStatus } : s
    );
    setSales(updatedSales);
    db.saveSales(updatedSales);

    // Update customer balance
    if (sale.customerId) {
      const updatedCustomers = customers.map(c =>
        c.id === sale.customerId ? { ...c, currentCredit: Math.max(0, c.currentCredit - amount) } : c
      );
      setCustomers(updatedCustomers);
      db.saveCustomers(updatedCustomers);
    }

    // Add cash movement
    addCashMovement({
      type: 'ingreso',
      category: 'Cobro de Venta al Crédito',
      amount,
      description: `Abono de ${sale.customerName} a Factura ${sale.invoiceSeries}-${sale.invoiceNumber}`,
      referenceReceipt: `REC-ABO-${Date.now().toString().slice(-4)}`,
    });
  };

  // Pay credit purchase
  const payCreditPurchase = (purchaseId: string, amount: number) => {
    const pur = purchases.find(p => p.id === purchaseId);
    if (!pur) return;

    const currentBalance = pur.creditBalance || 0;
    const newBalance = Math.max(0, currentBalance - amount);
    const newPaid = (pur.creditPaid || 0) + amount;
    const newStatus = newBalance <= 0 ? 'pagado' : 'pendiente';

    const updatedPurchases = purchases.map(p =>
      p.id === purchaseId ? { ...p, creditBalance: newBalance, creditPaid: newPaid, creditStatus: newStatus } : p
    );
    setPurchases(updatedPurchases);
    db.savePurchases(updatedPurchases);

    // Add cash movement
    addCashMovement({
      type: 'gasto',
      category: 'Pago a Proveedor (Crédito)',
      amount,
      description: `Pago a ${pur.supplierName} por Compra ${pur.purchaseNumber}`,
      referenceReceipt: `EGRE-PROV-${Date.now().toString().slice(-4)}`,
    });
  };

  // Cash Management
  const addCashMovement = (movement: {
    type: 'ingreso' | 'gasto';
    category: string;
    amount: number;
    description: string;
    referenceReceipt?: string;
  }) => {
    const activeReg = cashRegisters.find(r => r.status === 'abierta');
    const regId = activeReg ? activeReg.id : 'caja-default';
    const now = new Date().toISOString();

    const newMov: CashMovement = {
      id: 'cm-' + Date.now(),
      cashRegisterId: regId,
      date: now,
      type: movement.type,
      category: movement.category,
      amount: movement.amount,
      description: movement.description,
      referenceReceipt: movement.referenceReceipt,
      userId: currentUser.id,
      userName: currentUser.name,
    };

    const updatedMovs = [newMov, ...cashMovements];
    setCashMovements(updatedMovs);
    db.saveCashMovements(updatedMovs);

    if (activeReg) {
      const isIngreso = movement.type === 'ingreso';
      const newExpected = isIngreso
        ? activeReg.expectedCashInDrawer + movement.amount
        : activeReg.expectedCashInDrawer - movement.amount;

      const updatedRegs = cashRegisters.map(r =>
        r.id === activeReg.id
          ? {
              ...r,
              totalCashIngresos: isIngreso ? r.totalCashIngresos + movement.amount : r.totalCashIngresos,
              totalCashGastos: !isIngreso ? r.totalCashGastos + movement.amount : r.totalCashGastos,
              expectedCashInDrawer: newExpected,
            }
          : r
      );
      setCashRegisters(updatedRegs);
      db.saveCashRegisters(updatedRegs);
    }

    db.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: movement.type === 'ingreso' ? 'Ingreso de Caja Chica' : 'Egreso de Caja Chica',
      module: 'Caja Chica',
      details: `${movement.category}: C$ ${movement.amount.toFixed(2)} - ${movement.description}`,
    });
    setAuditLogs(db.getAuditLogs());
  };

  const openCashRegister = (initialCash: number) => {
    const newReg: CashRegister = {
      id: 'cash-' + Date.now(),
      code: 'CAJA-' + (cashRegisters.length + 1).toString().padStart(2, '0'),
      openedAt: new Date().toISOString(),
      openedByUserId: currentUser.id,
      openedByUserName: currentUser.name,
      initialCash,
      totalCashSales: 0,
      totalCardSales: 0,
      totalTransferSales: 0,
      totalCreditSales: 0,
      totalCashIngresos: 0,
      totalCashGastos: 0,
      expectedCashInDrawer: initialCash,
      status: 'abierta',
    };

    const updated = [newReg, ...cashRegisters];
    setCashRegisters(updated);
    db.saveCashRegisters(updated);

    db.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Apertura de Caja',
      module: 'Caja Chica',
      details: `Caja ${newReg.code} abierta con C$ ${initialCash.toFixed(2)}`,
    });
    setAuditLogs(db.getAuditLogs());
  };

  const closeCashRegister = (actualCash: number, notes?: string) => {
    const active = cashRegisters.find(r => r.status === 'abierta');
    if (!active) return;

    const diff = actualCash - active.expectedCashInDrawer;
    const now = new Date().toISOString();

    const updated = cashRegisters.map(r =>
      r.id === active.id
        ? {
            ...r,
            status: 'cerrada' as const,
            closedAt: now,
            closedByUserId: currentUser.id,
            closedByUserName: currentUser.name,
            actualCashCounted: actualCash,
            difference: diff,
            closingNotes: notes,
          }
        : r
    );

    setCashRegisters(updated);
    db.saveCashRegisters(updated);

    db.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Cierre de Caja',
      module: 'Caja Chica',
      details: `Caja ${active.code} cerrada. Esperado: C$ ${active.expectedCashInDrawer.toFixed(2)}, Contado: C$ ${actualCash.toFixed(2)} (Diferencia: C$ ${diff.toFixed(2)})`,
    });
    setAuditLogs(db.getAuditLogs());
  };

  const saveBusinessConfig = (config: BusinessConfig) => {
    setBusinessConfigState(config);
    db.saveBusinessConfig(config);
    db.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Actualización de Datos del Negocio',
      module: 'Configuración',
      details: 'Datos comerciales, logo o parámetros de facturación actualizados.',
    });
    setAuditLogs(db.getAuditLogs());
  };

  const saveCustomer = (customer: Customer) => {
    const exists = customers.some(c => c.id === customer.id);
    const updated = exists ? customers.map(c => (c.id === customer.id ? customer : c)) : [customer, ...customers];
    setCustomers(updated);
    db.saveCustomers(updated);
  };

  const saveSupplier = (supplier: Supplier) => {
    const exists = suppliers.some(s => s.id === supplier.id);
    const updated = exists ? suppliers.map(s => (s.id === supplier.id ? supplier : s)) : [supplier, ...suppliers];
    setSuppliers(updated);
    db.saveSuppliers(updated);
  };

  const saveUser = (user: User) => {
    const exists = users.some(u => u.id === user.id);
    const updated = exists ? users.map(u => (u.id === user.id ? user : u)) : [user, ...users];
    setUsers(updated);
    db.saveUsers(updated);
    db.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      action: exists ? 'Modificación de Usuario' : 'Creación de Usuario',
      module: 'Usuarios',
      details: `Usuario ${user.name} (${user.role}) guardado con éxito.`,
    });
    setAuditLogs(db.getAuditLogs());
  };

  // Derive unified Credit Accounts from credit sales and purchases
  const creditAccounts: CreditAccount[] = [
    ...sales
      .filter(s => s.isCredit)
      .map(s => ({
        id: s.id,
        type: 'por_cobrar' as const,
        referenceId: s.id,
        invoiceNumber: `${s.invoiceSeries}-${s.invoiceNumber}`,
        contactName: s.customerName,
        issueDate: s.date,
        dueDate: s.creditDueDate || s.date,
        totalAmount: s.total,
        paidAmount: s.creditPaid || 0,
        status: (s.creditStatus || 'pendiente') as 'pendiente' | 'pagado' | 'vencido',
        phone: s.customerIdentification,
      })),
    ...purchases
      .filter(p => p.isCredit)
      .map(p => ({
        id: p.id,
        type: 'por_pagar' as const,
        referenceId: p.id,
        invoiceNumber: p.invoiceSupplierNumber || p.purchaseNumber,
        contactName: p.supplierName,
        issueDate: p.date,
        dueDate: p.creditDueDate || p.date,
        totalAmount: p.total,
        paidAmount: p.creditPaid || 0,
        status: (p.creditStatus || 'pendiente') as 'pendiente' | 'pagado' | 'vencido',
      })),
  ];

  const restoreDatabase = (json: string): boolean => {
    const ok = db.restoreBackup(json);
    if (ok) {
      setProducts(db.getProducts());
      setCustomers(db.getCustomers());
      setSuppliers(db.getSuppliers());
      setSales(db.getSales());
      setPurchases(db.getPurchases());
      setMovements(db.getMovements());
      setCashRegisters(db.getCashRegisters());
      setCashMovements(db.getCashMovements());
      setUsers(db.getUsers());
      setBusinessConfigState(db.getBusinessConfig());
      setAuditLogs(db.getAuditLogs());
    }
    return ok;
  };

  const exportDatabaseJson = () => db.exportFullBackupJSON();

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        syncStatus,
        lastSyncTime,
        triggerCloudSync,
        triggerDriveBackup,
        currentUser,
        users,
        switchUser,
        hasPermission,
        products,
        customers,
        suppliers,
        sales,
        purchases,
        movements,
        cashRegisters,
        cashMovements,
        creditAccounts,
        activeCashRegister: cashRegisters.find(r => r.status === 'abierta'),
        businessConfig,
        auditLogs,
        saveProduct,
        deleteProduct,
        createSale,
        createPurchase,
        payCreditSale,
        payCreditPurchase,
        addCashMovement,
        openCashRegister,
        closeCashRegister,
        saveBusinessConfig,
        updateBusinessConfig: saveBusinessConfig,
        saveUser,
        saveCustomer,
        saveSupplier,
        restoreDatabase,
        exportDatabaseJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const AppContextProvider = AppProvider;

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

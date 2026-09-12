import {
  AuditLog,
  BusinessConfig,
  CashMovement,
  CashRegister,
  Customer,
  InventoryMovement,
  Product,
  Purchase,
  Sale,
  Supplier,
  User,
} from '../../domain/types';
import { DEFAULT_BUSINESS_CONFIG, INITIAL_USERS } from '../../domain/constants';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_CASH_MOVEMENTS,
  INITIAL_CASH_REGISTER,
  INITIAL_CUSTOMERS,
  INITIAL_MOVEMENTS,
  INITIAL_PRODUCTS,
  INITIAL_PURCHASES,
  INITIAL_SALES,
  INITIAL_SUPPLIERS,
} from './seedData';

const STORAGE_KEYS = {
  PRODUCTS: 'factupro_products_v1',
  CUSTOMERS: 'factupro_customers_v1',
  SUPPLIERS: 'factupro_suppliers_v1',
  SALES: 'factupro_sales_v1',
  PURCHASES: 'factupro_purchases_v1',
  MOVEMENTS: 'factupro_movements_v1',
  CASH_REGISTERS: 'factupro_cash_registers_v1',
  CASH_MOVEMENTS: 'factupro_cash_movements_v1',
  USERS: 'factupro_users_v1',
  BUSINESS_CONFIG: 'factupro_business_config_v1',
  AUDIT_LOGS: 'factupro_audit_logs_v1',
  CURRENT_USER: 'factupro_current_user_v1',
  LAST_SYNC: 'factupro_last_sync_timestamp',
};

export class AppDatabase {
  private static instance: AppDatabase;

  private constructor() {
    this.initializeIfEmpty();
  }

  public static getInstance(): AppDatabase {
    if (!AppDatabase.instance) {
      AppDatabase.instance = new AppDatabase();
    }
    return AppDatabase.instance;
  }

  private initializeIfEmpty() {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.saveItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      this.saveItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
      this.saveItem(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
      this.saveItem(STORAGE_KEYS.SALES, INITIAL_SALES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PURCHASES)) {
      this.saveItem(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MOVEMENTS)) {
      this.saveItem(STORAGE_KEYS.MOVEMENTS, INITIAL_MOVEMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CASH_REGISTERS)) {
      this.saveItem(STORAGE_KEYS.CASH_REGISTERS, [INITIAL_CASH_REGISTER]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CASH_MOVEMENTS)) {
      this.saveItem(STORAGE_KEYS.CASH_MOVEMENTS, INITIAL_CASH_MOVEMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.saveItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BUSINESS_CONFIG)) {
      this.saveItem(STORAGE_KEYS.BUSINESS_CONFIG, DEFAULT_BUSINESS_CONFIG);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      this.saveItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      this.saveItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
    }
  }

  private getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private saveItem<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e) {
      console.error('Storage error:', e);
    }
  }

  // PRODUCTS
  public getProducts(): Product[] {
    return this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  public saveProducts(products: Product[]): void {
    this.saveItem(STORAGE_KEYS.PRODUCTS, products);
  }

  public addProduct(product: Product): void {
    const list = this.getProducts();
    list.unshift(product);
    this.saveProducts(list);
  }

  public updateProduct(updated: Product): void {
    const list = this.getProducts().map(p => p.id === updated.id ? updated : p);
    this.saveProducts(list);
  }

  public deleteProduct(id: string): void {
    const list = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(list);
  }

  // CUSTOMERS
  public getCustomers(): Customer[] {
    return this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  }

  public saveCustomers(customers: Customer[]): void {
    this.saveItem(STORAGE_KEYS.CUSTOMERS, customers);
  }

  // SUPPLIERS
  public getSuppliers(): Supplier[] {
    return this.getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  }

  public saveSuppliers(suppliers: Supplier[]): void {
    this.saveItem(STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  // SALES
  public getSales(): Sale[] {
    return this.getItem<Sale[]>(STORAGE_KEYS.SALES, INITIAL_SALES);
  }

  public saveSales(sales: Sale[]): void {
    this.saveItem(STORAGE_KEYS.SALES, sales);
  }

  public addSale(sale: Sale): void {
    const list = this.getSales();
    list.unshift(sale);
    this.saveSales(list);
  }

  // PURCHASES
  public getPurchases(): Purchase[] {
    return this.getItem<Purchase[]>(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
  }

  public savePurchases(purchases: Purchase[]): void {
    this.saveItem(STORAGE_KEYS.PURCHASES, purchases);
  }

  public addPurchase(purchase: Purchase): void {
    const list = this.getPurchases();
    list.unshift(purchase);
    this.savePurchases(list);
  }

  // MOVEMENTS
  public getMovements(): InventoryMovement[] {
    return this.getItem<InventoryMovement[]>(STORAGE_KEYS.MOVEMENTS, INITIAL_MOVEMENTS);
  }

  public saveMovements(movements: InventoryMovement[]): void {
    this.saveItem(STORAGE_KEYS.MOVEMENTS, movements);
  }

  public addMovement(movement: InventoryMovement): void {
    const list = this.getMovements();
    list.unshift(movement);
    this.saveMovements(list);
  }

  // CASH REGISTERS
  public getCashRegisters(): CashRegister[] {
    return this.getItem<CashRegister[]>(STORAGE_KEYS.CASH_REGISTERS, [INITIAL_CASH_REGISTER]);
  }

  public saveCashRegisters(registers: CashRegister[]): void {
    this.saveItem(STORAGE_KEYS.CASH_REGISTERS, registers);
  }

  public getActiveCashRegister(): CashRegister | undefined {
    return this.getCashRegisters().find(r => r.status === 'abierta');
  }

  // CASH MOVEMENTS
  public getCashMovements(): CashMovement[] {
    return this.getItem<CashMovement[]>(STORAGE_KEYS.CASH_MOVEMENTS, INITIAL_CASH_MOVEMENTS);
  }

  public saveCashMovements(movements: CashMovement[]): void {
    this.saveItem(STORAGE_KEYS.CASH_MOVEMENTS, movements);
  }

  public addCashMovement(movement: CashMovement): void {
    const list = this.getCashMovements();
    list.unshift(movement);
    this.saveCashMovements(list);
  }

  // USERS
  public getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public saveUsers(users: User[]): void {
    this.saveItem(STORAGE_KEYS.USERS, users);
  }

  public getCurrentUser(): User {
    return this.getItem<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }

  public setCurrentUser(user: User): void {
    this.saveItem(STORAGE_KEYS.CURRENT_USER, user);
  }

  // BUSINESS CONFIG
  public getBusinessConfig(): BusinessConfig {
    return this.getItem<BusinessConfig>(STORAGE_KEYS.BUSINESS_CONFIG, DEFAULT_BUSINESS_CONFIG);
  }

  public saveBusinessConfig(config: BusinessConfig): void {
    this.saveItem(STORAGE_KEYS.BUSINESS_CONFIG, config);
  }

  // AUDIT LOGS
  public getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newEntry: AuditLog = {
      ...log,
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newEntry);
    if (logs.length > 500) logs.pop();
    this.saveItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  // BACKUP & RESTORE
  public exportFullBackupJSON(): string {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      creator: 'Maxwell Chacón (2012904950006A)',
      data: {
        products: this.getProducts(),
        customers: this.getCustomers(),
        suppliers: this.getSuppliers(),
        sales: this.getSales(),
        purchases: this.getPurchases(),
        movements: this.getMovements(),
        cashRegisters: this.getCashRegisters(),
        cashMovements: this.getCashMovements(),
        users: this.getUsers(),
        businessConfig: this.getBusinessConfig(),
        auditLogs: this.getAuditLogs(),
      },
    };
    return JSON.stringify(backup, null, 2);
  }

  public restoreBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) return false;
      const d = parsed.data;
      if (d.products) this.saveProducts(d.products);
      if (d.customers) this.saveCustomers(d.customers);
      if (d.suppliers) this.saveSuppliers(d.suppliers);
      if (d.sales) this.saveSales(d.sales);
      if (d.purchases) this.savePurchases(d.purchases);
      if (d.movements) this.saveMovements(d.movements);
      if (d.cashRegisters) this.saveCashRegisters(d.cashRegisters);
      if (d.cashMovements) this.saveCashMovements(d.cashMovements);
      if (d.users) this.saveUsers(d.users);
      if (d.businessConfig) this.saveBusinessConfig(d.businessConfig);
      if (d.auditLogs) this.saveItem(STORAGE_KEYS.AUDIT_LOGS, d.auditLogs);
      return true;
    } catch (e) {
      console.error('Failed to parse backup:', e);
      return false;
    }
  }

  // SQL SCHEMA GENERATOR FOR SQLite, MySQL, and PostgreSQL
  public generateSqlSchema(engine: 'sqlite' | 'postgresql' | 'mysql'): string {
    return this.generateSQLSchema(engine);
  }

  public generateSQLSchema(engine: 'sqlite' | 'postgresql' | 'mysql'): string {
    if (engine === 'sqlite') {
      return `-- FactuPro SQLite DDL Schema
-- Compatible con SQLite 3 / Turso / LibSQL
-- Autor: Maxwell Chacón (Cédula: 2012904950006A)

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  active INTEGER DEFAULT 1,
  phone TEXT,
  last_login TEXT,
  permissions_json TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'producto',
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  supplier_id TEXT,
  unit TEXT NOT NULL DEFAULT 'UND',
  purchase_price REAL NOT NULL,
  sale_price REAL NOT NULL,
  min_price REAL,
  wholesale_price REAL,
  current_stock REAL NOT NULL DEFAULT 0,
  min_stock REAL NOT NULL DEFAULT 5,
  lot_number TEXT,
  expiration_date TEXT,
  is_scale_product INTEGER DEFAULT 0,
  tax_percent REAL DEFAULT 15.0,
  status TEXT DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  identification TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  credit_limit REAL DEFAULT 0,
  current_credit REAL DEFAULT 0,
  allow_credit INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  identification TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  bank_account TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  invoice_series TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  date TEXT NOT NULL,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  subtotal REAL NOT NULL,
  tax_total REAL NOT NULL,
  discount_total REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL,
  payment_method TEXT NOT NULL,
  amount_paid REAL NOT NULL,
  change_due REAL NOT NULL DEFAULT 0,
  is_credit INTEGER DEFAULT 0,
  credit_due_date TEXT,
  credit_balance REAL DEFAULT 0,
  credit_status TEXT,
  cufe TEXT,
  cae TEXT,
  digital_signature TEXT,
  status TEXT DEFAULT 'completada'
);

CREATE TABLE IF NOT EXISTS sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  unit_price REAL NOT NULL,
  cost_price REAL NOT NULL,
  quantity REAL NOT NULL,
  subtotal REAL NOT NULL,
  tax_amount REAL NOT NULL,
  discount REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_code TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity REAL NOT NULL,
  cost_price REAL NOT NULL,
  sale_price REAL,
  previous_stock REAL NOT NULL,
  new_stock REAL NOT NULL,
  reference_doc TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  reason TEXT
);

CREATE TABLE IF NOT EXISTS cash_registers (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  opened_at TEXT NOT NULL,
  closed_at TEXT,
  opened_by_user_id TEXT NOT NULL,
  opened_by_user_name TEXT NOT NULL,
  initial_cash REAL NOT NULL,
  expected_cash REAL NOT NULL,
  actual_cash REAL,
  difference REAL,
  status TEXT NOT NULL DEFAULT 'abierta'
);

CREATE TABLE IF NOT EXISTS cash_movements (
  id TEXT PRIMARY KEY,
  cash_register_id TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL, -- 'ingreso' | 'gasto'
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  reference_receipt TEXT,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL
);
`;
    }

    if (engine === 'postgresql') {
      return `-- FactuPro PostgreSQL DDL Schema
-- Compatible con PostgreSQL 14, 15, 16, Supabase, Neon & Cloud SQL
-- Autor: Maxwell Chacón (Cédula: 2012904950006A)

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  username VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(150) NOT NULL,
  role VARCHAR(32) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  phone VARCHAR(32),
  last_login TIMESTAMPTZ,
  permissions_json JSONB
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(32) NOT NULL DEFAULT 'producto',
  category VARCHAR(100) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  supplier_id VARCHAR(64),
  unit VARCHAR(16) NOT NULL DEFAULT 'UND',
  purchase_price NUMERIC(14, 2) NOT NULL,
  sale_price NUMERIC(14, 2) NOT NULL,
  min_price NUMERIC(14, 2),
  wholesale_price NUMERIC(14, 2),
  current_stock NUMERIC(14, 3) NOT NULL DEFAULT 0,
  min_stock NUMERIC(14, 3) NOT NULL DEFAULT 5,
  lot_number VARCHAR(64),
  expiration_date DATE,
  is_scale_product BOOLEAN DEFAULT FALSE,
  tax_percent NUMERIC(5, 2) DEFAULT 15.00,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_expiration ON products(expiration_date);

CREATE TABLE IF NOT EXISTS sales (
  id VARCHAR(64) PRIMARY KEY,
  invoice_series VARCHAR(20) NOT NULL,
  invoice_number VARCHAR(30) NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  customer_id VARCHAR(64),
  customer_name VARCHAR(150) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  user_name VARCHAR(150) NOT NULL,
  subtotal NUMERIC(14, 2) NOT NULL,
  tax_total NUMERIC(14, 2) NOT NULL,
  discount_total NUMERIC(14, 2) DEFAULT 0,
  total NUMERIC(14, 2) NOT NULL,
  payment_method VARCHAR(32) NOT NULL,
  amount_paid NUMERIC(14, 2) NOT NULL,
  is_credit BOOLEAN DEFAULT FALSE,
  credit_due_date DATE,
  credit_balance NUMERIC(14, 2) DEFAULT 0,
  credit_status VARCHAR(20),
  cufe VARCHAR(120),
  cae VARCHAR(64),
  status VARCHAR(20) DEFAULT 'completada'
);
`;
    }

    // MySQL
    return `-- FactuPro MySQL / MariaDB DDL Schema
-- Compatible con MySQL 8.0+ y MariaDB 10.5+
-- Autor: Maxwell Chacón (Cédula: 2012904950006A)

CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`username\` VARCHAR(64) NOT NULL UNIQUE,
  \`email\` VARCHAR(150) NOT NULL,
  \`role\` VARCHAR(32) NOT NULL,
  \`active\` TINYINT(1) DEFAULT 1,
  \`phone\` VARCHAR(32) NULL,
  \`last_login\` DATETIME NULL,
  \`permissions_json\` JSON NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`products\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`code\` VARCHAR(64) NOT NULL UNIQUE,
  \`name\` VARCHAR(200) NOT NULL,
  \`type\` ENUM('producto', 'servicio') DEFAULT 'producto',
  \`category\` VARCHAR(100) NOT NULL,
  \`brand\` VARCHAR(100) NOT NULL,
  \`supplier_id\` VARCHAR(64) NULL,
  \`unit\` VARCHAR(16) NOT NULL DEFAULT 'UND',
  \`purchase_price\` DECIMAL(14, 2) NOT NULL,
  \`sale_price\` DECIMAL(14, 2) NOT NULL,
  \`current_stock\` DECIMAL(14, 3) NOT NULL DEFAULT 0,
  \`min_stock\` DECIMAL(14, 3) NOT NULL DEFAULT 5,
  \`lot_number\` VARCHAR(64) NULL,
  \`expiration_date\` DATE NULL,
  \`is_scale_product\` TINYINT(1) DEFAULT 0,
  \`tax_percent\` DECIMAL(5, 2) DEFAULT 15.00,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_code\` (\`code\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;
  }
}

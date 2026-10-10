export type TabId =
  | 'dashboard'
  | 'orders'
  | 'pos'
  | 'inventory'
  | 'kardex'
  | 'history'
  | 'cash'
  | 'users'
  | 'settings';

export type OrderStatus =
  | 'Pendiente'
  | 'En Diagnóstico'
  | 'En Reparación'
  | 'Listo para Entrega'
  | 'Entregado'
  | 'Cancelado';

export type PrintFormat = '58mm' | '80mm' | 'a4';

export interface WorkOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  device: string;
  brandModel: string;
  serialOrImei?: string;
  status: OrderStatus;
  problem: string;
  diagnosis: string;
  totalCost: number;
  advancePayment: number;
  createdAt: string;
  updatedAt: string;
  technician: string;
  printFormat: PrintFormat;
  notes?: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: 'Repuesto' | 'Accesorio' | 'Servicio' | 'Herramienta';
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  soldCount: number;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  isManual?: boolean;
}

export interface Sale {
  id: string;
  saleNumber: string;
  customerName: string;
  phone: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Yape / Plin';
  createdAt: string;
  cashier: string;
  printFormat: PrintFormat;
}

export interface KardexEntry {
  id: string;
  date: string; // YYYY-MM-DD HH:mm
  productId: string;
  productName: string;
  barcode: string;
  type: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  quantity: number;
  stockAfter: number;
  customerOrSupplier: string;
  reference: string; // e.g., Venta #V-1001, Orden #OT-1002, Compra Inicial
  unitPrice: number;
}

export interface CashMovement {
  id: string;
  sessionId: string;
  type: 'INGRESO' | 'EGRESO';
  tag: string; // etiqueta: Reparación, Venta POS, Adelanto, Compra Repuestos, Servicios, Otros
  description: string;
  amount: number;
  createdAt: string;
  user: string;
}

export interface CashSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  closingBalance?: number;
  status: 'ABIERTA' | 'CERRADA';
  openedBy: string;
}

export interface AppUser {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: 'Administrador' | 'Técnico' | 'Cajero';
  permissions: TabId[];
  active: boolean;
  createdAt: string;
}

export interface BusinessSettings {
  businessName: string;
  address: string;
  ruc: string;
  phone: string;
  email: string;
  logoUrl: string;
  country: string;
  phonePrefix: string;
  currencySymbol: string;
  themeMode: 'light' | 'dark' | 'auto';
  accentColor: 'blue' | 'emerald' | 'indigo' | 'amber' | 'rose';
  uiDensity: 'compact' | 'comfortable';
  autoHideSidebar: boolean;
  directPrint: boolean;
  defaultPrintFormat: PrintFormat;
  customTrackingDomain: string;
  orderTermsText: string;
  receiptFooterText: string;
  orderHeaderTitle: string;
  receiptHeaderTitle: string;
  showQrOnReceipt: boolean;
  showLogoOnReceipt: boolean;
  externalDbUrl: string;
  externalDbApiKey: string;
  googleDriveSyncEnabled: boolean;
  googleDriveFolderName: string;
  googleAccountEmail?: string;
  googleAccountLinked?: boolean;
  lastCloudSync?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  createdAt: string;
  read: boolean;
  linkTab?: TabId;
}

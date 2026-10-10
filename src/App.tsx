import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Wrench,
  ShoppingCart,
  Package,
  ClipboardList,
  History,
  Wallet,
  Users,
  Settings,
  Bell,
  QrCode,
  LogOut,
  Menu,
  X,
  ChevronRight,
  CheckCheck,
} from 'lucide-react';
import {
  AppNotification,
  AppUser,
  BusinessSettings,
  CashMovement,
  CashSession,
  KardexEntry,
  PrintFormat,
  Product,
  Sale,
  TabId,
  WorkOrder,
} from './types';
import {
  INITIAL_CASH_MOVEMENTS,
  INITIAL_CASH_SESSIONS,
  INITIAL_KARDEX,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_SALES,
  INITIAL_SETTINGS,
  INITIAL_USERS,
} from './initialData';
import { LoginView } from './components/LoginView';
import { DashboardTab } from './components/DashboardTab';
import { OrdersTab } from './components/OrdersTab';
import { PosTab } from './components/PosTab';
import { InventoryTab } from './components/InventoryTab';
import { KardexTab } from './components/KardexTab';
import { HistoryTab } from './components/HistoryTab';
import { CashTab } from './components/CashTab';
import { UsersTab } from './components/UsersTab';
import { SettingsTab } from './components/SettingsTab';
import { PrintJob, PrintModal } from './components/PrintModal';
import { TrackingPortalModal } from './components/TrackingPortalModal';
import { PWAInstallButton } from './components/PWAInstall';

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const NAV_ITEMS: {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: React.FC<{ className?: string }>;
  flatColor: string;
}[] = [
  {
    id: 'dashboard',
    label: 'Dashboard / Estadísticas',
    shortLabel: 'Dashboard',
    icon: LayoutDashboard,
    flatColor: 'bg-blue-600 text-white',
  },
  {
    id: 'orders',
    label: 'Órdenes de Trabajo',
    shortLabel: 'Órdenes',
    icon: Wrench,
    flatColor: 'bg-indigo-600 text-white',
  },
  {
    id: 'pos',
    label: 'Punto de Venta',
    shortLabel: 'Venta POS',
    icon: ShoppingCart,
    flatColor: 'bg-emerald-500 text-white',
  },
  {
    id: 'inventory',
    label: 'Inventario y Barras',
    shortLabel: 'Inventario',
    icon: Package,
    flatColor: 'bg-amber-500 text-white',
  },
  {
    id: 'kardex',
    label: 'Kardex',
    shortLabel: 'Kardex',
    icon: ClipboardList,
    flatColor: 'bg-cyan-500 text-white',
  },
  {
    id: 'history',
    label: 'Historial General',
    shortLabel: 'Historial',
    icon: History,
    flatColor: 'bg-purple-600 text-white',
  },
  {
    id: 'cash',
    label: 'Caja y Movimientos',
    shortLabel: 'Caja',
    icon: Wallet,
    flatColor: 'bg-emerald-600 text-white',
  },
  {
    id: 'users',
    label: 'Usuarios y Permisos',
    shortLabel: 'Usuarios',
    icon: Users,
    flatColor: 'bg-rose-500 text-white',
  },
  {
    id: 'settings',
    label: 'Ajustes del Taller',
    shortLabel: 'Ajustes',
    icon: Settings,
    flatColor: 'bg-slate-700 text-white',
  },
];

export function App() {
  // Persistent State
  const [settings, setSettings] = useState<BusinessSettings>(() =>
    loadStorage('tf_settings', INITIAL_SETTINGS)
  );
  const [users, setUsers] = useState<AppUser[]>(() =>
    loadStorage('tf_users', INITIAL_USERS)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadStorage('tf_products', INITIAL_PRODUCTS)
  );
  const [orders, setOrders] = useState<WorkOrder[]>(() =>
    loadStorage('tf_orders', INITIAL_ORDERS)
  );
  const [sales, setSales] = useState<Sale[]>(() =>
    loadStorage('tf_sales', INITIAL_SALES)
  );
  const [kardex, setKardex] = useState<KardexEntry[]>(() =>
    loadStorage('tf_kardex', INITIAL_KARDEX)
  );
  const [cashSessions, setCashSessions] = useState<CashSession[]>(() =>
    loadStorage('tf_cash_sessions', INITIAL_CASH_SESSIONS)
  );
  const [cashMovements, setCashMovements] = useState<CashMovement[]>(() =>
    loadStorage('tf_cash_movements', INITIAL_CASH_MOVEMENTS)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadStorage('tf_notifications', INITIAL_NOTIFICATIONS)
  );

  // Auth & Navigation State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() =>
    loadStorage('tf_current_user', null)
  );
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // Auto-hide Sidebar state
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Notifications & Modals
  const [notifOpen, setNotifOpen] = useState(false);
  const [printJob, setPrintJob] = useState<PrintJob | null>(null);
  const [trackingModal, setTrackingModal] = useState<{
    open: boolean;
    query: string;
  }>({ open: false, query: '' });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('tf_settings', JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    localStorage.setItem('tf_users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('tf_products', JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem('tf_orders', JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem('tf_sales', JSON.stringify(sales));
  }, [sales]);
  useEffect(() => {
    localStorage.setItem('tf_kardex', JSON.stringify(kardex));
  }, [kardex]);
  useEffect(() => {
    localStorage.setItem('tf_cash_sessions', JSON.stringify(cashSessions));
  }, [cashSessions]);
  useEffect(() => {
    localStorage.setItem('tf_cash_movements', JSON.stringify(cashMovements));
  }, [cashMovements]);
  useEffect(() => {
    localStorage.setItem('tf_notifications', JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tf_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tf_current_user');
    }
  }, [currentUser]);

  // Apply Dark / Light / Auto Theme to HTML root
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (settings.themeMode === 'dark') {
      applyTheme(true);
    } else if (settings.themeMode === 'light') {
      applyTheme(false);
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches);
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [settings.themeMode]);

  // Check URL query param `?track=OT-1001` on load for direct QR code scanning
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackParam = params.get('track');
    if (trackParam) {
      setTrackingModal({ open: true, query: trackParam });
    }
  }, []);

  const pushNotification = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' = 'info',
    linkTab?: TabId
  ) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      createdAt: 'Ahora mismo',
      read: false,
      linkTab,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
  };

  // Handlers for Work Orders
  const handleSaveOrder = (order: WorkOrder, isNew: boolean) => {
    if (isNew) {
      setOrders((prev) => [order, ...prev]);
      pushNotification(
        `Nueva Orden ${order.orderNumber}`,
        `Equipo ${order.brandModel} de ${order.customerName} registrado.`,
        'success',
        'orders'
      );
      if (order.advancePayment > 0) {
        const mov: CashMovement = {
          id: `cm-${Date.now()}`,
          sessionId: 'cs-current',
          type: 'INGRESO',
          tag: 'Adelanto Orden',
          description: `Adelanto Orden #${order.orderNumber} - ${order.customerName} (${order.brandModel})`,
          amount: order.advancePayment,
          createdAt: order.createdAt,
          user: currentUser?.fullName || 'Administrador',
        };
        setCashMovements((prev) => [mov, ...prev]);
      }
    } else {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
      pushNotification(
        `Orden ${order.orderNumber} Actualizada`,
        `Estado actual: ${order.status}`,
        'info',
        'orders'
      );
    }
  };

  const handleDeleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  // Handlers for POS Sales
  const handleCompleteSale = (sale: Sale) => {
    setSales((prev) => [sale, ...prev]);

    // Deduct stock & update soldCount + log Kardex entries
    const newKardexEntries: KardexEntry[] = [];
    setProducts((prevProds) =>
      prevProds.map((prod) => {
        const soldItem = sale.items.find((i) => i.productId === prod.id);
        if (!soldItem) return prod;

        const nextStock =
          prod.category === 'Servicio'
            ? prod.stock
            : Math.max(0, prod.stock - soldItem.quantity);

        newKardexEntries.push({
          id: `kdx-${Date.now()}-${prod.id}`,
          date: sale.createdAt,
          productId: prod.id,
          productName: prod.name,
          barcode: prod.barcode,
          type: 'SALIDA',
          quantity: soldItem.quantity,
          stockAfter: nextStock,
          customerOrSupplier: sale.customerName,
          reference: `Venta #${sale.saleNumber}`,
          unitPrice: soldItem.unitPrice,
        });

        return {
          ...prod,
          stock: nextStock,
          soldCount: prod.soldCount + soldItem.quantity,
          updatedAt: sale.createdAt.slice(0, 10),
        };
      })
    );

    if (newKardexEntries.length > 0) {
      setKardex((prev) => [...newKardexEntries, ...prev]);
    }

    // Add Cash Movement
    const mov: CashMovement = {
      id: `cm-${Date.now()}`,
      sessionId: 'cs-current',
      type: 'INGRESO',
      tag: 'Venta POS',
      description: `Boleta #${sale.saleNumber} - ${sale.customerName} (${sale.paymentMethod})`,
      amount: sale.total,
      createdAt: sale.createdAt,
      user: sale.cashier,
    };
    setCashMovements((prev) => [mov, ...prev]);

    pushNotification(
      `Venta Registrada ${sale.saleNumber}`,
      `Total cobrado: ${settings.currencySymbol} ${sale.total.toFixed(2)} a ${sale.customerName}.`,
      'success',
      'pos'
    );
  };

  // Handlers for Inventory & Kardex
  const handleSaveProduct = (
    product: Product,
    isNew: boolean,
    stockDelta = 0
  ) => {
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    if (isNew) {
      setProducts((prev) => [product, ...prev]);
      const entry: KardexEntry = {
        id: `kdx-${Date.now()}`,
        date: nowStr,
        productId: product.id,
        productName: product.name,
        barcode: product.barcode,
        type: 'ENTRADA',
        quantity: product.stock,
        stockAfter: product.stock,
        customerOrSupplier: 'Inventario Inicial',
        reference: `Alta SKU ${product.sku}`,
        unitPrice: product.costPrice,
      };
      setKardex((prev) => [entry, ...prev]);
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? product : p))
      );
      if (stockDelta !== 0) {
        const entry: KardexEntry = {
          id: `kdx-${Date.now()}`,
          date: nowStr,
          productId: product.id,
          productName: product.name,
          barcode: product.barcode,
          type: stockDelta > 0 ? 'ENTRADA' : 'AJUSTE',
          quantity: Math.abs(stockDelta),
          stockAfter: product.stock,
          customerOrSupplier: 'Ajuste de Inventario',
          reference: `Edición SKU ${product.sku}`,
          unitPrice: product.costPrice,
        };
        setKardex((prev) => [entry, ...prev]);
      }
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleManualKardexMovement = (
    productId: string,
    type: 'ENTRADA' | 'SALIDA' | 'AJUSTE',
    qty: number,
    customerOrSupplier: string,
    reference: string
  ) => {
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const nextStock =
          type === 'ENTRADA' ? p.stock + qty : Math.max(0, p.stock - qty);
        const entry: KardexEntry = {
          id: `kdx-${Date.now()}`,
          date: nowStr,
          productId: p.id,
          productName: p.name,
          barcode: p.barcode,
          type,
          quantity: qty,
          stockAfter: nextStock,
          customerOrSupplier,
          reference,
          unitPrice: p.salePrice,
        };
        setKardex((kPrev) => [entry, ...kPrev]);
        return { ...p, stock: nextStock, updatedAt: nowStr.slice(0, 10) };
      })
    );
  };

  // Handlers for Cash
  const handleOpenCash = (openingBalance: number) => {
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newSession: CashSession = {
      id: `cs-${Date.now()}`,
      openedAt: nowStr,
      openingBalance,
      status: 'ABIERTA',
      openedBy: currentUser?.fullName || 'Administrador',
    };
    setCashSessions((prev) => [
      newSession,
      ...prev.map((s) => ({ ...s, status: 'CERRADA' as const })),
    ]);

    const mov: CashMovement = {
      id: `cm-${Date.now()}`,
      sessionId: newSession.id,
      type: 'INGRESO',
      tag: 'Apertura de Caja',
      description: 'Saldo de apertura de caja',
      amount: openingBalance,
      createdAt: nowStr,
      user: currentUser?.fullName || 'Administrador',
    };
    setCashMovements((prev) => [mov, ...prev]);
    pushNotification(
      'Caja Abierta',
      `Apertura registrada con ${settings.currencySymbol} ${openingBalance.toFixed(2)}`,
      'success',
      'cash'
    );
  };

  const handleCloseCash = (closingBalance: number) => {
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setCashSessions((prev) =>
      prev.map((s) =>
        s.status === 'ABIERTA'
          ? { ...s, status: 'CERRADA', closedAt: nowStr, closingBalance }
          : s
      )
    );
    pushNotification(
      'Cierre de Caja Realizado',
      `Saldo final arqueado: ${settings.currencySymbol} ${closingBalance.toFixed(2)}`,
      'warning',
      'cash'
    );
  };

  const handleAddCashMovement = (
    type: 'INGRESO' | 'EGRESO',
    tag: string,
    description: string,
    amount: number
  ) => {
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const mov: CashMovement = {
      id: `cm-${Date.now()}`,
      sessionId: 'cs-current',
      type,
      tag,
      description,
      amount,
      createdAt: nowStr,
      user: currentUser?.fullName || 'Administrador',
    };
    setCashMovements((prev) => [mov, ...prev]);
  };

  const handleDeleteCashMovement = (id: string) => {
    setCashMovements((prev) => prev.filter((m) => m.id !== id));
  };

  // Handlers for Users
  const handleSaveUser = (userObj: AppUser, isNew: boolean) => {
    if (isNew) {
      setUsers((prev) => [...prev, userObj]);
    } else {
      setUsers((prev) => prev.map((u) => (u.id === userObj.id ? userObj : u)));
      if (currentUser && currentUser.id === userObj.id) {
        setCurrentUser(userObj);
      }
    }
    pushNotification(
      'Permisos de Usuario Actualizados',
      `El usuario ${userObj.username} fue guardado y afecta directo al Login.`,
      'info',
      'users'
    );
  };

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // Backup Export & Import (External Database & Google Drive Sync)
  const handleExportFullBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'Taller Fix',
      settings,
      users,
      products,
      orders,
      sales,
      kardex,
      cashSessions,
      cashMovements,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TallerFix_DB_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFullBackup = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.settings) setSettings(parsed.settings);
      if (Array.isArray(parsed.users)) setUsers(parsed.users);
      if (Array.isArray(parsed.products)) setProducts(parsed.products);
      if (Array.isArray(parsed.orders)) setOrders(parsed.orders);
      if (Array.isArray(parsed.sales)) setSales(parsed.sales);
      if (Array.isArray(parsed.kardex)) setKardex(parsed.kardex);
      if (Array.isArray(parsed.cashSessions)) setCashSessions(parsed.cashSessions);
      if (Array.isArray(parsed.cashMovements)) setCashMovements(parsed.cashMovements);
      return true;
    } catch {
      return false;
    }
  };

  // Filter visible tabs according to logged-in user's permissions
  const allowedNavItems = currentUser
    ? NAV_ITEMS.filter((item) => currentUser.permissions.includes(item.id))
    : NAV_ITEMS;

  // Ensure activeTab is allowed for user
  useEffect(() => {
    if (
      currentUser &&
      !currentUser.permissions.includes(activeTab) &&
      currentUser.permissions.length > 0
    ) {
      setActiveTab(currentUser.permissions[0]);
    }
  }, [currentUser, activeTab]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // If not logged in, render LoginView
  if (!currentUser) {
    return (
      <>
        <LoginView
          users={users}
          settings={settings}
          onLoginSuccess={(u) => {
            setCurrentUser(u);
            if (u.permissions.length > 0) {
              setActiveTab(u.permissions[0]);
            }
          }}
          onOpenPublicTracking={() =>
            setTrackingModal({ open: true, query: '' })
          }
        />
        <TrackingPortalModal
          isOpen={trackingModal.open}
          initialQuery={trackingModal.query}
          orders={orders}
          settings={settings}
          onClose={() => setTrackingModal({ open: false, query: '' })}
        />
      </>
    );
  }

  const isSidebarExpanded = !settings.autoHideSidebar || sidebarHovered;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Auto-Hiding Minimalist Sidebar */}
      <aside
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className={`print:hidden hidden md:flex flex-col justify-between fixed top-0 left-0 bottom-0 z-30 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 ${
          isSidebarExpanded ? 'w-64 shadow-xl' : 'w-20'
        }`}
      >
        {/* Brand Top */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={settings.logoUrl || '/icon.svg'}
                alt={settings.businessName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl object-contain bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shrink-0"
              />
              {isSidebarExpanded && (
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {settings.businessName}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {currentUser.role}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links with Flat Colored Icons */}
          <nav className="p-3 space-y-1.5">
            {allowedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (settings.autoHideSidebar) setSidebarHovered(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-blue-600 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                  title={!isSidebarExpanded ? item.label : undefined}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : item.flatColor
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSidebarExpanded && (
                    <span className="truncate flex-1 text-left">
                      {item.label}
                    </span>
                  )}
                  {isSidebarExpanded && isActive && (
                    <ChevronRight className="w-4 h-4 shrink-0 opacity-75" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User & Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setCurrentUser(null)}
            className="w-full flex items-center gap-3 p-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
            {isSidebarExpanded && (
              <div className="text-left min-w-0">
                <div className="truncate font-bold">Cerrar Sesión</div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentUser.fullName}
                </div>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[82vw] bg-white dark:bg-slate-900 h-full flex flex-col justify-between p-4 z-10 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <img
                    src={settings.logoUrl || '/icon.svg'}
                    alt={settings.businessName}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-xl object-contain"
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {settings.businessName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {currentUser.fullName}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-1">
                {allowedNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive ? 'bg-white/20 text-white' : item.flatColor
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <PWAInstallButton />
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  setCurrentUser(null);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>Salir ({currentUser.username})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          settings.autoHideSidebar ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Top Bar Contract: Zone 1 (Brand / Context) — Zone 2 (Quick Nav) — Zone 3 (Primary Actions) */}
        <header className="print:hidden sticky top-0 z-20 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Zone 1: Mobile Menu Trigger + Single-line Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
              {settings.businessName}
            </span>
          </div>

          {/* Zone 2: 4-5 Concise Single-line Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {allowedNavItems.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 ${
                  activeTab === item.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : ''
                }`}
              >
                {item.shortLabel}
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary Action & Notifications */}
          <div className="flex items-center gap-2.5 shrink-0 relative">
            <PWAInstallButton compact />

            <button
              onClick={() => setTrackingModal({ open: true, query: '' })}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
              title="Portal de Seguimiento por QR"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>Portal QR</span>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Notificaciones del sistema"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Floating Window */}
            {notifOpen && (
              <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Notificaciones ({notifications.length})
                  </span>
                  <button
                    onClick={() =>
                      setNotifications((prev) =>
                        prev.map((n) => ({ ...n, read: true }))
                      )
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Marcar leídas</span>
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setNotifications((prev) =>
                          prev.map((item) =>
                            item.id === n.id ? { ...item, read: true } : item
                          )
                        );
                        if (n.linkTab) setActiveTab(n.linkTab);
                        setNotifOpen(false);
                      }}
                      className={`py-2.5 px-2 rounded-xl cursor-pointer transition-colors ${
                        n.read
                          ? 'opacity-70 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          : 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                        <span>{n.title}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {n.createdAt}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-10">
          {activeTab === 'dashboard' && (
            <DashboardTab
              orders={orders}
              products={products}
              sales={sales}
              cashMovements={cashMovements}
              settings={settings}
              onNavigate={setActiveTab}
              onOpenTracking={(num) =>
                setTrackingModal({ open: true, query: num || '' })
              }
              onPrintOrder={(order) =>
                setPrintJob({
                  type: 'order',
                  data: order,
                  format: order.printFormat || settings.defaultPrintFormat,
                })
              }
            />
          )}

          {activeTab === 'orders' && (
            <OrdersTab
              orders={orders}
              settings={settings}
              currentUserFullName={currentUser.fullName}
              onSaveOrder={handleSaveOrder}
              onDeleteOrder={handleDeleteOrder}
              onPrintOrder={(order, fmt) =>
                setPrintJob({
                  type: 'order',
                  data: order,
                  format: fmt || order.printFormat || settings.defaultPrintFormat,
                })
              }
              onOpenTracking={(orderNum) =>
                setTrackingModal({ open: true, query: orderNum })
              }
            />
          )}

          {activeTab === 'pos' && (
            <PosTab
              products={products}
              sales={sales}
              settings={settings}
              currentUserFullName={currentUser.fullName}
              onCompleteSale={handleCompleteSale}
              onPrintSale={(sale, fmt) =>
                setPrintJob({
                  type: 'sale',
                  data: sale,
                  format: fmt || sale.printFormat || settings.defaultPrintFormat,
                })
              }
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryTab
              products={products}
              settings={settings}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onPrintBarcode={(prod, copies) =>
                setPrintJob({ type: 'barcode', data: prod, copies })
              }
            />
          )}

          {activeTab === 'kardex' && (
            <KardexTab
              kardex={kardex}
              products={products}
              settings={settings}
              onAddManualMovement={handleManualKardexMovement}
            />
          )}

          {activeTab === 'history' && (
            <HistoryTab
              orders={orders}
              sales={sales}
              settings={settings}
              onPrintOrder={(order, fmt) =>
                setPrintJob({
                  type: 'order',
                  data: order,
                  format: fmt || order.printFormat || settings.defaultPrintFormat,
                })
              }
              onPrintSale={(sale, fmt) =>
                setPrintJob({
                  type: 'sale',
                  data: sale,
                  format: fmt || sale.printFormat || settings.defaultPrintFormat,
                })
              }
              onOpenTracking={(orderNum) =>
                setTrackingModal({ open: true, query: orderNum })
              }
            />
          )}

          {activeTab === 'cash' && (
            <CashTab
              sessions={cashSessions}
              movements={cashMovements}
              settings={settings}
              currentUserFullName={currentUser.fullName}
              onOpenCash={handleOpenCash}
              onCloseCash={handleCloseCash}
              onAddMovement={handleAddCashMovement}
              onDeleteMovement={handleDeleteCashMovement}
            />
          )}

          {activeTab === 'users' && (
            <UsersTab
              users={users}
              currentUser={currentUser}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              settings={settings}
              onUpdateSettings={setSettings}
              onExportFullBackup={handleExportFullBackup}
              onImportFullBackup={handleImportFullBackup}
              onTriggerCloudSync={() =>
                pushNotification(
                  'Sincronización Google Drive',
                  `Base de datos respaldada en ${settings.googleDriveFolderName}.`,
                  'success',
                  'settings'
                )
              }
            />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar (Thumb-friendly navigation on Mobile) */}
        <nav className="print:hidden md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 flex items-center justify-around">
          {allowedNavItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center mb-0.5 ${
                    isActive ? item.flatColor : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="truncate max-w-[60px]">{item.shortLabel}</span>
              </button>
            );
          })}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold text-slate-500 dark:text-slate-400"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-0.5">
              <Menu className="w-4 h-4" />
            </div>
            <span>Más</span>
          </button>
        </nav>
      </div>

      {/* Print Preview & Direct Thermal/A4 Print Modal */}
      <PrintModal
        job={printJob}
        settings={settings}
        onClose={() => setPrintJob(null)}
      />

      {/* QR Live Tracking Portal Modal */}
      <TrackingPortalModal
        isOpen={trackingModal.open}
        initialQuery={trackingModal.query}
        orders={orders}
        settings={settings}
        onClose={() => setTrackingModal({ open: false, query: '' })}
      />
    </div>
  );
}

export default App;

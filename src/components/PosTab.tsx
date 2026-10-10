import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  User,
  Phone,
  PackagePlus,
  CheckCircle2,
  Receipt,
  CreditCard,
} from 'lucide-react';
import {
  BusinessSettings,
  PrintFormat,
  Product,
  Sale,
  SaleItem,
} from '../types';
import {
  FloatingInput,
  FloatingSelect,
  FlatIcon,
} from './FloatingField';

interface PosTabProps {
  products: Product[];
  sales: Sale[];
  settings: BusinessSettings;
  currentUserFullName: string;
  onCompleteSale: (sale: Sale) => void;
  onPrintSale: (sale: Sale, format?: PrintFormat) => void;
}

export const PosTab: React.FC<PosTabProps> = ({
  products,
  sales,
  settings,
  currentUserFullName,
  onCompleteSale,
  onPrintSale,
}) => {
  // Customer inputs
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Yape / Plin'
  >('Efectivo');
  const [printFormat, setPrintFormat] = useState<PrintFormat>(
    settings.defaultPrintFormat || '80mm'
  );

  // Cart items
  const [cart, setCart] = useState<SaleItem[]>([]);

  // Quick search
  const [productQuery, setProductQuery] = useState('');

  // Manual Item addition state
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualQty, setManualQty] = useState('1');

  const addProductToCart = (prod: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === prod.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === prod.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                subtotal: (i.quantity + 1) * i.unitPrice,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: prod.id,
          name: prod.name,
          quantity: 1,
          unitPrice: prod.salePrice,
          subtotal: prod.salePrice,
        },
      ];
    });
  };

  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(manualPrice);
    const qty = parseInt(manualQty, 10) || 1;
    if (!manualName.trim() || isNaN(price) || price <= 0) return;

    const newItem: SaleItem = {
      productId: `man-${Date.now()}`,
      name: manualName.trim(),
      quantity: qty,
      unitPrice: price,
      subtotal: qty * price,
      isManual: true,
    };
    setCart((prev) => [...prev, newItem]);
    setManualName('');
    setManualPrice('');
    setManualQty('1');
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const nextQty = item.quantity + delta;
          if (nextQty <= 0) return null;
          return {
            ...item,
            quantity: nextQty,
            subtotal: nextQty * item.unitPrice,
          };
        })
        .filter(Boolean) as SaleItem[]
    );
  };

  const removeCartItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.subtotal, 0);

  const handleCheckout = (shouldPrint: boolean) => {
    if (cart.length === 0) return;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Determine next receipt number safely
    const maxNum = sales.reduce((max, s) => {
      const match = s.saleNumber.match(/\d+$/);
      if (match) {
        const val = parseInt(match[0], 10);
        return val > max ? val : max;
      }
      return max;
    }, 40);
    const nextNum = String(maxNum + 1).padStart(4, '0');

    const newSale: Sale = {
      id: `sal-${Date.now()}`,
      saleNumber: `B001-${nextNum}`,
      customerName: customerName.trim() || 'Cliente General',
      phone: phone.trim(),
      items: cart,
      total: cartTotal,
      paymentMethod,
      createdAt: formattedDate,
      cashier: currentUserFullName,
      printFormat,
    };

    onCompleteSale(newSale);
    setCart([]);
    setCustomerName('');
    setPhone('');

    if (shouldPrint) {
      onPrintSale(newSale, printFormat);
    }
  };

  const filteredCatalog = products.filter((p) => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <FlatIcon icon={<ShoppingCart className="w-5 h-5" />} color="emerald" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Punto de Venta (POS)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Venta rápida de repuestos, accesorios y servicios con emisión en 58mm, 80mm y A4
            </p>
          </div>
        </div>

        {/* Last Sale Quick Reprint Button */}
        {sales.length > 0 && (
          <button
            onClick={() => onPrintSale(sales[0], sales[0].printFormat)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Reimprimir Última Boleta ({sales[0].saleNumber})</span>
          </button>
        )}
      </div>

      {/* Main POS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Catalog Search + Manual Item Entry (7 columns) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Quick Search Bar */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                1. Búsqueda Rápida de Productos o Servicios
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                {filteredCatalog.length} disponibles
              </span>
            </div>

            <FloatingInput
              label="Buscar por nombre, código de barras o SKU para agregar con 1 clic..."
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {filteredCatalog.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => addProductToCart(prod)}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-600 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 text-left flex items-center justify-between gap-3 transition-all cursor-pointer group"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {prod.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {prod.barcode} · Stock: {prod.stock}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      {settings.currencySymbol} {prod.salePrice.toFixed(2)}
                    </div>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-600">
                      <Plus className="w-3 h-3" /> Agregar
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Product / Service Addition */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <PackagePlus className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                2. Agregar Producto o Servicio Manualmente
              </h2>
            </div>

            <form
              onSubmit={handleAddManualItem}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
            >
              <div className="sm:col-span-6">
                <FloatingInput
                  label="Descripción del servicio o producto libre"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                />
              </div>
              <div className="sm:col-span-3">
                <FloatingInput
                  label={`Precio (${settings.currencySymbol})`}
                  type="number"
                  step="0.01"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                />
              </div>
              <div className="sm:col-span-3 flex items-center gap-2">
                <FloatingInput
                  label="Cant."
                  type="number"
                  min="1"
                  value={manualQty}
                  onChange={(e) => setManualQty(e.target.value)}
                  containerClassName="w-20"
                />
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer px-3"
                >
                  <Plus className="w-4 h-4" />
                  <span>Sumar</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Customer Data + Cart + Print 58mm/80mm/A4 (5 columns) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Comprobante de Venta Actual
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {cart.reduce((a, b) => a + b.quantity, 0)} ítems
            </span>
          </div>

          {/* Customer Fields with Floating Labels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FloatingInput
              label="Nombre del Cliente"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              icon={<User className="w-4 h-4" />}
            />
            <FloatingInput
              label={`Número Celular (${settings.phonePrefix})`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Phone className="w-4 h-4" />}
            />
          </div>

          {/* Cart Items List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto border-y border-slate-100 dark:border-slate-800 py-2">
            {cart.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                Seleccione productos del buscador o agregue un servicio manual para comenzar.
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="py-2.5 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500">
                      {settings.currencySymbol} {item.unitPrice.toFixed(2)} c/u
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.productId, -1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.productId, 1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="font-mono font-bold text-slate-900 dark:text-white w-20 text-right">
                    {settings.currencySymbol} {item.subtotal.toFixed(2)}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCartItem(item.productId)}
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Payment Method & Print Format Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FloatingSelect
              label="Método de Pago"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              icon={<CreditCard className="w-4 h-4" />}
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Yape / Plin">Billetera Digital (Yape / Plin / QR)</option>
              <option value="Tarjeta">Tarjeta Débito / Crédito</option>
              <option value="Transferencia">Transferencia Bancaria</option>
            </FloatingSelect>

            <FloatingSelect
              label="Formato de Impresión"
              value={printFormat}
              onChange={(e) => setPrintFormat(e.target.value as PrintFormat)}
              icon={<Printer className="w-4 h-4" />}
            >
              <option value="58mm">Ticket Térmico 58mm</option>
              <option value="80mm">Ticket Térmico 80mm</option>
              <option value="a4">Comprobante A4</option>
            </FloatingSelect>
          </div>

          {/* Total Box */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                Total a Cobrar
              </span>
              <span className="text-xs text-slate-300">
                Impuestos incluidos · {paymentMethod}
              </span>
            </div>
            <div className="text-2xl font-mono font-bold tabular-nums text-emerald-400">
              {settings.currencySymbol} {cartTotal.toFixed(2)}
            </div>
          </div>

          {/* Checkout Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => handleCheckout(false)}
              className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Solo Registrar Venta</span>
            </button>

            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => handleCheckout(true)}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Cobrar e Imprimir ({printFormat.toUpperCase()})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent POS Sales Table with Reprint */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Ventas Recientes en Punto de Venta (Reimpresión Rápida)
          </h3>
          <span className="text-xs text-slate-500">{sales.length} ventas registradas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 bg-slate-50/60 dark:bg-slate-800/40">
                <th className="py-3 px-4">Boleta</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Cliente / Celular</th>
                <th className="py-3 px-4">Detalle</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-right">Reimprimir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {sales.slice(0, 6).map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {sale.saleNumber}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{sale.createdAt}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {sale.customerName}
                    </div>
                    {sale.phone && (
                      <div className="font-mono text-[11px] text-slate-500">
                        {settings.phonePrefix} {sale.phone}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {sale.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {settings.currencySymbol} {sale.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      {(['58mm', '80mm', 'a4'] as PrintFormat[]).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => onPrintSale(sale, fmt)}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white font-mono text-[10px] font-semibold uppercase cursor-pointer"
                          title={`Reimprimir en ${fmt.toUpperCase()}`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

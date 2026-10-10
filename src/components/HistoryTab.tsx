import React, { useMemo, useState } from 'react';
import {
  History,
  Search,
  Printer,
  Calendar,
  MoreVertical,
  Wrench,
  ShoppingBag,
  MessageCircle,
  QrCode,
  RotateCcw,
  FileDown,
  X,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import {
  BusinessSettings,
  PrintFormat,
  Sale,
  WorkOrder,
} from '../types';
import { FloatingInput, FloatingSelect, FlatIcon } from './FloatingField';
import { exportMonthlyReportToPdf, getMonthLabel } from '../utils/pdfExport';

interface HistoryTabProps {
  orders: WorkOrder[];
  sales: Sale[];
  settings: BusinessSettings;
  onPrintOrder: (order: WorkOrder, format?: PrintFormat) => void;
  onPrintSale: (sale: Sale, format?: PrintFormat) => void;
  onOpenTracking: (orderNum: string) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  orders,
  sales,
  settings,
  onPrintOrder,
  onPrintSale,
  onOpenTracking,
}) => {
  const [subTab, setSubTab] = useState<'orders' | 'sales'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // PDF Export Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfReportType, setPdfReportType] = useState<'sales' | 'orders' | 'both'>('both');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  });
  const [pdfFeedback, setPdfFeedback] = useState(false);

  // Collect distinct months present in the data for quick selection
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    // Default current month
    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    monthSet.add(currentMonthStr);

    orders.forEach((o) => {
      if (o.createdAt && o.createdAt.length >= 7) {
        monthSet.add(o.createdAt.slice(0, 7));
      }
    });

    sales.forEach((s) => {
      if (s.createdAt && s.createdAt.length >= 7) {
        monthSet.add(s.createdAt.slice(0, 7));
      }
    });

    return Array.from(monthSet).sort().reverse();
  }, [orders, sales]);

  const handleTriggerPdfExport = () => {
    exportMonthlyReportToPdf({
      type: pdfReportType,
      monthStr: selectedMonth,
      sales,
      orders,
      settings,
    });
    setPdfFeedback(true);
    setTimeout(() => {
      setPdfFeedback(false);
      setIsPdfModalOpen(false);
    }, 1200);
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q) ||
      o.brandModel.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q);
    const matchesDate = !dateFilter || o.createdAt.startsWith(dateFilter);
    return matchesSearch && matchesDate;
  });

  const filteredSales = sales.filter((s) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.saleNumber.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q) ||
      s.items.some((i) => i.name.toLowerCase().includes(q));
    const matchesDate = !dateFilter || s.createdAt.startsWith(dateFilter);
    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <FlatIcon icon={<History className="w-5 h-5" />} color="purple" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Historial de Órdenes y Ventas
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Consulta histórica, filtros avanzados, reportes PDF mensuales y reimpresión
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botón de Exportar a PDF */}
          <button
            onClick={() => {
              setPdfReportType(subTab === 'orders' ? 'orders' : 'sales');
              setIsPdfModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            title="Generar reporte PDF mensual de ventas y órdenes"
          >
            <FileDown className="w-4 h-4" />
            <span>Exportar Reporte PDF</span>
          </button>

          {/* Sub-tab Segmented Switch */}
          <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => {
                setSubTab('orders');
                setOpenMenuId(null);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                subTab === 'orders'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Órdenes ({orders.length})</span>
            </button>

            <button
              onClick={() => {
                setSubTab('sales');
                setOpenMenuId(null);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                subTab === 'sales'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Ventas ({sales.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        <div className="sm:col-span-7">
          <FloatingInput
            label={
              subTab === 'orders'
                ? 'Buscar en historial por N° orden, cliente, celular, equipo o estado...'
                : 'Buscar en historial por N° boleta, cliente, celular o producto vendido...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="sm:col-span-4">
          <FloatingInput
            label="Filtrar por Fecha"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>
        <div className="sm:col-span-1">
          <button
            onClick={() => {
              setSearchQuery('');
              setDateFilter('');
            }}
            className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            title="Restablecer búsqueda"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-view 1: Service Orders History */}
      {subTab === 'orders' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-visible">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 bg-slate-50/60 dark:bg-slate-800/40">
                  <th className="py-3.5 px-4">Orden</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Cliente / Celular</th>
                  <th className="py-3.5 px-4">Equipo / Diagnóstico</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Importe</th>
                  <th className="py-3.5 px-4 text-right">Reimpresión / Más</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No se encontraron órdenes en el historial con esos criterios.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isMenuOpen = openMenuId === order.id;
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                        <td className="py-3.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                          {order.orderNumber}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                          {order.createdAt}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {order.customerName}
                          </div>
                          <div className="font-mono text-[11px] text-slate-500">
                            {settings.phonePrefix} {order.phone}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {order.device} · {order.brandModel}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {order.diagnosis}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          {order.status}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                          {settings.currencySymbol} {order.totalCost.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap relative">
                          <div className="inline-flex items-center gap-1">
                            {(['58mm', '80mm', 'a4'] as PrintFormat[]).map((fmt) => (
                              <button
                                key={fmt}
                                onClick={() => onPrintOrder(order, fmt)}
                                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white font-mono text-[10px] font-semibold uppercase cursor-pointer"
                                title={`Reimprimir en ${fmt.toUpperCase()}`}
                              >
                                {fmt}
                              </button>
                            ))}

                            <button
                              onClick={() => setOpenMenuId(isMenuOpen ? null : order.id)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {isMenuOpen && (
                            <div className="absolute right-4 top-12 z-40 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-2 text-left space-y-1">
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onOpenTracking(order.orderNumber);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer"
                              >
                                <QrCode className="w-4 h-4" />
                                <span>Ver Seguimiento QR</span>
                              </button>
                              <a
                                href={`https://wa.me/${settings.phonePrefix.replace('+', '')}${order.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(
                                  `Hola ${order.customerName}, le enviamos copia del registro de su orden ${order.orderNumber} (${order.brandModel}) en ${settings.businessName}.`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800"
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span>Contactar WhatsApp</span>
                              </a>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-view 2: POS Sales History */}
      {subTab === 'sales' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-visible">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 bg-slate-50/60 dark:bg-slate-800/40">
                  <th className="py-3.5 px-4">Boleta</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Cliente / Celular</th>
                  <th className="py-3.5 px-4">Productos / Servicios</th>
                  <th className="py-3.5 px-4">Pago</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4 text-right">Reimpresión Directa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No se encontraron ventas en el historial con esos criterios.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {sale.saleNumber}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {sale.createdAt}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {sale.customerName}
                        </div>
                        {sale.phone && (
                          <div className="font-mono text-[11px] text-slate-500">
                            {settings.phonePrefix} {sale.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs text-slate-700 dark:text-slate-300">
                        {sale.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">
                        {sale.paymentMethod}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                        {settings.currencySymbol} {sale.total.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {(['58mm', '80mm', 'a4'] as PrintFormat[]).map((fmt) => (
                            <button
                              key={fmt}
                              onClick={() => onPrintSale(sale, fmt)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white font-mono text-[10px] font-semibold uppercase cursor-pointer"
                            >
                              <Printer className="w-3 h-3" />
                              <span>{fmt}</span>
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Exportación a PDF (Reportes Mensuales) */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Exportar Reporte Mensual en PDF
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Generación de documento formal A4 para contabilidad y control
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Selector de Tipo de Reporte */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Contenido del Reporte PDF:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'both', label: 'Ventas y Órdenes' },
                    { id: 'sales', label: 'Solo Ventas POS' },
                    { id: 'orders', label: 'Solo Órdenes' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPdfReportType(tab.id as any)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                        pdfReportType === tab.id
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Mes */}
              <div className="space-y-1.5">
                <FloatingSelect
                  label="Mes del Reporte"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {getMonthLabel(m)} ({m})
                    </option>
                  ))}
                </FloatingSelect>
              </div>

              {/* Preview Resumen */}
              <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 space-y-2 text-xs">
                <div className="font-bold text-purple-950 dark:text-purple-200 flex items-center justify-between">
                  <span>Resumen preliminar para {getMonthLabel(selectedMonth)}:</span>
                  <span className="font-mono text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                    {settings.businessName}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  <div>
                    • Ventas del mes:{' '}
                    <strong className="font-mono">
                      {sales.filter((s) => s.createdAt?.startsWith(selectedMonth)).length}
                    </strong>{' '}
                    comprobantes
                  </div>
                  <div>
                    • Órdenes del mes:{' '}
                    <strong className="font-mono">
                      {orders.filter((o) => o.createdAt?.startsWith(selectedMonth)).length}
                    </strong>{' '}
                    equipos
                  </div>
                  <div>
                    • Total facturado POS:{' '}
                    <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                      {settings.currencySymbol}{' '}
                      {sales
                        .filter((s) => s.createdAt?.startsWith(selectedMonth))
                        .reduce((a, b) => a + (b.total || 0), 0)
                        .toFixed(2)}
                    </strong>
                  </div>
                  <div>
                    • Presupuesto órdenes:{' '}
                    <strong className="font-mono text-blue-600 dark:text-blue-400">
                      {settings.currencySymbol}{' '}
                      {orders
                        .filter((o) => o.createdAt?.startsWith(selectedMonth))
                        .reduce((a, b) => a + (b.totalCost || 0), 0)
                        .toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Footer Acciones */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleTriggerPdfExport}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                >
                  {pdfFeedback ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>¡Descargando Reporte!</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      <span>Generar y Descargar PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

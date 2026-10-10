import React, { useState } from 'react';
import {
  Plus,
  Search,
  Printer,
  MessageCircle,
  MoreVertical,
  Edit3,
  Trash2,
  QrCode,
  CheckCircle2,
  X,
  User,
  Phone,
  Smartphone,
  Wrench,
  DollarSign,
} from 'lucide-react';
import {
  BusinessSettings,
  OrderStatus,
  PrintFormat,
  WorkOrder,
} from '../types';
import {
  FloatingInput,
  FloatingSelect,
  FloatingTextarea,
  FlatIcon,
} from './FloatingField';

interface OrdersTabProps {
  orders: WorkOrder[];
  settings: BusinessSettings;
  currentUserFullName: string;
  onSaveOrder: (order: WorkOrder, isNew: boolean) => void;
  onDeleteOrder: (id: string) => void;
  onPrintOrder: (order: WorkOrder, format?: PrintFormat) => void;
  onOpenTracking: (orderNum: string) => void;
}

const ORDER_STATUSES: OrderStatus[] = [
  'Pendiente',
  'En Diagnóstico',
  'En Reparación',
  'Listo para Entrega',
  'Entregado',
  'Cancelado',
];

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  settings,
  currentUserFullName,
  onSaveOrder,
  onDeleteOrder,
  onPrintOrder,
  onOpenTracking,
}) => {
  // Filter states: nombre, celular, modelo, estado
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Floating popover menu state inside list
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Modal Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [device, setDevice] = useState('Smartphone');
  const [brandModel, setBrandModel] = useState('');
  const [serialOrImei, setSerialOrImei] = useState('');
  const [status, setStatus] = useState<OrderStatus>('Pendiente');
  const [problem, setProblem] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [totalCost, setTotalCost] = useState('0');
  const [advancePayment, setAdvancePayment] = useState('0');
  const [printFormat, setPrintFormat] = useState<PrintFormat>(
    settings.defaultPrintFormat || '80mm'
  );

  const openNewOrderModal = () => {
    setEditingOrder(null);
    setCustomerName('');
    setPhone('');
    setDevice('Smartphone');
    setBrandModel('');
    setSerialOrImei('');
    setStatus('Pendiente');
    setProblem('');
    setDiagnosis('');
    setTotalCost('');
    setAdvancePayment('0');
    setPrintFormat(settings.defaultPrintFormat || '80mm');
    setIsModalOpen(true);
  };

  const openEditOrderModal = (order: WorkOrder) => {
    setEditingOrder(order);
    setCustomerName(order.customerName);
    setPhone(order.phone);
    setDevice(order.device);
    setBrandModel(order.brandModel);
    setSerialOrImei(order.serialOrImei || '');
    setStatus(order.status);
    setProblem(order.problem);
    setDiagnosis(order.diagnosis);
    setTotalCost(String(order.totalCost));
    setAdvancePayment(String(order.advancePayment));
    setPrintFormat(order.printFormat || '80mm');
    setOpenMenuId(null);
    setIsModalOpen(true);
  };

  const handleSubmitOrder = (e: React.FormEvent, shouldPrintAfter: boolean) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !brandModel.trim()) return;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Determine next order number safely by finding highest existing number
    const maxNum = orders.reduce((max, o) => {
      const match = o.orderNumber.match(/\d+/);
      if (match) {
        const val = parseInt(match[0], 10);
        return val > max ? val : max;
      }
      return max;
    }, 1000);
    const nextNum = maxNum + 1;

    const newOrderObj: WorkOrder = {
      id: editingOrder ? editingOrder.id : `ord-${Date.now()}`,
      orderNumber: editingOrder ? editingOrder.orderNumber : `OT-${nextNum}`,
      customerName: customerName.trim(),
      phone: phone.trim(),
      device: device.trim() || 'Equipo',
      brandModel: brandModel.trim(),
      serialOrImei: serialOrImei.trim(),
      status,
      problem: problem.trim() || 'Revisión general',
      diagnosis: diagnosis.trim() || 'Pendiente de diagnóstico técnico',
      totalCost: parseFloat(totalCost) || 0,
      advancePayment: parseFloat(advancePayment) || 0,
      createdAt: editingOrder ? editingOrder.createdAt : formattedDate,
      updatedAt: formattedDate,
      technician: editingOrder ? editingOrder.technician : currentUserFullName,
      printFormat,
    };

    onSaveOrder(newOrderObj, !editingOrder);
    setIsModalOpen(false);

    if (shouldPrintAfter) {
      onPrintOrder(newOrderObj, printFormat);
    }
  };

  const handleQuickStatusChange = (order: WorkOrder, newStatus: OrderStatus) => {
    const updated: WorkOrder = {
      ...order,
      status: newStatus,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    onSaveOrder(updated, false);
    setOpenMenuId(null);
  };

  const buildWhatsAppLink = (order: WorkOrder) => {
    const cleanPhone = order.phone.replace(/[^0-9]/g, '');
    const prefix = settings.phonePrefix.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.startsWith(prefix) ? cleanPhone : `${prefix}${cleanPhone}`;
    const pending = Math.max(0, order.totalCost - order.advancePayment);
    const trackUrl = `${(settings.customTrackingDomain || window.location.origin).replace(
      /\/$/,
      ''
    )}/?track=${encodeURIComponent(order.orderNumber)}`;

    const message =
      `Hola *${order.customerName}*, te saludamos de *${settings.businessName}*.\n\n` +
      `📋 *Orden:* ${order.orderNumber}\n` +
      `📱 *Equipo:* ${order.device} ${order.brandModel}\n` +
      `🔧 *Estado:* ${order.status}\n` +
      `🩺 *Diagnóstico:* ${order.diagnosis}\n` +
      `💰 *Costo Total:* ${settings.currencySymbol} ${order.totalCost.toFixed(2)}\n` +
      `💵 *Adelanto:* ${settings.currencySymbol} ${order.advancePayment.toFixed(2)}\n` +
      `📌 *Saldo Pendiente:* ${settings.currencySymbol} ${pending.toFixed(2)}\n\n` +
      `🔍 *Sigue tu reparación en vivo aquí:* ${trackUrl}`;

    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
  };

  // Filter logic by nombre, celular, modelo, or orderNumber
  const filteredOrders = orders.filter((o) => {
    const q = searchFilter.trim().toLowerCase();
    const matchesSearch =
      !q ||
      o.customerName.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q) ||
      o.brandModel.toLowerCase().includes(q) ||
      o.device.toLowerCase().includes(q) ||
      o.orderNumber.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColorText = (st: OrderStatus) => {
    switch (st) {
      case 'Pendiente':
        return 'text-amber-600 dark:text-amber-400';
      case 'En Diagnóstico':
        return 'text-blue-600 dark:text-blue-400';
      case 'En Reparación':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'Listo para Entrega':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'Entregado':
        return 'text-slate-600 dark:text-slate-400';
      case 'Cancelado':
        return 'text-rose-600 dark:text-rose-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <FlatIcon icon={<Wrench className="w-5 h-5" />} color="blue" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Órdenes de Trabajo
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Recepción técnica, diagnóstico, impresión 58mm/80mm/A4 y aviso WhatsApp
            </p>
          </div>
        </div>

        <button
          onClick={openNewOrderModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Orden de Trabajo</span>
        </button>
      </div>

      {/* Filter Bar (Nombre, Celular, Modelo + Estado) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-7">
          <FloatingInput
            label="Filtrar por nombre de cliente, número celular, equipo o modelo..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="md:col-span-5 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['ALL', ...ORDER_STATUSES] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                statusFilter === st
                  ? 'bg-slate-900 text-white dark:bg-blue-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL' ? `Todas (${orders.length})` : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-800/40">
                <th className="py-3.5 px-4">Orden / Fecha</th>
                <th className="py-3.5 px-4">Cliente / Celular</th>
                <th className="py-3.5 px-4">Equipo / Modelo</th>
                <th className="py-3.5 px-4">Problema y Diagnóstico</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Costo / Adelanto</th>
                <th className="py-3.5 px-4 text-right">Acciones y Más Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No se encontraron órdenes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const balance = Math.max(0, order.totalCost - order.advancePayment);
                  const isMenuOpen = openMenuId === order.id;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                          {order.orderNumber}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">
                          {order.createdAt}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Impresión: {order.printFormat.toUpperCase()}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {order.customerName}
                        </div>
                        <div className="font-mono text-xs text-slate-500">
                          {settings.phonePrefix} {order.phone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {order.brandModel}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {order.device} {order.serialOrImei ? `· IMEI: ${order.serialOrImei}` : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top max-w-xs">
                        <div className="text-slate-800 dark:text-slate-200 line-clamp-1">
                          <span className="font-semibold">Falla:</span> {order.problem}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          <span className="font-semibold">Diag:</span> {order.diagnosis}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <span className={`font-bold ${statusColorText(order.status)}`}>
                          {order.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-top text-right font-mono tabular-nums whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">
                          Total: {settings.currencySymbol} {order.totalCost.toFixed(2)}
                        </div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          Adelanto: {settings.currencySymbol} {order.advancePayment.toFixed(2)}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          Saldo: {settings.currencySymbol} {balance.toFixed(2)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap relative">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Direct WhatsApp Button */}
                          <a
                            href={buildWhatsAppLink(order)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold transition-colors"
                            title="Enviar estado y QR por WhatsApp al cliente"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">WhatsApp</span>
                          </a>

                          {/* Quick Reprint Button */}
                          <button
                            onClick={() => onPrintOrder(order, order.printFormat)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Reimprimir orden"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Imprimir</span>
                          </button>

                          {/* Floating Window Trigger ("Ver más opciones dentro de listas") */}
                          <button
                            onClick={() =>
                              setOpenMenuId(isMenuOpen ? null : order.id)
                            }
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="Más opciones"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Floating Options Window */}
                        {isMenuOpen && (
                          <div className="absolute right-4 top-12 z-40 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-2 text-left space-y-1">
                            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Opciones de Orden {order.orderNumber}
                            </div>

                            <button
                              onClick={() => openEditOrderModal(order)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4 text-blue-600" />
                              <span>Editar Orden / Diagnóstico</span>
                            </button>

                            <div className="px-2.5 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Reimprimir en Formato:
                            </div>
                            <div className="grid grid-cols-3 gap-1 px-2 py-1">
                              {(['58mm', '80mm', 'a4'] as PrintFormat[]).map((fmt) => (
                                <button
                                  key={fmt}
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    onPrintOrder(order, fmt);
                                  }}
                                  className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-[11px] font-mono font-semibold uppercase text-center cursor-pointer"
                                >
                                  {fmt}
                                </button>
                              ))}
                            </div>

                            <div className="px-2.5 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Cambiar Estado Rápido:
                            </div>
                            <div className="grid grid-cols-1 gap-0.5">
                              {ORDER_STATUSES.map((st) => (
                                <button
                                  key={st}
                                  onClick={() => handleQuickStatusChange(order, st)}
                                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs cursor-pointer ${
                                    order.status === st
                                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 font-semibold'
                                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                  }`}
                                >
                                  <span>{st}</span>
                                  {order.status === st && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </button>
                              ))}
                            </div>

                            <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onOpenTracking(order.orderNumber);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer"
                              >
                                <QrCode className="w-4 h-4" />
                                <span>Ver Portal QR del Cliente</span>
                              </button>

                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onDeleteOrder(order.id);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Eliminar Orden</span>
                              </button>
                            </div>
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

      {/* Modal Crear / Editar Orden de Trabajo con Etiquetas dentro de espacios a rellenar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <FlatIcon icon={<Wrench className="w-5 h-5" />} color="blue" size="sm" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingOrder
                      ? `Editar Orden ${editingOrder.orderNumber}`
                      : 'Nueva Orden de Trabajo'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Complete los campos con etiquetas integradas e imprima el comprobante
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => handleSubmitOrder(e, false)}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FloatingInput
                  label="Nombre del Cliente *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  icon={<User className="w-4 h-4" />}
                  required
                />
                <FloatingInput
                  label={`Número Celular (${settings.phonePrefix}) *`}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={<Phone className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FloatingSelect
                  label="Tipo de Equipo"
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  icon={<Smartphone className="w-4 h-4" />}
                >
                  <option value="Smartphone">Smartphone / Celular</option>
                  <option value="Laptop">Laptop / Notebook</option>
                  <option value="Tablet">Tablet / iPad</option>
                  <option value="Consola">Consola de Videojuegos</option>
                  <option value="PC Escritorio">PC de Escritorio</option>
                  <option value="Smartwatch">Smartwatch</option>
                  <option value="Otro Equipo">Otro Equipo</option>
                </FloatingSelect>

                <FloatingInput
                  label="Marca y Modelo del Equipo *"
                  value={brandModel}
                  onChange={(e) => setBrandModel(e.target.value)}
                  required
                />

                <FloatingInput
                  label="Serie / IMEI / Patrón (Opcional)"
                  value={serialOrImei}
                  onChange={(e) => setSerialOrImei(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FloatingTextarea
                  label="Problema Reportado por el Cliente *"
                  rows={3}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  required
                />
                <FloatingTextarea
                  label="Diagnóstico Técnico y Solución"
                  rows={3}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <FloatingSelect
                  label="Estado de la Orden"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </FloatingSelect>

                <FloatingInput
                  label={`Costo Total (${settings.currencySymbol})`}
                  type="number"
                  step="0.01"
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  icon={<DollarSign className="w-4 h-4" />}
                />

                <FloatingInput
                  label={`Adelanto de Pago (${settings.currencySymbol})`}
                  type="number"
                  step="0.01"
                  value={advancePayment}
                  onChange={(e) => setAdvancePayment(e.target.value)}
                  icon={<DollarSign className="w-4 h-4" />}
                />

                <FloatingSelect
                  label="Formato de Impresión"
                  value={printFormat}
                  onChange={(e) => setPrintFormat(e.target.value as PrintFormat)}
                >
                  <option value="58mm">Ticket 58mm</option>
                  <option value="80mm">Ticket 80mm</option>
                  <option value="a4">Hoja A4 Completa</option>
                </FloatingSelect>
              </div>

              {/* Live Balance Preview */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span>
                  COSTO TOTAL:{' '}
                  <strong>
                    {settings.currencySymbol} {(parseFloat(totalCost) || 0).toFixed(2)}
                  </strong>
                </span>
                <span>
                  ADELANTO:{' '}
                  <strong className="text-emerald-600">
                    {settings.currencySymbol} {(parseFloat(advancePayment) || 0).toFixed(2)}
                  </strong>
                </span>
                <span>
                  SALDO PENDIENTE:{' '}
                  <strong className="text-blue-600 dark:text-blue-400 text-sm">
                    {settings.currencySymbol}{' '}
                    {Math.max(
                      0,
                      (parseFloat(totalCost) || 0) - (parseFloat(advancePayment) || 0)
                    ).toFixed(2)}
                  </strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Guardar Orden
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmitOrder(e, true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Guardar e Imprimir ({printFormat.toUpperCase()})</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

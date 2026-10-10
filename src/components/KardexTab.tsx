import React, { useState } from 'react';
import {
  ClipboardList,
  Calendar,
  Package,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Plus,
} from 'lucide-react';
import {
  BusinessSettings,
  KardexEntry,
  Product,
} from '../types';
import {
  FloatingInput,
  FloatingSelect,
  FlatIcon,
} from './FloatingField';

interface KardexTabProps {
  kardex: KardexEntry[];
  products: Product[];
  settings: BusinessSettings;
  onAddManualMovement: (
    productId: string,
    type: 'ENTRADA' | 'SALIDA' | 'AJUSTE',
    qty: number,
    customerOrSupplier: string,
    reference: string
  ) => void;
}

export const KardexTab: React.FC<KardexTabProps> = ({
  kardex,
  products,
  settings,
  onAddManualMovement,
}) => {
  // Explicit filters requested: filtro por día, producto, cliente
  const [dayFilter, setDayFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');

  // Quick manual Kardex entry modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || '');
  const [movType, setMovType] = useState<'ENTRADA' | 'SALIDA' | 'AJUSTE'>('ENTRADA');
  const [movQty, setMovQty] = useState('1');
  const [movParty, setMovParty] = useState('');
  const [movRef, setMovRef] = useState('');

  const filteredEntries = kardex.filter((entry) => {
    const matchesDay = !dayFilter || entry.date.startsWith(dayFilter);
    const matchesProduct =
      !productFilter.trim() ||
      entry.productName.toLowerCase().includes(productFilter.trim().toLowerCase()) ||
      entry.barcode.toLowerCase().includes(productFilter.trim().toLowerCase());
    const matchesCustomer =
      !customerFilter.trim() ||
      entry.customerOrSupplier.toLowerCase().includes(customerFilter.trim().toLowerCase()) ||
      entry.reference.toLowerCase().includes(customerFilter.trim().toLowerCase());
    return matchesDay && matchesProduct && matchesCustomer;
  });

  const handleCreateMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(movQty, 10) || 1;
    if (!selectedProdId || qty <= 0) return;

    onAddManualMovement(
      selectedProdId,
      movType,
      qty,
      movParty.trim() || 'Movimiento Interno',
      movRef.trim() || `KDX-${Date.now().toString().slice(-4)}`
    );
    setShowAddModal(false);
    setMovQty('1');
    setMovParty('');
    setMovRef('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <FlatIcon icon={<ClipboardList className="w-5 h-5" />} color="amber" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Kardex de Inventario
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Trazabilidad exacta de entradas, salidas y ajustes con filtro por día, producto y cliente
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Movimiento Kardex</span>
        </button>
      </div>

      {/* 3 Filters Bar: Día, Producto, Cliente */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        <div className="sm:col-span-3">
          <FloatingInput
            label="Filtrar por Día (Fecha)"
            type="date"
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>
        <div className="sm:col-span-4">
          <FloatingInput
            label="Filtrar por Producto o Código"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            icon={<Package className="w-4 h-4" />}
          />
        </div>
        <div className="sm:col-span-4">
          <FloatingInput
            label="Filtrar por Cliente / Proveedor / Ref"
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            icon={<User className="w-4 h-4" />}
          />
        </div>
        <div className="sm:col-span-1 flex justify-end">
          <button
            onClick={() => {
              setDayFilter('');
              setProductFilter('');
              setCustomerFilter('');
            }}
            className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 cursor-pointer"
            title="Limpiar filtros"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kardex Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 bg-slate-50/60 dark:bg-slate-800/40">
                <th className="py-3.5 px-4">Fecha y Hora</th>
                <th className="py-3.5 px-4">Producto / Código</th>
                <th className="py-3.5 px-4">Tipo Movimiento</th>
                <th className="py-3.5 px-4">Cliente / Proveedor</th>
                <th className="py-3.5 px-4">Documento / Ref.</th>
                <th className="py-3.5 px-4 text-right">Cantidad</th>
                <th className="py-3.5 px-4 text-right">Saldo Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No hay movimientos de Kardex para los criterios de día, producto o cliente ingresados.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.productName}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">
                        Barras: {item.barcode}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.type === 'ENTRADA' && (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                          <ArrowDownLeft className="w-3.5 h-3.5" /> ENTRADA
                        </span>
                      )}
                      {item.type === 'SALIDA' && (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                          <ArrowUpRight className="w-3.5 h-3.5" /> SALIDA
                        </span>
                      )}
                      {item.type === 'AJUSTE' && (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                          AJUSTE
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {item.customerOrSupplier}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {item.reference}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums">
                      <span
                        className={
                          item.type === 'ENTRADA'
                            ? 'text-emerald-600'
                            : item.type === 'SALIDA'
                            ? 'text-rose-600'
                            : 'text-amber-600'
                        }
                      >
                        {item.type === 'ENTRADA' ? `+${item.quantity}` : `-${item.quantity}`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      {item.stockAfter} uds
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Movimiento Manual */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Registrar Entrada / Salida en Kardex
            </h3>
            <form onSubmit={handleCreateMovement} className="space-y-3.5">
              <FloatingSelect
                label="Seleccionar Producto"
                value={selectedProdId}
                onChange={(e) => setSelectedProdId(e.target.value)}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock actual: {p.stock})
                  </option>
                ))}
              </FloatingSelect>

              <div className="grid grid-cols-2 gap-3">
                <FloatingSelect
                  label="Tipo de Movimiento"
                  value={movType}
                  onChange={(e) => setMovType(e.target.value as any)}
                >
                  <option value="ENTRADA">ENTRADA (+ Stock)</option>
                  <option value="SALIDA">SALIDA (- Stock)</option>
                  <option value="AJUSTE">AJUSTE (- Stock)</option>
                </FloatingSelect>

                <FloatingInput
                  label="Cantidad"
                  type="number"
                  min="1"
                  value={movQty}
                  onChange={(e) => setMovQty(e.target.value)}
                  required
                />
              </div>

              <FloatingInput
                label="Cliente o Proveedor Asociado *"
                value={movParty}
                onChange={(e) => setMovParty(e.target.value)}
                required
              />

              <FloatingInput
                label="Referencia (Factura, Guía, Orden)"
                value={movRef}
                onChange={(e) => setMovRef(e.target.value)}
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

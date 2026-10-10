import React, { useState } from 'react';
import {
  Wallet,
  LockOpen,
  Lock,
  ArrowUpCircle,
  ArrowDownCircle,
  Tag,
  Plus,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import {
  BusinessSettings,
  CashMovement,
  CashSession,
} from '../types';
import {
  FloatingInput,
  FloatingSelect,
  FlatIcon,
} from './FloatingField';

interface CashTabProps {
  sessions: CashSession[];
  movements: CashMovement[];
  settings: BusinessSettings;
  currentUserFullName: string;
  onOpenCash: (openingBalance: number) => void;
  onCloseCash: (closingBalance: number) => void;
  onAddMovement: (type: 'INGRESO' | 'EGRESO', tag: string, description: string, amount: number) => void;
  onDeleteMovement: (id: string) => void;
}

const INCOME_TAGS = [
  'Reparación / Servicio',
  'Venta POS',
  'Adelanto Orden',
  'Ingreso Extra',
  'Otros Ingresos',
];

const EXPENSE_TAGS = [
  'Compra Repuestos',
  'Insumos Taller',
  'Servicios (Luz/Internet)',
  'Movilidad / Envíos',
  'Pago Personal',
  'Otros Egresos',
];

export const CashTab: React.FC<CashTabProps> = ({
  sessions,
  movements,
  settings,
  currentUserFullName,
  onOpenCash,
  onCloseCash,
  onAddMovement,
  onDeleteMovement,
}) => {
  const activeSession = sessions.find((s) => s.status === 'ABIERTA') || null;

  // Form states for opening cash
  const [openingInput, setOpeningInput] = useState('200');

  // Form states for new movement (Ingreso / Egreso con etiqueta)
  const [movType, setMovType] = useState<'INGRESO' | 'EGRESO'>('INGRESO');
  const [movTag, setMovTag] = useState('Reparación / Servicio');
  const [customTag, setCustomTag] = useState('');
  const [movDesc, setMovDesc] = useState('');
  const [movAmount, setMovAmount] = useState('');
  const [tagFilter, setTagFilter] = useState('ALL');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const totalIngresos = movements
    .filter((m) => m.type === 'INGRESO')
    .reduce((acc, m) => acc + m.amount, 0);

  const totalEgresos = movements
    .filter((m) => m.type === 'EGRESO')
    .reduce((acc, m) => acc + m.amount, 0);

  const netTotal = totalIngresos - totalEgresos;

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(movAmount);
    if (isNaN(amt) || amt <= 0 || !movDesc.trim()) return;

    const finalTag = customTag.trim() || movTag;
    onAddMovement(movType, finalTag, movDesc.trim(), amt);
    setMovDesc('');
    setMovAmount('');
    setCustomTag('');
  };

  const uniqueTags = Array.from(new Set(movements.map((m) => m.tag)));

  const filteredMovements = movements.filter(
    (m) => tagFilter === 'ALL' || m.tag === tagFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <FlatIcon icon={<Wallet className="w-5 h-5" />} color="emerald" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Control y Arqueo de Caja
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Apertura, cierre, registro de ingresos y egresos con etiquetas y saldo total
            </p>
          </div>
        </div>

        {/* Open / Close Cash Action */}
        <div className="flex items-center gap-3">
          {activeSession ? (
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Caja Abierta ({activeSession.openedAt})
              </span>
              <button
                onClick={() => onCloseCash(netTotal)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Lock className="w-4 h-4" />
                <span>Cerrar Caja ({settings.currencySymbol} {netTotal.toFixed(2)})</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <FloatingInput
                label={`Monto Inicial (${settings.currencySymbol})`}
                type="number"
                step="0.01"
                value={openingInput}
                onChange={(e) => setOpeningInput(e.target.value)}
                containerClassName="w-40"
              />
              <button
                onClick={() => onOpenCash(parseFloat(openingInput) || 0)}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <LockOpen className="w-4 h-4" />
                <span>Abrir Caja</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary KPI Cards: Ingresos, Egresos, Total Neto */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Ingresos</span>
            <div className="text-2xl font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
              + {settings.currencySymbol} {totalIngresos.toFixed(2)}
            </div>
          </div>
          <FlatIcon icon={<ArrowUpCircle className="w-5 h-5" />} color="emerald" />
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Egresos / Gastos</span>
            <div className="text-2xl font-mono font-bold tabular-nums text-rose-600 dark:text-rose-400 mt-0.5">
              - {settings.currencySymbol} {totalEgresos.toFixed(2)}
            </div>
          </div>
          <FlatIcon icon={<ArrowDownCircle className="w-5 h-5" />} color="rose" />
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Total Efectivo Disponible en Caja</span>
            <div className="text-2xl font-mono font-bold tabular-nums text-white mt-0.5">
              {settings.currencySymbol} {netTotal.toFixed(2)}
            </div>
          </div>
          <FlatIcon icon={<Wallet className="w-5 h-5" />} color="blue" />
        </div>
      </div>

      {/* Add Ingreso / Egreso Form with Tag */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Registrar Ingreso o Egreso con Etiqueta
          </h2>
          {!activeSession && (
            <span className="text-xs text-amber-600 font-semibold">
              Nota: La caja figura cerrada. Puede abrirla arriba o registrar movimientos directos.
            </span>
          )}
        </div>

        <form onSubmit={handleMovementSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-2">
            <FloatingSelect
              label="Tipo"
              value={movType}
              onChange={(e) => {
                const t = e.target.value as 'INGRESO' | 'EGRESO';
                setMovType(t);
                setMovTag(t === 'INGRESO' ? INCOME_TAGS[0] : EXPENSE_TAGS[0]);
              }}
            >
              <option value="INGRESO">INGRESO (+)</option>
              <option value="EGRESO">EGRESO (-)</option>
            </FloatingSelect>
          </div>

          <div className="sm:col-span-3">
            <FloatingSelect
              label="Etiqueta Predefinida"
              value={movTag}
              onChange={(e) => setMovTag(e.target.value)}
              icon={<Tag className="w-4 h-4" />}
            >
              {(movType === 'INGRESO' ? INCOME_TAGS : EXPENSE_TAGS).map((tg) => (
                <option key={tg} value={tg}>
                  {tg}
                </option>
              ))}
            </FloatingSelect>
          </div>

          <div className="sm:col-span-2">
            <FloatingInput
              label="O Etiqueta Libre"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
            />
          </div>

          <div className="sm:col-span-3">
            <FloatingInput
              label="Concepto / Descripción *"
              value={movDesc}
              onChange={(e) => setMovDesc(e.target.value)}
              required
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <FloatingInput
              label={`Monto (${settings.currencySymbol}) *`}
              type="number"
              step="0.01"
              value={movAmount}
              onChange={(e) => setMovAmount(e.target.value)}
              required
              containerClassName="flex-1"
            />
            <button
              type="submit"
              className={`h-12 px-4 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer shrink-0 ${
                movType === 'INGRESO'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>

      {/* All Movements Table + Tag Filter */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-visible">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Todos los Movimientos de Caja ({filteredMovements.length})
          </h3>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setTagFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
                tagFilter === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-blue-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Todas las etiquetas
            </button>
            {uniqueTags.map((tg) => (
              <button
                key={tg}
                onClick={() => setTagFilter(tg)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
                  tagFilter === tg
                    ? 'bg-slate-900 text-white dark:bg-blue-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tg}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 bg-slate-50/60 dark:bg-slate-800/40">
                <th className="py-3.5 px-4">Fecha y Hora</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Etiqueta</th>
                <th className="py-3.5 px-4">Descripción</th>
                <th className="py-3.5 px-4">Usuario</th>
                <th className="py-3.5 px-4 text-right">Monto</th>
                <th className="py-3.5 px-4 text-right">Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredMovements.map((mov) => {
                const isMenuOpen = openMenuId === mov.id;
                return (
                  <tr key={mov.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {mov.createdAt}
                    </td>
                    <td className="py-3.5 px-4 font-bold whitespace-nowrap">
                      <span
                        className={
                          mov.type === 'INGRESO'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }
                      >
                        {mov.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {mov.tag}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200">
                      {mov.description}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{mov.user}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                      <span
                        className={
                          mov.type === 'INGRESO'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }
                      >
                        {mov.type === 'INGRESO' ? '+' : '-'} {settings.currencySymbol}{' '}
                        {mov.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right relative">
                      <button
                        onClick={() => setOpenMenuId(isMenuOpen ? null : mov.id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 cursor-pointer"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-4 top-11 z-40 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5 text-left">
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              onDeleteMovement(mov.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Anular Movimiento</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

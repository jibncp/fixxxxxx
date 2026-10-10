import React, { useMemo, useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  TrendingUp,
  Award,
  ShoppingBag,
  Clock,
  ArrowUpRight,
  Package,
  Plus,
  QrCode,
  Printer,
  MessageCircle,
  BarChart3,
  Calendar,
  UserCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import {
  BusinessSettings,
  CashMovement,
  Product,
  Sale,
  TabId,
  WorkOrder,
} from '../types';
import { FlatIcon } from './FloatingField';

interface DashboardTabProps {
  orders: WorkOrder[];
  products: Product[];
  sales: Sale[];
  cashMovements: CashMovement[];
  settings: BusinessSettings;
  onNavigate: (tab: TabId) => void;
  onOpenTracking: (orderNum?: string) => void;
  onPrintOrder: (order: WorkOrder) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  orders,
  products,
  sales,
  cashMovements,
  settings,
  onNavigate,
  onOpenTracking,
  onPrintOrder,
}) => {
  // Completed / Active work orders calculations
  const completedOrders = orders.filter(
    (o) => o.status === 'Listo para Entrega' || o.status === 'Entregado'
  );
  const inProgressOrders = orders.filter(
    (o) => o.status === 'Pendiente' || o.status === 'En Diagnóstico' || o.status === 'En Reparación'
  );

  // Best-selling product (producto más vendido)
  const sortedBySold = [...products].sort((a, b) => b.soldCount - a.soldCount);
  const topProduct = sortedBySold[0];

  // Revenue calculations
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const totalOrdersRevenue = orders.reduce((acc, o) => acc + o.advancePayment, 0);
  const cashBalance = cashMovements.reduce(
    (acc, m) => (m.type === 'INGRESO' ? acc + m.amount : acc - m.amount),
    0
  );

  // Status breakdown
  const statusCounts = {
    Pendiente: orders.filter((o) => o.status === 'Pendiente').length,
    'En Diagnóstico': orders.filter((o) => o.status === 'En Diagnóstico').length,
    'En Reparación': orders.filter((o) => o.status === 'En Reparación').length,
    'Listo para Entrega': orders.filter((o) => o.status === 'Listo para Entrega').length,
    Entregado: orders.filter((o) => o.status === 'Entregado').length,
  };

  // State for Sales Chart Period Filter (7, 14, 30 days)
  const [salesDaysRange, setSalesDaysRange] = useState<number>(7);

  // 1. Process Daily Sales for Line Chart (recharts)
  const dailySalesData = useMemo(() => {
    // Generate dates map for the selected days range
    const result: { dateKey: string; label: string; totalSales: number; count: number }[] = [];
    const dateMap = new Map<string, { totalSales: number; count: number }>();

    // Scan sales and aggregate by YYYY-MM-DD
    sales.forEach((s) => {
      const datePart = (s.createdAt || '').slice(0, 10);
      if (!datePart) return;
      const current = dateMap.get(datePart) || { totalSales: 0, count: 0 };
      dateMap.set(datePart, {
        totalSales: current.totalSales + (s.total || 0),
        count: current.count + 1,
      });
    });

    // Also include order payments (advancePayment or completed orders revenue)
    // Build days array from today backwards
    const today = new Date();
    for (let i = salesDaysRange - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      const entry = dateMap.get(key) || { totalSales: 0, count: 0 };

      // Clean day-month format for axis (e.g. "08/10")
      const axisLabel = `${dd}/${mm}`;
      result.push({
        dateKey: key,
        label: axisLabel,
        totalSales: Math.round(entry.totalSales * 100) / 100,
        count: entry.count,
      });
    }

    return result;
  }, [sales, salesDaysRange]);

  // Total sales in selected range
  const salesInRangeTotal = useMemo(() => {
    return dailySalesData.reduce((acc, curr) => acc + curr.totalSales, 0);
  }, [dailySalesData]);

  // 2. Process Repaired Jobs by Technician for Bar Chart (recharts)
  // Repaired jobs: orders where status is "Listo para Entrega" or "Entregado"
  const technicianChartData = useMemo(() => {
    const techMap = new Map<
      string,
      {
        technician: string;
        reparados: number; // listos o entregados
        enProceso: number; // pendiente, diagnóstico, reparación
        totalIngresos: number;
      }
    >();

    orders.forEach((order) => {
      const techName = order.technician?.trim() || 'Sin Asignar';
      if (!techMap.has(techName)) {
        techMap.set(techName, {
          technician: techName,
          reparados: 0,
          enProceso: 0,
          totalIngresos: 0,
        });
      }
      const item = techMap.get(techName)!;
      const isRepaired = order.status === 'Listo para Entrega' || order.status === 'Entregado';
      if (isRepaired) {
        item.reparados += 1;
        item.totalIngresos += order.totalCost || 0;
      } else {
        item.enProceso += 1;
      }
    });

    const list = Array.from(techMap.values());
    // Sort descending by number of repaired jobs
    list.sort((a, b) => b.reparados - a.reparados);
    return list;
  }, [orders]);

  // Total repaired jobs across technicians
  const totalRepairedByTechs = useMemo(() => {
    return technicianChartData.reduce((acc, curr) => acc + curr.reparados, 0);
  }, [technicianChartData]);

  // Modern palette for technician bars
  const techBarColors = ['#2563EB', '#10B981', '#6366F1', '#F59E0B', '#EC4899', '#06B6D4'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Estadísticas y Trabajos Realizados
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Resumen operativo en tiempo real · {settings.businessName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onOpenTracking()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Seguimiento QR</span>
          </button>
          <button
            onClick={() => onNavigate('orders')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Orden</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (4 Flat Minimalist Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Trabajos Realizados */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Trabajos Realizados / Listos
            </span>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {completedOrders.length} <span className="text-sm font-normal text-slate-400">/ {orders.length}</span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {inProgressOrders.length} equipos en taller ahora
            </p>
          </div>
          <FlatIcon icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
        </div>

        {/* KPI 2: Producto Más Vendido */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Producto Más Vendido
            </span>
            <div
              className="text-base font-bold text-slate-900 dark:text-white truncate"
              title={topProduct?.name}
            >
              {topProduct ? topProduct.name : 'Sin registros'}
            </div>
            <p className="text-xs font-mono tabular-nums text-amber-600 dark:text-amber-400 font-semibold">
              {topProduct ? `${topProduct.soldCount} unidades vendidas · ${settings.currencySymbol} ${topProduct.salePrice.toFixed(2)}` : '0 uds'}
            </p>
          </div>
          <FlatIcon icon={<Award className="w-5 h-5" />} color="amber" />
        </div>

        {/* KPI 3: Ingresos Totales (POS + Órdenes) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Recaudación Ventas y Órdenes
            </span>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {settings.currencySymbol} {(totalSalesRevenue + totalOrdersRevenue).toFixed(2)}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">
              POS: {settings.currencySymbol} {totalSalesRevenue.toFixed(2)} · Órdenes: {settings.currencySymbol} {totalOrdersRevenue.toFixed(2)}
            </p>
          </div>
          <FlatIcon icon={<TrendingUp className="w-5 h-5" />} color="blue" />
        </div>

        {/* KPI 4: Saldo en Caja */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Efectivo Neto en Caja
            </span>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {settings.currencySymbol} {cashBalance.toFixed(2)}
            </div>
            <button
              onClick={() => onNavigate('cash')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Ver arqueo de caja</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <FlatIcon icon={<ShoppingBag className="w-5 h-5" />} color="indigo" />
        </div>
      </div>

      {/* Visualización Gráfica Recharts: Ventas Diarias (Líneas) y Trabajos Reparados por Técnico (Barras) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Gráfico 1: Ventas Diarias mediante Gráfico de Líneas (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Ventas Diarias (Línea de Tendencia)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Facturación diaria en punto de venta y servicios
                  </p>
                </div>
              </div>

              {/* Selector de periodo de días */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-center">
                {[
                  { label: '7 días', days: 7 },
                  { label: '14 días', days: 14 },
                  { label: '30 días', days: 30 },
                ].map((item) => (
                  <button
                    key={item.days}
                    onClick={() => setSalesDaysRange(item.days)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      salesDaysRange === item.days
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-resumen del periodo */}
            <div className="flex items-center justify-between px-1 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Total en el periodo:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 tabular-nums text-sm">
                  {settings.currencySymbol} {salesInRangeTotal.toFixed(2)}
                </span>
              </div>
              <div className="text-slate-400 text-[11px] font-mono">
                {dailySalesData.filter((d) => d.totalSales > 0).length} días con ventas registradas
              </div>
            </div>

            {/* Recharts Responsive Container: LineChart */}
            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailySalesData}
                  margin={{ top: 12, right: 16, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="salesLineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E2E8F0"
                    className="dark:stroke-slate-800"
                  />
                  <XAxis
                    dataKey="label"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${settings.currencySymbol}${val}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                            <div className="font-mono text-slate-400 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-blue-400" />
                              <span>{data.dateKey}</span>
                            </div>
                            <div className="font-bold text-sm text-blue-400 font-mono tabular-nums">
                              {settings.currencySymbol} {Number(data.totalSales).toFixed(2)}
                            </div>
                            <div className="text-[11px] text-slate-300">
                              {data.count} {data.count === 1 ? 'venta realizada' : 'ventas realizadas'}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalSales"
                    name="Ventas Totales"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#1D4ED8', stroke: '#EFF6FF', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              Tendencia actualizada en tiempo real
            </span>
            <button
              onClick={() => onNavigate('pos')}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Registrar Venta POS →
            </button>
          </div>
        </div>

        {/* Gráfico 2: Trabajos Reparados por Técnico mediante Gráfico de Barras (5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Trabajos Reparados por Técnico
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Productividad de equipos listos y entregados
                  </p>
                </div>
              </div>

              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                {totalRepairedByTechs} reparados
              </span>
            </div>

            {/* Sub-resumen de técnicos */}
            <div className="flex items-center justify-between px-1 mb-4 text-xs text-slate-500 dark:text-slate-400">
              <span>{technicianChartData.length} técnicos con actividad</span>
              <span>Órdenes finalizadas / entregadas</span>
            </div>

            {/* Recharts Responsive Container: BarChart */}
            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={technicianChartData}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#E2E8F0"
                    className="dark:stroke-slate-800"
                  />
                  <XAxis
                    type="number"
                    stroke="#94A3B8"
                    fontSize={11}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="technician"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={110}
                    tickFormatter={(name) => {
                      // Shorten long names nicely
                      const parts = name.split(' ');
                      if (parts.length > 2) return `${parts[0]} ${parts[1]}`;
                      return name;
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                            <div className="font-bold text-slate-200 flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{data.technician}</span>
                            </div>
                            <div className="font-mono text-emerald-400 font-bold text-sm">
                              {data.reparados} {data.reparados === 1 ? 'equipo reparado' : 'equipos reparados'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              En proceso actual: {data.enProceso} equipos
                            </div>
                            <div className="text-[11px] text-blue-400 font-mono">
                              Facturado: {settings.currencySymbol} {Number(data.totalIngresos).toFixed(2)}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="reparados"
                    name="Equipos Reparados"
                    radius={[0, 6, 6, 0]}
                    barSize={20}
                  >
                    {technicianChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={techBarColors[index % techBarColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Equipos en estado Listo o Entregado
            </span>
            <button
              onClick={() => onNavigate('orders')}
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Ver Órdenes →
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Section: Ranking de Productos Más Vendidos & Estado de Trabajos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Ranking Productos Más Vendidos (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Ranking de Productos y Servicios Más Vendidos
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Desempeño por rotación de inventario y servicios de taller
                </p>
              </div>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer whitespace-nowrap"
              >
                Ir a Inventario
              </button>
            </div>

            <div className="space-y-3.5">
              {sortedBySold.slice(0, 5).map((prod, idx) => {
                const maxSold = Math.max(1, sortedBySold[0]?.soldCount || 1);
                const pct = Math.round((prod.soldCount / maxSold) * 100);
                return (
                  <div key={prod.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-bold text-slate-400 w-5">
                          0{idx + 1}.
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {prod.name}
                        </span>
                        <span className="text-slate-400 hidden sm:inline">·</span>
                        <span className="text-slate-500 hidden sm:inline">{prod.category}</span>
                      </div>
                      <div className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white shrink-0 ml-2">
                        {prod.soldCount} uds · {settings.currencySymbol} {prod.salePrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          idx === 0
                            ? 'bg-amber-500'
                            : idx === 1
                            ? 'bg-blue-600'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Total de referencias activas: {products.length} ítems</span>
            <button
              onClick={() => onNavigate('pos')}
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Vender en Punto de Venta →
            </button>
          </div>
        </div>

        {/* Right: Flujo de Trabajos Realizados por Estado (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Distribución de Trabajos del Taller
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Equipos según etapa técnica actual
                </p>
              </div>
              <FlatIcon icon={<Wrench className="w-4 h-4" />} color="blue" size="sm" />
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {(
                [
                  { label: 'Pendiente de Revisión', key: 'Pendiente', color: 'text-amber-600' },
                  { label: 'En Diagnóstico Técnico', key: 'En Diagnóstico', color: 'text-blue-600' },
                  { label: 'En Reparación Activa', key: 'En Reparación', color: 'text-indigo-600' },
                  { label: 'Listo para Entrega', key: 'Listo para Entrega', color: 'text-emerald-600' },
                  { label: 'Entregado al Cliente', key: 'Entregado', color: 'text-slate-600 dark:text-slate-400' },
                ] as const
              ).map((row) => (
                <div key={row.key} className="py-3 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{row.label}</span>
                  <span className={`font-mono tabular-nums font-bold text-sm ${row.color}`}>
                    {statusCounts[row.key]} equipos
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
            <div className="text-xs">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Efectividad de Entrega
              </div>
              <div className="text-slate-500">
                {orders.length > 0
                  ? `${Math.round((completedOrders.length / orders.length) * 100)}% de órdenes finalizadas con éxito`
                  : 'Sin órdenes registradas'}
              </div>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer whitespace-nowrap"
            >
              Ver Historial
            </button>
          </div>
        </div>
      </div>

      {/* Latest Work Orders Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Últimos Trabajos y Órdenes de Servicio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Acceso rápido a impresión térmica/A4, seguimiento QR y aviso por WhatsApp
            </p>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Ver todas ({orders.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-800/40">
                <th className="py-3 px-4">Orden</th>
                <th className="py-3 px-4">Cliente / Celular</th>
                <th className="py-3 px-4">Equipo y Modelo</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Total / Saldo</th>
                <th className="py-3 px-4 text-right">Acciones Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {orders.slice(0, 5).map((order) => {
                const pending = Math.max(0, order.totalCost - order.advancePayment);
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {order.customerName}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">
                        {settings.phonePrefix} {order.phone}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {order.device} · {order.brandModel}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {order.problem}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {settings.currencySymbol} {order.totalCost.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Resta: {settings.currencySymbol} {pending.toFixed(2)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onPrintOrder(order)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                          title="Imprimir / Reimprimir Orden"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenTracking(order.orderNumber)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                          title="Ver Seguimiento QR"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <a
                          href={`https://wa.me/${settings.phonePrefix.replace('+', '')}${order.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(
                            `Hola ${order.customerName}, le escribimos de ${settings.businessName}. Su orden ${order.orderNumber} (${order.brandModel}) se encuentra en estado: *${order.status}*. Saldo pendiente: ${settings.currencySymbol} ${pending.toFixed(2)}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800"
                          title="Enviar WhatsApp al cliente"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
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

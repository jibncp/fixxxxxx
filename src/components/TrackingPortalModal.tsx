import React, { useState } from 'react';
import {
  Search,
  Smartphone,
  CheckCircle2,
  Clock,
  Wrench,
  PackageCheck,
  AlertCircle,
  MessageCircle,
  X,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { BusinessSettings, WorkOrder } from '../types';
import { FloatingInput } from './FloatingField';
import { QRCodeSVG } from './BarcodeQR';

interface TrackingPortalModalProps {
  isOpen: boolean;
  initialQuery?: string;
  orders: WorkOrder[];
  settings: BusinessSettings;
  onClose: () => void;
}

export const TrackingPortalModal: React.FC<TrackingPortalModalProps> = ({
  isOpen,
  initialQuery = '',
  orders,
  settings,
  onClose,
}) => {
  const [query, setQuery] = useState(initialQuery);

  if (!isOpen) return null;

  const cleanQuery = query.trim().toLowerCase();
  const matchedOrder = cleanQuery
    ? orders.find(
        (o) =>
          o.orderNumber.toLowerCase() === cleanQuery ||
          o.orderNumber.toLowerCase().includes(cleanQuery) ||
          o.phone.replace(/\s+/g, '').includes(cleanQuery)
      )
    : orders[0];

  const steps = [
    { key: 'Pendiente', label: 'Recepcionado', icon: Clock },
    { key: 'En Diagnóstico', label: 'En Diagnóstico', icon: Search },
    { key: 'En Reparación', label: 'En Reparación', icon: Wrench },
    { key: 'Listo para Entrega', label: 'Listo para Entrega', icon: PackageCheck },
    { key: 'Entregado', label: 'Entregado', icon: CheckCircle2 },
  ];

  const currentStepIndex = matchedOrder
    ? steps.findIndex((s) => s.key === matchedOrder.status)
    : -1;

  const getTrackingUrl = (orderNum: string) => {
    const base = (settings.customTrackingDomain || window.location.origin).replace(/\/$/, '');
    return `${base}/?track=${encodeURIComponent(orderNum)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Portal de Seguimiento en Vivo · {settings.businessName}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Dominio activo: {settings.customTrackingDomain || window.location.host}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search Input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <FloatingInput
              label="Buscar por N° de Orden (ej. OT-1001) o Celular del Cliente"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
              containerClassName="flex-1"
            />
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {orders.slice(0, 3).map((o) => (
                <button
                  key={o.id}
                  onClick={() => setQuery(o.orderNumber)}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold border transition-colors cursor-pointer shrink-0 ${
                    matchedOrder?.id === o.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {o.orderNumber}
                </button>
              ))}
            </div>
          </div>

          {matchedOrder ? (
            <div className="space-y-5">
              {/* Order Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <span>ORDEN {matchedOrder.orderNumber}</span>
                    <span>·</span>
                    <span>{matchedOrder.createdAt}</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {matchedOrder.device} — {matchedOrder.brandModel}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Cliente: <span className="font-semibold">{matchedOrder.customerName}</span> · Técnico asignado:{' '}
                    <span className="font-semibold">{matchedOrder.technician}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <QRCodeSVG value={getTrackingUrl(matchedOrder.orderNumber)} size={68} />
                </div>
              </div>

              {/* Stepper Progress */}
              <div className="py-2">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                  Progreso de la Orden de Servicio
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    return (
                      <div
                        key={step.key}
                        className={`flex flex-col items-center text-center p-2.5 rounded-xl border transition-all ${
                          isCurrent
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                            : isCompleted
                            ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                            : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                            isCurrent
                              ? 'bg-blue-600 text-white'
                              : isCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-semibold leading-tight">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Diagnosis & Financial Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Diagnóstico y Reporte Técnico
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">Falla:</strong> {matchedOrder.problem}
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">Diagnóstico:</strong>{' '}
                    {matchedOrder.diagnosis || 'En revisión por laboratorio técnico.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between font-mono text-xs">
                  <div className="font-sans font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    Resumen Económico
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Presupuesto Total:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {settings.currencySymbol} {matchedOrder.totalCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Adelanto Abonado:</span>
                      <span>
                        - {settings.currencySymbol} {matchedOrder.advancePayment.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-800">
                      <span>Saldo al Retirar:</span>
                      <span>
                        {settings.currencySymbol}{' '}
                        {Math.max(0, matchedOrder.totalCost - matchedOrder.advancePayment).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Contact */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Garantía oficial de servicio · {settings.businessName}</span>
                </div>
                <a
                  href={`https://wa.me/${settings.phonePrefix.replace('+', '')}${settings.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(
                    `Hola ${settings.businessName}, consulto por mi orden ${matchedOrder.orderNumber} (${matchedOrder.device}).`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Consultar por WhatsApp</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No se encontró ninguna orden con ese código o celular
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Verifique el código impreso debajo del QR en su comprobante de recepción.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  Printer,
  X,
  Check,
  FileText,
  Receipt,
  QrCode,
  Zap,
} from 'lucide-react';
import {
  BusinessSettings,
  PrintFormat,
  Product,
  Sale,
  WorkOrder,
} from '../types';
import { BarcodeSVG, QRCodeSVG } from './BarcodeQR';

export type PrintJob =
  | { type: 'order'; data: WorkOrder; format: PrintFormat }
  | { type: 'sale'; data: Sale; format: PrintFormat }
  | { type: 'barcode'; data: Product; copies?: number };

interface PrintModalProps {
  job: PrintJob | null;
  settings: BusinessSettings;
  onClose: () => void;
  onFormatChange?: (format: PrintFormat) => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  job,
  settings,
  onClose,
  onFormatChange,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<PrintFormat>('80mm');
  const [copies, setCopies] = useState<number>(4);
  const [printedFeedback, setPrintedFeedback] = useState(false);

  useEffect(() => {
    if (!job) return;
    if (job.type === 'order' || job.type === 'sale') {
      setSelectedFormat(job.format || settings.defaultPrintFormat || '80mm');
    }
    if (job.type === 'barcode') {
      setCopies(job.copies || 4);
    }

    // If directPrint is enabled in settings, trigger print automatically after a short render delay
    if (settings.directPrint) {
      const timer = setTimeout(() => {
        handlePrintNow();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [job]);

  if (!job) return null;

  const handleFormatSwitch = (fmt: PrintFormat) => {
    setSelectedFormat(fmt);
    if (onFormatChange) onFormatChange(fmt);
  };

  const handlePrintNow = () => {
    setPrintedFeedback(true);
    setTimeout(() => setPrintedFeedback(false), 2000);
    window.print();
  };

  const getTrackingUrl = (orderNumber: string) => {
    const base = (settings.customTrackingDomain || window.location.origin).replace(/\/$/, '');
    return `${base}/?track=${encodeURIComponent(orderNumber)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Top Modal Controls (Hidden when printing) */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {job.type === 'order' && `Impresión de Orden ${job.data.orderNumber}`}
                {job.type === 'sale' && `Impresión de Boleta POS ${job.data.saleNumber}`}
                {job.type === 'barcode' && `Etiquetas de Código de Barras (${job.data.sku})`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {settings.directPrint
                  ? 'Envío directo habilitado · Impresión térmica / A4'
                  : 'Seleccione el formato de papel antes de imprimir'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(job.type === 'order' || job.type === 'sale') && (
              <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl">
                {(['58mm', '80mm', 'a4'] as PrintFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => handleFormatSwitch(fmt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-colors cursor-pointer whitespace-nowrap ${
                      selectedFormat === fmt
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            )}

            {job.type === 'barcode' && (
              <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Copias:</span>
                {[1, 2, 4, 8, 12].map((num) => (
                  <button
                    key={num}
                    onClick={() => setCopies(num)}
                    className={`px-2 py-1 rounded-md text-xs font-mono font-semibold cursor-pointer ${
                      copies === num
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-300/50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handlePrintNow}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              {printedFeedback ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Enviado</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Ahora</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
              title="Cerrar vista previa"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Canvas Area */}
        <div className="p-6 bg-slate-100 dark:bg-slate-950/80 max-h-[75vh] overflow-y-auto flex justify-center print:p-0 print:bg-white print:max-h-none">
          {/* ORDER PRINT VIEW */}
          {job.type === 'order' && (
            <div
              className={`bg-white text-slate-900 shadow-md print:shadow-none border border-slate-200 print:border-none transition-all ${
                selectedFormat === '58mm'
                  ? 'w-[240px] p-3 text-[11px]'
                  : selectedFormat === '80mm'
                  ? 'w-[320px] p-4 text-xs'
                  : 'w-full max-w-[680px] p-8 text-sm'
              }`}
            >
              {/* Header */}
              <div
                className={`flex ${
                  selectedFormat === 'a4'
                    ? 'flex-row items-start justify-between border-b-2 border-slate-900 pb-4'
                    : 'flex-col items-center text-center border-b border-dashed border-slate-400 pb-3'
                }`}
              >
                <div className={selectedFormat === 'a4' ? 'flex items-center gap-4' : 'flex flex-col items-center'}>
                  {settings.showLogoOnReceipt && (
                    <img
                      src={settings.logoUrl || '/icon.svg'}
                      alt={settings.businessName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-contain mb-1.5"
                    />
                  )}
                  <div>
                    <h2 className="font-bold text-base uppercase tracking-tight text-slate-900">
                      {settings.businessName}
                    </h2>
                    <p className="text-[11px] text-slate-600">{settings.address}</p>
                    <p className="text-[11px] text-slate-600 font-mono">
                      RUC/NIT: {settings.ruc} · Tel: {settings.phonePrefix} {settings.phone}
                    </p>
                  </div>
                </div>

                <div className={selectedFormat === 'a4' ? 'text-right' : 'mt-2 text-center'}>
                  <div className="font-bold uppercase tracking-wider text-xs text-slate-700">
                    {settings.orderHeaderTitle || 'ORDEN DE TRABAJO'}
                  </div>
                  <div className="font-mono font-bold text-base text-slate-900">
                    {job.data.orderNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{job.data.createdAt}</div>
                </div>
              </div>

              {/* Customer & Device Data */}
              <div
                className={`my-3 ${
                  selectedFormat === 'a4'
                    ? 'grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200'
                    : 'space-y-1.5 border-b border-dashed border-slate-400 pb-3'
                }`}
              >
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Cliente</div>
                  <div className="font-semibold text-slate-900">{job.data.customerName}</div>
                  <div className="font-mono text-[11px] text-slate-700">
                    Celular: {settings.phonePrefix} {job.data.phone}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Equipo Recepcionado</div>
                  <div className="font-semibold text-slate-900">
                    {job.data.device} — {job.data.brandModel}
                  </div>
                  <div className="text-[11px] text-slate-700">
                    Estado actual: <span className="font-bold">{job.data.status}</span>
                  </div>
                </div>
              </div>

              {/* Problem & Diagnosis */}
              <div className="space-y-2.5 my-3 border-b border-dashed border-slate-400 pb-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">
                    Problema Reportado
                  </div>
                  <p className="text-slate-800 whitespace-pre-wrap">{job.data.problem}</p>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">
                    Diagnóstico Técnico
                  </div>
                  <p className="text-slate-800 whitespace-pre-wrap">
                    {job.data.diagnosis || 'En evaluación técnica'}
                  </p>
                </div>
              </div>

              {/* Totals */}
              <div className="my-3 space-y-1 font-mono">
                <div className="flex justify-between text-slate-700">
                  <span>COSTO TOTAL:</span>
                  <span className="font-bold">
                    {settings.currencySymbol} {job.data.totalCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>ADELANTO DE PAGO:</span>
                  <span>
                    - {settings.currencySymbol} {job.data.advancePayment.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-300">
                  <span>SALDO PENDIENTE:</span>
                  <span>
                    {settings.currencySymbol}{' '}
                    {Math.max(0, job.data.totalCost - job.data.advancePayment).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* QR Tracking Section */}
              {settings.showQrOnReceipt && (
                <div className="mt-4 pt-3 border-t border-dashed border-slate-400 flex flex-col items-center text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Seguimiento en Línea por QR
                  </div>
                  <QRCodeSVG
                    value={getTrackingUrl(job.data.orderNumber)}
                    size={selectedFormat === '58mm' ? 92 : 112}
                  />
                  <div className="mt-1.5 font-mono text-[10px] text-slate-600 break-all">
                    {getTrackingUrl(job.data.orderNumber)}
                  </div>
                </div>
              )}

              {/* Signatures on A4 */}
              {selectedFormat === 'a4' && (
                <div className="grid grid-cols-2 gap-12 mt-10 pt-8">
                  <div className="border-t border-slate-400 text-center pt-1.5 text-xs text-slate-600">
                    Firma del Cliente ({job.data.customerName})
                  </div>
                  <div className="border-t border-slate-400 text-center pt-1.5 text-xs text-slate-600">
                    Firma Taller ({job.data.technician})
                  </div>
                </div>
              )}

              {/* Footer Terms */}
              <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[10px] text-slate-500 leading-relaxed">
                {settings.orderTermsText}
              </div>
            </div>
          )}

          {/* POS SALE RECEIPT PRINT VIEW */}
          {job.type === 'sale' && (
            <div
              className={`bg-white text-slate-900 shadow-md print:shadow-none border border-slate-200 print:border-none transition-all ${
                selectedFormat === '58mm'
                  ? 'w-[240px] p-3 text-[11px]'
                  : selectedFormat === '80mm'
                  ? 'w-[320px] p-4 text-xs'
                  : 'w-full max-w-[680px] p-8 text-sm'
              }`}
            >
              <div
                className={`flex ${
                  selectedFormat === 'a4'
                    ? 'flex-row items-start justify-between border-b-2 border-slate-900 pb-4'
                    : 'flex-col items-center text-center border-b border-dashed border-slate-400 pb-3'
                }`}
              >
                <div className={selectedFormat === 'a4' ? 'flex items-center gap-4' : 'flex flex-col items-center'}>
                  {settings.showLogoOnReceipt && (
                    <img
                      src={settings.logoUrl || '/icon.svg'}
                      alt={settings.businessName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-contain mb-1.5"
                    />
                  )}
                  <div>
                    <h2 className="font-bold text-base uppercase tracking-tight text-slate-900">
                      {settings.businessName}
                    </h2>
                    <p className="text-[11px] text-slate-600">{settings.address}</p>
                    <p className="text-[11px] text-slate-600 font-mono">
                      RUC/NIT: {settings.ruc} · Tel: {settings.phonePrefix} {settings.phone}
                    </p>
                  </div>
                </div>

                <div className={selectedFormat === 'a4' ? 'text-right' : 'mt-2 text-center'}>
                  <div className="font-bold uppercase tracking-wider text-xs text-slate-700">
                    {settings.receiptHeaderTitle || 'BOLETA DE VENTA'}
                  </div>
                  <div className="font-mono font-bold text-base text-slate-900">
                    {job.data.saleNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{job.data.createdAt}</div>
                </div>
              </div>

              <div className="my-2.5 pb-2 border-b border-dashed border-slate-400 text-[11px]">
                <div>
                  <span className="font-semibold">Cliente:</span> {job.data.customerName || 'Cliente General'}
                </div>
                {job.data.phone && (
                  <div className="font-mono">
                    <span className="font-sans font-semibold">Celular:</span> {settings.phonePrefix} {job.data.phone}
                  </div>
                )}
                <div>
                  <span className="font-semibold">Pago:</span> {job.data.paymentMethod} ·{' '}
                  <span className="font-semibold">Cajero:</span> {job.data.cashier}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full my-2 text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-[10px] uppercase text-slate-500">
                    <th className="py-1">Cant.</th>
                    <th className="py-1">Descripción</th>
                    <th className="py-1 text-right">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {job.data.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 pr-1 align-top">{item.quantity}x</td>
                      <td className="py-1.5 font-sans text-slate-800">
                        <div>{item.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          P.U: {settings.currencySymbol} {item.unitPrice.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-1.5 text-right font-semibold align-top">
                        {settings.currencySymbol} {item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-3 pt-2 border-t-2 border-slate-900 flex justify-between items-center font-mono text-sm font-bold">
                <span>TOTAL A PAGAR:</span>
                <span>
                  {settings.currencySymbol} {job.data.total.toFixed(2)}
                </span>
              </div>

              {settings.showQrOnReceipt && (
                <div className="mt-4 pt-3 border-t border-dashed border-slate-400 flex flex-col items-center text-center">
                  <QRCodeSVG
                    value={`${settings.businessName}|${job.data.saleNumber}|${job.data.total.toFixed(2)}`}
                    size={selectedFormat === '58mm' ? 84 : 100}
                  />
                </div>
              )}

              <div className="mt-3 pt-2 border-t border-slate-200 text-center text-[10px] text-slate-500">
                {settings.receiptFooterText}
              </div>
            </div>
          )}

          {/* BARCODE LABELS PRINT VIEW */}
          {job.type === 'barcode' && (
            <div className="bg-white p-6 rounded-xl shadow-md print:shadow-none w-full max-w-2xl">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: copies }).map((_, idx) => (
                  <div
                    key={idx}
                    className="border border-dashed border-slate-300 rounded-lg p-3 flex flex-col items-center text-center bg-white"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate max-w-full">
                      {settings.businessName}
                    </div>
                    <div className="text-xs font-semibold text-slate-900 truncate max-w-full my-0.5">
                      {job.data.name}
                    </div>
                    <BarcodeSVG value={job.data.barcode} height={40} width={150} />
                    <div className="mt-1 font-mono text-xs font-bold text-slate-900">
                      {settings.currencySymbol} {job.data.salePrice.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

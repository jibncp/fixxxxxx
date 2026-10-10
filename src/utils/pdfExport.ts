import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BusinessSettings, Sale, WorkOrder } from '../types';

export interface MonthlyReportParams {
  type: 'sales' | 'orders' | 'both';
  monthStr: string; // "YYYY-MM", e.g. "2026-10"
  sales: Sale[];
  orders: WorkOrder[];
  settings: BusinessSettings;
}

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Setiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function getMonthLabel(monthStr: string): string {
  if (!monthStr || !monthStr.includes('-')) return monthStr;
  const [year, month] = monthStr.split('-');
  const mIndex = parseInt(month, 10) - 1;
  const name = MONTH_NAMES[mIndex] || month;
  return `${name} ${year}`;
}

export function exportMonthlyReportToPdf({
  type,
  monthStr,
  sales,
  orders,
  settings,
}: MonthlyReportParams) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const monthLabel = getMonthLabel(monthStr);

  // Filter items for the specific month (or all if empty)
  const monthSales = monthStr
    ? sales.filter((s) => s.createdAt?.startsWith(monthStr))
    : sales;

  const monthOrders = monthStr
    ? orders.filter((o) => o.createdAt?.startsWith(monthStr))
    : orders;

  const totalSalesAmount = monthSales.reduce((acc, s) => acc + (s.total || 0), 0);
  const totalOrdersAmount = monthOrders.reduce((acc, o) => acc + (o.totalCost || 0), 0);
  const totalAdvancesAmount = monthOrders.reduce((acc, o) => acc + (o.advancePayment || 0), 0);
  const completedOrdersCount = monthOrders.filter(
    (o) => o.status === 'Listo para Entrega' || o.status === 'Entregado'
  ).length;

  const primaryColor: [number, number, number] = [37, 99, 235]; // Tailwind blue-600
  const darkTextColor: [number, number, number] = [15, 23, 42]; // Slate-900
  const mutedTextColor: [number, number, number] = [100, 116, 139]; // Slate-500
  const currency = settings.currencySymbol || 'S/';

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 26, 'F');

  // Business Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(settings.businessName.toUpperCase(), 14, 12);

  // Document Title
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const titleText =
    type === 'sales'
      ? `REPORTE MENSUAL DE VENTAS - ${monthLabel.toUpperCase()}`
      : type === 'orders'
      ? `REPORTE MENSUAL DE ÓRDENES DE SERVICIO - ${monthLabel.toUpperCase()}`
      : `REPORTE INTEGRAL (VENTAS Y ÓRDENES) - ${monthLabel.toUpperCase()}`;
  doc.text(titleText, 14, 19);

  // Right Header Meta (RUC / Date)
  doc.setFontSize(9);
  doc.text(`RUC/NIT: ${settings.ruc || '20608945123'}`, 196, 11, { align: 'right' });
  doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 196, 17, { align: 'right' });

  // Subheader / Contact Info
  let currentY = 32;
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedTextColor);
  doc.text(`Dirección: ${settings.address}`, 14, currentY);
  doc.text(`Tel: ${settings.phonePrefix} ${settings.phone} | Email: ${settings.email}`, 14, currentY + 4.5);
  currentY += 10;

  // Monthly KPI Summary Cards
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, currentY, 182, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...darkTextColor);

  if (type === 'sales') {
    doc.text('RESUMEN DE VENTAS:', 18, currentY + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Transacciones: ${monthSales.length} comprobantes`, 18, currentY + 14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129); // emerald-600
    doc.text(
      `Facturación Total: ${currency} ${totalSalesAmount.toFixed(2)}`,
      120,
      currentY + 14
    );
  } else if (type === 'orders') {
    doc.text('RESUMEN DE ÓRDENES DE TRABAJO:', 18, currentY + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Total Órdenes: ${monthOrders.length} | Reparados/Listos: ${completedOrdersCount}`,
      18,
      currentY + 14
    );
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(
      `Presupuesto Total: ${currency} ${totalOrdersAmount.toFixed(2)} | Cobrado: ${currency} ${totalAdvancesAmount.toFixed(2)}`,
      100,
      currentY + 14
    );
  } else {
    doc.text(`RESUMEN GENERAL DEL MES (${monthLabel}):`, 18, currentY + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Ventas POS: ${monthSales.length} (${currency} ${totalSalesAmount.toFixed(2)})`,
      18,
      currentY + 14
    );
    doc.text(
      `Órdenes: ${monthOrders.length} (${currency} ${totalOrdersAmount.toFixed(2)})`,
      115,
      currentY + 14
    );
  }

  currentY += 26;

  // TABLE 1: Órdenes de Trabajo (if type === 'orders' || type === 'both')
  if (type === 'orders' || type === 'both') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...darkTextColor);
    doc.text(`Órdenes de Trabajo Técnicas (${monthOrders.length})`, 14, currentY);
    currentY += 4;

    const orderRows = monthOrders.map((o) => {
      const balance = Math.max(0, o.totalCost - o.advancePayment);
      return [
        o.orderNumber,
        o.createdAt?.slice(0, 10) || '',
        o.customerName,
        `${settings.phonePrefix} ${o.phone}`,
        `${o.device} ${o.brandModel}`,
        o.technician || 'Taller',
        o.status,
        `${currency} ${o.totalCost.toFixed(2)}`,
        `${currency} ${balance.toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          'N° Orden',
          'Fecha',
          'Cliente',
          'Celular',
          'Equipo / Modelo',
          'Técnico',
          'Estado',
          'Total',
          'Saldo',
        ],
      ],
      body: orderRows,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'left',
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: [51, 65, 85],
        overflow: 'linebreak',
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left', cellWidth: 16 },
        1: { cellWidth: 17 },
        2: { cellWidth: 26 },
        3: { cellWidth: 20 },
        4: { cellWidth: 32 },
        5: { cellWidth: 22 },
        6: { fontStyle: 'bold', cellWidth: 22 },
        7: { halign: 'right', fontStyle: 'bold', cellWidth: 14 },
        8: { halign: 'right', cellWidth: 13 },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        // Page footer numbering
        const pageCount = (doc.internal as any).getNumberOfPages();
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Página ${data.pageNumber} de ${pageCount} | ${settings.businessName} - Reporte Generado`,
          14,
          290
        );
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || currentY + 30;
    currentY = finalY + 10;
  }

  // TABLE 2: Ventas POS (if type === 'sales' || type === 'both')
  if (type === 'sales' || type === 'both') {
    // If we're rendering both and space is tight, add page
    if (type === 'both' && currentY > 210) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...darkTextColor);
    doc.text(`Historial de Ventas POS (${monthSales.length})`, 14, currentY);
    currentY += 4;

    const saleRows = monthSales.map((s) => {
      const itemsDesc = s.items
        ? s.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')
        : 'Venta general';
      return [
        s.saleNumber,
        s.createdAt?.slice(0, 10) || '',
        s.customerName || 'Cliente General',
        s.phone ? `${settings.phonePrefix} ${s.phone}` : '-',
        itemsDesc,
        s.paymentMethod || 'Efectivo',
        s.cashier || 'Cajero',
        `${currency} ${s.total.toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          'N° Boleta',
          'Fecha',
          'Cliente',
          'Celular',
          'Productos / Servicios',
          'Método Pago',
          'Cajero',
          'Total Cobrado',
        ],
      ],
      body: saleRows,
      theme: 'striped',
      headStyles: {
        fillColor: [16, 185, 129], // emerald-500
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'left',
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: [51, 65, 85],
        overflow: 'linebreak',
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left', cellWidth: 18 },
        1: { cellWidth: 17 },
        2: { cellWidth: 28 },
        3: { cellWidth: 20 },
        4: { cellWidth: 46 },
        5: { cellWidth: 22 },
        6: { cellWidth: 17 },
        7: { halign: 'right', fontStyle: 'bold', cellWidth: 14 },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        const pageCount = (doc.internal as any).getNumberOfPages();
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Página ${data.pageNumber} de ${pageCount} | ${settings.businessName} - Reporte Generado`,
          14,
          290
        );
      },
    });
  }

  // File naming
  const safeBusiness = settings.businessName.replace(/[^a-zA-Z0-9]/g, '_');
  const safeMonth = monthStr || 'Historico_Completo';
  const fileName = `${safeBusiness}_Reporte_${type.toUpperCase()}_${safeMonth}.pdf`;

  // Download directly
  doc.save(fileName);
}

import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Printer,
  MoreVertical,
  Edit3,
  Trash2,
  Barcode,
  RefreshCw,
  X,
  ArrowUpCircle,
  AlertTriangle,
} from 'lucide-react';
import { BusinessSettings, Product } from '../types';
import {
  FloatingInput,
  FloatingSelect,
  FlatIcon,
} from './FloatingField';
import { BarcodeSVG } from './BarcodeQR';

interface InventoryTabProps {
  products: Product[];
  settings: BusinessSettings;
  onSaveProduct: (product: Product, isNew: boolean, stockDelta?: number) => void;
  onDeleteProduct: (id: string) => void;
  onPrintBarcode: (product: Product, copies?: number) => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  products,
  settings,
  onSaveProduct,
  onDeleteProduct,
  onPrintBarcode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Modal Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState<'Repuesto' | 'Accesorio' | 'Servicio' | 'Herramienta'>('Repuesto');
  const [costPrice, setCostPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('3');

  const generateRandomBarcode = () => {
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    setBarcode(String(randomDigits));
  };

  const openNewProductModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`TF-${100 + products.length + 1}`);
    setBarcode(`775010${1000 + products.length + 1}`);
    setCategory('Repuesto');
    setCostPrice('');
    setSalePrice('');
    setStock('10');
    setMinStock('3');
    setIsModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSku(prod.sku);
    setBarcode(prod.barcode);
    setCategory(prod.category);
    setCostPrice(String(prod.costPrice));
    setSalePrice(String(prod.salePrice));
    setStock(String(prod.stock));
    setMinStock(String(prod.minStock));
    setOpenMenuId(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent, shouldPrintBarcodeAfter: boolean) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStockNum = parseInt(stock, 10) || 0;
    const oldStockNum = editingProduct ? editingProduct.stock : 0;
    const stockDelta = newStockNum - oldStockNum;

    const prodObj: Product = {
      id: editingProduct ? editingProduct.id : `prd-${Date.now()}`,
      name: name.trim(),
      sku: sku.trim() || `TF-${Date.now().toString().slice(-4)}`,
      barcode: barcode.trim() || `775${Date.now().toString().slice(-7)}`,
      category,
      costPrice: parseFloat(costPrice) || 0,
      salePrice: parseFloat(salePrice) || 0,
      stock: newStockNum,
      minStock: parseInt(minStock, 10) || 1,
      soldCount: editingProduct ? editingProduct.soldCount : 0,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    onSaveProduct(prodObj, !editingProduct, stockDelta);
    setIsModalOpen(false);

    if (shouldPrintBarcodeAfter) {
      onPrintBarcode(prodObj, 4);
    }
  };

  const handleQuickRestock = (prod: Product, addQty: number) => {
    const updated: Product = {
      ...prod,
      stock: prod.stock + addQty,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    onSaveProduct(updated, false, addQty);
    setOpenMenuId(null);
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <FlatIcon icon={<Package className="w-5 h-5" />} color="indigo" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Inventario y Códigos de Barra
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Gestión de repuestos, accesorios, generación e impresión de etiquetas de barras
            </p>
          </div>
        </div>

        <button
          onClick={openNewProductModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Producto</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-7">
          <FloatingInput
            label="Buscar producto por nombre, código de barras o SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="md:col-span-5 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['ALL', 'Repuesto', 'Accesorio', 'Servicio', 'Herramienta'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white dark:bg-indigo-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              {cat === 'ALL' ? `Todos (${products.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-800/40">
                <th className="py-3.5 px-4">SKU / Categoría</th>
                <th className="py-3.5 px-4">Producto / Servicio</th>
                <th className="py-3.5 px-4">Código de Barras</th>
                <th className="py-3.5 px-4 text-right">Costo / Venta</th>
                <th className="py-3.5 px-4 text-right">Stock / Vendidos</th>
                <th className="py-3.5 px-4 text-right">Imprimir / Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {filteredProducts.map((prod) => {
                const isLowStock = prod.stock <= prod.minStock && prod.category !== 'Servicio';
                const isMenuOpen = openMenuId === prod.id;

                return (
                  <tr
                    key={prod.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                      <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {prod.sku}
                      </div>
                      <div className="text-[11px] text-slate-500">{prod.category}</div>
                    </td>

                    <td className="py-3.5 px-4 align-middle">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {prod.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Actualizado: {prod.updatedAt}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-middle">
                      <BarcodeSVG value={prod.barcode} height={28} width={125} />
                    </td>

                    <td className="py-3.5 px-4 align-middle text-right font-mono tabular-nums whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">
                        Venta: {settings.currencySymbol} {prod.salePrice.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Costo: {settings.currencySymbol} {prod.costPrice.toFixed(2)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-middle text-right font-mono tabular-nums whitespace-nowrap">
                      <div
                        className={`font-bold inline-flex items-center gap-1 ${
                          isLowStock
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isLowStock && <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{prod.stock} uds</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Vendidos: {prod.soldCount}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap relative">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onPrintBarcode(prod, 4)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Imprimir Etiquetas de Código de Barras"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">Imprimir Barras</span>
                        </button>

                        <button
                          onClick={() => openEditProductModal(prod)}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Editar Producto"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Floating Window Trigger */}
                        <button
                          onClick={() => setOpenMenuId(isMenuOpen ? null : prod.id)}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Más opciones"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {isMenuOpen && (
                        <div className="absolute right-4 top-14 z-40 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-2 text-left space-y-1">
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Opciones de Producto
                          </div>

                          <button
                            onClick={() => openEditProductModal(prod)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4 text-indigo-600" />
                            <span>Editar Datos y Precios</span>
                          </button>

                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              onPrintBarcode(prod, 8);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <Barcode className="w-4 h-4 text-blue-600" />
                            <span>Imprimir 8 Etiquetas</span>
                          </button>

                          <div className="px-2.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Ingreso Rápido de Stock (Kardex):
                          </div>
                          <div className="grid grid-cols-3 gap-1 px-2 py-1">
                            {[1, 5, 10].map((qty) => (
                              <button
                                key={qty}
                                onClick={() => handleQuickRestock(prod, qty)}
                                className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white font-mono text-xs font-bold text-center cursor-pointer"
                              >
                                +{qty}
                              </button>
                            ))}
                          </div>

                          <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                onDeleteProduct(prod.id);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Eliminar del Inventario</span>
                            </button>
                          </div>
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

      {/* Modal Agregar / Editar Producto con Generador de Código de Barras */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <FlatIcon icon={<Package className="w-5 h-5" />} color="indigo" size="sm" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingProduct ? 'Editar Producto' : 'Nuevo Producto en Inventario'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Generación automática de código de barras e integración con Kardex
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => handleSave(e, false)} className="p-6 space-y-4">
              <FloatingInput
                label="Nombre del Producto o Servicio *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FloatingInput
                  label="Código SKU Interno"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
                <FloatingSelect
                  label="Categoría"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <option value="Repuesto">Repuesto</option>
                  <option value="Accesorio">Accesorio</option>
                  <option value="Servicio">Servicio Técnico</option>
                  <option value="Herramienta">Herramienta / Insumo</option>
                </FloatingSelect>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-8">
                  <FloatingInput
                    label="Código de Barras (EAN / Code128)"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    icon={<Barcode className="w-4 h-4" />}
                  />
                </div>
                <div className="sm:col-span-4">
                  <button
                    type="button"
                    onClick={generateRandomBarcode}
                    className="w-full h-12 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-indigo-100 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Generar Código</span>
                  </button>
                </div>
              </div>

              {/* Live SVG Barcode Preview */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-semibold">Vista Previa de Etiqueta</div>
                  <div className="text-[11px] text-slate-400">Listo para impresora térmica o A4</div>
                </div>
                <BarcodeSVG value={barcode || '7750000000'} height={36} width={160} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <FloatingInput
                  label={`Costo (${settings.currencySymbol})`}
                  type="number"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                />
                <FloatingInput
                  label={`Precio Venta (${settings.currencySymbol})`}
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                />
                <FloatingInput
                  label="Stock Actual"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
                <FloatingInput
                  label="Stock Mínimo"
                  type="number"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Guardar Producto
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSave(e, true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Guardar e Imprimir Barras</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

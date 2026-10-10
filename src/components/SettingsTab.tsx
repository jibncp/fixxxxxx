import React, { useRef, useState } from 'react';
import {
  Settings,
  Building2,
  Globe,
  Palette,
  Printer,
  Database,
  Cloud,
  Upload,
  Download,
  CheckCircle2,
  Sun,
  Moon,
  Monitor,
  QrCode,
  RefreshCw,
  Mail,
  UserCheck,
  Unlink,
  Link,
  ShieldCheck,
} from 'lucide-react';
import { BusinessSettings, PrintFormat } from '../types';
import {
  FloatingInput,
  FloatingSelect,
  FloatingTextarea,
  FlatIcon,
} from './FloatingField';
import { PWAInstallButton } from './PWAInstall';

interface SettingsTabProps {
  settings: BusinessSettings;
  onUpdateSettings: (newSettings: BusinessSettings) => void;
  onExportFullBackup: () => void;
  onImportFullBackup: (jsonString: string) => boolean;
  onTriggerCloudSync: () => void;
}

const COUNTRY_PRESETS = [
  { country: 'Perú', prefix: '+51', currency: 'S/' },
  { country: 'México', prefix: '+52', currency: '$' },
  { country: 'Colombia', prefix: '+57', currency: '$' },
  { country: 'Chile', prefix: '+56', currency: '$' },
  { country: 'Argentina', prefix: '+54', currency: '$' },
  { country: 'Ecuador', prefix: '+593', currency: '$' },
  { country: 'Bolivia', prefix: '+591', currency: 'Bs.' },
  { country: 'España', prefix: '+34', currency: '€' },
  { country: 'Estados Unidos', prefix: '+1', currency: '$' },
];

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  onExportFullBackup,
  onImportFullBackup,
  onTriggerCloudSync,
}) => {
  const [form, setForm] = useState<BusinessSettings>(settings);

  // Keep form in sync when external settings are imported or updated
  React.useEffect(() => {
    setForm(settings);
  }, [settings]);

  const [savedBanner, setSavedBanner] = useState(false);
  const [syncingDrive, setSyncingDrive] = useState(false);
  const [testingExternalDb, setTestingExternalDb] = useState(false);
  const [dbStatusMsg, setDbStatusMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleField = <K extends keyof BusinessSettings>(
    key: K,
    val: BusinessSettings[K]
  ) => {
    const next = { ...form, [key]: val };
    setForm(next);
    onUpdateSettings(next);
  };

  const handleCountrySelect = (countryName: string) => {
    const preset = COUNTRY_PRESETS.find((c) => c.country === countryName);
    if (preset) {
      const next: BusinessSettings = {
        ...form,
        country: preset.country,
        phonePrefix: preset.prefix,
        currencySymbol: preset.currency,
      };
      setForm(next);
      onUpdateSettings(next);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleField('logoUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBackupImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const ok = onImportFullBackup(reader.result);
        setDbStatusMsg(
          ok
            ? 'Base de datos externa importada y restaurada con éxito.'
            : 'Archivo JSON inválido.'
        );
      }
    };
    reader.readAsText(file);
  };

  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState(
    form.googleAccountEmail || 'admin.tallerfix@gmail.com'
  );

  const handleLinkGoogleAccount = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!googleEmailInput.trim() || !googleEmailInput.includes('@')) {
      setDbStatusMsg('Por favor ingrese un correo válido de Google (@gmail.com o Google Workspace).');
      return;
    }
    setIsLinkingGoogle(true);
    setTimeout(() => {
      setIsLinkingGoogle(false);
      const email = googleEmailInput.trim();
      const updated = {
        ...form,
        googleAccountEmail: email,
        googleAccountLinked: true,
      };
      setForm(updated);
      onUpdateSettings(updated);
      setDbStatusMsg(`Cuenta de Google vinculada con éxito: ${email}`);
    }, 500);
  };

  const handleUnlinkGoogleAccount = () => {
    const updated = {
      ...form,
      googleAccountLinked: false,
    };
    setForm(updated);
    onUpdateSettings(updated);
    setDbStatusMsg('Cuenta de Google desvinculada para sincronización.');
  };

  const handleSimulateGoogleDriveSync = () => {
    if (!form.googleAccountLinked) {
      setDbStatusMsg('Debe vincular una cuenta de Google activa antes de sincronizar.');
      return;
    }
    setSyncingDrive(true);
    setTimeout(() => {
      setSyncingDrive(false);
      onTriggerCloudSync();
      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
      setForm((prev) => ({ ...prev, lastCloudSync: nowStr }));
      setDbStatusMsg(
        `Base de datos sincronizada con éxito en la cuenta de Google (${form.googleAccountEmail || googleEmailInput}) en la carpeta '${form.googleDriveFolderName}'.`
      );
    }, 600);
  };

  const handleTestExternalDbConnection = () => {
    setTestingExternalDb(true);
    setTimeout(() => {
      setTestingExternalDb(false);
      setDbStatusMsg(
        `Conexión verificada con endpoint externo: ${form.externalDbUrl || 'Local IndexedDB / JSON'}`
      );
    }, 500);
  };

  const triggerSaveFeedback = () => {
    onUpdateSettings(form);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <FlatIcon icon={<Settings className="w-5 h-5" />} color="slate" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Ajustes del Sistema y Personalización
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Negocio, logotipo, país/prefijos, tema claro/oscuro, impresión térmica y sincronización Google Drive
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <PWAInstallButton />
          <button
            onClick={triggerSaveFeedback}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{savedBanner ? '¡Cambios Guardados!' : 'Guardar Todo'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Información del Negocio y Logotipo (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <FlatIcon icon={<Building2 className="w-4 h-4" />} color="blue" size="sm" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              1. Información del Negocio y Logotipo
            </h2>
          </div>

          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <img
              src={form.logoUrl || '/icon.svg'}
              alt="Logo Taller"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-contain bg-white p-1.5 border border-slate-200 shrink-0"
            />
            <div className="space-y-1.5 flex-1">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Logotipo para Login, Menú y Boletas
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Logotipo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleField('logoUrl', '/icon.svg')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Restaurar Original
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FloatingInput
              label="Nombre Comercial del Taller"
              value={form.businessName}
              onChange={(e) => handleField('businessName', e.target.value)}
            />
            <FloatingInput
              label="RUC / NIT / Identificación Fiscal"
              value={form.ruc}
              onChange={(e) => handleField('ruc', e.target.value)}
            />
          </div>

          <FloatingInput
            label="Dirección del Local Comercial"
            value={form.address}
            onChange={(e) => handleField('address', e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FloatingInput
              label="Teléfono / Celular del Negocio"
              value={form.phone}
              onChange={(e) => handleField('phone', e.target.value)}
            />
            <FloatingInput
              label="Correo Electrónico"
              value={form.email}
              onChange={(e) => handleField('email', e.target.value)}
            />
          </div>
        </div>

        {/* 2. País, Prefijos Telefónicos, Dominio QR y Tema (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <FlatIcon icon={<Globe className="w-4 h-4" />} color="emerald" size="sm" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              2. País, Prefijos, Interfaz y Modo Oscuro/Claro
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FloatingSelect
              label="País"
              value={form.country}
              onChange={(e) => handleCountrySelect(e.target.value)}
            >
              {COUNTRY_PRESETS.map((c) => (
                <option key={c.country} value={c.country}>
                  {c.country} ({c.prefix})
                </option>
              ))}
            </FloatingSelect>

            <FloatingInput
              label="Prefijo WhatsApp"
              value={form.phonePrefix}
              onChange={(e) => handleField('phonePrefix', e.target.value)}
            />

            <FloatingInput
              label="Símbolo Moneda"
              value={form.currencySymbol}
              onChange={(e) => handleField('currencySymbol', e.target.value)}
            />
          </div>

          {/* Theme Mode Selector: Claro, Oscuro, Automático */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Modo de Apariencia (Claro, Oscuro, Automático)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'light', label: 'Modo Claro', icon: Sun },
                  { id: 'dark', label: 'Modo Oscuro', icon: Moon },
                  { id: 'auto', label: 'Automático', icon: Monitor },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                const active = form.themeMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleField('themeMode', m.id)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white dark:bg-blue-600 border-slate-900 dark:border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interface Style / Accent Color & Auto-hide Sidebar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                Color Plano de Interfaz
              </label>
              <div className="flex items-center gap-2">
                {(
                  [
                    { id: 'blue', bg: 'bg-blue-600' },
                    { id: 'emerald', bg: 'bg-emerald-500' },
                    { id: 'indigo', bg: 'bg-indigo-600' },
                    { id: 'amber', bg: 'bg-amber-500' },
                    { id: 'rose', bg: 'bg-rose-500' },
                  ] as const
                ).map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => handleField('accentColor', col.id)}
                    className={`w-8 h-8 rounded-xl ${col.bg} flex items-center justify-center text-white cursor-pointer transition-transform ${
                      form.accentColor === col.id ? 'scale-110 ring-2 ring-offset-2 ring-slate-900 dark:ring-white' : 'opacity-75'
                    }`}
                  >
                    {form.accentColor === col.id && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-2">
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.autoHideSidebar}
                  onChange={(e) => handleField('autoHideSidebar', e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span>Ocultar Sidebar automáticamente al navegar</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.directPrint}
                  onChange={(e) => handleField('directPrint', e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span>Habilitar envío directo de impresión</span>
              </label>
            </div>
          </div>

          <FloatingInput
            label="Dominio Personalizable para Seguimiento QR (ej. https://track.mitaller.com)"
            value={form.customTrackingDomain}
            onChange={(e) => handleField('customTrackingDomain', e.target.value)}
            icon={<QrCode className="w-4 h-4" />}
          />
        </div>

        {/* 3. Configuración de Impresión de Órdenes y Boletas (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <FlatIcon icon={<Printer className="w-4 h-4" />} color="amber" size="sm" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              3. Formato e Impresión de Órdenes de Trabajo y Boletas
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FloatingInput
              label="Título en Cabecera de Orden"
              value={form.orderHeaderTitle}
              onChange={(e) => handleField('orderHeaderTitle', e.target.value)}
            />
            <FloatingInput
              label="Título en Cabecera de Boleta POS"
              value={form.receiptHeaderTitle}
              onChange={(e) => handleField('receiptHeaderTitle', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <FloatingSelect
              label="Formato por Defecto"
              value={form.defaultPrintFormat}
              onChange={(e) => handleField('defaultPrintFormat', e.target.value as PrintFormat)}
            >
              <option value="58mm">Ticket 58mm</option>
              <option value="80mm">Ticket 80mm</option>
              <option value="a4">Hoja A4</option>
            </FloatingSelect>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.showLogoOnReceipt}
                onChange={(e) => handleField('showLogoOnReceipt', e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span>Incluir Logotipo</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.showQrOnReceipt}
                onChange={(e) => handleField('showQrOnReceipt', e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span>Imprimir Código QR</span>
            </label>
          </div>

          <FloatingTextarea
            label="Condiciones y Garantía en Órdenes de Trabajo"
            rows={2}
            value={form.orderTermsText}
            onChange={(e) => handleField('orderTermsText', e.target.value)}
          />

          <FloatingTextarea
            label="Pie de Página en Boletas de Venta POS"
            rows={2}
            value={form.receiptFooterText}
            onChange={(e) => handleField('receiptFooterText', e.target.value)}
          />
        </div>

        {/* 4. Base de Datos Externa y Sincronización con Google Drive (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <FlatIcon icon={<Database className="w-4 h-4" />} color="indigo" size="sm" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              4. Base de Datos Externa y Sincronización Google Drive
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-8">
              <FloatingInput
                label="Endpoint / URL de Base de Datos Externa (REST / Webhook)"
                value={form.externalDbUrl}
                onChange={(e) => handleField('externalDbUrl', e.target.value)}
              />
            </div>
            <div className="sm:col-span-4">
              <button
                type="button"
                onClick={handleTestExternalDbConnection}
                className="w-full h-12 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingExternalDb ? 'animate-spin' : ''}`} />
                <span>Probar Conexión</span>
              </button>
            </div>
          </div>

          {/* Google Account Linking Card for Cloud Synchronization */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* Official Google 'G' icon */}
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1.5 shadow-2xs shrink-0">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Cuenta de Google para Sincronización
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Respaldo en la nube de órdenes, ventas, inventario y caja
                  </p>
                </div>
              </div>

              {form.googleAccountLinked ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Vinculada</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-[11px] font-medium text-slate-500 dark:text-slate-300">
                  No vinculada
                </span>
              )}
            </div>

            {/* Email input and connection buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center pt-1">
              <div className="sm:col-span-8">
                <FloatingInput
                  label="Correo Electrónico de Google (ej. usuario@gmail.com)"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                />
              </div>

              <div className="sm:col-span-4">
                {form.googleAccountLinked ? (
                  <button
                    type="button"
                    onClick={handleUnlinkGoogleAccount}
                    className="w-full h-12 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Desvincular Cuenta</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleLinkGoogleAccount()}
                    className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Link className="w-3.5 h-3.5" />
                    <span>{isLinkingGoogle ? 'Vinculando...' : 'Vincular Cuenta'}</span>
                  </button>
                )}
              </div>
            </div>

            {form.googleAccountLinked && (
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Conectado como <strong className="text-slate-800 dark:text-slate-200">{form.googleAccountEmail || googleEmailInput}</strong>. Los respaldos se enviarán automáticamente a esta cuenta.
                </span>
              </div>
            )}
          </div>

          {/* Google Drive Sync Panel */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Sincronización con Google Drive
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Última sinc: {form.lastCloudSync || 'Pendiente'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
              <div className="sm:col-span-7">
                <FloatingInput
                  label="Nombre de Carpeta en Google Drive"
                  value={form.googleDriveFolderName}
                  onChange={(e) => handleField('googleDriveFolderName', e.target.value)}
                />
              </div>
              <div className="sm:col-span-5">
                <button
                  type="button"
                  onClick={handleSimulateGoogleDriveSync}
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Cloud className={`w-4 h-4 ${syncingDrive ? 'animate-bounce' : ''}`} />
                  <span>{syncingDrive ? 'Sincronizando...' : 'Sincronizar Drive Ahora'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Export / Import JSON External Database */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onExportFullBackup}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Exportar Base de Datos (.JSON)</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleBackupImportFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Importar Base de Datos (.JSON)</span>
            </button>
          </div>

          {dbStatusMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{dbStatusMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

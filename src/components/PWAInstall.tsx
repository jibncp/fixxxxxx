import React, { useEffect, useState } from 'react';
import { Download, Smartphone, CheckCircle2, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return compact ? null : (
      <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="w-4 h-4" />
        <span>App Android Instalada</span>
      </div>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
          compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs'
        }`}
        title="Instalar Taller Fix en Android / Dispositivo"
      >
        <Smartphone className="w-4 h-4 shrink-0" />
        <span>{compact ? 'Instalar App' : 'Instalar en Android'}</span>
      </button>

      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Instalar Taller Fix (Android / PWA)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Aplicación Web Progresiva con soporte Offline
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {isIOS ? (
                <>
                  <p>Para instalar <strong>Taller Fix</strong> en tu iPhone o iPad:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl">
                    <li>Toca el botón <strong>Compartir</strong> en la barra de Safari.</li>
                    <li>Desliza hacia abajo y selecciona <strong>Agregar a pantalla de inicio</strong>.</li>
                    <li>Confirma tocando <strong>Agregar</strong>.</li>
                  </ol>
                </>
              ) : (
                <>
                  <p>Para instalar <strong>Taller Fix</strong> directamente como App nativa en tu celular Android o PC:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl">
                    <li>Abre el menú del navegador Chrome (los 3 puntos arriba a la derecha).</li>
                    <li>Selecciona <strong>Instalar aplicación</strong> o <strong>Agregar a la pantalla principal</strong>.</li>
                    <li>El ícono de <strong>Taller Fix</strong> aparecerá en tu cajón de aplicaciones Android con pantalla completa.</li>
                  </ol>
                </>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

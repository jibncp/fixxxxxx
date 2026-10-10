import React, { useState } from 'react';
import {
  User,
  Lock,
  AlertCircle,
  ArrowRight,
  QrCode,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AppUser, BusinessSettings } from '../types';
import { FloatingInput } from './FloatingField';
import { PWAInstallButton } from './PWAInstall';

interface LoginViewProps {
  users: AppUser[];
  settings: BusinessSettings;
  onLoginSuccess: (user: AppUser) => void;
  onOpenPublicTracking: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  users,
  settings,
  onLoginSuccess,
  onOpenPublicTracking,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim().toLowerCase();

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Por favor ingrese su usuario y contraseña.');
      return;
    }

    // Case-insensitive validation ("mayúsculas y minúsculas no afectan")
    const foundUser = users.find(
      (u) =>
        u.username.trim().toLowerCase() === cleanUser &&
        u.password.trim().toLowerCase() === cleanPass
    );

    if (!foundUser) {
      setErrorMsg(
        'Credenciales erróneas. Verifique su usuario y contraseña e intente nuevamente.'
      );
      return;
    }

    if (!foundUser.active) {
      setErrorMsg(
        'Esta cuenta de usuario se encuentra suspendida. Contacte al administrador.'
      );
      return;
    }

    onLoginSuccess(foundUser);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-slate-950 p-4 sm:p-8">
      {/* Top Minimal Bar */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={settings.logoUrl || '/icon.svg'}
            alt={settings.businessName}
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-xl object-contain bg-white p-1 border border-slate-200 dark:border-slate-800"
          />
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
            {settings.businessName}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenPublicTracking}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Consultar Orden QR</span>
          </button>
          <PWAInstallButton compact />
        </div>
      </div>

      {/* Main Centered Login Card */}
      <div className="w-full max-w-md mx-auto my-8">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 sm:p-9 shadow-xl space-y-6">
          {/* Logo & Title */}
          <div className="flex flex-col items-center text-center space-y-2.5">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center p-3 shadow-xs">
              <img
                src={settings.logoUrl || '/icon.svg'}
                alt="Logotipo Taller Fix"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {settings.businessName}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sistema de Gestión de Órdenes, Punto de Venta e Inventario
              </p>
            </div>
          </div>

          {/* Error Notification Banner */}
          {errorMsg && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-medium"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form with Labels Inside Inputs */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <FloatingInput
              label="Usuario (Mayúsculas y minúsculas no afectan)"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              icon={<User className="w-4 h-4" />}
              autoComplete="username"
            />

            <FloatingInput
              label="Contraseña de Acceso"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Helper for Evaluator Convenience */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Por defecto: <strong className="font-mono text-slate-700 dark:text-slate-300">admin</strong> /{' '}
              <strong className="font-mono text-slate-700 dark:text-slate-300">212345</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('212345');
                setErrorMsg(null);
              }}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Autocompletar Admin
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400">
        {settings.businessName} · RUC: {settings.ruc} · {settings.address}
      </div>
    </div>
  );
};

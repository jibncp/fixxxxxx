import React, { useState } from 'react';
import {
  Users,
  Plus,
  ShieldCheck,
  KeyRound,
  UserCheck,
  Edit3,
  Trash2,
  MoreVertical,
  Check,
  X,
} from 'lucide-react';
import { AppUser, TabId } from '../types';
import {
  FloatingInput,
  FloatingSelect,
  FlatIcon,
} from './FloatingField';

interface UsersTabProps {
  users: AppUser[];
  currentUser: AppUser;
  onSaveUser: (user: AppUser, isNew: boolean) => void;
  onDeleteUser: (id: string) => void;
}

const ALL_TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard / Estadísticas' },
  { id: 'orders', label: 'Órdenes de Trabajo' },
  { id: 'pos', label: 'Punto de Venta (POS)' },
  { id: 'inventory', label: 'Inventario y Códigos de Barra' },
  { id: 'kardex', label: 'Kardex de Productos' },
  { id: 'history', label: 'Historial de Órdenes y Ventas' },
  { id: 'cash', label: 'Caja y Movimientos' },
  { id: 'users', label: 'Gestión de Usuarios' },
  { id: 'settings', label: 'Ajustes del Sistema' },
];

export const UsersTab: React.FC<UsersTabProps> = ({
  users,
  currentUser,
  onSaveUser,
  onDeleteUser,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'Administrador' | 'Técnico' | 'Cajero'>('Técnico');
  const [permissions, setPermissions] = useState<TabId[]>([
    'dashboard',
    'orders',
    'inventory',
  ]);
  const [active, setActive] = useState(true);

  const openNewUserModal = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setFullName('');
    setRole('Técnico');
    setPermissions(['dashboard', 'orders', 'inventory', 'history']);
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditUserModal = (u: AppUser) => {
    setEditingUser(u);
    setUsername(u.username);
    setPassword(u.password);
    setFullName(u.fullName);
    setRole(u.role);
    setPermissions(u.permissions);
    setActive(u.active);
    setOpenMenuId(null);
    setIsModalOpen(true);
  };

  const togglePermission = (tabId: TabId) => {
    setPermissions((prev) =>
      prev.includes(tabId) ? prev.filter((p) => p !== tabId) : [...prev, tabId]
    );
  };

  const applyRolePreset = (newRole: 'Administrador' | 'Técnico' | 'Cajero') => {
    setRole(newRole);
    if (newRole === 'Administrador') {
      setPermissions(ALL_TABS.map((t) => t.id));
    } else if (newRole === 'Técnico') {
      setPermissions(['dashboard', 'orders', 'inventory', 'kardex', 'history']);
    } else {
      setPermissions(['dashboard', 'orders', 'pos', 'history', 'cash']);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !fullName.trim()) return;

    const finalPermissions: TabId[] =
      permissions.length > 0 ? permissions : ['dashboard'];

    const userObj: AppUser = {
      id: editingUser ? editingUser.id : `usr-${Date.now()}`,
      username: username.trim().toLowerCase(),
      password: password.trim(),
      fullName: fullName.trim(),
      role,
      permissions: finalPermissions,
      active,
      createdAt: editingUser
        ? editingUser.createdAt
        : new Date().toISOString().slice(0, 10),
    };

    onSaveUser(userObj, !editingUser);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <FlatIcon icon={<Users className="w-5 h-5" />} color="cyan" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Usuarios, Contraseñas y Permisos
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Afecta directamente al inicio de sesión (Login insensible a mayúsculas/minúsculas)
            </p>
          </div>
        </div>

        <button
          onClick={openNewUserModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Nuevo Usuario</span>
        </button>
      </div>

      {/* Default Credential Callout Info */}
      <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300">
            <strong>Credencial principal configurada:</strong> Usuario{' '}
            <code className="font-mono font-bold text-slate-900 dark:text-white">admin</code> (o{' '}
            <code className="font-mono">ADMIN</code>) · Contraseña{' '}
            <code className="font-mono font-bold text-slate-900 dark:text-white">212345</code>. Los permisos asignados restringen las pestañas visibles al iniciar sesión.
          </span>
        </div>
        <span className="font-mono text-slate-500">
          Sesión actual: {currentUser.fullName}
        </span>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 bg-slate-50/60 dark:bg-slate-800/40">
                <th className="py-3.5 px-4">Usuario (Login)</th>
                <th className="py-3.5 px-4">Nombre Completo / Rol</th>
                <th className="py-3.5 px-4">Contraseña</th>
                <th className="py-3.5 px-4">Módulos / Permisos Habilitados</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map((u) => {
                const isMenuOpen = openMenuId === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {u.username}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {u.fullName}
                      </div>
                      <div className="text-[11px] text-slate-500">{u.role}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {u.password}
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="text-slate-600 dark:text-slate-300">
                        {u.permissions
                          .map((p) => ALL_TABS.find((t) => t.id === p)?.label.split(' ')[0])
                          .join(' · ')}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {u.permissions.length} de {ALL_TABS.length} módulos autorizados
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      <span className={u.active ? 'text-emerald-600' : 'text-rose-600'}>
                        {u.active ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap relative">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditUserModal(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 text-[11px] font-semibold cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Permisos</span>
                        </button>

                        <button
                          onClick={() => setOpenMenuId(isMenuOpen ? null : u.id)}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 cursor-pointer"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {isMenuOpen && (
                        <div className="absolute right-4 top-12 z-40 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-2 text-left space-y-1">
                          <button
                            onClick={() => openEditUserModal(u)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <KeyRound className="w-4 h-4 text-blue-600" />
                            <span>Cambiar Contraseña</span>
                          </button>
                          {u.username !== 'admin' && (
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                onDeleteUser(u.id);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Eliminar Usuario</span>
                            </button>
                          )}
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

      {/* Modal Crear / Editar Usuario y Permisos */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <FlatIcon icon={<UserCheck className="w-5 h-5" />} color="cyan" size="sm" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingUser ? `Editar Usuario: ${editingUser.username}` : 'Crear Nuevo Usuario'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Defina credenciales y marque los módulos permitidos
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

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <FloatingInput
                label="Nombre Completo del Colaborador *"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FloatingInput
                  label="Usuario de Acceso (Sin distinción Mayús/Minús) *"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <FloatingInput
                  label="Contraseña *"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FloatingSelect
                  label="Rol en el Taller"
                  value={role}
                  onChange={(e) => applyRolePreset(e.target.value as any)}
                >
                  <option value="Administrador">Administrador Total</option>
                  <option value="Técnico">Técnico Especialista</option>
                  <option value="Cajero">Cajero / Recepción POS</option>
                </FloatingSelect>

                <FloatingSelect
                  label="Estado de Cuenta"
                  value={active ? 'true' : 'false'}
                  onChange={(e) => setActive(e.target.value === 'true')}
                >
                  <option value="true">Activo (Puede iniciar sesión)</option>
                  <option value="false">Suspendido (Acceso bloqueado)</option>
                </FloatingSelect>
              </div>

              {/* Granular Permissions Checkboxes */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Permisos de Pestañas (Afecta directamente al menú tras Login):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  {ALL_TABS.map((tab) => {
                    const checked = permissions.includes(tab.id);
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => togglePermission(tab.id)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          checked
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span className="truncate">{tab.label}</span>
                        {checked && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Guardar Usuario y Permisos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Lock,
  CheckCircle2,
  XCircle,
  Edit2,
  Shield,
  Key,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../domain/types';
import { ROLE_PERMISSIONS } from '../../domain/constants';

export const UsersView: React.FC = () => {
  const { users, currentUser, switchUser, saveUser, hasPermission } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'cajero',
    status: 'active',
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      id: 'usr-' + Date.now(),
      name: '',
      email: '',
      role: 'cajero',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const role = (formData.role as UserRole) || 'cajero';
    const userToSave: User = {
      id: editingUser ? editingUser.id : formData.id || 'usr-' + Date.now(),
      name: formData.name!,
      username: editingUser ? editingUser.username : (formData.name?.toLowerCase().replace(/\s+/g, '') || 'usuario'),
      email: formData.email!,
      role,
      active: formData.status !== 'inactive',
      permissions: ROLE_PERMISSIONS[role],
      status: formData.status || 'active',
      avatar: formData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString(),
    };

    saveUser(userToSave);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Usuarios, Roles & Matriz de Permisos (RBAC)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Seguridad granular multiusuario para administradores, cajeros, bodegueros y contadores
          </p>
        </div>

        {hasPermission('users', 'create') && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20"
          >
            <UserPlus className="h-4 w-4" />
            <span>Crear Usuario</span>
          </button>
        )}
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {users.map(u => {
          const isCurrent = currentUser.id === u.id;

          return (
            <div
              key={u.id}
              className={`rounded-3xl border p-5 transition-all ${
                isCurrent
                  ? 'border-indigo-500 bg-indigo-50/40 dark:border-indigo-500/80 dark:bg-indigo-950/20 shadow-md'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="h-12 w-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{u.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                    <span className="mt-1 inline-block rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-black uppercase text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {u.role}
                    </span>
                  </div>
                </div>

                {isCurrent ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ACTIVO
                  </span>
                ) : (
                  <button
                    onClick={() => switchUser(u.id)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    Usar
                  </button>
                )}
              </div>

              {/* Permissions list summary */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Módulos Habilitados:
                </p>
                <div className="flex flex-wrap gap-1">
                  {u.permissions.map((p, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {p.module}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Matrix Reference */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Matriz de Privilegios por Perfil de Usuario
        </h3>
        <p className="text-xs text-slate-500">
          SuperAdmin tiene acceso total a todos los módulos y exportación de bases de datos. Los cajeros solo tienen acceso al POS y arqueo de su turno.
        </p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
              <tr>
                <th className="px-4 py-2">Rol / Perfil</th>
                <th className="px-4 py-2 text-center">POS Facturación</th>
                <th className="px-4 py-2 text-center">Inventarios & Stock</th>
                <th className="px-4 py-2 text-center">Compras & Costos</th>
                <th className="px-4 py-2 text-center">Créditos</th>
                <th className="px-4 py-2 text-center">Caja Chica</th>
                <th className="px-4 py-2 text-center">Reportes</th>
                <th className="px-4 py-2 text-center">Config & SQL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2.5 font-bold text-indigo-600">SuperAdmin</td>
                <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">✓ Total</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200">Admin</td>
                <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="px-4 py-2.5 text-center text-slate-400">Lectura</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200">Cajero</td>
                <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="px-4 py-2.5 text-center text-slate-400">Lectura</td>
                <td className="px-4 py-2.5 text-center text-rose-500">✕ Bloqueado</td>
                <td className="px-4 py-2.5 text-center text-slate-400">Lectura</td>
                <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">✓ Turno</td>
                <td className="px-4 py-2.5 text-center text-rose-500">✕ Bloqueado</td>
                <td className="px-4 py-2.5 text-center text-rose-500">✕ Bloqueado</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200">Bodeguero</td>
                <td className="px-4 py-2.5 text-center text-rose-500">✕ Bloqueado</td>
                <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">✓ Entrada</td>
                <td className="px-4 py-2.5 text-center text-rose-500">✕ Bloqueado</td>
                <td className="px-4 py-2.5 text-center text-rose-500">✕ Bloqueado</td>
                <td className="px-4 py-2.5 text-center text-slate-400">Lectura</td>
                <td className="px-4 py-2.5 text-center text-rose-500">✕ Bloqueado</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Registrar Nuevo Operador del Sistema
            </h3>

            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Correo Electrónico / Login *</label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Rol & Perfil de Seguridad</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                >
                  <option value="superadmin">SuperAdmin (Acceso total)</option>
                  <option value="admin">Administrador General</option>
                  <option value="cajero">Cajero de Punto de Venta</option>
                  <option value="bodeguero">Bodeguero / Almacenero</option>
                  <option value="contador">Contador / Auditor</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

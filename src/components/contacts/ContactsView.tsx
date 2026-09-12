import React, { useState } from 'react';
import {
  Users2,
  Building,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer, Supplier } from '../../domain/types';

export const ContactsView: React.FC = () => {
  const { customers, suppliers, saveCustomer, saveSupplier, businessConfig, hasPermission } = useApp();

  const [activeTab, setActiveTab] = useState<'clientes' | 'proveedores'>('clientes');
  const [search, setSearch] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // Forms
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({
    name: '',
    identification: '',
    email: '',
    phone: '',
    address: '',
    allowCredit: false,
    creditLimit: 1000,
    creditDays: 30,
    currentCredit: 0,
  });

  const [supplierForm, setSupplierForm] = useState<Partial<Supplier>>({
    name: '',
    identification: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
  });

  const filteredCustomers = customers.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.identification.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  const filteredSuppliers = suppliers.filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.identification.toLowerCase().includes(search.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.identification) return;

    saveCustomer({
      id: customerForm.id || 'cust-' + Date.now(),
      name: customerForm.name!,
      identification: customerForm.identification!,
      email: customerForm.email,
      phone: customerForm.phone,
      address: customerForm.address,
      allowCredit: Boolean(customerForm.allowCredit),
      creditLimit: Number(customerForm.creditLimit) || 0,
      creditDays: Number(customerForm.creditDays) || 30,
      currentCredit: Number(customerForm.currentCredit) || 0,
      createdAt: customerForm.createdAt || new Date().toISOString(),
    });

    setIsCustomerModalOpen(false);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name || !supplierForm.identification) return;

    saveSupplier({
      id: supplierForm.id || 'supp-' + Date.now(),
      name: supplierForm.name!,
      identification: supplierForm.identification!,
      contactPerson: supplierForm.contactPerson,
      email: supplierForm.email,
      phone: supplierForm.phone,
      address: supplierForm.address,
      createdAt: supplierForm.createdAt || new Date().toISOString(),
    });

    setIsSupplierModalOpen(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Directorio de Clientes y Proveedores
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Límites de crédito, números RUC / cédula, teléfonos y direcciones comerciales
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'clientes' ? (
            <button
              onClick={() => {
                setCustomerForm({
                  name: '',
                  identification: '',
                  email: '',
                  phone: '',
                  address: '',
                  allowCredit: false,
                  creditLimit: 5000,
                  creditDays: 30,
                  currentCredit: 0,
                });
                setIsCustomerModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Cliente</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSupplierForm({
                  name: '',
                  identification: '',
                  contactPerson: '',
                  email: '',
                  phone: '',
                  address: '',
                });
                setIsSupplierModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Proveedor</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setActiveTab('clientes')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'clientes'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Users2 className="h-4 w-4" />
            <span>Clientes ({customers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('proveedores')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'proveedores'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Building className="h-4 w-4" />
            <span>Proveedores ({suppliers.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Buscar en ${activeTab}...`}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Customers Tab View */}
      {activeTab === 'clientes' ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] uppercase font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Nombre / Razón Social</th>
                  <th className="px-4 py-3">RUC / Cédula</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Crédito Habilitado</th>
                  <th className="px-4 py-3 text-right">Límite Crédito</th>
                  <th className="px-4 py-3 text-right">Saldo Actual Deuda</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomers.map(cust => (
                  <tr
                    key={cust.id}
                    className="hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{cust.name}</div>
                      <div className="text-[10px] text-slate-400">{cust.address || 'Sin dirección registrada'}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {cust.identification}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      <div>{cust.phone || '—'}</div>
                      <div className="text-[10px] text-slate-400">{cust.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          cust.allowCredit
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}
                      >
                        {cust.allowCredit ? `Sí (${cust.creditDays} días)` : 'Solo Contado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {cust.allowCredit ? `${businessConfig.currencySymbol} ${cust.creditLimit.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {cust.currentCredit > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400">
                          {businessConfig.currencySymbol} {cust.currentCredit.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-emerald-600">Al día (0.00)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setCustomerForm(cust);
                          setIsCustomerModalOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Suppliers Table */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] uppercase font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Proveedor / Empresa</th>
                  <th className="px-4 py-3">RUC Fiscal</th>
                  <th className="px-4 py-3">Persona de Contacto</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Correo Electrónico</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSuppliers.map(supp => (
                  <tr
                    key={supp.id}
                    className="hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                      <div>{supp.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{supp.address}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {supp.identification}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{supp.contactPerson || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{supp.phone || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{supp.email || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSupplierForm(supp);
                          setIsSupplierModalOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {customerForm.id ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
            </h3>

            <form onSubmit={handleSaveCustomer} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nombre Completo / Empresa *</label>
                <input
                  type="text"
                  required
                  value={customerForm.name || ''}
                  onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Cédula / RUC *</label>
                  <input
                    type="text"
                    required
                    value={customerForm.identification || ''}
                    onChange={e => setCustomerForm({ ...customerForm, identification: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Teléfono</label>
                  <input
                    type="text"
                    value={customerForm.phone || ''}
                    onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Dirección</label>
                <input
                  type="text"
                  value={customerForm.address || ''}
                  onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              {/* Credit Settings */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(customerForm.allowCredit)}
                    onChange={e => setCustomerForm({ ...customerForm, allowCredit: e.target.checked })}
                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Habilitar línea de crédito para este cliente</span>
                </label>

                {customerForm.allowCredit && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] text-slate-500">Límite de Crédito (C$):</label>
                      <input
                        type="number"
                        step="100"
                        value={customerForm.creditLimit || ''}
                        onChange={e => setCustomerForm({ ...customerForm, creditLimit: Number(e.target.value) })}
                        className="mt-0.5 w-full rounded-xl border border-slate-200 bg-white p-1.5 font-mono text-xs dark:bg-slate-800 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500">Días de Crédito:</label>
                      <input
                        type="number"
                        value={customerForm.creditDays || 30}
                        onChange={e => setCustomerForm({ ...customerForm, creditDays: Number(e.target.value) })}
                        className="mt-0.5 w-full rounded-xl border border-slate-200 bg-white p-1.5 font-mono text-xs dark:bg-slate-800 dark:border-slate-700"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {supplierForm.id ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
            </h3>

            <form onSubmit={handleSaveSupplier} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Razón Social / Proveedor *</label>
                <input
                  type="text"
                  required
                  value={supplierForm.name || ''}
                  onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">RUC Fiscal *</label>
                  <input
                    type="text"
                    required
                    value={supplierForm.identification || ''}
                    onChange={e => setSupplierForm({ ...supplierForm, identification: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Contacto</label>
                  <input
                    type="text"
                    value={supplierForm.contactPerson || ''}
                    onChange={e => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Teléfono</label>
                  <input
                    type="text"
                    value={supplierForm.phone || ''}
                    onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Correo Electrónico</label>
                  <input
                    type="email"
                    value={supplierForm.email || ''}
                    onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Dirección</label>
                <input
                  type="text"
                  value={supplierForm.address || ''}
                  onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

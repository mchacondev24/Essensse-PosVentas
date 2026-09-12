import React, { useState } from 'react';
import { Shield, FileText, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { DEVELOPER_INFO } from '../../domain/constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LicenseModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all dark:bg-slate-900 dark:border dark:border-slate-800">
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Términos y Condiciones de Uso del Software</h3>
              <p className="text-xs text-slate-400">Essensse PosVentas</p>
            </div>
          </div>
          {accepted && (
            <button
              onClick={onClose}
              className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Main attribution */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-950 dark:bg-indigo-950/30">
            <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
              Titularidad de los Derechos de Autor
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-indigo-900/90 dark:text-indigo-300">
              El diseño de arquitectura, lógica de negocio, módulos de facturación, inventario y código fuente de esta solución son propiedad intelectual exclusiva de:
            </p>
            <div className="mt-2.5 flex items-center gap-4 rounded-xl bg-white p-3 border border-indigo-200/60 dark:bg-slate-800 dark:border-indigo-900">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{DEVELOPER_INFO.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Granada, Nicaragua • Cédula: <span className="font-mono font-semibold text-indigo-700 dark:text-indigo-400">{DEVELOPER_INFO.cedula}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{DEVELOPER_INFO.email}</p>
              </div>
            </div>
          </div>

          {/* Permitted Uses */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Usos Permitidos (Uso en Negocios)
            </h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <p>Libre para utilizar, instalar e implementar en negocios, pequeñas y medianas empresas para la gestión de su inventario, ventas y puntos de venta.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <p>Posibilidad de desplegar en entornos locales (Localhost) o servidores de nube (Vercel, Firebase, Railway, Cloud Run).</p>
              </div>
            </div>
          </div>

          {/* Restrictions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Restricciones Comerciales
            </h4>
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-500" />
                <p>
                  <strong className="font-bold">Prohibida la Reventa:</strong> No está permitida la redistribución de este software como un producto comercial empaquetado, su venta masiva ni la sublicencia del código fuente a terceros sin el consentimiento expreso y por escrito del autor.
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" checked={accepted} onChange={e => setAccepted(e.target.checked)} />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Acepto los términos y condiciones de uso del software.</span>
            </label>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between dark:bg-slate-800/50 dark:border-slate-800">
          <p className="text-[11px] text-slate-500">
            Para permisos de distribución, contacte al autor vía correo electrónico.
          </p>
          <button
            onClick={onClose}
            disabled={!accepted}
            className={`rounded-xl px-5 py-2 text-xs font-bold transition-all shadow-sm ${accepted ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'}`}
          >
            Aceptar y Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

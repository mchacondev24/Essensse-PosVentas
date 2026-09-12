import React from 'react';
import { Shield, FileText, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { DEVELOPER_INFO } from '../../domain/constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LicenseModal: React.FC<Props> = ({ isOpen, onClose }) => {
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
              <h3 className="text-base font-bold">Términos de Licencia y Propiedad Intelectual</h3>
              <p className="text-xs text-slate-400">FactuPro Invoicing & Inventory Suite</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Main attribution */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-950 dark:bg-indigo-950/30">
            <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
              Titularidad de los Derechos de Autor
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-indigo-900/90 dark:text-indigo-300">
              El diseño de arquitectura, lógica de negocio, módulos de facturación electrónica, inventario y código fuente de esta solución son propiedad intelectual exclusiva de:
            </p>
            <div className="mt-2.5 flex items-center gap-4 rounded-xl bg-white p-3 border border-indigo-200/60 dark:bg-slate-800 dark:border-indigo-900">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{DEVELOPER_INFO.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Cédula de Identidad: <span className="font-mono font-semibold text-indigo-700 dark:text-indigo-400">{DEVELOPER_INFO.cedula}</span>
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
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Libre para usar en comercios y empresas:</strong> Cualquier negocio puede utilizar libremente este sistema para sus operaciones diarias, facturación, kardex, punto de venta y reportes.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Configuración de marca propia:</strong> Puede personalizar el nombre del comercio, logotipo, datos fiscales y series de facturación sin restricción técnica.</span>
              </div>
            </div>
          </div>

          {/* Restrictions */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Restricciones de Comercialización y Distribución
              </h4>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              Queda estrictamente prohibida la <strong>distribución, reventa, comercialización o sublicenciamiento</strong> del código fuente o paquetes derivados con fines de lucro sin la autorización expresa, previa y por escrito de su autor: <strong>Maxwell Chacón</strong>.
            </p>
          </div>

          {/* Contact */}
          <div className="rounded-xl bg-slate-100 p-3 text-center text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Para autorizaciones comerciales, extensiones personalizadas o soporte empresarial: <br />
            <a href={`mailto:${DEVELOPER_INFO.email}`} className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              {DEVELOPER_INFO.email}
            </a>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end dark:bg-slate-850 dark:border-slate-800">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-all dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            Entendido y Acepto
          </button>
        </div>
      </div>
    </div>
  );
};

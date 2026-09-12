import React, { useState } from 'react';
import { Code2, Copy, Check, Play, Globe, Shield, Terminal, ArrowRight } from 'lucide-react';
import { SWAGGER_SPEC } from '../../infrastructure/api/swaggerDocs';
import { useApp } from '../../context/AppContext';

export const SwaggerView: React.FC = () => {
  const { products, sales, movements, businessConfig } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState<string>('GET /products');
  const [testResponse, setTestResponse] = useState<string | null>(null);

  const endpoints = [
    {
      method: 'GET',
      path: '/api/v1/health',
      summary: 'Verificar salud del servidor e interfaz',
      handler: () => ({ status: 'UP', timestamp: new Date().toISOString(), system: 'FactuPro Clean Arch' }),
    },
    {
      method: 'GET',
      path: '/api/v1/products',
      summary: 'Obtener catálogo de productos con stock en tiempo real',
      handler: () => products.slice(0, 5),
    },
    {
      method: 'GET',
      path: '/api/v1/sales',
      summary: 'Listar historial de ventas y facturas electrónicas',
      handler: () => sales.slice(0, 3),
    },
    {
      method: 'GET',
      path: '/api/v1/inventory/kardex',
      summary: 'Obtener movimientos de kardex y auditoría de inventario',
      handler: () => movements.slice(0, 3),
    },
    {
      method: 'GET',
      path: '/api/v1/hardware/scale/read',
      summary: 'Leer peso actual de la balanza conectada por red',
      handler: () => ({ netWeight: 1.45, unit: 'KG', stable: true, tare: 0 }),
    },
  ];

  const handleCopySpec = () => {
    navigator.clipboard.writeText(JSON.stringify(SWAGGER_SPEC, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTest = (ep: typeof endpoints[0]) => {
    setActiveEndpoint(`${ep.method} ${ep.path}`);
    const res = ep.handler();
    setTestResponse(JSON.stringify(res, null, 2));
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              API REST & Documentación Swagger en Red Local
            </h2>
            <span className="rounded-md bg-cyan-100 px-2 py-0.5 text-[10px] font-black uppercase text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
              OpenAPI 3.0
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Conecta sistemas externos, apps móviles Flutter, ecommerce y pistolas industriales mediante endpoints REST
          </p>
        </div>

        <button
          onClick={handleCopySpec}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 shadow-md"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? '¡JSON Copiado!' : 'Copiar OpenAPI Spec'}</span>
        </button>
      </div>

      {/* Network Server Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Servidor Local</span>
            <p className="font-mono font-bold text-xs text-slate-800 dark:text-slate-100">http://localhost:3000</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Autenticación</span>
            <p className="font-mono font-bold text-xs text-slate-800 dark:text-slate-100">Bearer JWT / API Key</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Formato de Intercambio</span>
            <p className="font-mono font-bold text-xs text-slate-800 dark:text-slate-100">application/json</p>
          </div>
        </div>
      </div>

      {/* Endpoints & Live Test Console */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Endpoints List */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Endpoints REST Disponibles
          </h3>

          <div className="space-y-2">
            {endpoints.map((ep, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-2xl border border-slate-200 p-3 hover:border-cyan-400 dark:border-slate-800 dark:hover:border-cyan-500 transition-all bg-slate-50/50 dark:bg-slate-850"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`rounded-lg px-2 py-1 text-[10px] font-black font-mono ${
                      ep.method === 'GET'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <div>
                    <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">{ep.path}</p>
                    <p className="text-[10px] text-slate-400">{ep.summary}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleTest(ep)}
                  className="flex items-center gap-1 rounded-xl bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-cyan-500 hover:text-white dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-cyan-500 transition-colors"
                >
                  <Play className="h-3 w-3" />
                  <span>Probar</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Test Console Output */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Consola Interactiva de Respuesta
            </h3>
            {activeEndpoint && (
              <span className="font-mono text-xs text-cyan-600 dark:text-cyan-400 font-bold">
                {activeEndpoint}
              </span>
            )}
          </div>

          <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 text-slate-200 font-mono text-xs min-h-[260px] max-h-[320px] overflow-y-auto">
            {testResponse ? (
              <pre className="text-emerald-400">
                <code>{testResponse}</code>
              </pre>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 text-center">
                Haz clic en "Probar" en cualquiera de los endpoints para simular la petición en vivo.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

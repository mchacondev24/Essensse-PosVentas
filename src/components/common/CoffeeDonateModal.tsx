import React, { useState } from 'react';
import { Coffee, Copy, Check, Heart, ShieldCheck, CreditCard, DollarSign, Smartphone } from 'lucide-react';
import { DEVELOPER_INFO } from '../../domain/constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CoffeeDonateModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (accountNum: string) => {
    navigator.clipboard.writeText(accountNum);
    setCopiedAccount(accountNum);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl transition-all dark:bg-slate-900 dark:border dark:border-slate-800">
        {/* Banner with gradient */}
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                <Coffee className="h-7 w-7 text-amber-100" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">¡Invítame un café! ☕</h3>
                <p className="text-xs text-amber-100 font-medium">Apoya al desarrollador de FactuPro</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-black/20 p-2 text-white/90 hover:bg-black/30 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-900/30">
            <Heart className="h-6 w-6 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              Este software fue desarrollado con dedicación por <strong>{DEVELOPER_INFO.name}</strong>. Si el sistema te ha sido de gran utilidad para gestionar tu negocio, puedes invitar un café realizando una transferencia bancaria directa.
            </p>
          </div>

          {/* Developer identity card */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 dark:bg-slate-800/60 dark:border-slate-700/60 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Titular de las Cuentas</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{DEVELOPER_INFO.name}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Cédula: <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">{DEVELOPER_INFO.cedula}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                {DEVELOPER_INFO.bankName}
              </span>
            </div>
          </div>

          {/* Accounts extracted from user's LAFISE screenshots */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Cuentas Bancarias LAFISE (Clic para copiar)
            </h4>

            {DEVELOPER_INFO.accounts.map((acc, index) => (
              <div
                key={index}
                className="group relative flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 transition-all hover:border-amber-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/80 dark:hover:border-amber-500/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    {acc.currency === 'USD' ? (
                      <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    ) : acc.icon === 'smartphone' ? (
                      <Smartphone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{acc.type}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {acc.currency}
                      </span>
                    </div>
                    <p className="font-mono text-sm font-semibold tracking-wider text-slate-800 dark:text-slate-200">
                      {acc.number}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(acc.number)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    copiedAccount === acc.number
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-900 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {copiedAccount === acc.number ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            Cualquier aporte es bienvenido. ¡Gracias por respaldar el software independiente de calidad!
          </div>
        </div>
      </div>
    </div>
  );
};

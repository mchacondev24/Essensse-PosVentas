import React, { useState, useEffect } from 'react';
import { Scale, RotateCcw, Check, Sliders, ArrowRight } from 'lucide-react';
import { DigitalScaleService, ScaleReading } from '../../infrastructure/hardware/digitalScale';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectWeight?: (netWeight: number, unit: 'KG' | 'LB' | 'G') => void;
  productName?: string;
  pricePerUnit?: number;
}

export const DigitalScaleModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectWeight,
  productName,
  pricePerUnit = 0,
}) => {
  const [reading, setReading] = useState<ScaleReading>(DigitalScaleService.getReading());
  const [manualInput, setManualInput] = useState<string>('1.500');

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = DigitalScaleService.subscribe(newReading => {
      setReading(newReading);
    });
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyWeight = () => {
    if (onSelectWeight) {
      onSelectWeight(reading.netWeight, reading.unit);
    }
    onClose();
  };

  const calculatedTotal = pricePerUnit * reading.netWeight;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl transition-all dark:bg-slate-900 dark:border dark:border-slate-800">
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Balanza / Báscula Digital Integrada</h3>
              <p className="text-xs text-slate-400">Compatibilidad con balanzas Torrey, CAS, Toledo y emuladores</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {productName && (
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Pesando Producto:</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{productName}</p>
              <p className="text-xs text-slate-500">
                Precio unitario: C$ {pricePerUnit.toFixed(2)} por {reading.unit}
              </p>
            </div>
          )}

          {/* Digital LED Scale Display */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 p-6 text-center border-4 border-slate-800 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 mb-2">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                ESTABLE
              </span>
              <span>TARA: {reading.tare.toFixed(3)} {reading.unit}</span>
            </div>

            <div className="font-mono text-5xl font-black tracking-widest text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]">
              {reading.netWeight.toFixed(3)}
              <span className="text-2xl ml-2 text-emerald-500 font-sans font-semibold">{reading.unit}</span>
            </div>

            {pricePerUnit > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-slate-300 text-xs">
                <span>Total Calculado:</span>
                <span className="text-lg font-bold text-amber-400 font-mono">
                  C$ {calculatedTotal.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Scale Buttons (Tare, Zero, Unit toggle) */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => DigitalScaleService.tare()}
              className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              TARA
            </button>
            <button
              onClick={() => DigitalScaleService.zero()}
              className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              CERO
            </button>
            <button
              onClick={() => DigitalScaleService.setUnit(reading.unit === 'LB' ? 'KG' : 'LB')}
              className="rounded-xl border border-indigo-200 bg-indigo-50 p-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
            >
              KG / LB ({reading.unit})
            </button>
            <button
              onClick={() => DigitalScaleService.simulateRandomWeight()}
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              Simular Peso
            </button>
          </div>

          {/* Quick preset weight buttons */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Pesos rápidos frecuentes:
            </label>
            <div className="flex flex-wrap gap-2">
              {[0.5, 1.0, 2.0, 5.0, 10.0].map(w => (
                <button
                  key={w}
                  onClick={() => DigitalScaleService.setWeight(w)}
                  className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  {w.toFixed(1)} {reading.unit}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center dark:bg-slate-850 dark:border-slate-800">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleApplyWeight}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-500/20"
          >
            <Check className="h-4 w-4" />
            Transferir {reading.netWeight.toFixed(3)} {reading.unit} a la Venta
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Scan, Barcode, QrCode, CheckCircle2, RefreshCw, Printer, Camera } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { BarcodeGunService } from '../../infrastructure/hardware/barcodeScanner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const HardwareScannerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { products } = useApp();
  const [lastScanned, setLastScanned] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<{ code: string; timestamp: string; matchName?: string }[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const barcodeSvgRef = useRef<SVGSVGElement | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Listen to scanner gun
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = BarcodeGunService.onScan((code: string) => {
      const match = products.find(p => p.code === code);
      setLastScanned(code);
      setScanHistory(prev => [
        { code, timestamp: new Date().toLocaleTimeString(), matchName: match?.name },
        ...prev.slice(0, 8),
      ]);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, products]);

  // Render sample barcode and QR for selected product
  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  useEffect(() => {
    if (!isOpen || !selectedProduct) return;

    if (barcodeSvgRef.current) {
      try {
        JsBarcode(barcodeSvgRef.current, selectedProduct.code, {
          format: 'CODE128',
          width: 1.8,
          height: 45,
          displayValue: true,
          fontSize: 12,
          margin: 6,
        });
      } catch (err) {
        console.error('JsBarcode error:', err);
      }
    }

    if (qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        JSON.stringify({
          sku: selectedProduct.code,
          name: selectedProduct.name,
          price: selectedProduct.salePrice,
          unit: selectedProduct.unit,
        }),
        { width: 140, margin: 1 }
      );
    }
  }, [isOpen, selectedProductId, selectedProduct]);

  // Webcam toggle
  const toggleCamera = async () => {
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (e) {
        alert('No se pudo acceder a la cámara. Verifique los permisos en el navegador.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all dark:bg-slate-900 dark:border dark:border-slate-800">
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
              <Scan className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Compatibilidad de Pistolas y Escáner QR / Barras</h3>
              <p className="text-xs text-slate-400">Soporte universal HID (USB, Bluetooth, Inalámbricas y Cámara)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Live Scanner Gun Buffer Status */}
          <div className="rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/60 p-4 text-center dark:border-sky-900/60 dark:bg-sky-950/20">
            <div className="flex items-center justify-center gap-2 text-sky-700 dark:text-sky-300 font-semibold text-sm">
              <Barcode className="h-5 w-5 animate-pulse" />
              <span>Escucha Activa de Pistolas de Código de Barras</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Dispara tu pistola USB o Bluetooth sobre cualquier etiqueta. El sistema intercepta la ráfaga automáticamente.
            </p>

            {lastScanned ? (
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2 text-emerald-800 font-mono font-bold text-sm dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                <span>Último código capturado: {lastScanned}</span>
              </div>
            ) : (
              <p className="mt-2 text-xs italic text-slate-400">Esperando disparo de pistola...</p>
            )}
          </div>

          {/* Camera Scanner Section */}
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Escaneo con Cámara Web / Teléfono
                </h4>
              </div>
              <button
                onClick={toggleCamera}
                className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
              >
                {cameraActive ? 'Apagar Cámara' : 'Activar Cámara'}
              </button>
            </div>

            {cameraActive && (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-36 w-56 border-2 border-dashed border-red-500 rounded-lg animate-pulse" />
                </div>
              </div>
            )}
          </div>

          {/* Tag and Code Generator */}
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Impresor de Etiquetas de Productos (Barras & QR)
              </h4>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:underline font-semibold dark:text-indigo-400"
              >
                <Printer className="h-3.5 w-3.5" />
                Imprimir Etiqueta
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-500 dark:text-slate-400">Seleccionar Producto:</label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-3 border border-slate-200/80 dark:bg-slate-800/50 dark:border-slate-700/60">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Código de Barras (Code 128)
                  </span>
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <svg ref={barcodeSvgRef} className="max-w-full" />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-3 border border-slate-200/80 dark:bg-slate-800/50 dark:border-slate-700/60">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Código QR Fiscal / Inventario
                  </span>
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <canvas ref={qrCanvasRef} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

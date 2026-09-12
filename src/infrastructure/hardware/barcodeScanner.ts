// Hardware Barcode Gun & Scanner Listener Service
// Compatible con pistolas USB, Bluetooth y lectores inalámbricos (Honeywell, Zebra, Datalogic, Netum, Newland, Eyoyo, etc.)
// Las pistolas emulan un teclado HID rápido enviando caracteres en ráfagas (< 50ms) y terminan con Enter.

export type BarcodeScanHandler = (scannedCode: string) => void;

export class BarcodeGunService {
  private static buffer: string = '';
  private static lastKeyTime: number = 0;
  private static handlers: Set<BarcodeScanHandler> = new Set();
  private static isListening: boolean = false;
  private static maxGapMs: number = 60; // Max interval between characters in hardware scanner guns

  public static init() {
    if (this.isListening || typeof window === 'undefined') return;
    this.isListening = true;

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      const now = Date.now();
      const diff = now - this.lastKeyTime;
      this.lastKeyTime = now;

      // Ignore when user is deliberately typing in regular inputs, unless it arrives at scanner speed (<40ms)
      const target = e.target as HTMLElement | null;
      const isInputFocused = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      if (e.key === 'Enter') {
        if (this.buffer.length >= 3) {
          const code = this.buffer.trim();
          this.buffer = '';
          this.notifyHandlers(code);
          if (!isInputFocused) {
            e.preventDefault();
          }
        }
        this.buffer = '';
        return;
      }

      if (e.key.length === 1) {
        if (diff > this.maxGapMs && !isInputFocused) {
          // New sequence starting
          this.buffer = e.key;
        } else {
          this.buffer += e.key;
        }
      }
    });
  }

  public static onScan(handler: BarcodeScanHandler): () => void {
    this.init();
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  private static notifyHandlers(code: string) {
    this.handlers.forEach(h => {
      try {
        h(code);
      } catch (err) {
        console.error('Error in barcode scan handler:', err);
      }
    });
  }
}

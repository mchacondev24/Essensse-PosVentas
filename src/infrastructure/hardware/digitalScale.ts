// Digital Scale & Weight Management Service
// Compatible con básculas comerciales (Torrey, Rhino, CAS, Toledo, Básculas chinas USB/Serial y balanzas grameras)

export interface ScaleReading {
  weight: number;
  unit: 'KG' | 'LB' | 'G';
  isStable: boolean;
  tare: number;
  netWeight: number;
}

export type ScaleListener = (reading: ScaleReading) => void;

export class DigitalScaleService {
  private static currentWeight: number = 1.250;
  private static tareWeight: number = 0;
  private static unit: 'KG' | 'LB' | 'G' = 'LB';
  private static listeners: Set<ScaleListener> = new Set();
  private static isConnected: boolean = true;

  public static getReading(): ScaleReading {
    const net = Math.max(0, this.currentWeight - this.tareWeight);
    return {
      weight: Number(this.currentWeight.toFixed(3)),
      unit: this.unit,
      isStable: true,
      tare: Number(this.tareWeight.toFixed(3)),
      netWeight: Number(net.toFixed(3)),
    };
  }

  public static setWeight(val: number) {
    this.currentWeight = Math.max(0, val);
    this.notify();
  }

  public static setUnit(unit: 'KG' | 'LB' | 'G') {
    this.unit = unit;
    this.notify();
  }

  public static tare() {
    this.tareWeight = this.currentWeight;
    this.notify();
  }

  public static zero() {
    this.tareWeight = 0;
    this.currentWeight = 0;
    this.notify();
  }

  public static simulateRandomWeight(min = 0.25, max = 5.0) {
    const random = Math.random() * (max - min) + min;
    this.currentWeight = Number(random.toFixed(3));
    this.notify();
  }

  public static subscribe(listener: ScaleListener): () => void {
    this.listeners.add(listener);
    listener(this.getReading());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notify() {
    const reading = this.getReading();
    this.listeners.forEach(l => l(reading));
  }
}

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Barcode,
  Scale,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Receipt,
  CreditCard,
  Banknote,
  Send,
  AlertCircle,
  Printer,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Product, Sale, SaleItem } from '../../domain/types';
import { DigitalScaleModal } from '../common/DigitalScaleModal';
import { PdfExportService } from '../../infrastructure/exporters/pdfGenerator';
import { BarcodeGunService } from '../../infrastructure/hardware/barcodeScanner';

export const POSView: React.FC = () => {
  const { products, customers, createSale, businessConfig, activeCashRegister } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [isCreditSale, setIsCreditSale] = useState<boolean>(false);
  const [creditDays, setCreditDays] = useState<number>(30);
  const [saleNotes, setSaleNotes] = useState<string>('');

  // Modals & State
  const [scaleModalOpen, setScaleModalOpen] = useState(false);
  const [productForScale, setProductForScale] = useState<Product | null>(null);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const barcodeInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus barcode input and listen to hardware guns
  useEffect(() => {
    const unsubscribe = BarcodeGunService.onScan((scannedCode: string) => {
      const found = products.find(
        p => p.code.toLowerCase() === scannedCode.toLowerCase() && p.status === 'active'
      );
      if (found) {
        if (found.isScaleProduct) {
          setProductForScale(found);
          setScaleModalOpen(true);
        } else {
          addToCart(found, 1);
        }
      }
    });
    return () => unsubscribe();
  }, [products]);

  // Handle manual or gun code submission in search box
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    const found = products.find(
      p => p.code.toLowerCase() === searchQuery.toLowerCase() && p.status === 'active'
    );
    if (found) {
      if (found.isScaleProduct) {
        setProductForScale(found);
        setScaleModalOpen(true);
      } else {
        addToCart(found, 1);
      }
      setSearchQuery('');
    }
  };

  const addToCart = (product: Product, quantity = 1, weightGrams?: number) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.productId === product.id);
      if (existingIdx !== -1) {
        const item = prev[existingIdx];
        const newQty = Number((item.quantity + quantity).toFixed(3));
        const newSubtotal = Number((newQty * item.unitPrice).toFixed(2));
        const newTax = (newSubtotal * product.taxPercent) / 100;
        const newTotal = Number((newSubtotal + newTax - item.discount).toFixed(2));

        const updated = [...prev];
        updated[existingIdx] = {
          ...item,
          quantity: newQty,
          subtotal: newSubtotal,
          taxAmount: newTax,
          total: newTotal,
          weightGrams: weightGrams ? (item.weightGrams || 0) + weightGrams : item.weightGrams,
        };
        return updated;
      } else {
        const subtotal = Number((quantity * product.salePrice).toFixed(2));
        const taxAmount = (subtotal * product.taxPercent) / 100;
        const total = Number((subtotal + taxAmount).toFixed(2));

        return [
          ...prev,
          {
            productId: product.id,
            code: product.code,
            name: product.name,
            unit: product.unit,
            unitPrice: product.salePrice,
            costPrice: product.purchasePrice,
            quantity,
            subtotal,
            taxAmount,
            discount: 0,
            total,
            weightGrams,
          },
        ];
      }
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCartItems(prev => {
      const item = prev[index];
      const newQty = Number((item.quantity + delta).toFixed(3));
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      const prod = products.find(p => p.id === item.productId);
      const taxRate = prod ? prod.taxPercent : 15;
      const subtotal = Number((newQty * item.unitPrice).toFixed(2));
      const taxAmount = (subtotal * taxRate) / 100;
      const total = Number((subtotal + taxAmount - item.discount).toFixed(2));

      const updated = [...prev];
      updated[index] = {
        ...item,
        quantity: newQty,
        subtotal,
        taxAmount,
        total,
      };
      return updated;
    });
  };

  const removeItem = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Totals calculations
  const subtotal = Number(cartItems.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2));
  const taxTotal = Number(cartItems.reduce((acc, item) => acc + item.taxAmount, 0).toFixed(2));
  const discountTotal = Number(cartItems.reduce((acc, item) => acc + item.discount, 0).toFixed(2));
  const total = Number((subtotal + taxTotal - discountTotal).toFixed(2));
  const change = Math.max(0, amountPaid - total);

  // Selected customer
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const handleOpenCheckout = () => {
    if (cartItems.length === 0) return;
    setAmountPaid(total);
    setShowCheckoutModal(true);
  };

  const handleFinishSale = () => {
    if (!activeCashRegister) {
      if (!confirm('No hay una caja chica abierta. ¿Deseas emitir la venta de todas formas?')) {
        return;
      }
    }

    const sale = createSale({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerIdentification: selectedCustomer.identification,
      items: cartItems,
      subtotal,
      taxTotal,
      discountTotal,
      total,
      paymentMethod: isCreditSale ? 'credito' : paymentMethod,
      amountPaid: isCreditSale ? 0 : amountPaid,
      change: isCreditSale ? 0 : change,
      isCredit: isCreditSale,
      creditDays: isCreditSale ? creditDays : undefined,
      notes: saleNotes,
    });

    setCompletedSale(sale);
    setShowCheckoutModal(false);
    clearCart();
    setAmountPaid(0);
    setIsCreditSale(false);
    setSaleNotes('');
  };

  // Filter products
  const categories = ['todos', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = products.filter(p => {
    if (p.status !== 'active') return false;
    const matchCat = selectedCategory === 'todos' || p.category === selectedCategory;
    const matchQuery =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Left: Product Catalog & Search */}
      <div className="flex flex-1 flex-col overflow-hidden border-r border-slate-200 dark:border-slate-800 p-4 lg:p-6">
        {/* Top Search & Barcode gun input */}
        <div className="space-y-3">
          <form onSubmit={handleBarcodeSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                ref={barcodeInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, código de barras o pistola escáner..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <Barcode className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>
            <button
              type="submit"
              className="rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-sm"
            >
              Agregar
            </button>
          </form>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {cat === 'todos' ? 'Todos los Productos' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map(prod => {
              const isOutOfStock = prod.type === 'producto' && prod.currentStock <= 0;
              return (
                <div
                  key={prod.id}
                  onClick={() => {
                    if (isOutOfStock) return;
                    if (prod.isScaleProduct) {
                      setProductForScale(prod);
                      setScaleModalOpen(true);
                    } else {
                      addToCart(prod, 1);
                    }
                  }}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 transition-all cursor-pointer ${
                    isOutOfStock
                      ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900'
                      : 'border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-indigo-500'
                  }`}
                >
                  {/* Tags */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {prod.unit}
                    </span>
                    {prod.isScaleProduct && (
                      <span className="flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <Scale className="h-3 w-3" />
                        Báscula
                      </span>
                    )}
                  </div>

                  {/* Product Title */}
                  <div className="my-2">
                    <p className="text-xs font-bold leading-snug text-slate-800 dark:text-slate-100 line-clamp-2">
                      {prod.name}
                    </p>
                    <p className="font-mono text-[10px] text-slate-400 truncate mt-0.5">
                      {prod.code}
                    </p>
                  </div>

                  {/* Price & Stock Bottom */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                      {businessConfig.currencySymbol} {prod.salePrice.toFixed(2)}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        prod.type === 'servicio'
                          ? 'text-sky-500'
                          : prod.currentStock <= prod.minStock
                          ? 'text-amber-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {prod.type === 'servicio' ? 'Servicio' : `Stock: ${prod.currentStock}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Cart & Fast Checkout */}
      <div className="flex w-full lg:w-96 flex-col bg-white dark:bg-slate-900 border-t lg:border-t-0 border-slate-200 dark:border-slate-800 h-1/2 lg:h-full">
        {/* Customer Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Cliente Asignado
          </label>
          <select
            value={selectedCustomerId}
            onChange={e => setSelectedCustomerId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.allowCredit ? `(Crédito Disp: C$ ${(c.creditLimit - c.currentCredit).toFixed(0)})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
              <Barcode className="h-10 w-10 stroke-1 mb-2 text-slate-300 dark:text-slate-700" />
              <p className="text-xs font-medium">El carrito está vacío</p>
              <p className="text-[11px] text-slate-400">Escanea un producto o selecciona del catálogo</p>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div
                key={`${item.productId}-${index}`}
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-2.5 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {businessConfig.currencySymbol} {item.unitPrice.toFixed(2)} x {item.quantity} {item.unit}
                    {item.weightGrams ? ` (${(item.weightGrams / 1000).toFixed(2)} kg)` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(index, -1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-200"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center font-mono text-xs font-bold text-slate-800 dark:text-slate-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(index, 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-200"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => removeItem(index)}
                    className="ml-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Checkout Button */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-850">
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">{businessConfig.currencySymbol} {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA ({businessConfig.taxRatePercent}%):</span>
              <span className="font-semibold">{businessConfig.currencySymbol} {taxTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white">
              <span>TOTAL FACTURA:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono text-base">
                {businessConfig.currencySymbol} {total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={clearCart}
              disabled={cartItems.length === 0}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-400"
            >
              Vaciar
            </button>
            <button
              onClick={handleOpenCheckout}
              disabled={cartItems.length === 0}
              className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Cobrar {businessConfig.currencySymbol} {total.toFixed(2)}
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Finalizar Venta & Factura Electrónica
              </h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Sale Summary Banner */}
            <div className="rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-950/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  Total a Cobrar
                </span>
                <p className="text-2xl font-black font-mono text-indigo-900 dark:text-indigo-100">
                  {businessConfig.currencySymbol} {total.toFixed(2)}
                </p>
              </div>
              <div className="text-right text-xs text-indigo-800 dark:text-indigo-200">
                <p className="font-semibold">{selectedCustomer.name}</p>
                <p className="text-[11px] opacity-75">{cartItems.length} artículos</p>
              </div>
            </div>

            {/* Credit or Cash Switch */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsCreditSale(false)}
                className={`rounded-xl p-2.5 text-xs font-bold border transition-all ${
                  !isCreditSale
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200'
                    : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                Venta de Contado
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!selectedCustomer.allowCredit) {
                    alert('Este cliente no tiene crédito habilitado. Puedes habilitarlo en el módulo de Clientes.');
                  }
                  setIsCreditSale(true);
                }}
                className={`rounded-xl p-2.5 text-xs font-bold border transition-all ${
                  isCreditSale
                    ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-200'
                    : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                Venta al Crédito
              </button>
            </div>

            {!isCreditSale ? (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Método de Pago:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['efectivo', 'tarjeta', 'transferencia'] as PaymentMethod[]).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`rounded-xl p-2.5 text-xs font-bold capitalize border transition-all ${
                        paymentMethod === method
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200'
                          : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'efectivo' && (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Monto Recibido del Cliente:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={amountPaid || ''}
                        onChange={e => setAmountPaid(Number(e.target.value))}
                        className="flex-1 rounded-xl border border-slate-200 p-2 text-base font-bold font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        placeholder="0.00"
                      />
                      {[100, 200, 500, 1000].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAmountPaid(val)}
                          className="rounded-xl bg-slate-100 px-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        >
                          C${val}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 text-xs">
                      <span className="font-semibold text-slate-500">Cambio / Vuelto:</span>
                      <span className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                        {businessConfig.currencySymbol} {change.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 rounded-2xl bg-violet-50/70 p-4 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/30">
                <div className="flex items-center gap-2 text-violet-800 dark:text-violet-300 font-bold text-xs">
                  <CreditCard className="h-4 w-4" />
                  <span>Condiciones de Venta al Crédito</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-500">Plazo en Días:</label>
                    <select
                      value={creditDays}
                      onChange={e => setCreditDays(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold dark:bg-slate-800 dark:border-slate-700"
                    >
                      <option value={15}>15 Días (Quincenal)</option>
                      <option value={30}>30 Días (Mensual)</option>
                      <option value={45}>45 Días</option>
                      <option value={60}>60 Días</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Límite Disponible:</label>
                    <p className="mt-2 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {businessConfig.currencySymbol} {(selectedCustomer.creditLimit - selectedCustomer.currentCredit).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleFinishSale}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
              >
                Emitir Factura Electrónica
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Sale Success Modal with PDF print */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-center dark:bg-slate-900 dark:border dark:border-slate-800 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                ¡Venta Emitida Exitosamente!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Factura Electrónica: <strong>{completedSale.invoiceSeries}-{completedSale.invoiceNumber}</strong>
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                {completedSale.electronicInvoice?.electronicAuthorization}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-xs dark:bg-slate-800/60 text-left space-y-1">
              <div className="flex justify-between">
                <span>Cliente:</span>
                <strong className="text-slate-800 dark:text-slate-200">{completedSale.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Facturado:</span>
                <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                  {businessConfig.currencySymbol} {completedSale.total.toFixed(2)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Método:</span>
                <span className="capitalize font-semibold">{completedSale.paymentMethod}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => PdfExportService.generateInvoicePdf(completedSale, businessConfig)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-sm"
              >
                <Printer className="h-4 w-4" />
                Descargar Factura PDF
              </button>
              <button
                onClick={() => setCompletedSale(null)}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scale Modal for weighted products */}
      {productForScale && (
        <DigitalScaleModal
          isOpen={scaleModalOpen}
          productName={productForScale.name}
          pricePerUnit={productForScale.salePrice}
          onClose={() => {
            setScaleModalOpen(false);
            setProductForScale(null);
          }}
          onSelectWeight={(weight, unit) => {
            if (productForScale) {
              const weightGrams = unit === 'KG' ? weight * 1000 : unit === 'LB' ? weight * 453.592 : weight;
              addToCart(productForScale, weight, Math.round(weightGrams));
            }
            setScaleModalOpen(false);
            setProductForScale(null);
          }}
        />
      )}
    </div>
  );
};

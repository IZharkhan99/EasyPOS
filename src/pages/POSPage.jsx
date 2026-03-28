import { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';
import { useCustomers } from '../hooks/useCustomers';
import { useOrders } from '../hooks/useOrders';
import { useCart } from '../hooks/useCart';
import { useShifts } from '../hooks/useShifts';
import { useSettings } from '../hooks/useSettings';
import Modal from '../components/Modal';
import createLogger from '../utils/logger';
import { formatCurrency } from '../utils/formatters';
import { DEFAULTS } from '../utils/constants';

const logger = createLogger('POSPage');

export default function POSPage() {
  const { openModal, closeModal, activeModal, modalData, showToast, printReceipt, printInvoice } = useApp();
  const { profile } = useAuth();
  const { products, isLoading: isProductsLoading } = useProducts();
  const { customers } = useCustomers();
  const { createOrder, isCreating } = useOrders();
  const { activeShift } = useShifts();
  const { settings } = useSettings();
  const { 
    cart, addToCart: cartAdd, updateQty, removeFromCart, clearCart, 
    currentCustomer, setCurrentCustomer, discount, setDiscount, 
    discountType, setDiscountType, subtotal, discountAmount, total, itemCount,
    heldOrders, holdOrder, restoreHeldOrder
  } = useCart();
  
  const taxRate = profile?.tax_rate ? parseFloat(profile.tax_rate) / 100 : DEFAULTS.TAX_RATE;

  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [cashInput, setCashInput] = useState('');
  const [custSearch, setCustSearch] = useState('');
  const [selectedPay, setSelectedPay] = useState('cash');
  const searchRef = useRef(null);

  const posSettings = {
    requireShift: settings.pos_require_shift !== 'false',
    scanSound: settings.pos_scan_sound !== 'false',
    quickCheckout: settings.pos_quick_checkout !== 'false',
  };

  const shiftOpen = !!activeShift;

  useEffect(() => {
    if (!activeModal && searchRef.current) {
        searchRef.current.focus();
    }
  }, [activeModal, cart.length]);

  const addToCart = (productId) => {
    if (!shiftOpen && posSettings.requireShift) {
      showToast('Shift is closed! Open a shift to start selling.', 'error');
      openModal('shift');
      return;
    }
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    logger.info(`Adding product to cart: ${product.name}`, { productId, price: product.price });
    if (posSettings.scanSound) {
      // Logic for scan sound
    }
    cartAdd(product);
  };

  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);
  const filtered = useMemo(() => products.filter(p => {
    const mc = activeCat === 'All' || p.category === activeCat;
    const ms = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  }), [products, activeCat, search]);

  const inCart = {};
  cart.forEach(c => inCart[c.id] = c.qty);

  const change = Math.max(0, (parseFloat(cashInput) || 0) - total);

  const handlePay = async () => {
    const method = selectedPay;
    if (method === 'cash') {
      const cash = parseFloat(cashInput) || total;
      if (cash < total) { showToast('Insufficient cash amount', 'error'); return; }
    }

    try {
      logger.info('Starting payment process', { method, total, customer: currentCustomer?.name });
      const taxAmount = total * taxRate;
      
      const orderData = {
        customer_id: currentCustomer?.id,
        total: total,
        subtotal: subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        payment_method: method,
        status: 'completed',
        shift_id: activeShift?.id,
        user_id: profile.id,
      };

      const itemsData = cart.map(item => ({
        product_id: item.id,
        name: item.name,
        sku: item.sku || '',
        qty: item.qty,
        unit_price: item.price,
        cost_price: item.cost || 0,
        total: item.price * item.qty,
      }));

      const newOrder = await createOrder({ orderData, itemsData });
      logger.info('Order created successfully', { orderId: newOrder.id });
      
      // Map to legacy format for receipt/invoice components
      const legacyOrder = {
        ...newOrder,
        customer: currentCustomer?.name || 'Walk-in Customer',
        items: cart,
        sub: subtotal,
        tax_amount: taxAmount,
        total: total,
        createdAt: new Date(),
      };

      clearCart();
      closeModal();
      showToast('Payment successful!', 'success');
      openModal('receipt', legacyOrder);
    } catch (err) {
      logger.error('Order processing failed', { error: err.message, cart });
      showToast('Failed to process order: ' + err.message, 'error');
    }
  };


  return (
    <div className="flex flex-1 overflow-hidden">
      {/* LEFT - Products */}
      <div className="flex-1 flex flex-col overflow-hidden p-3">
        <div className="flex gap-2 mb-2.5 flex-shrink-0">
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" className="absolute left-[11px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 stroke-[var(--text3)] fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              ref={searchRef}
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search products, scan barcode…"
              className="w-full bg-theme-elevated border border-theme2 rounded-lg py-2 pl-[34px] pr-3 text-[13px] text-theme outline-none transition-all focus:border-[#3b82f6]" 
            />
          </div>
          <button onClick={() => showToast('Barcode scanner activated')} className="h-auto rounded-[7px] bg-theme-elevated border border-theme px-2.5 text-theme2 text-[12px] font-medium cursor-pointer flex items-center gap-[5px] hover:bg-theme-hover hover:text-theme">Scan</button>
          {heldOrders.length > 0 && (
            <button onClick={restoreHeldOrder} className="h-auto rounded-[7px] bg-theme-elevated border border-theme px-2.5 text-theme2 text-[12px] font-medium cursor-pointer flex items-center gap-[5px] hover:bg-theme-hover hover:text-theme">
              Held ({heldOrders.length})
            </button>
          )}
        </div>

        {/* Category Bar */}
        <div className="flex gap-1.5 mb-2.5 overflow-x-auto flex-shrink-0 pb-0.5">
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCat(c)}
              className={`px-3 py-[5px] rounded-full border text-[12px] cursor-pointer whitespace-nowrap transition-all font-medium ${c === activeCat ? 'bg-[#3b82f6] border-[#3b82f6] text-white' : 'border-[var(--border2)] bg-transparent text-theme2 hover:bg-theme-hover hover:text-theme'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2 overflow-y-auto flex-1 content-start">
          {filtered.map(p => (
            <div key={p.id} onClick={() => addToCart(p.id)}
              className={`bg-theme-elevated border border-theme rounded-[11px] p-3 cursor-pointer transition-all select-none relative overflow-hidden hover:border-theme2 hover:-translate-y-px active:scale-95 ${p.stock === 0 ? 'opacity-40 pointer-events-none' : ''}`}>
              <span className="text-[26px] mb-1.5 block">{p.emoji || DEFAULTS.productEmoji}</span>
              <div className="text-xs font-semibold text-theme mb-0.5 leading-tight">{p.name}</div>
              <div className="text-[13.5px] font-extrabold text-[#3b82f6]">{formatCurrency(p.price)}</div>
              <div className="text-[10px] text-theme3 mt-0.5">
                {p.stock === 0 ? 'Out of stock' : p.stock < (p.reorder_level || 5) ? `⚠ Low: ${p.stock}` : p.stock + ' in stock'}
              </div>
              {inCart[p.id] && (
                <div className="absolute top-1.5 right-1.5 bg-[#3b82f6] text-white text-[10px] font-extrabold w-[18px] h-[18px] rounded-full flex items-center justify-center">{inCart[p.id]}</div>
              )}
            </div>
          ))}
          {!filtered.length && <div className="col-span-full text-center py-10 text-theme3">No products found</div>}
        </div>
      </div>

      {/* RIGHT - Cart */}
      <div className="w-[330px] min-w-[330px] bg-theme-surface border-l border-theme flex flex-col theme-transition">
        <div className="px-3.5 py-3 border-b border-theme flex items-center gap-2 flex-shrink-0">
          <span className="text-[13px] font-bold flex-1">Current Order</span>
          <span className="bg-[rgba(59,130,246,.12)] text-[#3b82f6] text-[10px] font-extrabold px-2 py-0.5 rounded-full">{itemCount}</span>
          <button onClick={clearCart} className="text-[11.5px] text-[#ef4444] cursor-pointer bg-none border-none px-[7px] py-[3px] rounded-md transition-all hover:bg-[rgba(239,68,68,.12)]">✕ Clear</button>
        </div>

        {/* Customer */}
        <div className="px-3.5 py-2 border-b border-theme flex items-center gap-2 flex-shrink-0 bg-theme-elevated">
          <div className="w-[26px] h-[26px] rounded-full bg-[rgba(59,130,246,.12)] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-[13px] h-[13px] stroke-[#3b82f6] fill-none" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <span className="text-[12.5px] font-semibold flex-1">{currentCustomer?.name || 'Walk-in Customer'}</span>
          <span onClick={() => openModal('customer')} className="text-[11px] text-[#3b82f6] cursor-pointer underline">Change</span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-1.5">
          {cart.length ? cart.map(item => (
            <div key={item.id} className="flex items-center gap-[7px] px-2 py-[7px] rounded-lg mb-0.5 bg-theme-elevated border border-theme">
              <span className="text-lg flex-shrink-0">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</div>
                <div className="text-[11px] text-theme3">{formatCurrency(item.price)} × {item.qty} = {formatCurrency(item.price * item.qty)}</div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-5 h-5 rounded-[5px] bg-theme-hover border-none text-theme cursor-pointer text-[13px] flex items-center justify-center hover:bg-theme-elevated">−</button>
                <span className="text-xs font-bold min-w-[16px] text-center">{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-5 h-5 rounded-[5px] bg-theme-hover border-none text-theme cursor-pointer text-[13px] flex items-center justify-center hover:bg-theme-elevated">+</button>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="w-[18px] h-[18px] bg-none border-none text-theme3 cursor-pointer text-xs flex items-center justify-center flex-shrink-0 hover:text-[#ef4444]">✕</button>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center h-[100px] text-theme3 text-[12.5px] gap-[7px]">
              <svg viewBox="0 0 24 24" className="w-7 h-7 stroke-[var(--text3)] fill-none opacity-40" strokeWidth="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
              Add products to start
            </div>
          )}
        </div>

        {/* Cart Summary */}
        <div className="px-3.5 py-2.5 border-t border-theme flex-shrink-0">
          <div className="flex justify-between text-[12.5px] text-theme2 mb-1"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex gap-1.5 my-1.5">
            <input type="number" placeholder="Discount %" min="0" max="100" value={discount || ''} onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
              className="flex-1 bg-theme-elevated border border-theme2 rounded-[7px] px-2.5 py-1.5 text-xs text-theme outline-none focus:border-[#3b82f6]" />
            <button onClick={() => { if (discount >= 0 && discount <= 100) showToast(`${discount}% discount applied`, 'success'); else showToast('Enter discount 0–100%', 'error'); }}
              className="bg-theme-elevated border border-theme2 rounded-[7px] px-2.5 py-1.5 text-[11.5px] text-theme2 cursor-pointer hover:bg-theme-hover">Apply</button>
          </div>
          <div className="flex justify-between text-[12.5px] text-theme2 mb-1"><span>Discount</span><span className="text-[#22c55e]">-{formatCurrency(discountAmount)}</span></div>
          <div className="flex justify-between text-[12.5px] text-theme2 mb-1"><span>Tax ({taxRate * 100}%)</span><span>{formatCurrency(total * taxRate)}</span></div>
          <div className="flex justify-between text-[15px] font-extrabold mt-[7px] pt-[7px] border-t border-theme"><span>Total</span><span>{formatCurrency(total)}</span></div>
          <div className="h-2" />

          {/* Payment Methods */}
          <div className="grid grid-cols-3 gap-[5px] my-2">
            {['cash', 'card', 'qr'].map(m => (
              <button key={m} onClick={() => setSelectedPay(m)}
                className={`py-[7px] px-1 rounded-lg border text-[11px] cursor-pointer flex flex-col items-center gap-0.5 transition-all font-semibold ${selectedPay === m ? 'border-[#3b82f6] bg-[rgba(59,130,246,.12)] text-[#3b82f6]' : 'border-[var(--border2)] bg-theme-elevated text-theme2'}`}>
                {m === 'cash' ? 'Cash' : m === 'card' ? 'Card' : 'QR Pay'}
              </button>
            ))}
          </div>
          <button onClick={holdOrder} className="w-full py-2 rounded-lg bg-theme-elevated border border-theme text-theme2 text-xs cursor-pointer mb-1.5 transition-all hover:bg-theme-hover hover:text-theme">⏸ Hold Order</button>
          <button onClick={() => { 
            if (!cart.length) return; 
            if (!shiftOpen && posSettings.requireShift) { showToast('Open shift first!', 'error'); return; }
            if (posSettings.quickCheckout && selectedPay === 'cash') {
                handlePay(); 
            } else {
                openModal('checkout');
            }
          }} disabled={!cart.length}
            className={`w-full py-3 rounded-[9px] border-none text-white text-[13.5px] font-extrabold cursor-pointer flex items-center justify-center gap-[7px] transition-all disabled:opacity-35 disabled:pointer-events-none ${!shiftOpen && posSettings.requireShift ? 'bg-gray-500' : 'bg-[#3b82f6] hover:bg-[#2563eb]'}`}>
            <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-white fill-none" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            {!shiftOpen && posSettings.requireShift ? 'Shift Closed' : `Charge $${total.toFixed(2)}`}
          </button>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      <Modal id="checkout" title="Complete Payment" subtitle={`${cart.length} items · ${currentCustomer?.name || 'Walk-in'}`}>
        <div className="text-[30px] font-black text-[#3b82f6] text-center my-3.5 tracking-[-1px]">{formatCurrency(total)}</div>
        <div className="grid grid-cols-3 gap-[7px] mb-4">
          {['cash', 'card', 'qr'].map(m => (
            <button key={m} onClick={() => setSelectedPay(m)}
              className={`p-2.5 rounded-[10px] border text-[11.5px] font-semibold cursor-pointer flex flex-col items-center gap-[5px] transition-all ${selectedPay === m ? 'border-[#3b82f6] bg-[rgba(59,130,246,.12)] text-[#3b82f6]' : 'border-[var(--border2)] bg-theme-elevated text-theme2'}`}>
              {m === 'cash' ? 'Cash' : m === 'card' ? 'Card' : 'QR Pay'}
            </button>
          ))}
        </div>
        {selectedPay === 'cash' && (
          <div>
            <div className="flex gap-[7px] mb-2.5">
              {[5, 10, 20, 50, 100].map(v => (
                <button key={v} onClick={() => setCashInput(String(Math.max(v, Math.ceil(total))))}
                  className="flex-1 py-2 rounded-[7px] border border-theme2 bg-theme-elevated text-theme2 cursor-pointer text-[12.5px] font-semibold hover:bg-theme-hover hover:text-theme">{formatCurrency(v)}</button>
              ))}
            </div>
            <div className="mb-3">
              <label className="text-[11.5px] text-theme2 mb-1 block font-medium">Cash tendered</label>
              <input type="number" value={cashInput} onChange={e => setCashInput(e.target.value)} placeholder="Enter amount…"
                className="w-full bg-theme-elevated border border-theme2 rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6]" />
            </div>
            <div className="bg-[rgba(34,197,94,.12)] border border-[rgba(34,197,94,.25)] rounded-[9px] px-3 py-2.5 flex justify-between items-center mb-3.5">
              <span className="text-[13px] font-semibold">Change due</span>
              <span className={`text-lg font-extrabold ${(parseFloat(cashInput) || 0) >= total ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>{formatCurrency(change)}</span>
            </div>
          </div>
        )}
        <button onClick={handlePay} className="w-full py-3 rounded-[9px] bg-[#22c55e] border-none text-white text-sm font-extrabold cursor-pointer hover:bg-[#16a34a]">✓ Confirm Payment</button>
        <button onClick={closeModal} className="w-full py-2 bg-none border-none text-theme3 text-[12.5px] cursor-pointer mt-[7px] text-center hover:text-theme">Cancel</button>
      </Modal>

      {/* RECEIPT MODAL */}
      <Modal id="receipt" title="">
        <div className="text-center text-lg font-extrabold text-[#22c55e] mb-1">✓ Payment Successful!</div>
        <div className="text-center text-xs text-theme3 mb-0.5">Order completed successfully</div>
        {activeModal === 'receipt' && modalData && (
          <div className="bg-theme-elevated rounded-[10px] p-4 my-3.5 text-xs">
            <div className="text-center text-[15px] font-extrabold mb-0.5">Easy POS</div>
            <div className="text-center text-[10.5px] text-theme3 mb-2.5">123 Market St, Rawalpindi · +92 300 0000000</div>
            <div className="r-divider" />
            <div className="flex justify-between font-semibold mb-1"><span>{modalData.id}</span><span>{new Date(modalData.createdAt).toLocaleTimeString()}</span></div>
            <div className="text-theme3 mb-2">Customer: {modalData.customer}</div>
            <div className="r-divider" />
            <div className="py-2 flex flex-col gap-1">
              {modalData.items.map((item, idx) => (
                <div key={idx} className="flex justify-between italic">
                  <span>{item.qty} × {item.name}</span>
                  <span>{formatCurrency(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="r-divider" />
            <div className="flex justify-between mt-2 font-bold mb-1"><span>Subtotal</span><span>{formatCurrency(modalData.sub)}</span></div>
            {modalData.discount_amount > 0 && (
              <div className="flex justify-between text-[#22c55e]"><span>Discount</span><span>-{formatCurrency(modalData.discount_amount)}</span></div>
            )}
            <div className="flex justify-between text-theme2"><span>Tax ({taxRate * 100}%)</span><span>{formatCurrency(modalData.tax_amount)}</span></div>
            <div className="flex justify-between mt-1 text-[14px] font-extrabold text-[#3b82f6]"><span>Total</span><span>{formatCurrency(modalData.total)}</span></div>
            <div className="r-divider" />
            <div className="text-center text-[10.5px] text-theme3 mt-1.5">Thank you for shopping with us!</div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <button onClick={() => { printReceipt(modalData); showToast('Sending to printer...', 'success'); }}
            className="w-full py-3 rounded-[9px] bg-[#3b82f6] border-none text-white text-[13px] font-bold cursor-pointer flex items-center justify-center gap-2 hover:bg-[#2563eb]">
            <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] stroke-white fill-none" strokeWidth="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Thermal Receipt
          </button>
          <button onClick={() => { printInvoice(modalData); showToast('Generating A4 Invoice...', 'success'); }}
            className="w-full py-3 rounded-[9px] bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6] text-[13px] font-bold cursor-pointer flex items-center justify-center gap-2 hover:bg-[#3b82f6] hover:text-white transition-all">
            <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] stroke-current fill-none" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            A4 Invoice
          </button>
        </div>
        <button onClick={closeModal} className="w-full py-2 bg-none border-none text-theme3 text-[12.5px] cursor-pointer text-center hover:text-theme">New Sale →</button>
      </Modal>

      {/* CUSTOMER SELECT MODAL */}
      <Modal id="customer" title="Select Customer" subtitle="Choose a customer or use walk-in default">
        <input value={custSearch} onChange={e => setCustSearch(e.target.value)} placeholder="Search customers…"
          className="w-full bg-theme-elevated border border-theme2 rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none mb-3 focus:border-[#3b82f6]" />
        <div className="max-h-[260px] overflow-y-auto flex flex-col gap-1">
          {customers.filter(c => !custSearch || c.name.toLowerCase().includes(custSearch.toLowerCase()) || c.phone.includes(custSearch)).map(c => (
            <div key={c.id} onClick={() => { setCurrentCustomer(c); closeModal(); showToast('Customer: ' + c.name); }}
              className="px-3 py-2.5 rounded-lg cursor-pointer flex items-center gap-2.5 bg-theme-elevated border border-theme transition-all hover:bg-theme-hover">
              <div className="w-[30px] h-[30px] rounded-full bg-[rgba(59,130,246,.12)] flex items-center justify-center text-[11px] font-extrabold text-[#3b82f6]">
                {c.name.split(' ').map(x => x[0]).join('')}
              </div>
              <div>
                <div className="text-[13px] font-semibold">{c.name}</div>
                <div className="text-[11px] text-theme3">{c.phone || 'No phone'}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={closeModal} className="w-full py-2 bg-none border-none text-theme3 text-[12.5px] cursor-pointer mt-[7px] text-center hover:text-theme">Cancel</button>
      </Modal>
    </div>
  );
}

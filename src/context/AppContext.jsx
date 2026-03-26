import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { PRODUCTS as initialProducts } from '../data/products';
import { CUSTOMERS } from '../data/customers';
import { staffData as initialStaff, returnsData as initialReturns, expensesData as initialExpenses, paymentsData as initialPayments, alertsData as initialAlerts, shiftHistory as initialShiftHistory, ordersData as initialOrders } from '../data/store';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Products
  const [products, setProducts] = useState([...initialProducts]);
  const nextProdId = useRef(21);

  // Cart
  const [cart, setCart] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(CUSTOMERS[0]);
  const [discount, setDiscount] = useState(0);
  const [selectedPay, setSelectedPay] = useState('cash');
  const [heldOrders, setHeldOrders] = useState([]);

  // Orders & Shift
  const [orders, setOrders] = useState([...initialOrders]);
  const [shiftOpen, setShiftOpen] = useState(true);
  const [shiftStartTime, setShiftStartTime] = useState(new Date());
  const [shiftOpeningFloat, setShiftOpeningFloat] = useState(200);
  const orderCounter = useRef(3001);
  const [shiftHistory, setShiftHistory] = useState([...initialShiftHistory]);

  // Module data
  const [staff, setStaff] = useState([...initialStaff]);
  const [returns, setReturns] = useState([...initialReturns]);
  const [expenses, setExpenses] = useState([...initialExpenses]);
  const [payments, setPayments] = useState([...initialPayments]);
  const [alerts, setAlerts] = useState([...initialAlerts]);
  const [customers, setCustomers] = useState([...CUSTOMERS]);

  // Suppliers & Purchase Orders
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'Main Distribution Co.', contact: 'John Smith', phone: '555-0101', email: 'orders@maindistro.com', category: 'General' },
    { id: 2, name: 'Fresh Produce Ltd.', contact: 'Maria Garcia', phone: '555-0102', email: 'sales@freshproduce.com', category: 'Food' },
    { id: 3, name: 'TechWare Solutions', contact: 'Alex Chen', phone: '555-0103', email: 'support@techware.com', category: 'Electronics' }
  ]);
  const [purchaseOrders, setPurchaseOrders] = useState([
    { id: 'PO-1001', supplier: 'Main Distribution Co.', date: '2026-03-15', total: 450.00, status: 'Received' },
    { id: 'PO-1002', supplier: 'Fresh Produce Ltd.', date: '2026-03-19', total: 120.50, status: 'Pending' }
  ]);

  // Audit Logs & History
  const [auditLogs, setAuditLogs] = useState([]);
  const [inventoryHistory, setInventoryHistory] = useState([]);

  const logInventoryChange = useCallback((productId, delta, reason) => {
    const product = products.find(p => p.id === productId);
    const entry = {
      id: Date.now() + Math.random(),
      productId,
      productName: product?.name || 'Unknown',
      delta,
      newStock: (product?.stock || 0) + delta,
      reason,
      timestamp: new Date().toISOString(),
      user: 'Jake Doe'
    };
    setInventoryHistory(prev => [entry, ...prev]);
  }, [products]);

  const addLog = useCallback((action, module, details) => {
    const log = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action,
      module,
      details,
      user: 'Jake Doe' // Mock current user
    };
    setAuditLogs(prev => [log, ...prev]);
    console.log(`[Audit Log] ${action} on ${module}:`, details);
  }, []);

  // Feature toggles
  const [features, setFeatures] = useState(() => {
    const defaults = { promotions: false, repairs: false, returns: true, advpayments: true, expenses: true };
    const stored = {};
    Object.keys(defaults).forEach(k => {
      const v = localStorage.getItem(`feature_${k}`);
      stored[k] = v !== null ? v === 'true' : defaults[k];
    });
    return stored;
  });

  // POS Behavioral Settings
  const [posSettings, setPosSettings] = useState(() => {
    const defaults = { autoPrint: true, scanSound: true, requireShift: true, quickCheckout: false };
    const stored = {};
    Object.keys(defaults).forEach(k => {
      const v = localStorage.getItem(`pos_set_${k}`);
      stored[k] = v !== null ? v === 'true' : defaults[k];
    });
    return stored;
  });

  // Reporting State
  const [reportRange, setReportRange] = useState('today'); // 'today', 'week', 'month', 'custom'
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const getRangeDates = useCallback(() => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    
    if (reportRange === 'today') {
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
    } else if (reportRange === 'week') {
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      start.setHours(0,0,0,0);
    } else if (reportRange === 'month') {
      start.setDate(1);
      start.setHours(0,0,0,0);
    } else if (reportRange === 'custom' && customRange.start && customRange.end) {
      return { start: new Date(customRange.start), end: new Date(customRange.end) };
    }
    return { start, end };
  }, [reportRange, customRange]);

  const getFilteredData = useCallback((data) => {
    const { start, end } = getRangeDates();
    return data.filter(item => {
      const date = new Date(item.createdAt || item.date);
      return date >= start && date <= end;
    });
  }, [getRangeDates]);

  const updatePosSetting = useCallback((key, val) => {
    setPosSettings(prev => {
      const n = { ...prev, [key]: val };
      localStorage.setItem(`pos_set_${key}`, val);
      return n;
    });
  }, []);

  // Business Profile
  const [businessInfo, setBusinessInfo] = useState(() => {
    const defaults = { name: 'EasyPOS Retail Ltd.', address: '123 Business Avenue, Tech City', phone: '+1 (555) 000-111', email: 'support@easypos.com', taxId: 'TX-99887766' };
    const stored = {};
    Object.keys(defaults).forEach(k => {
        const v = localStorage.getItem(`biz_info_${k}`);
        stored[k] = v !== null ? v : defaults[k];
    });
    return stored;
  });

  const updateBusinessInfo = useCallback((updates) => {
    setBusinessInfo(prev => {
        const n = { ...prev, ...updates };
        Object.entries(updates).forEach(([k, v]) => localStorage.setItem(`biz_info_${k}`, v));
        return n;
    });
  }, []);

  // Toast
  const [toast, setToast] = useState({ msg: '', type: '', show: false });
  const toastTimer = useRef(null);

  const showToast = useCallback((msg, type = '') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type, show: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2400);
  }, []);

  // Modal state
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);

  const openModal = useCallback((name, data = null) => { setActiveModal(name); setModalData(data); }, []);
  const closeModal = useCallback(() => { setActiveModal(null); setModalData(null); }, []);

  // Cart operations
  const addToCart = useCallback((id) => {
    const p = products.find(x => x.id === id);
    if (!p || p.stock === 0) return;
    setCart(prev => {
      const ex = prev.find(c => c.id === id);
      if (ex) return prev.map(c => c.id === id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...p, qty: 1 }];
    });
  }, [products]);

  const changeQty = useCallback((id, d) => {
    setCart(prev => {
      const item = prev.find(c => c.id === id);
      if (!item) return prev;
      const newQty = item.qty + d;
      if (newQty <= 0) return prev.filter(c => c.id !== id);
      return prev.map(c => c.id === id ? { ...c, qty: newQty } : c);
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(c => c.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCurrentCustomer(CUSTOMERS[0]);
    setDiscount(0);
  }, []);

  // Hold order
  const holdOrder = useCallback(() => {
    if (!cart.length) { showToast('Cart is empty', 'error'); return; }
    setHeldOrders(prev => [...prev, { items: [...cart], customer: currentCustomer, disc: discount }]);
    clearCart();
    showToast('Order held successfully');
  }, [cart, currentCustomer, discount, clearCart, showToast]);

  const restoreHeldOrder = useCallback(() => {
    setHeldOrders(prev => {
      if (!prev.length) return prev;
      const rest = prev.slice(0, -1);
      const h = prev[prev.length - 1];
      setCart([...h.items]);
      setCurrentCustomer(h.customer);
      setDiscount(h.disc || 0);
      showToast('Order restored');
      return rest;
    });
  }, [showToast]);

  // Calculations
  const getCartTotals = useCallback(() => {
    const sub = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const disc = sub * (discount / 100);
    const tax = (sub - disc) * 0.08;
    const total = (sub - disc) + tax;
    const itemCount = cart.reduce((s, c) => s + c.qty, 0);
    return { sub, disc, tax, total, itemCount };
  }, [cart, discount]);

  // Process order
  const processOrder = useCallback((method) => {
    const { sub, disc, tax, total, itemCount } = getCartTotals();
    const now = new Date();
    const order = {
      id: '#' + orderCounter.current++,
      items: [...cart],
      customer: currentCustomer.name,
      itemCount, sub, disc, tax, total, method,
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString(),
      createdAt: now.toISOString(),
      status: 'Completed'
    };
    setOrders(prev => [order, ...prev]);
    // Reduce stock & Check alerts
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      if (cartItem) {
        const newStock = Math.max(0, p.stock - cartItem.qty);
        logInventoryChange(p.id, -cartItem.qty, `Sale ${order.id}`);
        // Low stock alert
        if (newStock <= p.minStock && p.stock > p.minStock) {
            setAlerts(a => [{ id: Date.now() + p.id, type: 'critical', msg: `Low Stock: ${p.name} (${newStock} remains)`, date: new Date().toLocaleString() }, ...a]);
        }
        return { ...p, stock: newStock };
      }
      return p;
    }));
    // Update Loyalty Points (1 point per $)
    if (currentCustomer && currentCustomer.id !== 1) {
        setCustomers(prev => prev.map(c => c.id === currentCustomer.id ? { ...c, points: (c.points || 0) + Math.floor(total) } : c));
    }
    clearCart();
    return order;
  }, [cart, currentCustomer, getCartTotals, clearCart, logInventoryChange]);

  // Add product
  const addProduct = useCallback((product) => {
    const id = nextProdId.current++;
    const newProduct = { ...product, id };
    setProducts(prev => [...prev, newProduct]);
    addLog('CREATE', 'Products', `Added product: ${product.name}`);
    showToast('Product added: ' + product.name, 'success');
  }, [showToast, addLog]);

  const updateProduct = useCallback((id, updates) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        if (updates.stock !== undefined && updates.stock !== p.stock) {
          logInventoryChange(id, updates.stock - p.stock, 'Manual Adjustment');
        }
        return { ...p, ...updates };
      }
      return p;
    }));
    addLog('UPDATE', 'Products', `Updated product ID: ${id}`);
    showToast('Product updated', 'success');
  }, [showToast, addLog, logInventoryChange]);

  const deleteProduct = useCallback((id) => {
    const p = products.find(prod => prod.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    addLog('DELETE', 'Products', `Deleted product: ${p?.name || id}`);
    showToast('Product removed');
  }, [products, showToast, addLog]);

  const deleteMultipleProducts = useCallback((ids) => {
    setProducts(prev => prev.filter(p => !ids.includes(p.id)));
    addLog('DELETE_BULK', 'Products', `Deleted ${ids.length} products`);
    showToast(`Removed ${ids.length} products`);
  }, [addLog, showToast]);

  // Shift
  const closeShift = useCallback((closingCash, cashierName = 'Staff') => {
    const shiftOrders = orders.filter(o => new Date(o.createdAt) >= shiftStartTime);
    const cashSales = shiftOrders.filter(o => o.method === 'cash').reduce((s, o) => s + o.total, 0);
    const expected = shiftOpeningFloat + cashSales;
    const diff = closingCash - expected;
    const now = new Date();
    
    const report = {
      date: now.toLocaleDateString(),
      cashier: cashierName,
      opened: shiftStartTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      closed: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      duration: `${Math.floor((now - shiftStartTime) / 3600000)}h ${Math.floor(((now - shiftStartTime) % 3600000) / 60000)}m`,
      ordersCount: shiftOrders.length,
      revenue: shiftOrders.reduce((s, o) => s + o.total, 0),
      tax: shiftOrders.reduce((s, o) => s + o.tax, 0),
      discount: shiftOrders.reduce((s, o) => s + o.disc, 0),
      cashSales,
      cardSales: shiftOrders.filter(o => o.method === 'card').reduce((s, o) => s + o.total, 0),
      float: shiftOpeningFloat,
      closingCash,
      diff
    };

    setShiftHistory(prev => [report, ...prev]);
    setShiftOpen(false);
    addLog('SHIFT_CLOSE', 'System', `Shift closed by ${cashierName}. Diff: $${diff.toFixed(2)}`);
    showToast(`Shift closed. ${diff >= 0 ? 'Overage' : 'Shortage'}: $${Math.abs(diff).toFixed(2)}`, 'success');
  }, [orders, shiftOpeningFloat, shiftStartTime, showToast, addLog]);

  const openShift = useCallback((float) => {
    setShiftOpeningFloat(float);
    setShiftStartTime(new Date());
    setShiftOpen(true);
    addLog('SHIFT_OPEN', 'System', `Shift opened with float: $${float.toFixed(2)}`);
    showToast('Shift opened! Float: $' + float.toFixed(2), 'success');
  }, [showToast, addLog]);

  // Staff CRUD
  const addStaffMember = useCallback((s) => {
    const id = Math.max(...staff.map(x => x.id), 0) + 1;
    const newStaff = { ...s, id, status: 'Active' };
    setStaff(prev => [...prev, newStaff]);
    addLog('CREATE', 'Staff', `Added staff: ${s.name}`);
    showToast(s.name + ' added to staff', 'success');
  }, [staff, showToast, addLog]);

  const updateStaffMember = useCallback((id, updates) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    addLog('UPDATE', 'Staff', `Updated staff ID: ${id}`);
    showToast('Staff member updated', 'success');
  }, [showToast, addLog]);

  const removeStaffMember = useCallback((id) => {
    const s = staff.find(member => member.id === id);
    setStaff(prev => prev.filter(st => st.id !== id));
    addLog('DELETE', 'Staff', `Removed staff: ${s?.name || id}`);
    showToast('Staff removed');
  }, [staff, showToast, addLog]);

  const removeMultipleStaff = useCallback((ids) => {
    setStaff(prev => prev.filter(s => !ids.includes(s.id)));
    addLog('DELETE_BULK', 'Staff', `Removed ${ids.length} staff members`);
    showToast(`Removed ${ids.length} staff members`);
  }, [addLog, showToast]);

  // Customers CRUD
  const addCustomer = useCallback((c) => {
    const id = Math.max(...customers.map(x => x.id), 0) + 1;
    const newCustomer = { ...c, id, visits: 0, spent: 0, lastVisit: 'New' };
    setCustomers(prev => [...prev, newCustomer]);
    addLog('CREATE', 'Customers', `Added customer: ${c.name}`);
    showToast(c.name + ' added to customers', 'success');
  }, [customers, showToast, addLog]);

  const updateCustomer = useCallback((id, updates) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    addLog('UPDATE', 'Customers', `Updated customer ID: ${id}`);
    showToast('Customer updated', 'success');
  }, [showToast, addLog]);

  const deleteCustomer = useCallback((id) => {
    const c = customers.find(cust => cust.id === id);
    setCustomers(prev => prev.filter(cust => cust.id !== id));
    addLog('DELETE', 'Customers', `Deleted customer: ${c?.name || id}`);
    showToast('Customer removed');
  }, [customers, showToast, addLog]);

  const deleteMultipleCustomers = useCallback((ids) => {
    setCustomers(prev => prev.filter(c => !ids.includes(c.id)));
    addLog('DELETE_BULK', 'Customers', `Deleted ${ids.length} customers`);
    showToast(`Removed ${ids.length} customers`);
  }, [addLog, showToast]);

  // Returns
  const addReturn = useCallback((r) => {
    const id = 'R' + String(Math.max(...returns.map(x => parseInt(x.id.substring(1)) || 0), 0) + 1).padStart(3, '0');
    setReturns(prev => [...prev, { ...r, id, status: 'Pending' }]);
    addLog('CREATE', 'Returns', `Created return request: ${id}`);
    showToast('Return ' + id + ' created (Pending Approval)', 'success');
  }, [returns, showToast, addLog]);

  const approveReturn = useCallback((id) => {
    const ret = returns.find(r => r.id === id);
    if (!ret || ret.status !== 'Pending') return;

    setReturns(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    
    // Logic to increment stock if items are recognized
    // For now, we search for the product name in the ret.items string
    if (ret.items) {
      setProducts(prev => prev.map(p => {
        if (ret.items.toLowerCase().includes(p.name.toLowerCase())) {
          logInventoryChange(p.id, 1, `Return Approved: ${id}`);
          return { ...p, stock: p.stock + 1 };
        }
        return p;
      }));
    }

    addLog('APPROVE', 'Returns', `Approved return: ${id}`);
    showToast('Return ' + id + ' approved and stock updated', 'success');
  }, [returns, addLog, showToast]);

  const rejectReturn = useCallback((id) => {
    setReturns(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
    addLog('REJECT', 'Returns', `Rejected return: ${id}`);
    showToast('Return ' + id + ' rejected');
  }, [addLog, showToast]);

  // Expenses
  const addExpense = useCallback((e) => {
    const id = 'E' + String(Math.max(...expenses.map(x => parseInt(x.id.substring(1))), 0) + 1).padStart(3, '0');
    setExpenses(prev => [...prev, { ...e, id, status: 'Approved' }]);
    showToast('Expense $' + e.amount.toFixed(2) + ' recorded', 'success');
  }, [expenses, showToast]);

  // Payments
  const addPayment = useCallback(() => {
    showToast('Advanced payment recorded', 'success');
  }, [showToast]);

  // Alerts
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
    showToast('All alerts cleared');
  }, [showToast]);

  // Feature toggles
  const toggleFeature = useCallback((feature) => {
    setFeatures(prev => {
      const n = { ...prev, [feature]: !prev[feature] };
      localStorage.setItem(`feature_${feature}`, n[feature]);
      return n;
    });
  }, []);

  // Stats
  const getOrderStats = useCallback((data = orders) => {
    const rev = data.reduce((s, o) => s + o.total, 0);
    const cnt = data.length;
    const itemsCnt = data.reduce((s, o) => s + (o.itemCount || 0), 0);
    const cashRev = data.filter(o => o.method === 'cash').reduce((s, o) => s + o.total, 0);
    const cardRev = data.filter(o => o.method !== 'cash').reduce((s, o) => s + o.total, 0);
    const avg = cnt ? rev / cnt : 0;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.reorder).length;
    return { rev, cnt, itemsCnt, cashRev, cardRev, avg, lowStock };
  }, [orders, products]);

  const printReceipt = useCallback((order) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    const itemsHtml = order.cart ? order.cart.map(item => `
        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>${item.qty}x ${item.name}</span>
            <span>$${(item.price * item.qty).toFixed(2)}</span>
        </div>
    `).join('') : order.items.map(item => `
        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>${item.qty}x ${item.name}</span>
            <span>$${(item.price * item.qty).toFixed(2)}</span>
        </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt ${order.id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 80mm; margin: 0; padding: 20px; font-size: 13px; color: #000; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .item-list { border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .total-section { font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="header">
            <h2 style="margin:0;">${businessInfo.name}</h2>
            <div style="font-size:11px;">${businessInfo.address}</div>
            <div style="font-size:11px;">Tel: ${businessInfo.phone}</div>
          </div>
          <div style="margin-bottom:10px;">
            <div>Order: ${order.id}</div>
            <div>Date: ${order.date} ${order.time}</div>
            <div>User: ${order.user || 'Admin'}</div>
            <div>Customer: ${order.customer?.name || order.customer || 'Walk-in'}</div>
          </div>
          <div class="item-list">${itemsHtml}</div>
          <div class="total-section">
            <div style="display:flex; justify-content:space-between;"><span>Subtotal:</span><span>$${order.sub.toFixed(2)}</span></div>
            <div style="display:flex; justify-content:space-between;"><span>Tax:</span><span>$${order.tax.toFixed(2)}</span></div>
            <div style="display:flex; justify-content:space-between;"><span>Discount:</span><span>-$${order.disc.toFixed(2)}</span></div>
            <div style="display:flex; justify-content:space-between; font-size:16px; margin-top:5px; border-top:1px solid #000; padding-top:5px;">
                <span>TOTAL:</span><span>$${order.total.toFixed(2)}</span>
            </div>
          </div>
          <div style="margin-top:10px; border-top:1px dashed #000; padding-top:5px; font-size:11px;">
            <div>Method: ${order.method.toUpperCase()}</div>
          </div>
          <div class="footer">
            <div>*** THANK YOU ***</div>
            <div style="margin-top:5px;">Visit us again!</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, [businessInfo]);

  const printInvoice = useCallback((order) => {
    const printWindow = window.open('', '_blank', 'width=800,height=1000');
    const items = order.cart || order.items || [];
    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align:center;">${item.qty}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align:right;">$${item.price.toFixed(2)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align:right;">$${(item.price * item.qty).toFixed(2)}</td>
        </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${order.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; line-height: 1.5; }
            .invoice-box { max-width: 800px; margin: auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
            .logo { font-size: 28px; font-weight: 800; color: #3b82f6; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { background: #f8fafc; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
            .totals { float: right; width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
            .grand-total { font-size: 20px; font-weight: 800; color: #3b82f6; border-bottom: none; margin-top: 10px; }
            .footer { margin-top: 80px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="invoice-box">
            <div class="header">
              <div>
                <div class="logo">${businessInfo.name}</div>
                <div style="font-size:12px; color:#64748b;">Premium Point of Sale Solutions</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:24px; font-weight:700; color:#1e293b;">INVOICE</div>
                <div style="font-size:14px; color:#64748b;"># ${order.id}</div>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; margin-bottom:40px;">
              <div>
                <div style="font-size:11px; font-weight:700; color:#3b82f6; text-transform:uppercase; margin-bottom:8px;">Billed From</div>
                <div style="font-size:14px; font-weight:700;">${businessInfo.name}</div>
                <div style="font-size:13px; color:#64748b;">${businessInfo.address}<br/>${businessInfo.phone}<br/>${businessInfo.email}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:11px; font-weight:700; color:#3b82f6; text-transform:uppercase; margin-bottom:8px;">Billed To</div>
                <div style="font-size:14px; font-weight:700;">${order.customer?.name || order.customer || 'Walk-in Customer'}</div>
                <div style="font-size:13px; color:#64748b;">${order.customer?.email || 'N/A'}<br/>${order.customer?.phone || 'N/A'}</div>
              </div>
            </div>

            <div style="background:#f8fafc; padding:15px; border-radius:8px; margin-bottom:40px; display:flex; gap:40px;">
              <div>
                <div style="font-size:10px; color:#64748b; text-transform:uppercase;">Invoice Date</div>
                <div style="font-size:13px; font-weight:600;">${order.date}</div>
              </div>
              <div>
                <div style="font-size:10px; color:#64748b; text-transform:uppercase;">Payment Method</div>
                <div style="font-size:13px; font-weight:600;">${order.method.toUpperCase()}</div>
              </div>
              <div>
                <div style="font-size:10px; color:#64748b; text-transform:uppercase;">Order Status</div>
                <div style="font-size:13px; font-weight:600; color:#22c55e;">COMPLETED</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width:50%;">Description</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:right;">Price</th>
                  <th style="text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="totals">
              <div class="total-row"><span>Subtotal:</span><span>$${order.sub.toFixed(2)}</span></div>
              <div class="total-row"><span>Tax (Included):</span><span>$${order.tax.toFixed(2)}</span></div>
              <div class="total-row"><span>Discount:</span><span>-$${order.disc.toFixed(2)}</span></div>
              <div class="total-row grand-total"><span>Amount Paid:</span><span>$${order.total.toFixed(2)}</span></div>
            </div>

            <div style="clear:both;"></div>

            <div class="footer">
              <div style="font-weight:700; color:#1e293b; margin-bottom:5px;">Thank you for your business!</div>
              <div>Please keep this invoice for your records. For any queries, contact ${businessInfo.email}</div>
              <div style="margin-top:10px; font-size:10px;">Generated automatically by ${businessInfo.name}</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, [businessInfo]);

  const printSupplierInvoice = useCallback((po) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Supplier Invoice - ${po.id}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1e293b; background: white; }
            .invoice-box { max-width: 800px; margin: auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #8b5cf6; padding-bottom: 20px; }
            .logo { font-size: 28px; font-weight: 800; color: #8b5cf6; }
            .badge { font-size: 10px; font-weight: 800; color: #8b5cf6; background: #8b5cf615; padding: 4px 10px; border-radius: 99px; text-transform: uppercase; margin-bottom: 10px; display: inline-block; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { background: #f8fafc; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
            td { padding: 14px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="invoice-box">
             <span class="badge">Purchase Order Receipt</span>
            <div class="header">
              <div>
                <div class="logo">${businessInfo.name}</div>
                <div style="font-size:12px; color:#64748b;">A4 Document Service</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:24px; font-weight:700; color:#1e293b;">PO INVOICE</div>
                <div style="font-size:14px; color:#64748b;"># ${po.id}</div>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; margin-bottom:40px;">
              <div>
                 <div style="font-size:11px; font-weight:700; color:#8b5cf6; text-transform:uppercase; margin-bottom:8px;">Supplied To</div>
                 <div style="font-size:14px; font-weight:700;">${businessInfo.name}</div>
                 <div style="font-size:13px; color:#64748b;">${businessInfo.address}<br/>${businessInfo.phone}<br/>${businessInfo.taxId}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:11px; font-weight:700; color:#8b5cf6; text-transform:uppercase; margin-bottom:8px;">Supplied From (Vendor)</div>
                <div style="font-size:14px; font-weight:700;">${po.supplier}</div>
                <div style="font-size:13px; color:#64748b;">Official Restock Partner</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width:70%;">Description of Goods / Restock PO Content</th>
                  <th style="text-align:right;">Amount (USD)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Restock order via PO ${po.id} - Received on ${po.date}</td>
                  <td style="text-align:right; font-weight:700;">$${po.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div style="float:right; width:260px; background:#f8fafc; padding:20px; border-radius:12px;">
                <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:10px;">
                    <span style="color:#64748b;">Total Amount:</span>
                    <span style="font-weight:700;">$${po.total.toFixed(2)}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:800; border-top:1px solid #e2e8f0; padding-top:10px; color:#8b5cf6;">
                    <span>PO BAL:</span>
                    <span>$0.00 (PAID)</span>
                </div>
            </div>
            <div style="clear:both;"></div>

            <div style="margin-top:60px; text-align:center; color:#94a3b8; font-size:11px;">
              This is a computer-generated purchase receipt. No signature required.
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, [businessInfo]);

  const printStaffPayslip = useCallback((s) => {
    const printWindow = window.open('', '_blank');
    const comm = s.salary * (s.commAmount / 100);
    const total = s.salary + comm;
    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip - ${s.name}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1e293b; background: white; }
            .box { max-width: 800px; margin: auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 12px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .title { font-size: 24px; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; }
            .emp-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 40px; }
            .label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; }
            .val { font-size: 14px; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; font-size: 11px; text-transform: uppercase; padding: 12px; border-bottom: 2px solid #e2e8f0; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .total-box { margin-top: 30px; border-top: 2px solid #3b82f6; padding-top: 20px; display: flex; justify-content: space-between; font-size: 20px; font-weight: 800; color: #3b82f6; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="box">
            <div class="header">
              <div>
                <div class="title">Official Payslip</div>
                <div style="font-size:12px; color:#64748b;">${businessInfo.name}</div>
              </div>
              <div style="text-align:right;">
                <img src="https://via.placeholder.com/60?text=POS" style="opacity:0.2;" />
              </div>
            </div>

            <div class="emp-grid">
              <div><div class="label">Employee Name</div><div class="val">${s.name}</div></div>
              <div><div class="label">Position</div><div class="val">${s.position}</div></div>
              <div><div class="label">Pay Period</div><div class="val">${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</div></div>
              <div><div class="label">Status</div><div class="val" style="color:#22c55e;">ACTIVE</div></div>
            </div>

            <table>
              <thead><tr><th>Description</th><th style="text-align:right;">Earnings</th></tr></thead>
              <tbody>
                <tr><td>Basic Salary</td><td style="text-align:right;">$${s.salary.toFixed(2)}</td></tr>
                <tr><td>Performance Commission (${s.commAmount}%)</td><td style="text-align:right;">$${comm.toFixed(2)}</td></tr>
                <tr><td>Extra Duties / Overtime</td><td style="text-align:right;">$0.00</td></tr>
              </tbody>
            </table>

            <div class="total-box">
              <span>NET PAYABLE</span>
              <span>$${total.toFixed(2)}</span>
            </div>

            <div style="margin-top:60px; font-size:12px; color:#64748b;">
               <strong>Notes:</strong><br/>
               This payslip is a record of your monthly earnings at ${businessInfo.name}. For discrepancies, contact the payroll department within 5 working days.
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, [businessInfo]);

  const printSummaryReport = useCallback((type, data, range) => {
    const printWindow = window.open('', '_blank');
    const title = type.charAt(0).toUpperCase() + type.slice(1) + ' Business Summary';
    
    let tableHtml = '';
    if (type === 'sales') {
        tableHtml = `
            <table>
                <thead><tr><th>Date</th><th>Order ID</th><th>Customer</th><th>Total</th></tr></thead>
                <tbody>
                    ${data.map(o => `<tr><td>${new Date(o.createdAt).toLocaleDateString()}</td><td>${o.id}</td><td>${o.customer}</td><td style="text-align:right;">$${o.total.toFixed(2)}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
    } else if (type === 'purchases') {
        tableHtml = `
            <table>
                <thead><tr><th>Date</th><th>PO ID</th><th>Supplier</th><th>Status</th><th>Total</th></tr></thead>
                <tbody>
                    ${data.map(po => `<tr><td>${po.date}</td><td>${po.id}</td><td>${po.supplier}</td><td>${po.status}</td><td style="text-align:right;">$${po.total.toFixed(2)}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
    } else if (type === 'staff') {
        tableHtml = `
            <table>
                <thead><tr><th>Employee</th><th>Role</th><th>Salary</th><th>Comm %</th><th>Status</th></tr></thead>
                <tbody>
                    ${data.map(s => `<tr><td>${s.name}</td><td>${s.access || 'Staff'}</td><td>$${s.salary?.toFixed(2)}</td><td>${s.commAmount}%</td><td>${s.status}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
    } else if (type === 'customers') {
        tableHtml = `
            <table>
                <thead><tr><th>Customer</th><th>Points</th><th>Total Spent</th><th>Last Visit</th></tr></thead>
                <tbody>
                    ${data.map(c => `<tr><td>${c.name}</td><td>${c.points || 0}</td><td>$${(c.spent || 0).toFixed(2)}</td><td>${c.lastVisit}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
    }

    const totals = type === 'sales' ? data.reduce((s,o) => s + o.total, 0) : 
                   type === 'purchases' ? data.reduce((s,p) => s + p.total, 0) :
                   type === 'staff' ? data.reduce((s,st) => s + st.salary, 0) :
                   data.reduce((s,cu) => s + (cu.spent || 0), 0);

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1e293b; background: white; }
            .report-box { max-width: 900px; margin: auto; }
            .header { border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo { font-size: 24px; font-weight: 800; color: #10b981; }
            .range-badge { font-size: 11px; font-weight: 700; background: #10b98115; color: #10b981; padding: 5px 12px; border-radius: 99px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; padding: 12px; border-bottom: 2px solid #e2e8f0; background: #f8fafc; }
            td { padding: 12px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
            .summary-footer { margin-top: 40px; padding: 20px; background: #f8fafc; border-radius: 12px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="report-box">
            <div class="header">
              <div>
                <div class="logo">${businessInfo.name}</div>
                <div style="font-size:12px; color:#64748b;">${title}</div>
              </div>
              <div class="range-badge">Range: ${range.start.toLocaleDateString()} - ${range.end.toLocaleDateString()}</div>
            </div>
            
            <div style="font-size:14px; margin-bottom:20px;">
                <strong>Consolidated Report Details:</strong><br/>
                This document provides a structure-verified summary of <strong>${type.toUpperCase()}</strong> activities during the selected period.
            </div>

            ${tableHtml}

            <div class="summary-footer">
              <div>
                <div style="font-size:10px; color:#64748b; text-transform:uppercase;">Generated On</div>
                <div style="font-size:13px; font-weight:700;">${new Date().toLocaleString()}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:10px; color:#64748b; text-transform:uppercase;">Total Volume (${data.length} entries)</div>
                <div style="font-size:22px; font-weight:900; color:#10b981;">$${totals.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, [businessInfo]);

  // Backup & Export
  // Suppliers CRUD
  const addSupplier = useCallback((s) => {
    const newS = { ...s, id: Date.now() };
    setSuppliers(prev => [...prev, newS]);
    addLog('CREATE', 'Suppliers', `Added supplier: ${s.name}`);
    showToast('Supplier added');
  }, [addLog, showToast]);

  const updateSupplier = useCallback((id, updates) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    addLog('UPDATE', 'Suppliers', `Updated supplier ID: ${id}`);
    showToast('Supplier updated');
  }, [addLog, showToast]);

  const removeSupplier = useCallback((id) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    addLog('DELETE', 'Suppliers', `Removed supplier ID: ${id}`);
    showToast('Supplier removed');
  }, [addLog, showToast]);

  // Purchase Orders CRUD
  const addPurchaseOrder = useCallback((po) => {
    const newPO = { ...po, id: 'PO-' + (1000 + purchaseOrders.length + 1) };
    setPurchaseOrders(prev => [newPO, ...prev]);
    addLog('CREATE', 'Purchase Orders', `Created PO: ${newPO.id}`);
    showToast('Purchase Order created');
  }, [purchaseOrders.length, addLog, showToast]);

  const updatePOStatus = useCallback((id, status) => {
    setPurchaseOrders(prev => prev.map(po => po.id === id ? { ...po, status } : po));
    addLog('UPDATE', 'Purchase Orders', `Updated PO ${id} status to ${status}`);
    showToast(`PO ${id} marked as ${status}`);
  }, [addLog, showToast]);

  const exportFullBackup = useCallback(() => {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        products, orders, staff, returns, expenses, payments, alerts, customers, auditLogs
      }
    };
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `easypos-full-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Backup export started!', 'success');
  }, [products, orders, staff, returns, expenses, payments, alerts, customers, auditLogs, showToast]);

  const exportModuleAsCSV = useCallback((moduleName, data) => {
    if (!data || data.length === 0) { showToast(`No data to export for ${moduleName}`, 'error'); return; }
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        const escaped = String(value || '').replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      }).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `easypos-${moduleName}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`${moduleName} exported as CSV!`, 'success');
  }, [showToast]);

  const value = {
    // Products
    products, addProduct, updateProduct, deleteProduct,
    // Cart
    cart, addToCart, changeQty, removeFromCart, clearCart,
    currentCustomer, setCurrentCustomer,
    discount, setDiscount,
    selectedPay, setSelectedPay,
    heldOrders, holdOrder, restoreHeldOrder,
    getCartTotals,
    // Orders
    orders, processOrder, getOrderStats,
    // Shift
    shiftOpen, shiftStartTime, shiftOpeningFloat, setShiftOpeningFloat,
    closeShift, openShift, shiftHistory,
    // Modules
    staff, addStaffMember, updateStaffMember, removeStaffMember,
    returns, addReturn, approveReturn, rejectReturn,
    expenses, addExpense,
    payments, addPayment,
    alerts, clearAllAlerts,
    // Customers
    customers, addCustomer, updateCustomer, deleteCustomer, deleteMultipleCustomers,
    // Audit Logs
    auditLogs, addLog,
    // Inventory History
    inventoryHistory, logInventoryChange,
    // Feature toggling
    features, toggleFeature,
    // POS Settings
    posSettings, updatePosSetting,
    // Printing
    printReceipt, printInvoice, printSupplierInvoice, printStaffPayslip, printSummaryReport,
    // UI
    toast, showToast,
    activeModal, modalData, openModal, closeModal,
    // Backup & Export
    exportFullBackup, exportModuleAsCSV,
    // Business Identity
    businessInfo, updateBusinessInfo,
    // Suppliers
    suppliers, addSupplier, updateSupplier, removeSupplier,
    // Purchase Orders
    purchaseOrders, addPurchaseOrder, updatePOStatus,
    // Bulk
    deleteMultipleProducts, removeMultipleStaff, deleteMultipleCustomers,
    // Reporting
    reportRange, setReportRange, customRange, setCustomRange, getFilteredData, getRangeDates
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);

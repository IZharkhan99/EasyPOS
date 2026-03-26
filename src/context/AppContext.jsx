import { createContext, useContext, useState, useCallback, useRef } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Toast State
  const [toast, setToast] = useState({ msg: '', type: '', show: false });
  const toastTimer = useRef(null);

  const showToast = useCallback((msg, type = '') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type, show: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2400);
  }, []);

  // Modal State
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);

  const openModal = useCallback((name, data = null) => { 
    setActiveModal(name); 
    setModalData(data); 
  }, []);

  const closeModal = useCallback(() => { 
    setActiveModal(null); 
    setModalData(null); 
  }, []);

  // Feature Toggles (Local Persistence)
  const [features, setFeatures] = useState(() => {
    const defaults = { promotions: false, repairs: false, returns: true, advpayments: true, expenses: true };
    const stored = {};
    Object.keys(defaults).forEach(k => {
      const v = localStorage.getItem(`feature_${k}`);
      stored[k] = v !== null ? v === 'true' : defaults[k];
    });
    return stored;
  });

  const toggleFeature = useCallback((feature) => {
    setFeatures(prev => {
      const n = { ...prev, [feature]: !prev[feature] };
      localStorage.setItem(`feature_${feature}`, n[feature]);
      return n;
    });
  }, []);

  // Reporting Period State
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
      const date = new Date(item.created_at || item.createdAt || item.date);
      return date >= start && date <= end;
    });
  }, [getRangeDates]);

  // Printing Utilities
  const printReceipt = useCallback((order, businessInfo = {}) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    // Simplified print logic for cleaner context - normally would take full businessInfo
    // Standard biz info if not provided
    const biz = businessInfo.name ? businessInfo : { name: 'EasyPOS', address: 'System Default' };
    
    const items = order.items || order.cart || [];
    const itemsHtml = items.map(item => `
        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>${item.qty}x ${item.name}</span>
            <span>$${((item.price || 0) * item.qty).toFixed(2)}</span>
        </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <body onload="window.print(); window.close();">
          <div style="text-align:center; border-bottom:1px dashed #000; padding-bottom:10px; margin-bottom:10px;">
            <h2 style="margin:0;">${biz.name}</h2>
            <div style="font-size:11px;">${biz.address}</div>
          </div>
          <div>Order: ${order.id}</div>
          <div style="border-bottom:1px dashed #000; padding:10px 0;">${itemsHtml}</div>
          <div style="font-weight:bold; margin-top:10px;">
            <div style="display:flex; justify-content:space-between;"><span>TOTAL:</span><span>$${(order.total || 0).toFixed(2)}</span></div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, []);

  // CSV Export Utility
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
    toast, showToast,
    activeModal, modalData, openModal, closeModal,
    features, toggleFeature,
    reportRange, setReportRange, customRange, setCustomRange, getFilteredData, getRangeDates,
    printReceipt, exportModuleAsCSV
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);

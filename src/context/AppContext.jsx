import { useState, useContext, createContext, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import createLogger from '../utils/logger';
import { TOAST_DURATIONS, DEFAULTS } from '../utils/constants';
import { printReceipt as printR, printStaffPayslip as printS, printInvoice as printI } from '../utils/printUtils';

const logger = createLogger('AppContext');
const AppContext = createContext();

export function AppProvider({ children }) {
  const { profile } = useAuth();
  
  // Toast State
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'success') => {
    logger.info(`Showing toast: ${message}`, { type });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    
    setToast({ message, type });
    
    const duration = TOAST_DURATIONS[type] || TOAST_DURATIONS.success;
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, duration);
  };

  // Modal State
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);

  const openModal = useCallback((name, data = null) => { 
    logger.info(`Opening modal: ${name}`);
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
  const printReceipt = (data) => {
    logger.info('Printing receipt', { orderId: data.id });
    printR(data, profile, null);
  };

  const printStaffPayslip = (staff) => {
    logger.info('Printing payslip', { staffId: staff.id });
    printS(staff, profile, null);
  };

  const printInvoice = (data) => {
    logger.info('Printing invoice', { orderId: data.id });
    printI(data, profile, null);
  };

  // CSV Export Utility
  const exportModuleAsCSV = useCallback((moduleName, data) => {
    if (!data || data.length === 0) { showToast(`No data to export for ${moduleName}`, 'error'); return; }
    const headers = Object.keys(data[0]);
    if (window.confirm(`Export ${moduleName} data as CSV?`)) {
      const csvContent = "data:text/csv;charset=utf-8," + 
        (headers ? headers.join(",") + "\n" : "") + 
        data.map(e => Object.values(e).join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${moduleName}_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      showToast(`${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} exported successfully`, 'success');
    }
  }, [showToast]);

  const value = {
    toast, showToast,
    activeModal, modalData, openModal, closeModal,
    features, toggleFeature,
    reportRange, setReportRange, customRange, setCustomRange, getFilteredData, getRangeDates,
    printReceipt, printInvoice, exportModuleAsCSV
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);

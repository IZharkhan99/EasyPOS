/**
 * Formatting utilities for consistent UI display.
 */
import { DEFAULTS } from './constants';

/**
 * Format currency with a prefix symbol.
 * Defaults to $ if no symbol is provided.
 */
export const formatCurrency = (amount, symbol) => {
  const currencySymbol = symbol || DEFAULTS.CURRENCY_SYMBOL;
  const num = typeof amount === 'number' ? amount : parseFloat(amount || 0);
  return `${currencySymbol}${num.toFixed(2)}`;
};

/**
 * Format percentage (e.g. 0.08 -> 8.0%)
 */
export const formatPercent = (value, decimals = 1) => {
  const num = typeof value === 'number' ? value : parseFloat(value || 0);
  return `${(num * 100).toFixed(decimals)}%`;
};

/**
 * Format dates
 */
export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString();
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString();
};

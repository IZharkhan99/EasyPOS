/**
 * Global Constants for EasyPOS
 */

export const DEFAULTS = {
  TAX_RATE: 0.08,             // 8% default
  CURRENCY_SYMBOL: '$',
  WAREHOUSE: 'Main',
  CATEGORY: 'General',
  PAGINATION_ITEMS_PER_PAGE: 15,
  MONTHLY_BUDGET: 5000,
};

export const PRODUCT_CATEGORIES = [
  'Electronics', 'Mobiles', 'Laptops', 'Accessories', 'Storage', 'Networking', 'Supplies'
];

export const WAREHOUSE_OPTIONS = [
  'Main', 'Branch A', 'Branch B'
];

export const CASH_DENOMINATIONS = [5, 10, 20, 50, 100];

export const TOAST_DURATIONS = {
  success: 2400,
  info: 3000,
  warning: 4000,
  error: 6000,
};

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  STOCK_KEEPER: 'stock keeper',
  SALES_REP: 'sales rep',
};

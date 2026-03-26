export const staffData = [
  { id: 1, name: 'Ahmed Khan', pin: '1111', access: 'Manager', position: 'Manager', shift: 'Full-time', phone: '+92 300 1111111', status: 'Active', salary: 1000, commType: 'percentage', commAmount: 2, hired: '2024-01-15' },
  { id: 2, name: 'Fatima Ali', pin: '2222', access: 'Cashier', position: 'Cashier', shift: 'Morning', phone: '+92 301 2222222', status: 'Active', salary: 400, commType: 'percentage', commAmount: 1.5, hired: '2024-03-01' },
  { id: 3, name: 'Hassan Raza', pin: '3333', access: 'Cashier', position: 'Cashier', shift: 'Afternoon', phone: '+92 302 3333333', status: 'Active', salary: 400, commType: 'fixed', commAmount: 2, hired: '2024-02-10' },
  { id: 4, name: 'Zainab Malik', pin: '4444', access: 'Cashier', position: 'Stock Keeper', shift: 'Evening', phone: '+92 303 4444444', status: 'Active', salary: 350, commType: 'fixed', commAmount: 1, hired: '2024-01-20' },
  { id: 5, name: 'Omar Ahmed', pin: '5555', access: 'Cashier', position: 'Sales Rep', shift: 'Full-time', phone: '+92 304 5555555', status: 'Active', salary: 450, commType: 'percentage', commAmount: 2.5, hired: '2024-02-05' },
  { id: 6, name: 'Ayesha Khan', pin: '6666', access: 'Cashier', position: 'Cashier', shift: 'Morning', phone: '+92 305 6666666', status: 'Inactive', salary: 400, commType: 'percentage', commAmount: 1.5, hired: '2024-01-10' },
  { id: 7, name: 'Bilal Hassan', pin: '7777', access: 'Manager', position: 'Manager', shift: 'Full-time', phone: '+92 306 7777777', status: 'Active', salary: 1100, commType: 'percentage', commAmount: 3, hired: '2023-12-20' },
  { id: 8, name: 'Sara Ahmed', pin: '8888', access: 'Cashier', position: 'Sales Rep', shift: 'Afternoon', phone: '+92 307 8888888', status: 'Active', salary: 450, commType: 'percentage', commAmount: 2, hired: '2024-02-15' },
];

export const returnsData = [
  { id: 'R001', orderRef: '#3001', customer: 'Walk-in', items: 'iPhone Case (1)', reason: 'Changed Mind', amount: 15.00, method: 'Cash', status: 'Pending', date: '2026-03-18', createdBy: 'Fatima' },
  { id: 'R002', orderRef: '#3000', customer: 'Ahmed Khan', items: 'USB Cable (2)', reason: 'Defective', amount: 24.00, method: 'Original Payment', status: 'Approved', date: '2026-03-18', createdBy: 'Hassan' },
  { id: 'R003', orderRef: '#2999', customer: 'Walk-in', items: 'Wireless Mouse (1)', reason: 'Wrong Item', amount: 35.00, method: 'Store Credit', status: 'Pending', date: '2026-03-18', createdBy: 'Zainab' },
  { id: 'R004', orderRef: '#2998', customer: 'Fatima Ali', items: 'Power Bank (1)', reason: 'Not Working', amount: 45.00, method: 'Cash', status: 'Refunded', date: '2026-03-17', createdBy: 'Hassan' },
  { id: 'R005', orderRef: '#2997', customer: 'Walk-in', items: 'Screen Protector (5)', reason: 'Damaged', amount: 40.00, method: 'Cash', status: 'Rejected', date: '2026-03-17', createdBy: 'Fatima' },
];

export const expensesData = [
  { id: 'E001', date: '2026-03-18', category: 'Utilities', description: 'Monthly electricity bill', amount: 250.00, method: 'Bank Transfer', ref: 'UTIL-001', status: 'Approved', createdBy: 'Ahmed Khan', approvedBy: 'Bilal Hassan' },
  { id: 'E002', date: '2026-03-18', category: 'Supplies', description: 'Receipt paper & cleaning supplies', amount: 45.50, method: 'Cash', ref: 'SUP-001', status: 'Approved', createdBy: 'Zainab Malik', approvedBy: 'Ahmed Khan' },
  { id: 'E003', date: '2026-03-17', category: 'Maintenance', description: 'Printer repair & maintenance', amount: 150.00, method: 'Check', ref: 'MAIN-001', status: 'Pending', createdBy: 'Hassan Raza', approvedBy: null },
  { id: 'E004', date: '2026-03-17', category: 'Supplies', description: 'Office stationery', amount: 75.00, method: 'Cash', ref: 'SUP-002', status: 'Approved', createdBy: 'Fatima Ali', approvedBy: 'Ahmed Khan' },
  { id: 'E005', date: '2026-03-16', category: 'Marketing', description: 'Social media ads campaign', amount: 300.00, method: 'Card', ref: 'MKT-001', status: 'Approved', createdBy: 'Omar Ahmed', approvedBy: 'Bilal Hassan' },
  { id: 'E006', date: '2026-03-16', category: 'Rent', description: 'Store rental payment', amount: 2000.00, method: 'Bank Transfer', ref: 'RENT-001', status: 'Approved', createdBy: 'Ahmed Khan', approvedBy: 'Bilal Hassan' },
  { id: 'E007', date: '2026-03-15', category: 'Supplies', description: 'Carrier bags & packaging', amount: 85.00, method: 'Cash', ref: 'PKG-001', status: 'Approved', createdBy: 'Zainab Malik', approvedBy: 'Ahmed Khan' },
];

export const paymentsData = [
  { id: 'P001', date: '2026-03-18', orderRef: '#3001', customer: 'Ahmed Khan', amount: 150.00, method: 'Partial', status: 'Pending', details: 'Paid $150, Balance $50 due', paid: 150, pending: 50 },
  { id: 'P002', date: '2026-03-18', orderRef: '#3002', customer: 'Fatima Ali', amount: 600.00, method: 'EMI', status: 'Active', details: '12 months @ 12% = $57/month', paid: 114, pending: 570 },
  { id: 'P003', date: '2026-03-18', orderRef: '#3003', customer: 'Hassan Raza', amount: 300.00, method: 'BNPL', status: 'Active', details: '3 payments: 1st now, rest in 30 & 60 days', paid: 100, pending: 200 },
  { id: 'P004', date: '2026-03-17', orderRef: 'GC-001', customer: 'Walk-in', amount: 50.00, method: 'Gift Card', status: 'Active', details: 'Gift Card issued', paid: 0, pending: 50 },
  { id: 'P005', date: '2026-03-17', orderRef: '#2999', customer: 'Omar Ahmed', amount: 120.00, method: 'Split', status: 'Completed', details: 'Cash $40 + Card $60 + Points $20', paid: 120, pending: 0 },
  { id: 'P006', date: '2026-03-17', orderRef: '#3004', customer: 'Zainab Malik', amount: 89.50, method: 'Coupon', status: 'Completed', details: 'Code NEWUSER20 applied', paid: 89.50, pending: 0 },
];

export const alertsData = [
  { id: 'AL001', type: 'Inventory', severity: 'Critical', message: 'iPhone 15 Pro out of stock', time: '14:32', status: 'Active' },
  { id: 'AL002', type: 'Inventory', severity: 'Warning', message: 'Paracetamol BATCH-BC-002 expires in 48 days', time: '13:45', status: 'Active' },
  { id: 'AL003', type: 'Sales', severity: 'Warning', message: 'Today revenue $850 is below target $1200', time: '17:00', status: 'Active' },
  { id: 'AL004', type: 'Staff', severity: 'Info', message: 'Hassan Raza clocked in 5 minutes late', time: '08:05', status: 'Resolved' },
  { id: 'AL005', type: 'Payment', severity: 'Critical', message: 'Card payment failed - declined', time: '16:42', status: 'Active' },
  { id: 'AL006', type: 'Inventory', severity: 'Warning', message: 'USB Cable stock at 2 units (reorder point: 30)', time: '09:30', status: 'Resolved' },
  { id: 'AL007', type: 'System', severity: 'Info', message: 'Receipt printer offline', time: '15:20', status: 'Resolved' },
  { id: 'AL008', type: 'Sales', severity: 'Info', message: 'Loyalty points earned: 500 points for Ahmed Khan', time: '16:30', status: 'Resolved' },
];

export const shiftHistory = [
  { date: 'Mar 16, 2026', cashier: 'Jake Doe', opened: '09:00', closed: '18:00', duration: '9h 0m', orders: 42, revenue: 1284.50, float: 200 },
  { date: 'Mar 15, 2026', cashier: 'Sarah W.', opened: '09:00', closed: '17:30', duration: '8h 30m', orders: 38, revenue: 982.00, float: 200 },
  { date: 'Mar 14, 2026', cashier: 'Jake Doe', opened: '09:00', closed: '18:00', duration: '9h 0m', orders: 51, revenue: 1560.75, float: 200 },
];

export const ordersData = [
  { id: 'ORD-1001', customer: 'Ahmed Khan', itemCount: 3, sub: 120.00, tax: 9.60, total: 129.60, method: 'cash', time: '10:30 AM', createdAt: '2026-03-18T10:30:00Z', items: [{ name: 'iPhone Case', qty: 2, price: 15 }, { name: 'USB-C Cable', qty: 1, price: 12 }] },
  { id: 'ORD-1002', customer: 'Walk-in', itemCount: 1, sub: 45.00, tax: 3.60, total: 48.60, method: 'card', time: '11:15 AM', createdAt: '2026-03-18T11:15:00Z', items: [{ name: 'Wireless Mouse', qty: 1, price: 45 }] },
  { id: 'ORD-1003', customer: 'Fatima Ali', itemCount: 2, sub: 88.00, tax: 7.04, total: 95.04, method: 'qr', time: '02:45 PM', createdAt: '2026-03-17T14:45:00Z', items: [{ name: 'Power Bank', qty: 1, price: 50 }, { name: 'Earbuds', qty: 1, price: 38 }] },
  { id: 'ORD-1004', customer: 'Walk-in', itemCount: 1, sub: 12.00, tax: 0.96, total: 12.96, method: 'cash', time: '04:20 PM', createdAt: '2026-03-16T16:20:00Z', items: [{ name: 'USB-C Cable', qty: 1, price: 12 }] },
  { id: 'ORD-1005', customer: 'Walk-in', itemCount: 5, sub: 250.00, tax: 20.00, total: 270.00, method: 'card', time: '09:10 AM', createdAt: '2026-03-15T09:10:00Z', items: [{ name: 'Mechanical Keyboard', qty: 1, price: 120 }, { name: 'Monitor Stand', qty: 1, price: 130 }] },
  { id: 'ORD-1006', customer: 'Hassan Raza', itemCount: 2, sub: 15.00, tax: 1.20, total: 16.20, method: 'cash', time: '12:30 PM', createdAt: '2026-03-14T12:30:00Z', items: [{ name: 'Phone Screen Protector', qty: 2, price: 7.5 }] },
];

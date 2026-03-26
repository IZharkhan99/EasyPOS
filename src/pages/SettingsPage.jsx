import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useRef } from 'react';

const THEMES = [
  { id: 'dark', label: 'Dark', bg: '#131920' },
  { id: 'light', label: 'Light', bg: '#f0f4f8' },
  { id: 'ocean', label: 'Ocean', bg: '#041220' },
  { id: 'violet', label: 'Violet', bg: '#120f22' },
  { id: 'forest', label: 'Forest', bg: '#1c3718ff' },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { features, toggleFeature, showToast, exportFullBackup, exportModuleAsCSV, orders, products, staff, customers, posSettings, updatePosSetting, businessInfo, updateBusinessInfo } = useApp();
  const fileInputRef = useRef(null);

  const handleExportOrders = () => {
    const headers = ['Order #', 'Customer', 'Items', 'Payment', 'Subtotal', 'Tax', 'Total', 'Time', 'Date', 'Status'];
    const data = orders.map(o => ({
      'Order #': o.id,
      'Customer': o.customer,
      'Items': o.itemCount,
      'Payment': o.method,
      'Subtotal': o.sub.toFixed(2),
      'Tax': o.tax.toFixed(2),
      'Total': o.total.toFixed(2),
      'Time': o.time,
      'Date': o.date,
      'Status': o.status,
    }));
    exportModuleAsCSV('orders', data, headers);
  };

  const handleExportProducts = () => {
    const headers = ['Product', 'Category', 'Price', 'Cost', 'Stock', 'SKU'];
    const data = products.map(p => ({
      'Product': p.name,
      'Category': p.category,
      'Price': p.price.toFixed(2),
      'Cost': p.cost.toFixed(2),
      'Stock': p.stock,
      'SKU': p.sku,
    }));
    exportModuleAsCSV('products', data, headers);
  };

  const handleExportStaff = () => {
    const headers = ['Name', 'Position', 'Shift', 'Status', 'Phone', 'Salary'];
    const data = staff.map(s => ({
      'Name': s.name,
      'Position': s.position,
      'Shift': s.shift,
      'Status': s.status,
      'Phone': s.phone,
      'Salary': s.salary,
    }));
    exportModuleAsCSV('staff', data, headers);
  };

  const handleExportCustomers = () => {
    const headers = ['Name', 'Phone', 'Email', 'Visits', 'Total Spent', 'Last Visit', 'Tier'];
    const data = customers.filter(c => c.id > 0).map(c => ({
      'Name': c.name,
      'Phone': c.phone,
      'Email': c.email,
      'Visits': c.visits,
      'Total Spent': c.spent.toFixed(2),
      'Last Visit': c.lastVisit,
      'Tier': c.tier,
    }));
    exportModuleAsCSV('customers', data, headers);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="text-[21px] font-extrabold tracking-[-0.4px] mb-1">Settings</div>
      <div className="text-[12.5px] text-theme3 mb-4">Configure your store, POS behavior & appearance</div>

      <div className="grid grid-cols-2 gap-4">
        {/* Store Information */}
        <div className="bg-theme-surface border border-theme rounded-xl p-4">
          <div className="text-[14px] font-bold mb-3">Business Profile & Identity</div>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Business Name', key: 'name', value: businessInfo.name },
              { label: 'Full Address', key: 'address', value: businessInfo.address },
              { label: 'Phone Number', key: 'phone', value: businessInfo.phone },
              { label: 'Business Email', key: 'email', value: businessInfo.email },
              { label: 'Tax ID / Registration', key: 'taxId', value: businessInfo.taxId },
            ].map((f, i) => (
              <div key={i}>
                <label className="text-xs font-semibold text-theme2 mb-1 block">{f.label}</label>
                <input 
                  value={f.value} 
                  onChange={e => updateBusinessInfo({ [f.key]: e.target.value })}
                  className="w-full bg-theme-elevated border border-theme2 rounded-lg py-2 px-3 text-xs text-theme outline-none focus:border-[#3b82f6]" 
                />
              </div>
            ))}
            <div className="mt-1 p-2 bg-[rgba(34,197,94,.08)] border border-[rgba(34,197,94,.2)] rounded-lg">
                <div className="text-[10.5px] text-[#22c55e] font-semibold">✓ Custom identity will appear on all Invoices & Receipts</div>
            </div>
          </div>
        </div>

        {/* Theme + Toggles */}
        <div className="flex flex-col gap-4">
          {/* Theme */}
          <div className="bg-theme-surface border border-theme rounded-xl p-4">
            <div className="text-[14px] font-bold mb-3">Appearance</div>
            <div className="flex gap-2">
              {THEMES.map(t => (
                <div key={t.id} onClick={() => { setTheme(t.id); showToast(`Theme: ${t.label}`, 'success'); }}
                  className={`flex-1 rounded-[10px] border-2 p-3 cursor-pointer text-center transition-all ${theme === t.id ? 'border-[#3b82f6]' : 'border-[var(--border)] hover:border-[var(--border2)]'}`}>
                  <div className="w-[24px] h-[24px] rounded-full mx-auto mb-1.5" style={{ background: t.bg, border: t.id === 'light' ? '1px solid #cbd5e1' : 'none' }} />
                  <div className="text-[11px] font-semibold">{t.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* POS Behavior */}
          <div className="bg-theme-surface border border-theme rounded-xl p-4">
            <div className="text-[14px] font-bold mb-3">POS Behavior</div>
            <div className="flex flex-col gap-2.5">
              {[
                { key: 'autoPrint', label: 'Auto-print receipts', desc: 'Print receipt after each sale' },
                { key: 'scanSound', label: 'Sound on scan', desc: 'Play sound on barcode scan' },
                { key: 'requireShift', label: 'Require shift open', desc: 'Must open shift before selling' },
                { key: 'quickCheckout', label: 'Quick checkout', desc: 'Skip payment modal for cash' },
              ].map((t) => (
                <div key={t.key} className="flex items-center justify-between py-2 border-b border-theme last:border-0">
                  <div><div className="text-[12.5px] font-semibold">{t.label}</div><div className="text-[11px] text-theme3">{t.desc}</div></div>
                  <button onClick={() => updatePosSetting(t.key, !posSettings[t.key])} className={`toggle-switch ${posSettings[t.key] ? 'on' : ''}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Optional Features */}
          <div className="bg-theme-surface border border-theme rounded-xl p-4">
            <div className="text-[14px] font-bold mb-3">Optional Features</div>
            <div className="flex flex-col gap-2.5">
              {[
                { key: 'returns', label: '🔄 Returns & Refunds', desc: 'Enable return processing' },
                { key: 'advpayments', label: '💳 Advanced Payments', desc: 'BNPL, EMI, gift cards' },
                { key: 'expenses', label: '💸 Expense Tracking', desc: 'Track operational costs' },
                { key: 'promotions', label: '🏷️ Promotions', desc: 'Discount campaigns' },
                { key: 'repairs', label: '🔧 Repair Tracking', desc: 'Device repair management' },
              ].map(f => (
                <div key={f.key} className="flex items-center justify-between py-2 border-b border-theme last:border-0">
                  <div><div className="text-[12.5px] font-semibold">{f.label}</div><div className="text-[11px] text-theme3">{f.desc}</div></div>
                  <button onClick={() => toggleFeature(f.key)} className={`toggle-switch ${features[f.key] ? 'on' : ''}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Backup & Export */}
      <div className="mt-4">
        <div className="text-[14px] font-bold mb-3">Data Backup & Export</div>
        <div className="grid grid-cols-2 gap-4">
          {/* Full Backup */}
          <div className="bg-theme-surface border border-theme rounded-xl p-4">
            <div className="text-[13px] font-semibold mb-2 flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Full Backup
            </div>
            <p className="text-xs text-theme3 mb-3">Export all data as JSON (orders, products, staff, customers)</p>
            <button onClick={exportFullBackup} className="w-full bg-[#3b82f6] text-white border-none px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer hover:bg-[#2563eb]">Download Full Backup</button>
          </div>

          {/* Export Modules */}
          <div className="bg-theme-surface border border-theme rounded-xl p-4">
            <div className="text-[13px] font-semibold mb-2 flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Export as CSV
            </div>
            <p className="text-xs text-theme3 mb-3">Export individual modules as CSV files</p>
            <div className="flex gap-1.5">
              <button onClick={handleExportOrders} className="flex-1 bg-[#f97316] text-white border-none px-2 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer hover:bg-[#ea580c]">Orders</button>
              <button onClick={handleExportProducts} className="flex-1 bg-[#22c55e] text-white border-none px-2 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer hover:bg-[#16a34a]">Products</button>
              <button onClick={handleExportStaff} className="flex-1 bg-[#8b5cf6] text-white border-none px-2 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer hover:bg-[#7c3aed]">Staff</button>
              <button onClick={handleExportCustomers} className="flex-1 bg-[#14b8a6] text-white border-none px-2 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer hover:bg-[#0d9488]">Customers</button>
            </div>
          </div>
        </div>

        {/* Backup Info */}
        <div className="mt-4 bg-[rgba(59,130,246,.08)] border border-[rgba(59,130,246,.2)] rounded-xl p-3">
          <div className="flex gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-[#3b82f6] fill-none flex-shrink-0 mt-0.5" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <div>
              <div className="text-xs font-semibold text-[#3b82f6] mb-0.5">Data is currently static</div>
              <div className="text-xs text-[#3b82f6] opacity-80">All data will be lost on refresh. Future versions will save backups to the cloud.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

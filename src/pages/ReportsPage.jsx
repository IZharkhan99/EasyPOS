import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

export default function ReportsPage() {
  const { 
    orders: allOrders, 
    purchaseOrders: allPO, 
    staff, customers, 
    reportRange, setReportRange, 
    getFilteredData, getRangeDates,
    printSummaryReport
  } = useApp();

  const [activeTab, setActiveTab] = useState('sales');

  const filteredOrders = useMemo(() => getFilteredData(allOrders), [allOrders, getFilteredData, reportRange]);
  const filteredPO = useMemo(() => getFilteredData(allPO), [allPO, getFilteredData, reportRange]);

  const stats = useMemo(() => {
    const rev = filteredOrders.reduce((s, o) => s + o.total, 0);
    const tax = filteredOrders.reduce((s, o) => s + (o.tax || 0), 0);
    const disc = filteredOrders.reduce((s, o) => s + (o.disc || 0), 0);
    const purchases = filteredPO.reduce((s, o) => s + o.total, 0);
    return { rev, tax, disc, purchases };
  }, [filteredOrders, filteredPO]);

  const rangeInfo = getRangeDates();

  const renderSales = () => (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-theme-surface border border-theme p-4 rounded-xl">
          <div className="text-[10px] text-theme3 uppercase font-bold mb-1">Total Revenue</div>
          <div className="text-xl font-black text-[#3b82f6]">${stats.rev.toFixed(2)}</div>
        </div>
        <div className="bg-theme-surface border border-theme p-4 rounded-xl">
          <div className="text-[10px] text-theme3 uppercase font-bold mb-1">Total Orders</div>
          <div className="text-xl font-black text-[#10b981]">{filteredOrders.length}</div>
        </div>
        <div className="bg-theme-surface border border-theme p-4 rounded-xl">
          <div className="text-[10px] text-theme3 uppercase font-bold mb-1">Tax Collected</div>
          <div className="text-xl font-black text-[#f59e0b]">${stats.tax.toFixed(2)}</div>
        </div>
        <div className="bg-theme-surface border border-theme p-4 rounded-xl">
          <div className="text-[10px] text-theme3 uppercase font-bold mb-1">Discounts Given</div>
          <div className="text-xl font-black text-[#f43f5e]">${stats.disc.toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-theme-surface border border-theme rounded-xl overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-theme-elevated/50 border-b border-theme">
              {['Date', 'Order ID', 'Customer', 'Items', 'Status', 'Total'].map(h => (
                <th key={h} className="px-4 py-3.5 text-[10.5px] text-theme3 font-bold text-left uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(o => (
              <tr key={o.id} className="border-t border-theme hover:bg-theme-hover transition-colors">
                <td className="px-4 py-3.5 text-[12px] text-theme3">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3.5 text-[12px] font-bold text-[#3b82f6] truncate max-w-[80px]">{o.id}</td>
                <td className="px-4 py-3.5 text-[12px] text-theme font-medium">{o.customer?.name || o.customer || 'Walk-in'}</td>
                <td className="px-4 py-3.5 text-[12px] text-theme3">{o.itemCount} items</td>
                <td className="px-4 py-3.5"><span className="px-2 py-0.5 rounded-full bg-[#22c55e1a] text-[#22c55e] text-[9px] font-bold uppercase">Paid</span></td>
                <td className="px-4 py-3.5 text-[12px] font-bold text-theme">${o.total.toFixed(2)}</td>
              </tr>
            ))}
            {!filteredOrders.length && <tr><td colSpan="6" className="p-10 text-center text-theme3 italic">No sales found for this period</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPurchases = () => (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-theme-surface border border-theme p-4 rounded-xl shadow-sm">
          <div className="text-[10px] text-theme3 uppercase font-bold mb-1">Total Purchases</div>
          <div className="text-xl font-black text-[#8b5cf6]">${stats.purchases.toFixed(2)}</div>
        </div>
        <div className="bg-theme-surface border border-theme p-4 rounded-xl shadow-sm">
          <div className="text-[10px] text-theme3 uppercase font-bold mb-1">Restock Orders</div>
          <div className="text-xl font-black text-[#14b8a6]">{filteredPO.length}</div>
        </div>
      </div>

      <div className="bg-theme-surface border border-theme rounded-xl overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-theme-elevated/50 border-b border-theme">
              {['Date', 'PO ID', 'Supplier', 'Status', 'Total'].map(h => (
                <th key={h} className="px-4 py-3.5 text-[10.5px] text-theme3 font-bold text-left uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPO.map(po => (
              <tr key={po.id} className="border-t border-theme hover:bg-theme-hover transition-colors">
                <td className="px-4 py-3.5 text-[12px] text-theme3">{po.date}</td>
                <td className="px-4 py-3.5 text-[12px] font-bold text-[#8b5cf6]">{po.id}</td>
                <td className="px-4 py-3.5 text-[12px] text-theme font-medium">{po.supplier}</td>
                <td className="px-4 py-3.5"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${po.status === 'Received' ? 'bg-[#22c55e1a] text-[#22c55e]' : 'bg-[#f59e0b1a] text-[#f59e0b]'}`}>{po.status}</span></td>
                <td className="px-4 py-3.5 text-[12px] font-bold text-theme">${po.total.toFixed(2)}</td>
              </tr>
            ))}
            {!filteredPO.length && <tr><td colSpan="5" className="p-10 text-center text-theme3 italic">No purchase orders found for this period</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStaff = () => (
    <div className="animate-in fade-in duration-500">
      <div className="bg-theme-surface border border-theme rounded-xl overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-theme-elevated/50 border-b border-theme">
              {['Employee Name', 'Role', 'Monthly Salary', 'Comm %', 'Estimated Commission', 'Status'].map(h => (
                <th key={h} className="px-4 py-3.5 text-[10.5px] text-theme3 font-bold text-left uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map(s => {
                const comm = stats.rev > 0 ? (s.salary * (s.commAmount / 100)) : 0;
                return (
                  <tr key={s.id} className="border-t border-theme hover:bg-theme-hover transition-colors">
                    <td className="px-4 py-3.5 text-[13px] font-semibold text-theme">{s.name}</td>
                    <td className="px-4 py-3.5"><span className="px-2 py-0.5 rounded-full bg-[#8b5cf615] text-[#8b5cf6] text-[9.5px] font-bold uppercase">{s.access || 'Staff'}</span></td>
                    <td className="px-4 py-3.5 text-[13px] text-theme font-medium tabular-nums">${s.salary?.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-[13px] text-theme tabular-nums">{s.commAmount}%</td>
                    <td className="px-4 py-3.5 text-[13px] font-bold text-[#10b981] tabular-nums">${comm.toFixed(2)}</td>
                    <td className="px-4 py-3.5"><span className="px-2 py-0.5 rounded-full bg-[#22c55e1a] text-[#22c55e] text-[9px] font-bold uppercase">{s.status || 'Active'}</span></td>
                  </tr>
                );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="animate-in fade-in duration-500">
       <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-theme-surface border border-theme p-4 rounded-xl shadow-sm">
          <div className="text-[10px] text-theme3 uppercase font-bold mb-1">Active Customers</div>
          <div className="text-xl font-black text-[#14b8a6]">{customers.length}</div>
        </div>
        <div className="bg-theme-surface border border-theme p-4 rounded-xl shadow-sm">
          <div className="text-[10px] text-theme3 uppercase font-bold mb-1">Avg. Loyalty Points</div>
          <div className="text-xl font-black text-[#3b82f6]">{(customers.reduce((s,c) => s + (c.points || 0), 0) / (customers.length || 1)).toFixed(0)}</div>
        </div>
      </div>
      <div className="bg-theme-surface border border-theme rounded-xl overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-theme-elevated/50 border-b border-theme">
              {['Customer Name', 'Loyalty Points', 'Total Spent', 'Last Visit'].map(h => (
                <th key={h} className="px-4 py-3.5 text-[10.5px] text-theme3 font-bold text-left uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-t border-theme hover:bg-theme-hover transition-colors">
                <td className="px-4 py-3.5 text-[13px] font-semibold text-theme">{c.name}</td>
                <td className="px-4 py-3.5">
                    <span className="bg-[#3b82f61a] text-[#3b82f6] px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight">{c.points || 0} pts</span>
                </td>
                <td className="px-4 py-3.5 text-[13px] font-bold text-theme tabular-nums">${(c.spent || 0).toFixed(2)}</td>
                <td className="px-4 py-3.5 text-[12px] text-theme3 italic">{c.lastVisit || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-theme-surface select-none">
      <div className="flex items-start justify-between mb-6 group">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-theme">Intelligence Hub</h1>
          <p className="text-theme3 text-[13px] mt-1">Structured business reports and data visualization Center</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-theme-elevated p-1 rounded-lg border border-theme shadow-inner">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'Week' },
              { id: 'month', label: 'Month' }
            ].map(r => (
              <button key={r.id} onClick={() => setReportRange(r.id)} 
                className={`px-4 py-1.5 rounded-md text-[11px] font-bold transition-all duration-300 ${reportRange === r.id ? 'bg-[#10b981] text-white shadow-md' : 'text-theme2 hover:bg-theme-hover'}`}>
                {r.label}
              </button>
            ))}
          </div>
          <button 
            onClick={() => {
              const data = activeTab === 'sales' ? filteredOrders : 
                           activeTab === 'purchases' ? filteredPO : 
                           activeTab === 'staff' ? staff : customers;
              printSummaryReport(activeTab, data, rangeInfo);
            }}
            className="bg-[#3b82f6] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#2563eb] transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print Summary
          </button>
        </div>
      </div>

      <div className="flex border-b border-theme gap-6 mb-6">
        {[
          { id: 'sales', label: 'Sales Reports' },
          { id: 'purchases', label: 'Inventory Restocks' },
          { id: 'staff', label: 'Staff Performance' },
          { id: 'customers', label: 'Loyalty & Customers' }
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`pb-3 text-[13px] font-bold transition-all relative ${activeTab === t.id ? 'text-[#3b82f6]' : 'text-theme3 hover:text-theme'}`}>
            {t.label}
            {activeTab === t.id && <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#3b82f6] rounded-t-full" />}
          </button>
        ))}
      </div>

      <div className="bg-theme-elevated/20 p-4 rounded-xl border border-theme border-dashed mb-6 flex justify-between items-center bg-gradient-to-r from-theme-elevated/30 to-transparent">
        <div className="text-[12px] text-theme3">
            Showing results for <strong className="text-theme">{reportRange.toUpperCase()}</strong> range: 
            <span className="ml-2 bg-[#3b82f61a] text-[#3b82f6] px-2 py-0.5 rounded font-bold uppercase tabular-nums">
                {rangeInfo.start.toLocaleDateString()} — {rangeInfo.end.toLocaleDateString()}
            </span>
        </div>
        <div className="text-[10px] text-theme3 italic flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            Live module synchronization active
        </div>
      </div>

      {activeTab === 'sales' && renderSales()}
      {activeTab === 'purchases' && renderPurchases()}
      {activeTab === 'staff' && renderStaff()}
      {activeTab === 'customers' && renderCustomers()}
    </div>
  );
}

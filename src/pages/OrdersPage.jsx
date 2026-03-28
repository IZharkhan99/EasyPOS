import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useOrders } from '../hooks/useOrders';
import Pagination from '../components/Pagination';
import createLogger from '../utils/logger';
import { formatCurrency } from '../utils/formatters';

const logger = createLogger('OrdersPage');

export default function OrdersPage() {
  const { printReceipt, printInvoice } = useApp();
  const { orders, isLoading } = useOrders();
  const [filter, setFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const stats = useMemo(() => {
    const rev = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const cnt = orders.length;
    const avg = cnt ? rev / cnt : 0;
    const cashRev = orders.filter(o => o.payment_method === 'cash').reduce((sum, o) => sum + (o.total || 0), 0);
    const cardRev = orders.filter(o => o.payment_method !== 'cash').reduce((sum, o) => sum + (o.total || 0), 0);
    const itemsCnt = orders.reduce((sum, o) => sum + (o.order_items?.length || 0), 0);
    return { rev, cnt, avg, cashRev, cardRev, itemsCnt };
  }, [orders]);

  const filtered = useMemo(() => 
    orders.filter(o => {
      const matchSearch = !filter || o.id.includes(filter) || o.order_number?.includes(filter) || o.customers?.name?.toLowerCase().includes(filter.toLowerCase());
      const orderDate = new Date(o.created_at);
      const matchStart = !startDate || orderDate >= new Date(startDate);
      const matchEnd = !endDate || orderDate <= new Date(endDate + 'T23:59:59');
      return matchSearch && matchStart && matchEnd;
    }),
    [orders, filter, startDate, endDate]
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="text-[21px] font-extrabold tracking-[-0.4px] mb-1">Orders & Transactions</div>
      <div className="text-[12.5px] text-theme3 mb-4">View all sales transactions and order history</div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(stats.rev), sub: stats.cnt + ' transactions', color: '#3b82f6' },
          { label: 'Average Order', value: formatCurrency(stats.avg), sub: 'per transaction', color: '#f97316' },
          { label: 'Cash Revenue', value: formatCurrency(stats.cashRev), sub: orders.filter(o => o.payment_method === 'cash').length + ' orders', color: '#22c55e' },
          { label: 'Card Revenue', value: formatCurrency(stats.cardRev), sub: orders.filter(o => o.payment_method !== 'cash').length + ' orders', color: '#8b5cf6' },
          { label: 'Items Sold', value: stats.itemsCnt, sub: 'units total', color: '#14b8a6' },
        ].map((s, i) => (
          <div key={i} className="bg-theme-surface border border-theme rounded-xl p-3.5">
            <div className="text-[10.5px] text-theme3 uppercase tracking-[.5px] font-semibold mb-1">{s.label}</div>
            <div className="text-[22px] font-extrabold tracking-[-0.5px]" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[11px] text-theme3 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-theme-surface border border-theme rounded-t-xl px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <span className="text-[13px] font-bold whitespace-nowrap">Transaction History</span>
          <div className="flex items-center gap-2">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} 
              className="bg-theme-elevated border border-theme2 rounded-lg py-1 px-2 text-[11px] text-theme outline-none focus:border-[#3b82f6]" />
            <span className="text-theme3 text-[11px]">to</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} 
              className="bg-theme-elevated border border-theme2 rounded-lg py-1 px-2 text-[11px] text-theme outline-none focus:border-[#3b82f6]" />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-[10px] text-[#ef4444] hover:underline cursor-pointer">Clear Dates</button>
            )}
          </div>
        </div>
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search orders…"
          className="bg-theme-elevated border border-theme2 rounded-lg py-1.5 px-3 text-xs text-theme outline-none w-60 focus:border-[#3b82f6]" />
      </div>

      {/* Table */}
      <div className="bg-theme-surface border-x border-b border-theme rounded-b-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Order #', 'Customer', 'Items', 'Payment', 'Subtotal', 'Tax', 'Total', 'Time', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-[10.5px] text-theme3 font-bold text-left uppercase tracking-[.5px] bg-theme-elevated border-b border-theme">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length ? paginatedData.map(o => (
              <tr key={o.id} className="hover:bg-theme-hover">
                <td className="px-4 py-2.5 text-[13px] font-bold border-b border-theme truncate max-w-[100px]" title={o.id}>{o.order_number || o.id.slice(0, 8)}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{o.customers?.name || 'Walk-in'}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{o.order_items?.length || 0}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${o.payment_method === 'cash' ? 'bg-[rgba(34,197,94,.12)] text-[#22c55e]' : o.payment_method === 'card' ? 'bg-[rgba(59,130,246,.12)] text-[#3b82f6]' : 'bg-[rgba(139,92,246,.12)] text-[#8b5cf6]'}`}>
                    {(o.payment_method || 'cash').charAt(0).toUpperCase() + (o.payment_method || 'cash').slice(1)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{formatCurrency(o.subtotal || 0)}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{formatCurrency(o.tax_amount || 0)}</td>
                <td className="px-4 py-2.5 text-[13px] font-bold text-[#3b82f6] border-b border-theme">{formatCurrency(o.total || 0)}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme"><span className="inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[rgba(34,197,94,.12)] text-[#22c55e]">Completed</span></td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">
                  <div className="flex gap-1.5">
                    <button onClick={() => { logger.info('Reprinting receipt', { orderId: o.id }); printReceipt(o); }} className="bg-theme-elevated border border-theme px-2.5 py-1 rounded-md text-[11px] text-theme2 cursor-pointer hover:bg-theme-hover hover:text-theme flex items-center gap-1">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 stroke-current fill-none" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                      Receipt
                    </button>
                    <button onClick={() => { logger.info('Reprinting invoice', { orderId: o.id }); printInvoice(o); }} className="bg-[#3b82f6]/10 border border-[#3b82f6]/20 px-2.5 py-1 rounded-md text-[11px] text-[#3b82f6] font-bold cursor-pointer hover:bg-[#3b82f6] hover:text-white flex items-center gap-1 transition-all">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 stroke-current fill-none" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      A4 Invoice
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="10" className="text-center text-theme3 py-5">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filtered.length}
      />
</div>
  );
}
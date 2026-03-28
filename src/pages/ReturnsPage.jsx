import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useReturns } from '../hooks/useReturns';
import { useOrders } from '../hooks/useOrders';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import createLogger from '../utils/logger';
import { formatCurrency, formatPercent } from '../utils/formatters';

const logger = createLogger('ReturnsPage');

export default function ReturnsPage() {
  const { openModal, closeModal, showToast } = useApp();
  const { returns = [], createReturn, updateReturn, isLoading } = useReturns();
  const { orders = [] } = useOrders();
  const { profile: currentUser } = useAuth();
  const isManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [form, setForm] = useState({ orderRef: '', items: '', reason: 'Changed Mind', amount: '', method: 'Cash' });

  const filtered = useMemo(() =>
    (returns || []).filter(r => !filter || r.id?.includes(filter) || r.customer?.toLowerCase().includes(filter.toLowerCase())),
    [returns, filter]
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const refundTotal = (returns || []).reduce((s, r) => s + (r.amount || 0), 0);
  const pending = (returns || []).filter(r => r.status === 'Pending').length;
  const returnRate = orders.length > 0 ? (returns.length / orders.length) : 0;

  const handleSave = async () => {
    try {
      logger.info('Creating new return request', form);
      await createReturn({ ...form, amount: parseFloat(form.amount) || 0, date: new Date().toISOString().split('T')[0] });
      closeModal();
      setForm({ orderRef: '', items: '', reason: 'Changed Mind', amount: '', method: 'Cash' });
      showToast('Return created successfully', 'success');
    } catch (err) {
      logger.error('Failed to create return', { error: err.message, form });
      showToast('Failed to create return: ' + err.message, 'error');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      logger.info(`Updating return status: ${id} -> ${status}`);
      await updateReturn({ id, status });
      showToast(`Return ${status.toLowerCase()}`, 'success');
    } catch (err) {
      logger.error('Failed to update return status', { error: err.message, id, status });
      showToast('Update failed: ' + err.message, 'error');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex items-start justify-between mb-4">
        <div><div className="text-[21px] font-extrabold tracking-[-0.4px]">Returns & Refunds</div><div className="text-[12.5px] text-theme3 mt-0.5">Process refunds and track return requests</div></div>
        <button onClick={() => openModal('createReturn')} className="bg-[#3b82f6] text-white border-none px-3.5 py-2 rounded-lg text-[12.5px] font-semibold cursor-pointer hover:bg-[#2563eb]">+ Create Return</button>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Returns', value: returns.length, color: '#3b82f6' }, 
          { label: 'Refund Amount', value: formatCurrency(refundTotal), color: '#ef4444' }, 
          { label: 'Return Rate', value: formatPercent(returnRate), color: '#f97316' }, 
          { label: 'Pending', value: pending, color: '#eab308' }
        ].map((s, i) => (
          <div key={i} className="bg-theme-surface border border-theme rounded-xl p-3.5">
            <div className="text-[10.5px] text-theme3 uppercase tracking-[.5px] font-semibold mb-1">{s.label}</div>
            <div className="text-[22px] font-extrabold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-theme-surface border border-theme rounded-t-xl px-4 py-3 flex items-center justify-between"><span className="text-[13px] font-bold">Return History</span><input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search…" className="bg-theme-elevated border border-theme2 rounded-lg py-1.5 px-3 text-xs text-theme outline-none w-52 focus:border-[#3b82f6]" /></div>
      <div className="bg-theme-surface border-x border-b border-theme rounded-b-xl overflow-auto">
        <table className="w-full border-collapse">
          <thead><tr>{['Return #', 'Order Ref', 'Customer', 'Items', 'Reason', 'Amount', 'Status', ''].map(h => <th key={h} className="px-4 py-2.5 text-[10.5px] text-theme3 font-bold text-left uppercase tracking-[.5px] bg-theme-elevated border-b border-theme">{h}</th>)}</tr></thead>
          <tbody>
            {paginatedData.map(r => (
              <tr key={r.id} className="hover:bg-theme-hover">
                <td className="px-4 py-2.5 text-[13px] font-bold border-b border-theme">{r.id}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{r.orderRef}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{r.customer}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{r.items}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{r.reason}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme font-bold text-[#ef4444]">{formatCurrency(r.amount)}</td>
                <td className="px-4 py-2.5 border-b border-theme"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${r.status === 'Pending' ? 'bg-[rgba(249,115,22,.12)] text-[#f97316]' : r.status === 'Approved' ? 'bg-[rgba(34,197,94,.12)] text-[#22c55e]' : 'bg-[rgba(239,68,68,.12)] text-[#ef4444]'}`}>{r.status}</span></td>
                <td className="px-4 py-2.5 border-b border-theme min-w-[140px]">
                  <div className="flex gap-1.5">
                    {r.status === 'Pending' ? (
                      isManager ? (
                        <>
                          <button onClick={() => handleStatusUpdate(r.id, 'Approved')} className="bg-[rgba(34,197,94,.12)] text-[#22c55e] border border-[rgba(34,197,94,.2)] px-2 py-1 rounded text-[10px] font-bold hover:bg-[#22c55e] hover:text-white transition-all">Approve</button>
                          <button onClick={() => handleStatusUpdate(r.id, 'Rejected')} className="bg-[rgba(239,68,68,.12)] text-[#ef4444] border border-[rgba(239,68,68,.2)] px-2 py-1 rounded text-[10px] font-bold hover:bg-[#ef4444] hover:text-white transition-all">Reject</button>
                        </>
                      ) : (
                        <span className="text-[11px] text-theme3 italic">Awaiting Approval</span>
                      )
                    ) : (
                      <span className="text-[11px] text-theme3 italic">{r.status}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
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
      <Modal id="createReturn" title="Create Return" subtitle="Process a return or refund" wide>
        <div className="flex flex-col gap-3">
          <div><label className="text-xs font-semibold text-theme2 mb-1 block">Order Reference</label><input value={form.orderRef} onChange={e => setForm({...form, orderRef: e.target.value})} placeholder="#3001" className="w-full bg-theme-elevated border border-theme2 rounded-lg py-2 px-3 text-xs text-theme outline-none focus:border-[#3b82f6]" /></div>
          <div><label className="text-xs font-semibold text-theme2 mb-1 block">Items to Return</label><input value={form.items} onChange={e => setForm({...form, items: e.target.value})} placeholder="Item name (qty)" className="w-full bg-theme-elevated border border-theme2 rounded-lg py-2 px-3 text-xs text-theme outline-none focus:border-[#3b82f6]" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-theme2 mb-1 block">Reason</label><select value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="w-full bg-theme-elevated border border-theme2 rounded-lg py-2 px-3 text-xs text-theme outline-none"><option>Changed Mind</option><option>Defective</option><option>Wrong Item</option><option>Not Working</option><option>Damaged</option></select></div>
            <div><label className="text-xs font-semibold text-theme2 mb-1 block">Refund Amount</label><input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full bg-theme-elevated border border-theme2 rounded-lg py-2 px-3 text-xs text-theme outline-none focus:border-[#3b82f6]" /></div>
          </div>
          <div><label className="text-xs font-semibold text-theme2 mb-1 block">Refund Method</label><select value={form.method} onChange={e => setForm({...form, method: e.target.value})} className="w-full bg-theme-elevated border border-theme2 rounded-lg py-2 px-3 text-xs text-theme outline-none"><option>Cash</option><option>Original Payment</option><option>Store Credit</option></select></div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-[9px] bg-[#22c55e] text-white text-[13px] font-bold cursor-pointer border-none hover:bg-[#16a34a]">Create Return</button>
          <button onClick={closeModal} className="px-4 py-2.5 rounded-[9px] bg-theme-elevated border border-theme text-theme2 text-[13px] cursor-pointer hover:bg-theme-hover">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}

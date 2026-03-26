import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Pagination from '../components/Pagination';

export default function PaymentsPage() {
  const { payments, showToast } = useApp();
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const filtered = useMemo(() =>
    payments.filter(p => !filter || p.orderRef.includes(filter) || p.customer.toLowerCase().includes(filter.toLowerCase())),
    [payments, filter]
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const partial = payments.filter(p => p.method === 'Partial').reduce((s, p) => s + p.amount, 0);
  const bnpl = payments.filter(p => p.method === 'BNPL').reduce((s, p) => s + p.pending, 0);
  const emi = payments.filter(p => p.method === 'EMI').reduce((s, p) => s + p.pending, 0);
  const gc = payments.filter(p => p.method === 'Gift Card').reduce((s, p) => s + p.pending, 0);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex items-start justify-between mb-4">
        <div><div className="text-[21px] font-extrabold tracking-[-0.4px]">Advanced Payments</div><div className="text-[12.5px] text-theme3 mt-0.5">Manage partial payments, BNPL, EMI & gift cards</div></div>
        <button onClick={() => showToast('Advanced payment recorded', 'success')} className="bg-[#3b82f6] text-white border-none px-3.5 py-2 rounded-lg text-[12.5px] font-semibold cursor-pointer hover:bg-[#2563eb]">+ New Payment</button>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[{ label: 'Partial Payments', value: '$' + partial.toFixed(2), color: '#3b82f6' }, { label: 'BNPL Outstanding', value: '$' + bnpl.toFixed(2), color: '#f97316' }, { label: 'EMI Receivable', value: '$' + emi.toFixed(2), color: '#8b5cf6' }, { label: 'Gift Cards', value: '$' + gc.toFixed(2), color: '#22c55e' }].map((s, i) => (
          <div key={i} className="bg-theme-surface border border-theme rounded-xl p-3.5"><div className="text-[10.5px] text-theme3 uppercase tracking-[.5px] font-semibold mb-1">{s.label}</div><div className="text-[22px] font-extrabold" style={{ color: s.color }}>{s.value}</div></div>
        ))}
      </div>
      <div className="bg-theme-surface border border-theme rounded-t-xl px-4 py-3 flex items-center justify-between"><span className="text-[13px] font-bold">Payment Records</span><input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search…" className="bg-theme-elevated border border-theme2 rounded-lg py-1.5 px-3 text-xs text-theme outline-none w-52 focus:border-[#3b82f6]" /></div>
      <div className="bg-theme-surface border-x border-b border-theme rounded-b-xl overflow-auto">
        <table className="w-full border-collapse">
          <thead><tr>{['Date', 'Order Ref', 'Customer', 'Amount', 'Method', 'Status', 'Details', ''].map(h => <th key={h} className="px-4 py-2.5 text-[10.5px] text-theme3 font-bold text-left uppercase tracking-[.5px] bg-theme-elevated border-b border-theme">{h}</th>)}</tr></thead>
          <tbody>
            {paginatedData.map(p => (
              <tr key={p.id} className="hover:bg-theme-hover">
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{p.date}</td>
                <td className="px-4 py-2.5 text-[13px] font-bold border-b border-theme">{p.orderRef}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{p.customer}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">${p.amount.toFixed(2)}</td>
                <td className="px-4 py-2.5 border-b border-theme"><span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(59,130,246,.12)] text-[#3b82f6]">{p.method}</span></td>
                <td className="px-4 py-2.5 border-b border-theme"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${p.status === 'Pending' ? 'bg-[rgba(249,115,22,.12)] text-[#f97316]' : 'bg-[rgba(34,197,94,.12)] text-[#22c55e]'}`}>{p.status}</span></td>
                <td className="px-4 py-2.5 text-[12px] text-theme3 border-b border-theme">{p.details}</td>
                <td className="px-4 py-2.5 border-b border-theme"><button onClick={() => showToast(p.method + ' details…')} className="bg-theme-elevated border border-theme px-2.5 py-1 rounded-md text-[11px] text-theme2 cursor-pointer hover:bg-theme-hover">Details</button></td>
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
    </div>
  );
}

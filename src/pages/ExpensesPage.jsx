import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useExpenses } from '../hooks/useExpenses';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

export default function ExpensesPage() {
  const { openModal, closeModal, showToast } = useApp();
  const { expenses, addExpense, isLoading } = useExpenses();
  const [filter, setFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], category: 'Utilities', description: '', amount: '', method: 'Cash' });

  const filtered = useMemo(() =>
    expenses.filter(e => {
      const matchSearch = !filter || e.category.toLowerCase().includes(filter.toLowerCase()) || e.description.toLowerCase().includes(filter.toLowerCase());
      const expenseDate = new Date(e.date);
      const matchStart = !startDate || expenseDate >= new Date(startDate);
      const matchEnd = !endDate || expenseDate <= new Date(endDate + 'T23:59:59');
      return matchSearch && matchStart && matchEnd;
    }),
    [expenses, filter, startDate, endDate]
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const month = expenses.reduce((s, e) => s + e.amount, 0);
  const today = expenses.filter(e => e.date === new Date().toISOString().split('T')[0]).reduce((s, e) => s + e.amount, 0);

  const handleSave = () => {
    addExpense({ ...form, amount: parseFloat(form.amount) || 0, ref: 'REF-' + Date.now(), createdBy: 'Current User', approvedBy: 'Manager' });
    closeModal();
    setForm({ date: new Date().toISOString().split('T')[0], category: 'Utilities', description: '', amount: '', method: 'Cash' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex items-start justify-between mb-4">
        <div><div className="text-[21px] font-extrabold tracking-[-0.4px]">Expenses</div><div className="text-[12.5px] text-theme3 mt-0.5">Track operational costs and budgets</div></div>
        <button onClick={() => openModal('addExpense')} className="bg-[#3b82f6] text-white border-none px-3.5 py-2 rounded-lg text-[12.5px] font-semibold cursor-pointer hover:bg-[#2563eb]">+ Add Expense</button>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[{ label: "Today's Expenses", value: '$' + today.toFixed(2), color: '#ef4444' }, { label: 'Monthly Total', value: '$' + month.toFixed(2), color: '#f97316' }, { label: 'Pending Approval', value: expenses.filter(e => e.status === 'Pending').length, color: '#eab308' }, { label: 'Budget Used', value: Math.round((month / 5000) * 100) + '%', color: '#3b82f6' }].map((s, i) => (
          <div key={i} className="bg-theme-surface border border-theme rounded-xl p-3.5"><div className="text-[10.5px] text-theme3 uppercase tracking-[.5px] font-semibold mb-1">{s.label}</div><div className="text-[22px] font-extrabold" style={{ color: s.color }}>{s.value}</div></div>
        ))}
      </div>
      <div className="bg-theme-surface border border-theme rounded-t-xl px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <span className="text-[13px] font-bold whitespace-nowrap">Expense Records</span>
          <div className="flex items-center gap-2">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} 
              className="bg-theme-elevated border border-theme2 rounded-lg py-1 px-2 text-[11px] text-theme outline-none focus:border-[#3b82f6]" />
            <span className="text-theme3 text-[11px]">to</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} 
              className="bg-theme-elevated border border-theme2 rounded-lg py-1 px-2 text-[11px] text-theme outline-none focus:border-[#3b82f6]" />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-[10px] text-[#ef4444] hover:underline cursor-pointer">Clear</button>
            )}
          </div>
        </div>
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search…" className="bg-theme-elevated border border-theme2 rounded-lg py-1.5 px-3 text-xs text-theme outline-none w-52 focus:border-[#3b82f6]" />
      </div>
      <div className="bg-theme-surface border-x border-b border-theme rounded-b-xl overflow-auto">
        <table className="w-full border-collapse">
          <thead><tr>{['Date', 'Category', 'Description', 'Amount', 'Method', 'Status', 'Created By', ''].map(h => <th key={h} className="px-4 py-2.5 text-[10.5px] text-theme3 font-bold text-left uppercase tracking-[.5px] bg-theme-elevated border-b border-theme">{h}</th>)}</tr></thead>
          <tbody>
            {paginatedData.map(e => (
              <tr key={e.id} className="hover:bg-theme-hover">
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{e.date}</td>
                <td className="px-4 py-2.5 border-b border-theme"><span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(59,130,246,.12)] text-[#3b82f6]">{e.category}</span></td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{e.description}</td>
                <td className="px-4 py-2.5 text-[13px] font-bold text-[#ef4444] border-b border-theme">${e.amount.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{e.method}</td>
                <td className="px-4 py-2.5 border-b border-theme"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${e.status === 'Pending' ? 'bg-[rgba(249,115,22,.12)] text-[#f97316]' : 'bg-[rgba(34,197,94,.12)] text-[#22c55e]'}`}>{e.status}</span></td>
                <td className="px-4 py-2.5 text-[13px] text-theme3 border-b border-theme">{e.createdBy}</td>
                <td className="px-4 py-2.5 border-b border-theme"><button onClick={() => showToast(e.ref)} className="bg-theme-elevated border border-theme px-2.5 py-1 rounded-md text-[11px] text-theme2 cursor-pointer hover:bg-theme-hover">View</button></td>
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

      <Modal id="addExpense" title="Add Expense" subtitle="Record a new expense" wide>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-theme2 mb-1 block">Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-theme-elevated border border-theme2 rounded-lg py-2 px-3 text-xs text-theme outline-none focus:border-[#3b82f6]" /></div>
            <div><label className="text-xs font-semibold text-theme2 mb-1 block">Category</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-theme-elevated border border-theme2 rounded-lg py-2 px-3 text-xs text-theme outline-none"><option>Utilities</option><option>Supplies</option><option>Maintenance</option><option>Marketing</option><option>Rent</option><option>Salary</option></select></div>
          </div>
          <div><label className="text-xs font-semibold text-theme2 mb-1 block">Description</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-theme-elevated border border-theme2 rounded-lg py-2 px-3 text-xs text-theme outline-none focus:border-[#3b82f6]" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-theme2 mb-1 block">Amount</label><input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full bg-theme-elevated border border-theme2 rounded-lg py-2 px-3 text-xs text-theme outline-none focus:border-[#3b82f6]" /></div>
            <div><label className="text-xs font-semibold text-theme2 mb-1 block">Payment Method</label><select value={form.method} onChange={e => setForm({...form, method: e.target.value})} className="w-full bg-theme-elevated border border-theme2 rounded-lg py-2 px-3 text-xs text-theme outline-none"><option>Cash</option><option>Card</option><option>Bank Transfer</option><option>Check</option></select></div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-[9px] bg-[#22c55e] text-white text-[13px] font-bold cursor-pointer border-none hover:bg-[#16a34a]">Save Expense</button>
          <button onClick={closeModal} className="px-4 py-2.5 rounded-[9px] bg-theme-elevated border border-theme text-theme2 text-[13px] cursor-pointer hover:bg-theme-hover">Cancel</button>
        </div>
      </Modal>

      

    </div>
  );
}

import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Pagination from '../components/Pagination';

export default function AlertsPage() {
  const { alerts, clearAllAlerts, showToast } = useApp();
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const filtered = useMemo(() =>
    typeFilter ? alerts.filter(a => a.type === typeFilter) : alerts,
    [alerts, typeFilter]
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const critical = alerts.filter(a => a.severity === 'Critical').length;
  const warning = alerts.filter(a => a.severity === 'Warning').length;
  const info = alerts.filter(a => a.severity === 'Info').length;
  const resolved = alerts.filter(a => a.status === 'Resolved').length;

  const types = [...new Set(alerts.map(a => a.type))];

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex items-start justify-between mb-4">
        <div><div className="text-[21px] font-extrabold tracking-[-0.4px]">Notifications & Alerts</div><div className="text-[12.5px] text-theme3 mt-0.5">System notifications, low stock & payment alerts</div></div>
        <button onClick={clearAllAlerts} className="bg-[#ef4444] text-white border-none px-3.5 py-2 rounded-lg text-[12.5px] font-semibold cursor-pointer hover:bg-[#dc2626]">Clear All</button>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[{ label: 'Critical', value: critical, color: '#ef4444' }, { label: 'Warnings', value: warning, color: '#f97316' }, { label: 'Info', value: info, color: '#3b82f6' }, { label: 'Resolved', value: resolved, color: '#22c55e' }].map((s, i) => (
          <div key={i} className="bg-theme-surface border border-theme rounded-xl p-3.5"><div className="text-[10.5px] text-theme3 uppercase tracking-[.5px] font-semibold mb-1">{s.label}</div><div className="text-[22px] font-extrabold" style={{ color: s.color }}>{s.value}</div></div>
        ))}
      </div>
      <div className="flex gap-1.5 mb-3">
        <button onClick={() => setTypeFilter('')} className={`px-3 py-1 rounded-full text-xs cursor-pointer transition-all border ${!typeFilter ? 'bg-[#3b82f6] border-[#3b82f6] text-white' : 'border-[var(--border2)] bg-transparent text-theme2 hover:bg-theme-hover'}`}>All</button>
        {types.map(t => <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1 rounded-full text-xs cursor-pointer transition-all border ${typeFilter === t ? 'bg-[#3b82f6] border-[#3b82f6] text-white' : 'border-[var(--border2)] bg-transparent text-theme2 hover:bg-theme-hover'}`}>{t}</button>)}
      </div>
      <div className="bg-theme-surface border border-theme rounded-xl overflow-auto">
        <table className="w-full border-collapse">
          <thead><tr>{['Type', 'Severity', 'Message', 'Time', 'Status', ''].map(h => <th key={h} className="px-4 py-2.5 text-[10.5px] text-theme3 font-bold text-left uppercase tracking-[.5px] bg-theme-elevated border-b border-theme">{h}</th>)}</tr></thead>
          <tbody>
            {paginatedData.map(a => (
              <tr key={a.id} className="hover:bg-theme-hover">
                <td className="px-4 py-2.5 border-b border-theme"><span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(59,130,246,.12)] text-[#3b82f6]">{a.type}</span></td>
                <td className="px-4 py-2.5 border-b border-theme"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${a.severity === 'Critical' ? 'bg-[rgba(239,68,68,.12)] text-[#ef4444]' : a.severity === 'Warning' ? 'bg-[rgba(249,115,22,.12)] text-[#f97316]' : 'bg-[rgba(59,130,246,.12)] text-[#3b82f6]'}`}>{a.severity}</span></td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{a.message}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{a.time}</td>
                <td className="px-4 py-2.5 border-b border-theme"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${a.status === 'Active' ? 'bg-[rgba(234,179,8,.12)] text-[#eab308]' : 'bg-[rgba(34,197,94,.12)] text-[#22c55e]'}`}>{a.status}</span></td>
                <td className="px-4 py-2.5 border-b border-theme"><button onClick={() => showToast('Alert acknowledged')} className="bg-theme-elevated border border-theme px-2.5 py-1 rounded-md text-[11px] text-theme2 cursor-pointer hover:bg-theme-hover">Acknowledge</button></td>
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
  )};
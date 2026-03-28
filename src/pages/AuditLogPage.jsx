import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuditLogs } from '../hooks/useAuditLogs';
import Pagination from '../components/Pagination';
import createLogger from '../utils/logger';

const logger = createLogger('AuditLogPage');

export default function AuditLogPage() {
  const { exportModuleAsCSV } = useApp();
  const { auditLogs, isLoading } = useAuditLogs();
  const [filter, setFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const filtered = (auditLogs || []).filter(log => {
    const matchSearch = log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.module.toLowerCase().includes(filter.toLowerCase()) ||
      log.details.toLowerCase().includes(filter.toLowerCase()) ||
      log.allValues?.toString().toLowerCase().includes(filter.toLowerCase()) ||
      log.user.toLowerCase().includes(filter.toLowerCase());

    const logDate = new Date(log.timestamp);
    const matchStart = !startDate || logDate >= new Date(startDate);
    const matchEnd = !endDate || logDate <= new Date(endDate + 'T23:59:59');

    return matchSearch && matchStart && matchEnd;
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[21px] font-extrabold tracking-[-0.4px] mb-1 text-theme">System Audit Logs</div>
          <div className="text-[12.5px] text-theme3 mt-0.5">Track all administrative actions and changes</div>
        </div>
      </div>

      <div className="bg-theme-surface border border-theme rounded-xl overflow-hidden mb-4">
        <div className="p-4 border-b border-theme flex items-center justify-between bg-theme-elevated/30">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-1 relative max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme3 text-[14px]">🔍</span>
              <input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Search logs…"
                className="w-full bg-theme-surface border border-theme2 rounded-lg py-2 pl-9 pr-4 text-[12.5px] text-theme outline-none focus:border-[#3b82f6] transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="bg-theme-surface border border-theme2 rounded-lg py-1.5 px-2 text-[11px] text-theme outline-none focus:border-[#3b82f6]" />
              <span className="text-theme3 text-[11px]">to</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="bg-theme-surface border border-theme2 rounded-lg py-1.5 px-2 text-[11px] text-theme outline-none focus:border-[#3b82f6]" />
              {(startDate || endDate) && (
                <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-[10px] text-[#ef4444] hover:underline cursor-pointer">Clear</button>
              )}
            </div>
            <div className="flex-1" />
            <button 
              onClick={() => {
                logger.info('Exporting audit logs as CSV');
                exportModuleAsCSV('audit-logs', auditLogs);
              }} 
              className="bg-theme-elevated border border-theme px-3.5 py-2 rounded-lg text-[12.5px] font-semibold text-theme2 cursor-pointer hover:bg-theme-hover flex items-center gap-2 transition-all border-none"
            >
              <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] stroke-current fill-none" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-min-h-[400px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-theme-elevated/50">
                {['Timestamp', 'User', 'Action', 'Module', 'Details'].map(h => (
                  <th key={h} className="px-5 py-3 text-[10.5px] text-theme3 font-bold text-left uppercase tracking-wider border-b border-theme">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(5)].map((__, j) => (
                      <td key={j} className="px-5 py-4 border-b border-theme">
                        <div className="h-4 bg-theme-elevated rounded w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                paginatedData.map((log, i) => (
                  <tr key={i} className="hover:bg-theme-elevated/20 transition-colors">
                    <td className="px-5 py-3 text-[12.5px] border-b border-theme text-theme2 font-medium">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-[12.5px] border-b border-theme font-semibold text-theme">
                      {log.user}
                    </td>
                    <td className="px-5 py-3 text-[12.5px] border-b border-theme">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.action === 'CREATE' ? 'bg-green-500/10 text-green-500' :
                        log.action === 'UPDATE' ? 'bg-blue-500/10 text-blue-500' :
                          log.action === 'DELETE' ? 'bg-red-500/10 text-red-500' :
                            'bg-[#3b82f61a] text-[#3b82f6]'
                        }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[12.5px] border-b border-theme text-theme2">
                      {log.module}
                    </td>
                    <td className="px-5 py-3 text-[12.5px] border-b border-theme text-theme3 italic">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && paginatedData.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-theme3 text-[13px]">
                    No audit logs found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { useState, useMemo } from 'react';

export default function ShiftPage() {
  const { shiftOpen, shiftStartTime, shiftOpeningFloat, setShiftOpeningFloat, orders, getOrderStats, closeShift, openShift, openModal, closeModal, shiftHistory, showToast } = useApp();
  const { currentUser } = useAuth();
  const stats = getOrderStats();
  const [closingCash, setClosingCash] = useState('');
  const [floatInput, setFloatInput] = useState('200');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(shiftHistory.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return shiftHistory.slice(start, start + itemsPerPage);
  }, [shiftHistory, currentPage, itemsPerPage]);

  const handleConfirm = () => {
    if (shiftOpen) {
      closeShift(parseFloat(closingCash) || 0, currentUser?.name || 'Staff');
    } else {
      openShift(parseFloat(floatInput) || 200);
    }
    closeModal();
    setClosingCash('');
  };

  const printZReport = (report) => {
    if (!report) return;
    const printWindow = window.open('', '_blank', 'width=380,height=600');
    const html = `
      <html>
        <head>
          <title>Z-Report ${report.date}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 300px; margin: 0 auto; padding: 20px; font-size: 13px; color: #000; background: #fff; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .mt-2 { margin-top: 10px; }
            .mb-2 { margin-bottom: 10px; }
            .border-top { border-top: 1px dashed #000; padding-top: 10px; }
            .flex { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="text-center font-bold" style="font-size: 16px;">SHIFT Z-REPORT</div>
          <div class="text-center mb-2">${report.date}</div>
          <div class="border-top"></div>
          <div class="flex"><span>Cashier:</span><span>${report.cashier}</span></div>
          <div class="flex"><span>Opened:</span><span>${report.opened}</span></div>
          <div class="flex"><span>Closed:</span><span>${report.closed}</span></div>
          <div class="flex"><span>Duration:</span><span>${report.duration}</span></div>
          <div class="border-top mt-2 mb-2"></div>
          <div class="flex"><span>Total Orders:</span><span>${report.ordersCount}</span></div>
          <div class="flex font-bold"><span>REVENUE:</span><span>$${report.revenue.toFixed(2)}</span></div>
          <div class="flex"><span>Total Tax:</span><span>$${report.tax.toFixed(2)}</span></div>
          <div class="flex"><span>Discounts:</span><span>$${report.discount.toFixed(2)}</span></div>
          <div class="border-top mt-2 mb-2"></div>
          <div class="flex"><span>Cash Sales:</span><span>$${report.cashSales.toFixed(2)}</span></div>
          <div class="flex"><span>Card Sales:</span><span>$${report.cardSales.toFixed(2)}</span></div>
          <div class="border-top mt-2 mb-2"></div>
          <div class="flex"><span>Opening Float:</span><span>$${report.float.toFixed(2)}</span></div>
          <div class="flex"><span>Expected Cash:</span><span>$${(report.float + report.cashSales).toFixed(2)}</span></div>
          <div class="flex"><span>Actual Cash:</span><span>$${report.closingCash.toFixed(2)}</span></div>
          <div class="flex font-bold" style="color: ${report.diff < 0 ? '#ff0000' : '#000'}">
            <span>DIFF:</span><span>${report.diff >= 0 ? '+' : ''}$${report.diff.toFixed(2)}</span>
          </div>
          <div class="border-top mt-2 text-center" style="font-size: 10px;">Z-Report Printed: ${new Date().toLocaleString()}</div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[21px] font-extrabold tracking-[-0.4px]">Shift Management</div>
          <div className="text-[12.5px] text-theme3 mt-0.5">Manage shifts, cash tracking & handover</div>
        </div>
        <button onClick={() => openModal('shift')} className={`px-3.5 py-2 rounded-lg text-[12.5px] font-semibold cursor-pointer border-none text-white ${shiftOpen ? 'bg-[#ef4444] hover:bg-[#dc2626]' : 'bg-[#22c55e] hover:bg-[#16a34a]'}`}>
          {shiftOpen ? 'Close Shift' : 'Open New Shift'}
        </button>
      </div>

      {/* Current Shift Stats */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Status', value: shiftOpen ? 'Active' : 'Closed', color: shiftOpen ? '#22c55e' : '#ef4444' },
          { label: 'Started', value: shiftStartTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), color: '#3b82f6' },
          { label: 'Orders', value: stats.cnt, color: '#8b5cf6' },
          { label: 'Revenue', value: '$' + stats.rev.toFixed(2), color: '#3b82f6' },
          { label: 'Opening Float', value: '$' + shiftOpeningFloat.toFixed(2), color: '#f97316' },
        ].map((s, i) => (
          <div key={i} className="bg-theme-surface border border-theme rounded-xl p-3.5">
            <div className="text-[10.5px] text-theme3 uppercase tracking-[.5px] font-semibold mb-1">{s.label}</div>
            <div className="text-[22px] font-extrabold tracking-[-0.5px]" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Cash Breakdown */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-theme-surface border border-theme rounded-xl p-3.5">
          <div className="text-[13px] font-bold mb-2">Cash Breakdown</div>
          <div className="flex justify-between text-[13px] py-1.5 border-b border-theme"><span className="text-theme2">Cash Sales</span><span className="font-bold text-[#22c55e]">${stats.cashRev.toFixed(2)}</span></div>
          <div className="flex justify-between text-[13px] py-1.5 border-b border-theme"><span className="text-theme2">Card Sales</span><span className="font-bold text-[#3b82f6]">${stats.cardRev.toFixed(2)}</span></div>
          <div className="flex justify-between text-[13px] py-1.5 font-bold mt-1"><span>Total</span><span>${stats.rev.toFixed(2)}</span></div>
        </div>
        <div className="bg-theme-surface border border-theme rounded-xl p-3.5">
          <div className="text-[13px] font-bold mb-2">Shift Info</div>
          <div className="flex justify-between text-[13px] py-1.5 border-b border-theme"><span className="text-theme2">Cashier</span><span className="font-semibold">Jake Doe</span></div>
          <div className="flex justify-between text-[13px] py-1.5 border-b border-theme"><span className="text-theme2">Float</span><span className="font-semibold">${shiftOpeningFloat.toFixed(2)}</span></div>
          <div className="flex justify-between text-[13px] py-1.5"><span className="text-theme2">Expected Cash</span><span className="font-bold text-[#22c55e]">${(shiftOpeningFloat + stats.cashRev).toFixed(2)}</span></div>
        </div>
      </div>

      {/* History */}
      <div className="bg-theme-surface border border-theme rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-theme text-[13px] font-bold">Shift History</div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Date', 'Cashier', 'Opened', 'Closed', 'Duration', 'Orders', 'Revenue', 'Float', 'Status'].map(h => (
                <th key={h} className="px-4 py-2.5 text-[10.5px] text-theme3 font-bold text-left uppercase tracking-[.5px] bg-theme-elevated border-b border-theme">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((s, i) => (
              <tr key={i} className="hover:bg-theme-hover">
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{s.date}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{s.cashier}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{s.opened}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{s.closed}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{s.duration}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{s.ordersCount}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme font-bold text-[#3b82f6]">${s.revenue.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">${s.float.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">
                  <button onClick={() => printZReport(s)} className="bg-theme-elevated border border-theme px-2 py-1 rounded-md text-[10px] text-theme flex items-center gap-1 hover:bg-theme-hover cursor-pointer">
                    <svg viewBox="0 0 24 24" className="w-[11px] h-[11px] stroke-current fill-none" strokeWidth="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    Z-Report
                  </button>
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
        totalItems={shiftHistory.length}
      />

      {/* Shift Modal */}
      <Modal id="shift" title={shiftOpen ? 'Close Shift' : 'Open New Shift'} subtitle={shiftOpen ? 'Review your shift before closing' : 'Enter opening float to start a new shift'}>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-theme-elevated rounded-lg p-3 text-center"><div className="text-[11px] text-theme3 mb-1">Orders</div><div className="text-lg font-extrabold">{stats.cnt}</div></div>
          <div className="bg-theme-elevated rounded-lg p-3 text-center"><div className="text-[11px] text-theme3 mb-1">Revenue</div><div className="text-lg font-extrabold text-[#3b82f6]">${stats.rev.toFixed(2)}</div></div>
          <div className="bg-theme-elevated rounded-lg p-3 text-center"><div className="text-[11px] text-theme3 mb-1">Cash</div><div className="text-lg font-extrabold text-[#22c55e]">${stats.cashRev.toFixed(2)}</div></div>
          <div className="bg-theme-elevated rounded-lg p-3 text-center"><div className="text-[11px] text-theme3 mb-1">Card</div><div className="text-lg font-extrabold text-[#8b5cf6]">${stats.cardRev.toFixed(2)}</div></div>
        </div>
        {shiftOpen ? (
          <div className="mb-4">
            <label className="text-xs font-semibold text-theme2 mb-1 block">Closing Cash Amount</label>
            <input type="number" value={closingCash} onChange={e => setClosingCash(e.target.value)} placeholder="Count your cash drawer…"
              className="w-full bg-theme-elevated border border-theme2 rounded-lg py-2.5 px-3 text-xs text-theme outline-none focus:border-[#3b82f6]" />
          </div>
        ) : (
          <div className="mb-4">
            <label className="text-xs font-semibold text-theme2 mb-1 block">Opening Float Amount</label>
            <input type="number" value={floatInput} onChange={e => setFloatInput(e.target.value)} placeholder="200"
              className="w-full bg-theme-elevated border border-theme2 rounded-lg py-2.5 px-3 text-xs text-theme outline-none focus:border-[#3b82f6]" />
          </div>
        )}
        <button onClick={handleConfirm} className={`w-full py-3 rounded-[9px] border-none text-white text-sm font-extrabold cursor-pointer ${shiftOpen ? 'bg-[#ef4444] hover:bg-[#dc2626]' : 'bg-[#22c55e] hover:bg-[#16a34a]'}`}>
          {shiftOpen ? 'Close Shift & Print Summary' : 'Open Shift'}
        </button>
        <button onClick={closeModal} className="w-full py-2 bg-none border-none text-theme3 text-[12.5px] cursor-pointer mt-2 text-center hover:text-theme">Cancel</button>
      </Modal>
    </div>
  );
}

import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useShifts } from '../hooks/useShifts';
import { useOrders } from '../hooks/useOrders';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { useState, useMemo } from 'react';
import createLogger from '../utils/logger';
import { formatCurrency } from '../utils/formatters';
import { DEFAULTS } from '../utils/constants';

const logger = createLogger('ShiftPage');

export default function ShiftPage() {
  const { openModal, closeModal, activeModal, showToast } = useApp();
  const { profile: currentUser } = useAuth();
  const { shifts, activeShift, openShift, closeShift, isLoading } = useShifts();
  const { orders } = useOrders();

  const [closingCash, setClosingCash] = useState('');
  const [floatInput, setFloatInput] = useState(DEFAULTS.OPENING_FLOAT);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const shiftOpen = !!activeShift;

  const currentShiftOrders = useMemo(() =>
    (orders || []).filter(o => o.shift_id === activeShift?.id),
    [orders, activeShift]
  );

  const stats = useMemo(() => {
    const rev = currentShiftOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const cnt = currentShiftOrders.length;
    const cashRev = currentShiftOrders.filter(o => o.payment_method === 'cash').reduce((sum, o) => sum + (o.total || 0), 0);
    const cardRev = currentShiftOrders.filter(o => o.payment_method !== 'cash').reduce((sum, o) => sum + (o.total || 0), 0);
    return { rev, cnt, cashRev, cardRev };
  }, [currentShiftOrders]);

  const shiftHistory = (shifts || []).filter(s => s.status === 'closed');

  const totalPages = Math.ceil(shiftHistory.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return shiftHistory.slice(start, start + itemsPerPage);
  }, [shiftHistory, currentPage, itemsPerPage]);

  const handleConfirm = async () => {
    try {
      if (shiftOpen) {
        const cash = parseFloat(closingCash) || 0;
        const expected = (activeShift.opening_float || 0) + stats.cashRev;
        await closeShift({
          id: activeShift.id,
          data: {
            closing_cash: cash,
            expected_cash: expected,
            cash_difference: cash - expected,
            total_revenue: stats.rev,
            cash_sales: stats.cashRev,
            card_sales: stats.cardRev,
            orders_count: stats.cnt,
            status: 'closed',
            closed_at: new Date().toISOString(),
          }
        });
      } else {
        await openShift({
          opening_float: parseFloat(floatInput) || DEFAULTS.OPENING_FLOAT || 200,
          status: 'open',
          opened_at: new Date().toISOString(),
        });
      }
      closeModal();
      setClosingCash('');
      logger.info(shiftOpen ? 'Shift closed successfully' : 'Shift opened successfully', { shiftId: activeShift?.id || 'new' });
      showToast(shiftOpen ? 'Shift closed successfully' : 'Shift opened successfully', 'success');
    } catch (err) {
      logger.error('Shift action failed', { error: err.message, action: shiftOpen ? 'close' : 'open' });
      showToast('Action failed: ' + err.message, 'error');
    }
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
          <div class="flex font-bold"><span>REVENUE:</span><span>${formatCurrency(report.revenue)}</span></div>
          <div class="flex"><span>Total Tax:</span><span>${formatCurrency(report.tax || 0)}</span></div>
          <div class="flex"><span>Discounts:</span><span>${formatCurrency(report.discount || 0)}</span></div>
          <div class="border-top mt-2 mb-2"></div>
          <div class="flex"><span>Cash Sales:</span><span>${formatCurrency(report.cashSales)}</span></div>
          <div class="flex"><span>Card Sales:</span><span>${formatCurrency(report.cardSales)}</span></div>
          <div class="border-top mt-2 mb-2"></div>
          <div class="flex"><span>Opening Float:</span><span>${formatCurrency(report.float)}</span></div>
          <div class="flex"><span>Expected Cash:</span><span>${formatCurrency(report.float + report.cashSales)}</span></div>
          <div class="flex"><span>Actual Cash:</span><span>${formatCurrency(report.closingCash)}</span></div>
          <div class="flex font-bold" style="color: ${report.diff < 0 ? '#ff0000' : '#000'}">
            <span>DIFF:</span><span>${report.diff >= 0 ? '+' : ''}${formatCurrency(Math.abs(report.diff))}</span>
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
          { label: 'Started', value: activeShift ? new Date(activeShift.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--', color: '#3b82f6' },
          { label: 'Orders', value: stats.cnt, color: '#8b5cf6' },
          { label: 'Revenue', value: formatCurrency(stats.rev), color: '#3b82f6' },
          { label: 'Opening Float', value: formatCurrency(activeShift?.opening_float || 0), color: '#f97316' },
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
          <div className="flex justify-between text-[13px] py-1.5 border-b border-theme"><span className="text-theme2">Cash Sales</span><span className="font-bold text-[#22c55e]">{formatCurrency(stats.cashRev)}</span></div>
          <div className="flex justify-between text-[13px] py-1.5 border-b border-theme"><span className="text-theme2">Card Sales</span><span className="font-bold text-[#3b82f6]">{formatCurrency(stats.cardRev)}</span></div>
          <div className="flex justify-between text-[13px] py-1.5 font-bold mt-1"><span>Total</span><span>{formatCurrency(stats.rev)}</span></div>
        </div>
        <div className="bg-theme-surface border border-theme rounded-xl p-3.5">
          <div className="text-[13px] font-bold mb-2">Shift Info</div>
          <div className="flex justify-between text-[13px] py-1.5 border-b border-theme"><span className="text-theme2">Cashier</span><span className="font-semibold">{activeShift?.profiles?.name || currentUser?.name || 'Staff'}</span></div>
          <div className="flex justify-between text-[13px] py-1.5 border-b border-theme"><span className="text-theme2">Float</span><span className="font-semibold">{formatCurrency(activeShift?.opening_float || 0)}</span></div>
          <div className="flex justify-between text-[13px] py-1.5"><span className="text-theme2">Expected Cash</span><span className="font-bold text-[#22c55e]">{formatCurrency((activeShift?.opening_float || 0) + stats.cashRev)}</span></div>
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
              <tr key={s.id} className="hover:bg-theme-hover">
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{new Date(s.closed_at).toLocaleDateString()}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{s.profiles?.name || 'Staff'}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{new Date(s.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{s.closed_at ? new Date(s.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{Math.round((new Date(s.closed_at) - new Date(s.opened_at)) / 60000)}m</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{s.orders_count || 0}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme font-bold text-[#3b82f6]">{formatCurrency(s.total_revenue || 0)}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{formatCurrency(s.opening_float || 0)}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">
                  <button onClick={() => printZReport(s)} className="bg-theme-elevated border border-theme px-2 py-1 rounded-md text-[10px] text-theme flex items-center gap-1 hover:bg-theme-hover cursor-pointer">
                    <svg viewBox="0 0 24 24" className="w-[11px] h-[11px] stroke-current fill-none" strokeWidth="2"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
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
          <div className="bg-theme-elevated rounded-lg p-3 text-center"><div className="text-[11px] text-theme3 mb-1">Revenue</div><div className="text-lg font-extrabold text-[#3b82f6]">{formatCurrency(stats.rev)}</div></div>
          <div className="bg-theme-elevated rounded-lg p-3 text-center"><div className="text-[11px] text-theme3 mb-1">Cash</div><div className="text-lg font-extrabold text-[#22c55e]">{formatCurrency(stats.cashRev)}</div></div>
          <div className="bg-theme-elevated rounded-lg p-3 text-center"><div className="text-[11px] text-theme3 mb-1">Card</div><div className="text-lg font-extrabold text-[#8b5cf6]">{formatCurrency(stats.cardRev)}</div></div>
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

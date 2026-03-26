import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

function StatCard({ label, value, color, sub, icon }) {
  return (
    <div className="bg-theme-surface border border-theme rounded-xl p-3.5 theme-transition">
      {icon && <div className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center mb-2.5" style={{ background: `${color}1f` }}>
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: color }}>{icon}</svg>
      </div>}
      <div className="text-[10.5px] text-theme3 uppercase tracking-[.5px] font-semibold mb-1">{label}</div>
      <div className="text-[22px] font-extrabold tracking-[-0.5px]" style={{ color }}>{value}</div>
      {sub && <div className="text-[11px] text-theme3 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { orders, getOrderStats, showToast, openModal } = useApp();
  const stats = getOrderStats();
  const revChartRef = useRef(null);
  const topChartRef = useRef(null);
  const chartsInit = useRef(false);

  useEffect(() => {
    if (chartsInit.current) return;
    chartsInit.current = true;
    const chartOpts = { tooltip: { backgroundColor: '#1a2230', borderColor: '#253347', borderWidth: 1, titleColor: '#7a8fa8', bodyColor: '#e8f0fe', padding: 8, displayColors: false }, legend: { display: false } };

    // Grouping revenue by weekday
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueByDay = [0, 0, 0, 0, 0, 0, 0];
    orders.forEach(o => {
      const d = new Date(o.createdAt).getDay();
      revenueByDay[d] += o.total;
    });
    // Shift so today is at the end (roughly)
    const today = new Date().getDay();
    const sortedLabels = [];
    const sortedData = [];
    for (let i = 0; i < 7; i++) {
      const idx = (today - 6 + i + 7) % 7;
      sortedLabels.push(days[idx]);
      sortedData.push(revenueByDay[idx]);
    }

    // Top Products Calculation
    const productCounts = {};
    orders.forEach(o => {
      const items = o.items || o.cart || [];
      items.forEach(item => {
        productCounts[item.name] = (productCounts[item.name] || 0) + item.qty;
      });
    });
    const sortedProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (revChartRef.current) {
      new Chart(revChartRef.current.getContext('2d'), {
        type: 'bar',
        data: { labels: sortedLabels, datasets: [{ data: sortedData, backgroundColor: '#3b82f6', borderRadius: 5, borderSkipped: false }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { ...chartOpts }, scales: { x: { grid: { display: false }, ticks: { color: '#4a5e72', font: { size: 10 } }, border: { display: false } }, y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4a5e72', font: { size: 10 }, callback: v => '$' + v }, border: { display: false } } } }
      });
    }
    if (topChartRef.current) {
      new Chart(topChartRef.current.getContext('2d'), {
        type: 'bar',
        data: { labels: sortedProducts.map(p => p[0]), datasets: [{ data: sortedProducts.map(p => p[1]), backgroundColor: ['#3b82f6', '#8b5cf6', '#f97316', '#22c55e', '#14b8a6'], borderRadius: 4, borderSkipped: false }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { ...chartOpts }, scales: { x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4a5e72', font: { size: 10 } }, border: { display: false } }, y: { grid: { display: false }, ticks: { color: '#7a8fa8', font: { size: 10 } }, border: { display: false } } } }
      });
    }
  }, [orders]);

  const recent = orders.slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <div className="text-[21px] font-extrabold tracking-[-0.4px]">Dashboard</div>
          <div className="text-[12.5px] text-theme3 mt-0.5">Good morning, Jake! Here's your store overview.</div>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <button onClick={() => showToast('Report exported!')} className="bg-theme-elevated text-theme2 border border-theme px-3 py-2 rounded-lg text-[12.5px] cursor-pointer flex items-center gap-[5px] transition-all hover:bg-theme-hover hover:text-theme">Export</button>
          <button onClick={() => navigate('/pos')} className="bg-[#3b82f6] text-white border-none px-3.5 py-2 rounded-lg text-[12.5px] font-semibold cursor-pointer flex items-center gap-[5px] transition-all hover:bg-[#2563eb]">
            <svg viewBox="0 0 24 24" className="w-[13px] h-[13px] stroke-white fill-none" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>New Sale
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <StatCard label="Today's Revenue" value={`$${stats.rev.toFixed(2)}`} color="#3b82f6" sub="vs $842 yesterday" icon={<><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></>} />
        <StatCard label="Orders Today" value={stats.cnt} color="#22c55e" sub="vs 28 yesterday" icon={<><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="2" /></>} />
        <StatCard label="Avg Order Value" value={stats.cnt ? `$${stats.avg.toFixed(2)}` : '$0.00'} color="#f97316" sub="vs $30.1 yesterday" icon={<><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /></>} />
        <StatCard label="Items Sold" value={stats.itemsCnt} color="#8b5cf6" sub="units today" icon={<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />} />
        <StatCard label="Customers" value="1,248" color="#14b8a6" sub="+14 this week" icon={<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></>} />
      </div>

      {/* Quick Actions */}
      <div className="bg-theme-surface border border-theme rounded-t-xl px-4 py-3 text-[13px] font-bold mb-px">Quick Actions</div>
      <div className="grid grid-cols-2 gap-3 mb-3.5 mt-2.5">
        {[
          { label: 'New Sale', sub: 'Open POS terminal', color: '#3b82f6', onClick: () => navigate('/pos') },
          { label: 'Check Stock', sub: `${stats.lowStock} items need restock`, color: '#f97316', onClick: () => navigate('/products') },
          { label: 'View Orders', sub: `${stats.cnt} orders today`, color: '#22c55e', onClick: () => navigate('/orders') },
          { label: 'Close Shift', sub: 'End current shift', color: '#ef4444', onClick: () => openModal('shift') },
        ].map((a, i) => (
          <div key={i} onClick={a.onClick} className="bg-theme-surface border border-theme rounded-xl p-3.5 cursor-pointer flex items-center gap-2.5 transition-all hover:bg-theme-hover hover:border-theme2">
            <div className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}1f`, color: a.color }}>
              <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div className="text-[13px] font-bold text-theme">{a.label}</div>
              <div className="text-[11px] text-theme3 mt-0.5">{a.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-3 mb-3.5">
        <div className="bg-theme-surface border border-theme rounded-xl p-3.5">
          <div className="text-[13px] font-bold mb-3">Revenue — Last 7 Days</div>
          <div className="relative w-full h-[200px]"><canvas ref={revChartRef}></canvas></div>
        </div>
        <div className="bg-theme-surface border border-theme rounded-xl p-3.5">
          <div className="text-[13px] font-bold mb-3">Top Selling Products</div>
          <div className="relative w-full h-[200px]"><canvas ref={topChartRef}></canvas></div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-theme-surface border border-theme rounded-xl overflow-hidden mb-3.5">
        <div className="px-4 py-3 border-b border-theme flex items-center justify-between">
          <span className="text-[13px] font-bold">Recent Transactions</span>
          <button onClick={() => navigate('/orders')} className="bg-theme-elevated text-theme2 border border-theme px-3 py-1.5 rounded-lg text-[12.5px] cursor-pointer hover:bg-theme-hover hover:text-theme">View All</button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Order #', 'Customer', 'Items', 'Payment', 'Total', 'Time', 'Status'].map(h => (
                <th key={h} className="px-4 py-2.5 text-[10.5px] text-theme3 font-bold text-left uppercase tracking-[.5px] bg-theme-elevated border-b border-theme">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.length ? recent.map(o => (
              <tr key={o.id} className="hover:bg-theme-hover">
                <td className="px-4 py-2.5 text-[13px] font-bold border-b border-theme">{o.id}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{o.customer}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{o.itemCount}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${o.method === 'cash' ? 'bg-[rgba(34,197,94,.12)] text-[#22c55e]' : o.method === 'card' ? 'bg-[rgba(59,130,246,.12)] text-[#3b82f6]' : 'bg-[rgba(139,92,246,.12)] text-[#8b5cf6]'}`}>
                    {o.method.charAt(0).toUpperCase() + o.method.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-[13px] font-bold text-[#3b82f6] border-b border-theme">${o.total.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{o.time}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme"><span className="inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[rgba(34,197,94,.12)] text-[#22c55e]">Completed</span></td>
              </tr>
            )) : (
              <tr><td colSpan="7" className="text-center text-theme3 py-5">No transactions yet today</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

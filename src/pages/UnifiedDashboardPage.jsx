import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

function StatCard({ label, value, color, sub, icon }) {
  return (
    <div className="bg-theme-surface border border-theme rounded-xl p-3.5 theme-transition relative overflow-hidden group hover:border-theme2 hover:shadow-xl hover:shadow-[var(--glow)] transition-all duration-300" style={{ '--glow': `${color}15` }}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-white/5 -mr-12 -mt-12 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      {icon && <div className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center mb-2.5 relative z-10" style={{ background: `${color}1f` }}>
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: color }}>{icon}</svg>
      </div>}
      <div className="text-[10.5px] text-theme3 uppercase tracking-[.5px] font-semibold mb-1 relative z-10">{label}</div>
      <div className="text-[22px] font-extrabold tracking-[-0.5px] relative z-10" style={{ color }}>{value}</div>
      {sub && <div className="text-[11px] text-theme3 mt-0.5 relative z-10">{sub}</div>}
    </div>
  );
}

export default function UnifiedDashboardPage() {
  const navigate = useNavigate();
  const { orders: allOrders, products, getOrderStats, showToast, openModal, reportRange, setReportRange, customRange, setCustomRange, getFilteredData } = useApp();
  const orders = getFilteredData(allOrders);
  const stats = getOrderStats(orders); 
  const [viewMode, setViewMode] = useState('advanced'); 

  const chartRefs = {
    simpleRev: useRef(null),
    simpleTop: useRef(null),
    advTrend: useRef(null),
    advCat: useRef(null),
    advPay: useRef(null),
    advHour: useRef(null)
  };

  const activeCharts = useRef([]);

  useEffect(() => {
    // Cleanup
    activeCharts.current.forEach(c => c.destroy());
    activeCharts.current = [];

    const co = {
      tooltip: { backgroundColor: '#1a2230', borderColor: '#253347', borderWidth: 1, titleColor: '#7a8fa8', bodyColor: '#e8f0fe', padding: 10, displayColors: false },
      legend: { display: false }
    };

    const scales = (isCurrency = true) => ({
      x: { grid: { display: false }, ticks: { color: '#4a5e72', font: { size: 10 } }, border: { display: false } },
      y: { min: 0, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#4a5e72', font: { size: 10 }, callback: v => isCurrency ? '$' + v : v }, border: { display: false } }
    });

    if (viewMode === 'simple') {
      // 1. Simple Revenue (7 Days)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const revenueByDay = [0, 0, 0, 0, 0, 0, 0];
      orders.forEach(o => revenueByDay[new Date(o.createdAt).getDay()] += o.total);

      const today = new Date().getDay();
      const sortedLabels = [];
      const sortedData = [];
      for (let i = 0; i < 7; i++) {
        const idx = (today - 6 + i + 7) % 7;
        sortedLabels.push(days[idx]);
        sortedData.push(revenueByDay[idx]);
      }

      if (chartRefs.simpleRev.current) {
        activeCharts.current.push(new Chart(chartRefs.simpleRev.current, {
          type: 'bar',
          data: { labels: sortedLabels, datasets: [{ data: sortedData, backgroundColor: '#3b82f6', borderRadius: 6, barThickness: 25 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: co, scales: scales() }
        }));
      }

      // 2. Simple Top Products
      const prodCounts = {};
      orders.forEach(o => (o.items || []).forEach(i => prodCounts[i.name] = (prodCounts[i.name] || 0) + i.qty));
      const sortedProds = Object.entries(prodCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

      if (chartRefs.simpleTop.current) {
        activeCharts.current.push(new Chart(chartRefs.simpleTop.current, {
          type: 'bar',
          data: { labels: sortedProds.map(p => p[0]), datasets: [{ data: sortedProds.map(p => p[1]), backgroundColor: '#8b5cf6', borderRadius: 6, barThickness: 25 }] },
          options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: co, scales: { ...scales(false), y: { grid: { display: false }, ticks: { color: '#7a8fa8', font: { size: 10 } }, border: { display: false } } } }
        }));
      }
    } else {
      // 1. Advanced Trend (14 Days)
      const dates = [...Array(14)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();
      const revData = dates.map(d => orders.filter(o => o.createdAt?.startsWith(d)).reduce((s, o) => s + o.total, 0));

      if (chartRefs.advTrend.current) {
        const ctx = chartRefs.advTrend.current.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 240);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

        activeCharts.current.push(new Chart(ctx, {
          type: 'line',
          data: { labels: dates.map(d => d.split('-').slice(1).join('/')), datasets: [{ data: revData, borderColor: '#3b82f6', borderWidth: 2.5, fill: true, backgroundColor: gradient, tension: 0.45, pointRadius: 0, pointHoverRadius: 5 }] },
          options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            animation: { duration: 2000, easing: 'easeOutQuart' },
            plugins: co, 
            scales: scales() 
          }
        }));
      }

      // 2. Category Breakdown
      const cats = [...new Set(products.map(p => p.category))];
      const catData = cats.map(c => orders.reduce((s, o) => s + o.items.filter(i => products.find(p => p.name === i.name)?.category === c).reduce((ss, ii) => ss + (ii.price * ii.qty), 0), 0));

      if (chartRefs.advCat.current) {
        activeCharts.current.push(new Chart(chartRefs.advCat.current, {
          type: 'doughnut',
          data: { labels: cats, datasets: [{ data: catData, backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#6366f1', '#f43f5e'], borderWidth: 0 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#7a8fa8', font: { size: 10 }, boxWidth: 10, padding: 12 } } }, cutout: '78%' }
        }));
      }

      // 3. Payment Methods
      const payMethods = ['cash', 'card', 'qr'];
      const payData = payMethods.map(m => orders.filter(o => o.method === m).length);

      if (chartRefs.advPay.current) {
        activeCharts.current.push(new Chart(chartRefs.advPay.current, {
          type: 'doughnut',
          data: { labels: ['Cash', 'Card', 'QR'], datasets: [{ data: payData, backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6'], borderWidth: 0 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#7a8fa8', font: { size: 10 }, boxWidth: 10, padding: 15 } } }, cutout: '75%' }
        }));
      }

      // 4. Hourly Sales
      const hours = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm'];
      const hourData = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(h => orders.filter(o => new Date(o.createdAt).getHours() === h).length);

      if (chartRefs.advHour.current) {
        const ctx = chartRefs.advHour.current.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(20, 184, 166, 0.15)');
        gradient.addColorStop(1, 'rgba(20, 184, 166, 0)');

        activeCharts.current.push(new Chart(ctx, {
          type: 'line',
          data: { labels: hours, datasets: [{ data: hourData, borderColor: '#10b981', borderWidth: 2.5, fill: true, backgroundColor: gradient, tension: 0.45, pointRadius: 0 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: co, scales: scales(false) }
        }));
      }

      // 5. Vertical Top Products (to match screenshot)
      const prodCounts = {};
      orders.forEach(o => (o.items || []).forEach(i => prodCounts[i.name] = (prodCounts[i.name] || 0) + i.qty));
      const topProds = Object.entries(prodCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

       if (chartRefs.simpleTop.current && viewMode === 'advanced') {
         activeCharts.current.push(new Chart(chartRefs.simpleTop.current, {
           type: 'bar',
           data: { 
            labels: topProds.map(p => p[0]), 
            datasets: [{ 
              data: topProds.map(p => p[1]), 
              backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#14b8a6'], 
              borderRadius: 6,
              barThickness: 34
            }] 
          },
           options: { responsive: true, maintainAspectRatio: false, plugins: co, scales: scales(false) }
         }));
       }
    }

    return () => activeCharts.current.forEach(c => c.destroy());
  }, [orders, products, viewMode]);

  const recent = orders.slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
      {/* Header with Toggle */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <div className="text-[21px] font-extrabold tracking-[-0.4px]">Enterprise Dashboard</div>
          <div className="text-[12.5px] text-theme3 mt-0.5">{viewMode === 'advanced' ? 'Detailed sales performance and business insights' : "Welcome back! Here's what's happening today."}</div>
        </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-theme-elevated p-1 rounded-lg border border-theme shadow-inner mr-2">
              {[
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'Weekly' },
                { id: 'month', label: 'Monthly' }
              ].map(r => (
                <button key={r.id} onClick={() => setReportRange(r.id)} 
                  className={`px-3 py-1.5 rounded-md text-[10.5px] font-bold transition-all duration-300 ${reportRange === r.id ? 'bg-[#10b981] text-white shadow-lg' : 'text-theme2 hover:bg-theme-hover'}`}>
                  {r.label}
                </button>
              ))}
            </div>

            <div className="flex bg-theme-elevated p-1 rounded-lg border border-theme shadow-inner">
              <button onClick={() => setViewMode('simple')} className={`px-3 py-1.5 rounded-md text-[11.5px] font-bold transition-all duration-300 ${viewMode === 'simple' ? 'bg-[#3b82f6] text-white shadow-lg' : 'text-theme2 hover:bg-theme-hover'}`}>Overview</button>
              <button onClick={() => setViewMode('advanced')} className={`px-3 py-1.5 rounded-md text-[11.5px] font-bold transition-all duration-300 ${viewMode === 'advanced' ? 'bg-[#8b5cf6] text-white shadow-lg' : 'text-theme2 hover:bg-theme-hover'}`}>Advanced Insights</button>
            </div>
          <button onClick={() => navigate('/pos')} className="bg-[#3b82f6] text-white border-none px-4 py-2.5 rounded-lg text-[12.5px] font-bold cursor-pointer transition-all hover:bg-[#2563eb] shadow-lg shadow-blue-500/20 active:scale-95">New Sale</button>
        </div>
      </div>

      {/* KPI Cards (Matching original 5-card layout) */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <StatCard label="Today's Revenue" value={`$${stats.rev.toFixed(2)}`} color="#3b82f6" sub={`vs $842 yesterday`} icon={<><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></>} />
        <StatCard label="Orders Today" value={orders.length} color="#10b981" sub="vs 28 yesterday" icon={<><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /></>} />
        <StatCard label="Avg Order Value" value={`$${stats.avg.toFixed(2)}`} color="#f59e0b" sub="vs $30.1 yesterday" icon={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></>} />
        <StatCard label="Items Sold" value={orders.reduce((s,o) => s + (o.itemCount || 0), 0)} color="#8b5cf6" sub="units today" icon={<><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></>} />
        <StatCard label="Customers" value="1,248" color="#14b8a6" sub="+14 this week" icon={<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>} />
      </div>

      {/* Charts Section */}
      {viewMode === 'simple' ? (
        <div className="grid grid-cols-2 gap-3 mb-4 animate-in fade-in duration-500">
          <div className="bg-theme-surface border border-theme rounded-xl p-4">
            <div className="text-[13px] font-bold mb-4 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-[#3b82f6] rounded-full" /> Revenue (Last 7 Days)
            </div>
            <div className="h-[240px] w-full"><canvas ref={chartRefs.simpleRev}></canvas></div>
          </div>
          <div className="bg-theme-surface border border-theme rounded-xl p-4">
            <div className="text-[13px] font-bold mb-4 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-[#8b5cf6] rounded-full" /> Top Selling Items
            </div>
            <div className="h-[240px] w-full"><canvas ref={chartRefs.simpleTop}></canvas></div>
          </div>
        </div>
      ) : (
        <>
          {/* Row 1: Trend & Category */}
          <div className="grid grid-cols-3 gap-3 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="col-span-2 bg-theme-surface border border-theme rounded-xl p-4">
              <div className="text-[13px] font-bold mb-4 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-[#3b82f6] rounded-full" /> Revenue Trend (14 Days)
              </div>
              <div className="h-[240px] w-full"><canvas ref={chartRefs.advTrend}></canvas></div>
            </div>
            <div className="bg-theme-surface border border-theme rounded-xl p-4">
              <div className="text-[13px] font-bold mb-4 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-[#8b5cf6] rounded-full" /> Sales by Category
              </div>
              <div className="h-[240px] w-full"><canvas ref={chartRefs.advCat}></canvas></div>
            </div>
          </div>

          {/* Row 2: Payments, Hourly & Top Products (3 Columns) */}
          <div className="grid grid-cols-3 gap-3 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-theme-surface border border-theme rounded-xl p-4">
              <div className="text-[13px] font-bold mb-4 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-[#22c55e] rounded-full" /> Payment Methods
              </div>
              <div className="h-[200px] w-full"><canvas ref={chartRefs.advPay}></canvas></div>
            </div>
            <div className="bg-theme-surface border border-theme rounded-xl p-4">
              <div className="text-[13px] font-bold mb-4 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-[#14b8a6] rounded-full" /> Sales by Hour
              </div>
              <div className="h-[200px] w-full"><canvas ref={chartRefs.advHour}></canvas></div>
            </div>
            <div className="bg-theme-surface border border-theme rounded-xl p-4">
              <div className="text-[13px] font-bold mb-4 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-[#f97316] rounded-full" /> Top Products (Units)
              </div>
              <div className="h-[200px] w-full"><canvas ref={chartRefs.simpleTop}></canvas></div>
            </div>
          </div>
        </>
      )}

      {/* Quick Actions (Compact) */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Check Stock', sub: 'Inventory list', color: '#f97316', onClick: () => navigate('/products') },
          { label: 'View Reports', sub: 'Sales history', color: '#3b82f6', onClick: () => navigate('/orders') },
          { label: 'Staff Shift', sub: 'Manage hours', color: '#22c55e', onClick: () => openModal('shift') },
          { label: 'System Logs', sub: 'Audit trail', color: '#8b5cf6', onClick: () => navigate('/audit-logs') },
        ].map((a, i) => (
          <div key={i} onClick={a.onClick} className="bg-theme-surface border border-theme rounded-xl p-3 cursor-pointer flex items-center gap-2.5 transition-all hover:bg-theme-hover hover:border-theme2 group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{ background: `${a.color}1f`, color: a.color }}>
              <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] stroke-current fill-none" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <div>
              <div className="text-[12px] font-bold text-theme">{a.label}</div>
              <div className="text-[10px] text-theme3">{a.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-theme-surface border border-theme rounded-xl overflow-hidden mb-5">
        <div className="px-4 py-3 border-b border-theme flex items-center justify-between">
          <span className="text-[13px] font-bold">Recent Real-time Sales</span>
          <button onClick={() => navigate('/orders')} className="text-[#3b82f6] text-[11px] font-bold hover:underline">See full history →</button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-theme-elevated/30">
              {['Order #', 'Customer', 'Items', 'Method', 'Total', 'Time'].map(h => (
                <th key={h} className="px-4 py-2 text-[10px] text-theme3 font-bold text-left uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map(o => (
              <tr key={o.id} className="hover:bg-theme-hover transition-colors border-t border-theme border-dashed first:border-none">
                <td className="px-4 py-2.5 text-[12px] font-extrabold text-[#3b82f6]">{o.id}</td>
                <td className="px-4 py-2.5 text-[12px] font-medium text-theme">{o.customer}</td>
                <td className="px-4 py-2.5 text-[11px] text-theme3">{o.itemCount} items</td>
                <td className="px-4 py-2.5 text-[11px]">
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${o.method === 'cash' ? 'bg-[#22c55e1a] text-[#22c55e]' : 'bg-[#3b82f61a] text-[#3b82f6]'}`}>{o.method}</span>
                </td>
                <td className="px-4 py-2.5 text-[12px] font-black text-theme">${o.total.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-[11px] text-theme3 tabular-nums">{o.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

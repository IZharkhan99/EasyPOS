import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useCustomers } from '../hooks/useCustomers';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import createLogger from '../utils/logger';
import { formatCurrency } from '../utils/formatters';

const logger = createLogger('CustomersPage');

export default function CustomersPage() {
  const { openModal, closeModal, activeModal, modalData, exportModuleAsCSV, showToast } = useApp();
  const { customers, addCustomer, updateCustomer, deleteCustomer, deleteMultipleCustomers, isLoading } = useCustomers();
  const { profile: currentUser } = useAuth();
   const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', tier: 'Bronze' });
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const filtered = useMemo(() => 
    customers.filter(c => (!filter || c.name.toLowerCase().includes(filter.toLowerCase()) || c.phone?.includes(filter) || c.email?.toLowerCase().includes(filter.toLowerCase()))),
    [customers, filter]
  );

  const [selectedIds, setSelectedIds] = useState([]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const cIds = paginatedData.map(c => c.id);
    const allSelected = cIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !cIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...cIds])]);
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} customers?`)) {
      try {
        logger.info('Bulk deleting customers', { ids: selectedIds });
        await deleteMultipleCustomers(selectedIds);
        showToast(`${selectedIds.length} customers deleted successfully`, 'success');
        setSelectedIds([]);
      } catch (err) {
        logger.error('Bulk delete failed', { error: err.message, ids: selectedIds });
        showToast('Failed to delete customers: ' + err.message, 'error');
      }
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Enter customer name', 'error'); return; }
    try {
      if (activeModal === 'editCustomer' && modalData) {
        logger.info(`Updating customer: ${modalData.id}`, form);
        await updateCustomer({ id: modalData.id, ...form });
        showToast('Customer updated successfully', 'success');
      } else {
        logger.info('Adding new customer', form);
        await addCustomer(form);
        showToast('Customer added successfully', 'success');
      }
      closeModal();
      setForm({ name: '', phone: '', email: '', address: '', tier: 'Bronze' });
    } catch (err) {
      logger.error('Failed to save customer', { error: err.message, form });
      showToast('Error saving customer: ' + err.message, 'error');
    }
  };

  const openEdit = (c) => {
    setForm({ name: c.name, phone: c.phone, email: c.email, address: c.address || '', tier: c.tier || 'Bronze' });
    openModal('editCustomer', c);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[21px] font-extrabold tracking-[-0.4px] mb-1">Customers</div>
          <div className="text-[12.5px] text-theme3 mt-0.5">Manage your customer database and loyalty program</div>
        </div>
        <button onClick={() => openModal('addCustomer')} className="bg-[#3b82f6] text-white border-none px-3.5 py-2 rounded-lg text-[12.5px] font-semibold cursor-pointer hover:bg-[#2563eb]">+ Add Customer</button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Customers', value: customers.length, color: '#3b82f6' },
          { label: 'Active This Month', value: customers.filter(c => (c.total_visits || 0) > 0).length, color: '#22c55e' },
          { label: 'Loyalty Members', value: customers.filter(c => (c.loyalty_points || 0) > 0).length, color: '#8b5cf6' },
          { label: 'Avg Spend', value: formatCurrency(customers.reduce((s, c) => s + (c.total_spent || 0), 0) / Math.max(1, customers.length)), color: '#f97316' },
        ].map((s, i) => (
          <div key={i} className="bg-theme-surface border border-theme rounded-xl p-3.5">
            <div className="text-[10.5px] text-theme3 uppercase tracking-[.5px] font-semibold mb-1">{s.label}</div>
            <div className="text-[22px] font-extrabold tracking-[-0.5px]" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-theme-surface border border-theme rounded-t-xl px-4 py-3 flex items-center justify-between gap-3">
        <span className="text-[13px] font-bold">Customer Directory</span>
        <div className="flex gap-2">
          {selectedIds.length > 0 && currentUser?.role !== 'cashier' && (
            <button onClick={handleBulkDelete} className="bg-[rgba(239,68,68,.12)] border border-[rgba(239,68,68,.2)] px-3 py-1.5 rounded-lg text-[12.5px] font-bold text-[#ef4444] cursor-pointer hover:bg-[#ef4444] hover:text-white transition-all">
              Delete Selected ({selectedIds.length})
            </button>
          )}
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search customers…" className="bg-theme-elevated border border-theme2 rounded-lg py-1.5 px-3 text-xs text-theme outline-none w-60 focus:border-[#3b82f6]" />
          <button onClick={() => exportModuleAsCSV('customers', customers)} className="bg-theme-elevated border border-theme px-3 py-1.5 rounded-lg text-[12.5px] font-semibold text-theme2 cursor-pointer hover:bg-theme-hover flex items-center gap-2 transition-all">
            <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] stroke-current fill-none" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
        </div>
      </div>
      <div className="bg-theme-surface border-x border-b border-theme rounded-b-xl overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="px-4 py-2.5 bg-theme-elevated border-b border-theme w-10">
                <input type="checkbox" onChange={toggleSelectAll} checked={paginatedData.length > 0 && paginatedData.every(c => selectedIds.includes(c.id))} className="cursor-pointer" />
              </th>
               {['Customer', 'Phone', 'Email', 'Address', 'Visits', 'Total Spent', 'Last Visit', 'Tier', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-[10.5px] text-theme3 font-bold text-left uppercase tracking-[.5px] bg-theme-elevated border-b border-theme">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(c => (
              <tr key={c.id} className={`hover:bg-theme-hover transition-colors ${selectedIds.includes(c.id) ? 'bg-theme-active' : ''}`}>
                <td className="px-4 py-2.5 border-b border-theme text-center">
                  <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleSelect(c.id)} className="cursor-pointer" />
                </td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">
                  <div className="flex items-center gap-2.5">
                    <div className="w-[30px] h-[30px] rounded-full bg-[rgba(59,130,246,.12)] flex items-center justify-center text-[11px] font-extrabold text-[#3b82f6]">{c.name.split(' ').map(x => x[0]).join('')}</div>
                    <strong>{c.name}</strong>
                  </div>
                </td>
                 <td className="px-4 py-2.5 text-[13px] border-b border-theme">{c.phone}</td>
                <td className="px-4 py-2.5 text-[13px] text-theme3 border-b border-theme">{c.email}</td>
                <td className="px-4 py-2.5 text-[13px] text-theme2 border-b border-theme truncate max-w-[150px]" title={c.address}>{c.address || '-'}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{c.total_visits || 0}</td>
                <td className="px-4 py-2.5 text-[13px] font-bold text-[#3b82f6] border-b border-theme">{formatCurrency(c.total_spent || 0)}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{c.last_visit ? new Date(c.last_visit).toLocaleDateString() : 'Never'}</td>
                  <td className="px-4 py-2.5 text-[13px] border-b border-theme">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${c.tier === 'Platinum' ? 'bg-[rgba(139,92,246,.12)] text-[#8b5cf6]' : c.tier === 'Gold' ? 'bg-[rgba(234,179,8,.12)] text-[#eab308]' : c.tier === 'Silver' ? 'bg-[rgba(148,163,184,.12)] text-[#94a3b8]' : 'bg-[rgba(249,115,22,.12)] text-[#f97316]'}`}>{c.tier || 'Bronze'}</span>
                  </td>
                  <td className="px-4 py-2.5 text-[13px] border-b border-theme flex gap-1">
                    <button onClick={() => openEdit(c)} className="bg-theme-elevated border border-theme px-2.5 py-1 rounded-md text-[11px] text-theme2 cursor-pointer hover:bg-theme-hover">Edit</button>
                    {currentUser?.role !== 'cashier' && (
                      <button onClick={async () => {
                        if (confirm('Delete this customer?')) {
                          try {
                            logger.info(`Deleting customer: ${c.id}`);
                            await deleteCustomer(c.id);
                            showToast('Customer deleted', 'success');
                          } catch (err) {
                            logger.error(`Failed to delete customer ${c.id}`, { error: err.message });
                            showToast('Delete failed: ' + err.message, 'error');
                          }
                        }
                      }} className="bg-theme-elevated border border-theme px-2.5 py-1 rounded-md text-[11px] text-[#ef4444] cursor-pointer hover:bg-[rgba(239,68,68,.12)]">Delete</button>
                    )}
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

      <Modal id="addCustomer" title="Add New Customer" subtitle="Enter customer details">
        <CustomerForm form={form} setForm={setForm} />
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-[9px] bg-[#22c55e] text-white text-[13px] font-bold cursor-pointer border-none hover:bg-[#16a34a]">Save Customer</button>
          <button onClick={closeModal} className="px-4 py-2.5 rounded-[9px] bg-theme-elevated border border-theme text-theme2 text-[13px] cursor-pointer hover:bg-theme-hover">Cancel</button>
        </div>
      </Modal>

      <Modal id="editCustomer" title="Edit Customer" subtitle="Update customer details">
        <CustomerForm form={form} setForm={setForm} />
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-[9px] bg-[#3b82f6] text-white text-[13px] font-bold cursor-pointer border-none hover:bg-[#2563eb]">Update Customer</button>
          <button onClick={closeModal} className="px-4 py-2.5 rounded-[9px] bg-theme-elevated border border-theme text-theme2 text-[13px] cursor-pointer hover:bg-theme-hover">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}

function CustomerForm({ form, setForm }) {
  const Label = ({ title, sub }) => (
    <div className="mb-1.5 flex justify-between items-end">
        <label className="text-[11px] font-bold text-theme2 uppercase tracking-wide">{title}</label>
        {sub && <span className="text-[10px] text-[#3b82f6] font-medium">{sub}</span>}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label title="Full Name *" />
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6] transition-all" />
        </div>
        <div>
          <Label title="Phone Number" />
          <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6]" />
        </div>
        <div>
          <Label title="Email Address" />
          <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6]" />
        </div>
        <div className="col-span-2">
          <Label title="Full Address" />
          <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} 
            rows="2"
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6] resize-none" />
        </div>
        <div className="col-span-2">
          <Label title="Customer Tier" sub="Loyalty" />
          <select value={form.tier} onChange={e => setForm({...form, tier: e.target.value})} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6]">
            <option value="Bronze">Bronze (Standard)</option>
            <option value="Silver">Silver (Preferred)</option>
            <option value="Gold">Gold (VIP)</option>
            <option value="Platinum">Platinum (Elite)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
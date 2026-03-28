import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useStaff } from '../hooks/useStaff';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import createLogger from '../utils/logger';
import { formatCurrency } from '../utils/formatters';

const logger = createLogger('StaffPage');

export default function StaffPage() {
  const { openModal, closeModal, activeModal, modalData, exportModuleAsCSV, showToast, printStaffPayslip } = useApp();
  const { staff, addStaff, updateStaff, deleteStaff, deleteMultipleStaff, isLoading } = useStaff();
  const { profile: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const [filter, setFilter] = useState('');
  const [showPins, setShowPins] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [form, setForm] = useState({ name: '', position: 'cashier', shift: 'full-time', phone: '', salary: '', commType: 'percentage', commAmount: '', pin: '', status: 'Active' });

  const filtered = useMemo(() => 
    (staff || []).filter(s => !filter || s.name?.toLowerCase().includes(filter.toLowerCase()) || s.phone?.includes(filter)),
    [staff, filter]
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
    const sIds = paginatedData.map(s => s.id);
    const allSelected = sIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !sIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...sIds])]);
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to remove ${selectedIds.length} staff members?`)) {
      try {
        logger.info('Bulk removing staff', { ids: selectedIds });
        await deleteMultipleStaff(selectedIds);
        showToast(`${selectedIds.length} staff members removed successfully`, 'success');
        setSelectedIds([]);
      } catch (err) {
        logger.error('Bulk staff removal failed', { error: err.message, ids: selectedIds });
        showToast('Bulk delete failed: ' + err.message, 'error');
      }
    }
  };

  const present = (staff || []).filter(s => s.is_active).length;
  const commission = (staff || []).reduce((sum, s) => sum + ((s.salary || 0) * ((s.commission_amount || 0) / 100)), 0);

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Enter staff name', 'error'); return; }
    
    const dbData = {
      name: form.name,
      phone: form.phone,
      role: form.position?.toLowerCase() || 'cashier',
      shift_type: form.shift,
      is_active: form.status === 'Active',
      salary: parseFloat(form.salary) || 0,
      commission_type: form.commType || 'percentage',
      commission_amount: parseFloat(form.commAmount) || 0,
      pin: form.pin,
    };

    try {
      if (activeModal === 'editStaff' && modalData) {
        logger.info(`Updating staff profile: ${modalData.id}`, dbData);
        await updateStaff({ id: modalData.id, ...dbData });
        showToast('Staff profile updated successfully', 'success');
      } else {
        logger.info('Adding new staff member', dbData);
        await addStaff(dbData);
        showToast('Staff member added successfully', 'success');
      }
      closeModal();
      setForm({ name: '', position: 'Cashier', shift: 'full-time', phone: '', salary: '', commType: 'percentage', commAmount: '', pin: '', status: 'Active' });
    } catch (err) {
      logger.error('Failed to save staff profile', { error: err.message, form });
      showToast('Error saving staff: ' + err.message, 'error');
    }
  };

  const openEdit = (s) => {
    setForm({ 
      name: s.name, 
      phone: s.phone || '', 
      position: s.role?.charAt(0).toUpperCase() + s.role?.slice(1) || 'Cashier',
      shift: s.shift_type || 'full-time',
      status: s.is_active ? 'Active' : 'On Leave',
      salary: String(s.salary || 0),
      commType: s.commission_type || 'percentage',
      commAmount: String(s.commission_amount || 0),
      pin: s.pin || '',
    });
    openModal('editStaff', s);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[21px] font-extrabold tracking-[-0.4px]">Staff Management</div>
          <div className="text-[12.5px] text-theme3 mt-0.5">Manage employees, roles, access & commissions</div>
        </div>
        <button onClick={() => openModal('addStaff')} className="bg-[#3b82f6] text-white border-none px-3.5 py-2 rounded-lg text-[12.5px] font-semibold cursor-pointer hover:bg-[#2563eb]">+ Add Staff</button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Staff', value: (staff || []).length, color: '#3b82f6' },
          { label: 'Present Today', value: present, color: '#22c55e' },
          { label: 'Avg Hours', value: '8.5', color: '#f97316' },
          { label: 'Commission Due', value: formatCurrency(commission), color: '#8b5cf6' },
        ].map((s, i) => (
          <div key={i} className="bg-theme-surface border border-theme rounded-xl p-3.5">
            <div className="text-[10.5px] text-theme3 uppercase tracking-[.5px] font-semibold mb-1">{s.label}</div>
            <div className="text-[22px] font-extrabold tracking-[-0.5px]" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-theme-surface border border-theme rounded-t-xl px-4 py-3 flex items-center justify-between gap-3">
        <span className="text-[13px] font-bold">Staff Directory</span>
        <div className="flex gap-2">
          {selectedIds.length > 0 && isAdmin && (
            <button onClick={handleBulkDelete} className="bg-[rgba(239,68,68,.12)] border border-[rgba(239,68,68,.2)] px-3 py-1.5 rounded-lg text-[12.5px] font-bold text-[#ef4444] cursor-pointer hover:bg-[#ef4444] hover:text-white transition-all">
              Remove Selected ({selectedIds.length})
            </button>
          )}
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search staff…" className="bg-theme-elevated border border-theme2 rounded-lg py-1.5 px-3 text-xs text-theme outline-none w-60 focus:border-[#3b82f6]" />
          <button onClick={() => exportModuleAsCSV('staff', staff)} className="bg-theme-elevated border border-theme px-3 py-1.5 rounded-lg text-[12.5px] font-semibold text-theme2 cursor-pointer hover:bg-theme-hover flex items-center gap-2 transition-all">
            <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] stroke-current fill-none" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
        </div>
      </div>
      <div className="bg-theme-surface border-x border-b border-theme rounded-b-xl overflow-x-auto">
        <table className="w-full border-collapse min-w-[900px]">
          <thead>
            <tr>
              <th className="px-4 py-2.5 bg-theme-elevated border-b border-theme w-10">
                <input type="checkbox" onChange={toggleSelectAll} checked={paginatedData.length > 0 && paginatedData.every(s => selectedIds.includes(s.id))} className="cursor-pointer" />
              </th>
              {['Name', 'Position', 'Shift', 'Status', 'PIN', 'Access', 'Phone', 'Commission', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-[10.5px] text-theme3 font-bold text-left uppercase tracking-[.5px] bg-theme-elevated border-b border-theme">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(s => (
              <tr key={s.id} className={`hover:bg-theme-hover transition-colors ${selectedIds.includes(s.id) ? 'bg-theme-active' : ''}`}>
                <td className="px-4 py-2.5 border-b border-theme text-center">
                  <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => toggleSelect(s.id)} className="cursor-pointer" />
                </td>
                <td className="px-4 py-2.5 text-[13px] font-bold border-b border-theme">{s.name}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{s.role?.charAt(0).toUpperCase() + s.role?.slice(1)}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme"><span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(59,130,246,.12)] text-[#3b82f6]">{s.shift_type}</span></td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${s.is_active ? 'bg-[rgba(34,197,94,.12)] text-[#22c55e]' : 'bg-[rgba(249,115,22,.12)] text-[#f97316]'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">
                  <div className="flex items-center gap-1.5 font-mono">
                    {showPins[s.id] ? s.pin : '••••'}
                    <button onClick={() => setShowPins(prev => ({ ...prev, [s.id]: !prev[s.id] }))} className="text-[10px] text-[#3b82f6] hover:underline bg-none border-none p-0 cursor-pointer">{showPins[s.id] ? 'Hide' : 'Show'}</button>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme"><span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(139,92,246,.12)] text-[#8b5cf6]">{s.role?.toUpperCase() || 'CASHIER'}</span></td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{s.phone}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">{formatCurrency((s.salary || 0) * ((s.commission_amount || 0) / 100))}</td>
                <td className="px-4 py-2.5 text-[13px] border-b border-theme">
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(s)} className="bg-theme-elevated border border-theme px-2.5 py-1 rounded-md text-[11px] text-theme2 cursor-pointer hover:bg-theme-hover">Edit</button>
                    <button onClick={() => { logger.info('Generating payslip', { staffId: s.id }); printStaffPayslip(s); showToast('Payslip generated', 'info'); }} className="bg-theme-elevated border border-[#3b82f6]/20 px-2.5 py-1 rounded-md text-[11px] text-[#3b82f6] font-bold cursor-pointer hover:bg-[#3b82f6] hover:text-white transition-all">Payslip</button>
                    {isAdmin && (
                      <button onClick={async () => {
                        if (confirm('Remove this staff member?')) {
                          try {
                            logger.info(`Removing staff: ${s.id}`);
                            await deleteStaff(s.id);
                            showToast('Staff removed', 'success');
                          } catch (err) {
                            logger.error(`Failed to remove staff ${s.id}`, { error: err.message });
                            showToast('Remove failed: ' + err.message, 'error');
                          }
                        }
                      }} className="bg-theme-elevated border border-theme px-2.5 py-1 rounded-md text-[11px] text-theme2 cursor-pointer hover:bg-theme-hover">Remove</button>
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

      <Modal id="addStaff" title="Add Staff Member" subtitle="Fill in staff details" wide>
        <StaffForm form={form} setForm={setForm} />
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-[9px] bg-[#22c55e] text-white text-[13px] font-bold cursor-pointer border-none hover:bg-[#16a34a]">Save Staff</button>
          <button onClick={closeModal} className="px-4 py-2.5 rounded-[9px] bg-theme-elevated border border-theme text-theme2 text-[13px] cursor-pointer hover:bg-theme-hover">Cancel</button>
        </div>
      </Modal>

      <Modal id="editStaff" title="Edit Staff Member" subtitle="Update staff details" wide>
        <StaffForm form={form} setForm={setForm} />
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-[9px] bg-[#3b82f6] text-white text-[13px] font-bold cursor-pointer border-none hover:bg-[#2563eb]">Update Staff</button>
          <button onClick={closeModal} className="px-4 py-2.5 rounded-[9px] bg-theme-elevated border border-theme text-theme2 text-[13px] cursor-pointer hover:bg-theme-hover">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}

function StaffForm({ form, setForm }) {
  const Label = ({ title, sub }) => (
    <div className="mb-1.5 flex justify-between items-end">
        <label className="text-[11px] font-bold text-theme2 uppercase tracking-wide">{title}</label>
        {sub && <span className="text-[10px] text-[#3b82f6] font-medium">{sub}</span>}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
      {/* Basic Profile */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label title="Full Name *" />
          <input value={form.name} required onChange={e => setForm({...form, name: e.target.value})} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6] transition-all" />
        </div>
        <div>
          <Label title="Phone Number" />
          <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6]" />
        </div>
        <div>
          <Label title="Status" />
          <select value={form.status || 'Active'} onChange={e => setForm({...form, status: e.target.value})} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none">
            <option>Active</option><option>On Leave</option><option>Terminated</option>
          </select>
        </div>
      </div>

      <div className="h-px bg-theme opacity-50" />

      {/* Role & Access */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label title="Position" />
          <select value={form.position} onChange={e => setForm({...form, position: e.target.value})} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none">
            <option value="Cashier">Cashier</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
            <option value="Owner">Owner</option>
          </select>
        </div>
        <div>
          <Label title="Work Shift" />
          <select value={form.shift} onChange={e => setForm({...form, shift: e.target.value})} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none">
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="morning">Morning Shift</option>
            <option value="evening">Evening Shift</option>
          </select>
        </div>
        <div>
          <Label title="System Access" />
          <select value={form.position} onChange={e => setForm({...form, position: e.target.value})} 
              className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6]">
              <option value="Cashier">Cashier (Standard POS)</option>
              <option value="Manager">Manager (Inventory + Returns)</option>
              <option value="Admin">Admin (Full System)</option>
              <option value="Owner">Owner (Root Access)</option>
          </select>
        </div>
        <div>
          <Label title="Access PIN *" sub="Secret" />
          <input type="password" value={form.pin || ''} required onChange={e => setForm({...form, pin: e.target.value})} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6] font-mono tracking-widest" placeholder="••••" />
        </div>
      </div>

      <div className="h-px bg-theme opacity-50" />

      {/* Compensation */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label title="Base Salary" />
          <input type="number" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none font-bold" />
        </div>
        <div>
          <Label title="Comm. Type" />
          <select value={form.commType} onChange={e => setForm({...form, commType: e.target.value})} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none">
            <option value="percentage">Percentage</option><option value="fixed">Fixed</option>
          </select>
        </div>
        <div>
          <Label title="Rate" />
          <input type="number" value={form.commAmount} onChange={e => setForm({...form, commAmount: e.target.value})} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none" />
        </div>
      </div>
    </div>
  );
}

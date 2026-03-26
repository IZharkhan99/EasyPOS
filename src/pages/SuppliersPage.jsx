import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { useState, useMemo } from 'react';

export default function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, removeSupplier, openModal, closeModal, activeModal, modalData, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({ name: '', contact: '', phone: '', email: '', category: 'General' });

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.contact.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const handleEdit = (s) => {
    setFormData(s);
    openModal('editSupplier', s);
  };

  const handleAdd = () => {
    setFormData({ name: '', contact: '', phone: '', email: '', category: 'General' });
    openModal('addSupplier');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeModal === 'addSupplier') {
      addSupplier(formData);
    } else {
      updateSupplier(modalData.id, formData);
    }
    closeModal();
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[21px] font-extrabold tracking-[-0.4px]">Suppliers</div>
          <div className="text-[12.5px] text-theme3 mt-0.5">Manage your inventory vendors</div>
        </div>
        <button onClick={handleAdd} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-lg text-[13px] font-bold border-none cursor-pointer flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Supplier
        </button>
      </div>

      <div className="bg-theme-surface border border-theme rounded-xl overflow-hidden mb-4">
        <div className="p-3 border-b border-theme bg-theme-elevated/30 flex items-center gap-3">
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme3 stroke-current fill-none" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search suppliers..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full bg-theme-surface border border-theme rounded-lg py-2 pl-9 pr-3 text-[13px] text-theme outline-none focus:border-[#3b82f6]" />
          </div>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Supplier Name', 'Contact Person', 'Phone', 'Email', 'Category', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-[10.5px] text-theme3 font-bold text-left uppercase tracking-[.5px] bg-theme-elevated/50 border-b border-theme">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(s => (
              <tr key={s.id} className="hover:bg-theme-hover transition-colors">
                <td className="px-4 py-3 text-[13px] border-b border-theme font-semibold text-theme">{s.name}</td>
                <td className="px-4 py-3 text-[13px] border-b border-theme text-theme2">{s.contact}</td>
                <td className="px-4 py-3 text-[13px] border-b border-theme text-theme2">{s.phone}</td>
                <td className="px-4 py-3 text-[13px] border-b border-theme text-theme2">{s.email}</td>
                <td className="px-4 py-3 text-[13px] border-b border-theme">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-theme-elevated border border-theme text-theme3">{s.category}</span>
                </td>
                <td className="px-4 py-3 text-[13px] border-b border-theme">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(s)} className="p-1.5 rounded-md hover:bg-[#3b82f6]/10 text-theme3 hover:text-[#3b82f6] border-none bg-transparent cursor-pointer">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => { if(confirm('Delete supplier?')) removeSupplier(s.id); }} className="p-1.5 rounded-md hover:bg-[#ef4444]/10 text-theme3 hover:text-[#ef4444] border-none bg-transparent cursor-pointer">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} totalItems={filtered.length} />

      <Modal id={activeModal === 'addSupplier' ? 'addSupplier' : 'editSupplier'} title={activeModal === 'addSupplier' ? 'Add New Supplier' : 'Edit Supplier'} subtitle="Fill in the supplier details below">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[11px] font-bold text-theme2 uppercase tracking-wide mb-1.5 block">Supplier Name *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6] transition-all" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-theme2 uppercase tracking-wide mb-1.5 block">Contact Person</label>
              <input type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6]" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-theme2 uppercase tracking-wide mb-1.5 block">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6]">
                <option>General</option>
                <option>Food</option>
                <option>Electronics</option>
                <option>Clothing</option>
              </select>
            </div>
          </div>

          <div className="h-px bg-theme opacity-50" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-theme2 uppercase tracking-wide mb-1.5 block">Phone Number</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6]" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-theme2 uppercase tracking-wide mb-1.5 block">Email Address</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6]" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-2.5 rounded-lg border-none bg-[#3b82f6] text-white text-[13px] font-bold cursor-pointer hover:bg-[#2563eb]">Save Supplier</button>
            <button type="button" onClick={closeModal} className="px-6 py-2.5 rounded-lg border border-theme bg-transparent text-theme2 text-[13px] cursor-pointer hover:bg-theme-hover">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

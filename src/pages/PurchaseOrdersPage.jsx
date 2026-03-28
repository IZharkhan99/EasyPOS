import { useApp } from '../context/AppContext';
import { usePurchaseOrders } from '../hooks/usePurchaseOrders';
import { useSuppliers } from '../hooks/useSuppliers';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { useState, useMemo } from 'react';
import createLogger from '../utils/logger';
import { formatCurrency } from '../utils/formatters';

const logger = createLogger('PurchaseOrdersPage');

export default function PurchaseOrdersPage() {
   const { openModal, closeModal, activeModal, modalData, showToast, printSupplierInvoice } = useApp();
   const { purchaseOrders, createPurchaseOrder, updatePurchaseOrder, isLoading: isPOLoading } = usePurchaseOrders();
   const { suppliers, isLoading: isSuppliersLoading } = useSuppliers();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

   const [formData, setFormData] = useState({ supplier_id: '', total: 0, order_date: new Date().toISOString().split('T')[0], status: 'pending' });

  const filtered = (purchaseOrders || []).filter(po => 
    po.id?.toLowerCase().includes(search.toLowerCase()) || 
    po.supplier?.toLowerCase().includes(search.toLowerCase()) ||
    po.status?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const handleAdd = () => {
    setFormData({ 
      supplier_id: suppliers[0]?.id || '', 
      total: 0, 
      order_date: new Date().toISOString().split('T')[0], 
      status: 'pending' 
    });
    openModal('addPO');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      logger.info('Creating purchase order', formData);
      await createPurchaseOrder(formData);
      showToast('Purchase order created successfully', 'success');
      closeModal();
    } catch (err) {
      logger.error('Failed to create purchase order', { error: err.message, formData });
      showToast('Failed to create purchase order: ' + err.message, 'error');
    }
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'received': return '#22c55e';
      case 'pending': return '#f97316';
      case 'ordered': return '#3b82f6';
      case 'cancelled': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[21px] font-extrabold tracking-[-0.4px]">Purchase Orders</div>
          <div className="text-[12.5px] text-theme3 mt-0.5">Track stock restocks from vendors</div>
        </div>
        <button onClick={handleAdd} className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-4 py-2 rounded-lg text-[13px] font-bold border-none cursor-pointer flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Create PO
        </button>
      </div>

      <div className="bg-theme-surface border border-theme rounded-xl overflow-hidden mb-4">
        <div className="p-3 border-b border-theme bg-theme-elevated/30">
          <div className="relative w-72">
            <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme3 stroke-current fill-none" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search PO numbers or suppliers..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full bg-theme-surface border border-theme rounded-lg py-2 pl-9 pr-3 text-[13px] text-theme outline-none focus:border-[#3b82f6]" />
          </div>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['PO ID', 'Supplier', 'Order Date', 'Amount', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-[10.5px] text-theme3 font-bold text-left uppercase tracking-[.5px] bg-theme-elevated/50 border-b border-theme">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isPOLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(6)].map((__, j) => (
                    <td key={j} className="px-4 py-4 border-b border-theme">
                      <div className="h-4 bg-theme-elevated rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              paginatedData.map(po => (
                <tr key={po.id} className="hover:bg-theme-hover transition-colors">
                  <td className="px-4 py-3 text-[13px] border-b border-theme font-bold text-theme">{po.id}</td>
                  <td className="px-4 py-3 text-[13px] border-b border-theme text-theme2">{po.supplier}</td>
                  <td className="px-4 py-3 text-[13px] border-b border-theme text-theme2">{po.date}</td>
                  <td className="px-4 py-3 text-[13px] border-b border-theme font-bold text-theme">{formatCurrency(po.total || 0)}</td>
                  <td className="px-4 py-3 text-[13px] border-b border-theme">
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase" style={{ backgroundColor: getStatusColor(po.status) + '20', color: getStatusColor(po.status) }}>{po.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[13px] border-b border-theme whitespace-nowrap">
                    <div className="flex gap-2">
                      {po.status?.toLowerCase() === 'ordered' && (
                        <button 
                          onClick={async () => {
                            try {
                              logger.info('Updating PO status to received', { poId: po.id });
                              await updatePurchaseOrder({ id: po.id, data: { status: 'received' } });
                              showToast('Stock received successfully', 'success');
                            } catch (err) {
                              logger.error('Failed to update PO status', { error: err.message, poId: po.id });
                              showToast('Failed to update status: ' + err.message, 'error');
                            }
                          }} 
                          className="text-[11px] font-bold text-[#22c55e] bg-[rgba(34,197,94,.1)] border border-[rgba(34,197,94,.2)] px-2 py-1 rounded cursor-pointer hover:bg-[#22c55e] hover:text-white transition-all"
                        >
                          Receive Stock
                        </button>
                      )}
                      {po.status?.toLowerCase() === 'pending' && (
                        <button 
                          onClick={async () => {
                            try {
                              logger.info('Updating PO status to ordered', { poId: po.id });
                              await updatePurchaseOrder({ id: po.id, data: { status: 'ordered' } });
                              showToast('PO marked as ordered', 'success');
                            } catch (err) {
                              logger.error('Failed to update PO status', { error: err.message, poId: po.id });
                              showToast('Failed to update status: ' + err.message, 'error');
                            }
                          }} 
                          className="text-[11px] font-bold text-[#3b82f6] bg-[rgba(59,130,246,.1)] border border-[rgba(59,130,246,.2)] px-2 py-1 rounded cursor-pointer hover:bg-[#3b82f6] hover:text-white transition-all"
                        >
                          Mark Ordered
                        </button>
                      )}
                      <button onClick={() => printSupplierInvoice(po)} className="text-[11px] font-bold text-[#8b5cf6] bg-[rgba(139,92,246,.1)] border border-[rgba(139,92,246,.2)] px-2 py-1 rounded cursor-pointer hover:bg-[#8b5cf6] hover:text-white transition-all">
                        View Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            {!isPOLoading && paginatedData.length === 0 && (
              <tr><td colSpan="6" className="p-10 text-center text-theme3 italic">No purchase orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} totalItems={filtered.length} />

      <Modal id="addPO" title="Create Purchase Order" subtitle="Issue a new restock request to a supplier">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-[11px] font-bold text-theme2 uppercase tracking-wide mb-1.5 block">Supplier *</label>
              <select required value={formData.supplier_id} onChange={e => setFormData({...formData, supplier_id: e.target.value})} className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6]">
                <option value="" disabled>Select a supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="h-px bg-theme opacity-50" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-theme2 uppercase tracking-wide mb-1.5 block">Total Cost</label>
              <input type="number" step="0.01" required value={formData.total} onChange={e => setFormData({...formData, total: parseFloat(e.target.value)})} className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6] font-bold" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-theme2 uppercase tracking-wide mb-1.5 block">Expected Date</label>
              <input type="date" required value={formData.order_date} onChange={e => setFormData({...formData, order_date: e.target.value})} className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6]" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-2.5 rounded-lg border-none bg-[#8b5cf6] text-white text-[13px] font-bold cursor-pointer hover:bg-[#7c3aed]">Create PO</button>
            <button type="button" onClick={closeModal} className="px-6 py-2.5 rounded-lg border border-theme bg-transparent text-theme2 text-[13px] cursor-pointer hover:bg-theme-hover">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

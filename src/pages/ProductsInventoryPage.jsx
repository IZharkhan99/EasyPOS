import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';
import { useSuppliers } from '../hooks/useSuppliers';
import { useInventoryHistory } from '../hooks/useInventoryHistory';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';

export default function ProductsInventoryPage() {
  const { openModal, closeModal, activeModal, modalData, exportModuleAsCSV, showToast } = useApp();
  const { products, addProduct, updateProduct, deleteProduct, deleteMultipleProducts, isLoading: isProductsLoading } = useProducts();
  const { suppliers } = useSuppliers();
  const { inventoryHistory } = useInventoryHistory();
  const { profile } = useAuth();
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [form, setForm] = useState({ name: '', category: 'Electronics', sku: '', price: '', cost: '', stock: '10', tracking: 'none', serial: '', warranty: '', batch: '', expiry: '', color: '', size: '', warehouse: 'Main' });
  const [selectedIds, setSelectedIds] = useState([]);

  const filtered = useMemo(() =>
    (products || []).filter(p => !filter || p.name?.toLowerCase().includes(filter.toLowerCase()) || p.sku?.toLowerCase().includes(filter.toLowerCase())),
    [products, filter]
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const pIds = paginatedData.map(p => p.id);
    const allSelected = pIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !pIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...pIds])]);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
      deleteMultipleProducts(selectedIds);
      setSelectedIds([]);
    }
  };

  const inStock = (products || []).filter(p => (p.stock || 0) > (p.reorder || 0)).length;
  const lowStock = (products || []).filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= (p.reorder || 0)).length;
  const outOfStock = (products || []).filter(p => (p.stock || 0) === 0).length;

  const handleSave = () => {
    if (!form.name.trim()) { showToast('Enter product name', 'error'); return; }
    if (activeModal === 'editProduct' && modalData) {
      updateProduct(modalData.id, { ...form, price: parseFloat(form.price) || 0, cost: parseFloat(form.cost) || 0, stock: parseInt(form.stock) || 0 });
    } else {
      addProduct({ ...form, price: parseFloat(form.price) || 0, cost: parseFloat(form.cost) || 0, stock: parseInt(form.stock) || 10, reorder: 5, emoji: '📦' });
    }
    closeModal();
    setForm({ name: '', category: 'Electronics', sku: '', price: '', cost: '', stock: '10', tracking: 'none', serial: '', warranty: '', batch: '', expiry: '', color: '', size: '', warehouse: 'Main' });
  };

  const openEdit = (p) => {
    setForm({ ...p, price: String(p.price), cost: String(p.cost), stock: String(p.stock) });
    openModal('editProduct', p);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[21px] font-extrabold tracking-[-0.4px]">Products & Inventory</div>
          <div className="text-[12.5px] text-theme3 mt-0.5">Manage your product catalog and stock levels</div>
        </div>
        <button onClick={() => openModal('addProduct')} className="bg-[#3b82f6] text-white border-none px-3.5 py-2 rounded-lg text-[12.5px] font-semibold cursor-pointer hover:bg-[#2563eb]">+ Add Product</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Products', value: (products || []).length, color: '#3b82f6' },
          { label: 'In Stock', value: inStock, color: '#22c55e' },
          { label: 'Low Stock', value: lowStock, color: '#f97316' },
          { label: 'Out of Stock', value: outOfStock, color: '#ef4444' },
        ].map((s, i) => (
          <div key={i} className="bg-theme-surface border border-theme rounded-xl p-3.5">
            <div className="text-[10.5px] text-theme3 uppercase tracking-[.5px] font-semibold mb-1">{s.label}</div>
            <div className="text-[22px] font-extrabold tracking-[-0.5px]" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-theme-surface border border-theme rounded-t-xl px-4 py-3 flex items-center justify-between gap-3">
        <span className="text-[13px] font-bold">Product Catalog</span>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <button onClick={handleBulkDelete} className="bg-[rgba(239,68,68,.12)] border border-[rgba(239,68,68,.2)] px-3 py-1.5 rounded-lg text-[12.5px] font-bold text-[#ef4444] cursor-pointer hover:bg-[#ef4444] hover:text-white transition-all">
              Delete Selected ({selectedIds.length})
            </button>
          )}
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search products…" className="bg-theme-elevated border border-theme2 rounded-lg py-1.5 px-3 text-xs text-theme outline-none w-60 focus:border-[#3b82f6]" />
          <button onClick={() => exportModuleAsCSV('products', products)} className="bg-theme-elevated border border-theme px-3 py-1.5 rounded-lg text-[12.5px] font-semibold text-theme2 cursor-pointer hover:bg-theme-hover flex items-center gap-2 transition-all">
            <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] stroke-current fill-none" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-theme-surface border-x border-b border-theme rounded-b-xl overflow-x-auto">
        <table className="w-full border-collapse min-w-[1000px]">
          <thead>
            <tr>
              <th className="px-4 py-2.5 bg-theme-elevated border-b border-theme w-10">
                <input type="checkbox" onChange={toggleSelectAll} checked={paginatedData.length > 0 && paginatedData.every(p => selectedIds.includes(p.id))} className="cursor-pointer" />
              </th>
              {['Product', 'Category', 'Price', 'Cost', 'Margin', 'Stock', 'Tracking', 'Details', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-[10.5px] text-theme3 font-bold text-left uppercase tracking-[.5px] bg-theme-elevated border-b border-theme">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(p => {
              const tracking = p.tracking || 'none';
              let details = '—';
              if (tracking === 'serial') details = `IMEI: ${p.serial || '—'}`;
              else if (tracking === 'batch') details = `Exp: ${p.expiry || '—'}`;
              else if (tracking === 'variant') details = `${p.color || '—'} / ${p.size || '—'}`;
              return (
                <tr key={p.id} className={`hover:bg-theme-hover transition-colors ${selectedIds.includes(p.id) ? 'bg-theme-active' : ''}`}>
                  <td className="px-4 py-2.5 border-b border-theme text-center">
                    <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} className="cursor-pointer" />
                  </td>
                  <td className="px-4 py-2.5 text-[13px] font-bold border-b border-theme">{p.name}</td>
                  <td className="px-4 py-2.5 text-[13px] border-b border-theme">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[rgba(59,130,246,.12)] text-[#3b82f6]">{p.category}</span>
                  </td>
                  <td className="px-4 py-2.5 text-[13px] font-bold text-[#3b82f6] border-b border-theme">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-[13px] text-theme3 border-b border-theme">${p.cost.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-[13px] font-semibold text-[#22c55e] border-b border-theme">${(p.price - p.cost).toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-[13px] font-semibold border-b border-theme">{p.stock}</td>
                  <td className="px-4 py-2.5 text-[13px] border-b border-theme">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(59,130,246,.12)] text-[#3b82f6]">{tracking === 'none' ? 'Simple' : tracking.charAt(0).toUpperCase() + tracking.slice(1)}</span>
                  </td>
                  <td className="px-4 py-2.5 text-[11px] text-theme3 border-b border-theme">{details}</td>
                  <td className="px-4 py-2.5 text-[13px] border-b border-theme">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${p.stock === 0 ? 'bg-[rgba(239,68,68,.12)] text-[#ef4444]' : p.stock <= p.reorder ? 'bg-[rgba(249,115,22,.12)] text-[#f97316]' : 'bg-[rgba(34,197,94,.12)] text-[#22c55e]'}`}>
                      {p.stock === 0 ? 'Out' : p.stock <= p.reorder ? 'Low' : 'OK'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[13px] border-b border-theme flex gap-1">
                    <button onClick={() => openModal('viewHistory', p)} title="View History" className="bg-theme-elevated border border-theme px-2 py-1 rounded-md text-[11px] text-theme2 cursor-pointer hover:bg-theme-hover">
                      <svg viewBox="0 0 24 24" className="w-[13px] h-[13px] stroke-current fill-none" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    </button>
                    <button onClick={() => openEdit(p)} className="bg-theme-elevated border border-theme px-2.5 py-1 rounded-md text-[11px] text-theme2 cursor-pointer hover:bg-theme-hover">Edit</button>
                    {profile?.role !== 'cashier' && (
                      <button onClick={() => deleteProduct(p.id)} className="bg-theme-elevated border border-theme px-2.5 py-1 rounded-md text-[11px] text-[#ef4444] cursor-pointer hover:bg-[rgba(239,68,68,.12)]">Delete</button>
                    )}
                  </td>
                </tr>
              );
            })}
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

      {/* Add Product Modal */}
      <Modal id="addProduct" title="Add New Product" subtitle="Fill in product details" wide>
        <ProductForm form={form} setForm={setForm} suppliers={suppliers} />
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-[9px] bg-[#22c55e] text-white text-[13px] font-bold cursor-pointer border-none hover:bg-[#16a34a]">Save Product</button>
          <button onClick={closeModal} className="px-4 py-2.5 rounded-[9px] bg-theme-elevated border border-theme text-theme2 text-[13px] cursor-pointer hover:bg-theme-hover">Cancel</button>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal id="editProduct" title="Edit Product" subtitle="Update product information" wide>
        <ProductForm form={form} setForm={setForm} suppliers={suppliers} />
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-[9px] bg-[#3b82f6] text-white text-[13px] font-bold cursor-pointer border-none hover:bg-[#2563eb]">Update Product</button>
          <button onClick={closeModal} className="px-4 py-2.5 rounded-[9px] bg-theme-elevated border border-theme text-theme2 text-[13px] cursor-pointer hover:bg-theme-hover">Cancel</button>
        </div>
      </Modal>

      {/* Inventory History Modal */}
      <Modal id="viewHistory" title={`${modalData?.name} - Stock History`} subtitle="View all stock adjustments for this item" wide>
        <div className="bg-theme-elevated border border-theme rounded-lg overflow-hidden">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-theme-surface">
                <th className="px-3 py-2 text-left text-theme3 font-bold uppercase tracking-wider border-b border-theme">Date</th>
                <th className="px-3 py-2 text-left text-theme3 font-bold uppercase tracking-wider border-b border-theme">Reason</th>
                <th className="px-3 py-2 text-right text-theme3 font-bold uppercase tracking-wider border-b border-theme">Change</th>
                <th className="px-3 py-2 text-right text-theme3 font-bold uppercase tracking-wider border-b border-theme">New Stock</th>
              </tr>
            </thead>
            <tbody>
              {inventoryHistory.filter(h => h.productId === modalData?.id).length > 0 ? (
                inventoryHistory.filter(h => h.productId === modalData?.id).map(h => (
                  <tr key={h.id} className="border-b border-theme hover:bg-theme-hover">
                    <td className="px-3 py-2 text-theme2">{new Date(h.timestamp).toLocaleString()}</td>
                    <td className="px-3 py-2 text-theme font-medium">{h.reason}</td>
                    <td className={`px-3 py-2 text-right font-bold ${h.delta > 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                      {h.delta > 0 ? `+${h.delta}` : h.delta}
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-theme">{h.newStock}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="px-3 py-8 text-center text-theme3 italic">No history found for this product</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={closeModal} className="px-6 py-2 rounded-lg bg-theme-elevated border border-theme text-theme2 text-[13px] font-semibold cursor-pointer hover:bg-theme-hover">Close</button>
        </div>
      </Modal>
    </div>
  );
}

function ProductForm({ form, setForm, suppliers }) {
  const Label = ({ title, sub }) => (
    <div className="mb-1.5 flex justify-between items-end">
        <label className="text-[11px] font-bold text-theme2 uppercase tracking-wide">{title}</label>
        {sub && <span className="text-[10px] text-[#3b82f6] font-medium">{sub}</span>}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label title="Product Name *" />
          <input value={form.name} required onChange={e => setForm({ ...form, name: e.target.value })} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6] transition-all" />
        </div>
        <div>
          <Label title="Category" />
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6] transition-all">
            {['Electronics', 'Mobiles', 'Laptops', 'Accessories', 'Storage', 'Networking', 'Supplies'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <Label title="SKU / Barcode" />
          <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6] transition-all" placeholder="e.g. PRD-001" />
        </div>
      </div>

      <div className="h-px bg-theme opacity-50" />

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label title="Selling Price" sub="$" />
          <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6] font-bold" />
        </div>
        <div>
          <Label title="Cost Price" sub="$" />
          <input type="number" step="0.01" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6]" />
        </div>
        <div className="col-span-2 text-center text-[11px] font-bold py-1 bg-theme-elevated/40 rounded italic text-theme3">
            Margin: <span className="text-[#22c55e]">${(parseFloat(form.price || 0) - parseFloat(form.cost || 0)).toFixed(2)} ({form.price > 0 ? (((form.price-form.cost)/form.price)*100).toFixed(1) : '0'}%)</span>
        </div>
      </div>

      <div className="h-px bg-theme opacity-50" />

      {/* Inventory */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label title="Available Stock" />
          <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6] font-bold" />
        </div>
        <div>
          <Label title="Reorder Level" />
          <input type="number" value={form.reorder} onChange={e => setForm({ ...form, reorder: e.target.value })} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6]" />
        </div>
        <div>
          <Label title="Warehouse" />
          <select value={form.warehouse} onChange={e => setForm({ ...form, warehouse: e.target.value })} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6]">
            <option>Main</option><option>Branch A</option><option>Branch B</option>
          </select>
        </div>
        <div>
          <Label title="Supplier" />
          <select value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} 
            className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6]">
            <option value="">Select Supplier</option>
            {suppliers?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="h-px bg-theme opacity-50" />

      {/* Tracking */}
      <div>
        <Label title="Stock Tracking Method" />
        <select value={form.tracking} onChange={e => setForm({ ...form, tracking: e.target.value })} 
          className="w-full bg-theme-elevated border border-theme rounded-lg py-2.5 px-3 text-[13px] text-theme outline-none focus:border-[#3b82f6] mb-4">
          <option value="none">Standard Inventory (Simple)</option>
          <option value="serial">Serial Number / IMEI</option>
          <option value="batch">Batch & Expiry Date</option>
          <option value="variant">Product Variants (Size/Color)</option>
        </select>

        {form.tracking !== 'none' && (
          <div className="bg-theme-elevated/40 p-4 rounded-xl border border-dashed border-theme gap-4 grid grid-cols-2 animate-in slide-in-from-top-2 duration-300">
            {form.tracking === 'serial' && <>
              <div><Label title="Serial / IMEI" /><input value={form.serial} onChange={e => setForm({ ...form, serial: e.target.value })} className="w-full bg-theme-surface border border-theme rounded-lg py-2 px-3 text-xs text-theme" /></div>
              <div><Label title="Warranty (Months)" /><input type="number" value={form.warranty} onChange={e => setForm({ ...form, warranty: e.target.value })} className="w-full bg-theme-surface border border-theme rounded-lg py-2 px-3 text-xs text-theme" /></div>
            </>}
            {form.tracking === 'batch' && <>
              <div><Label title="Batch #" /><input value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} className="w-full bg-theme-surface border border-theme rounded-lg py-2 px-3 text-xs text-theme" /></div>
              <div><Label title="Expiry Date" /><input type="date" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} className="w-full bg-theme-surface border border-theme rounded-lg py-2 px-3 text-xs text-theme" /></div>
            </>}
            {form.tracking === 'variant' && <>
              <div><Label title="Color" /><input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-full bg-theme-surface border border-theme rounded-lg py-2 px-3 text-xs text-theme" /></div>
              <div><Label title="Size" /><input value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} className="w-full bg-theme-surface border border-theme rounded-lg py-2 px-3 text-xs text-theme" /></div>
            </>}
          </div>
        )}
      </div>
    </div>
  );
}

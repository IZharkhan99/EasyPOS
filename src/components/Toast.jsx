import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast } = useApp();
  return (
    <div className={`fixed bottom-[22px] left-1/2 -translate-x-1/2 bg-theme-elevated border rounded-[9px] px-4 py-2.5 text-[12.5px] text-theme z-[999] transition-all duration-250 pointer-events-none whitespace-nowrap ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} ${toast.type === 'success' ? 'border-[rgba(34,197,94,.4)] text-[#22c55e]' : toast.type === 'error' ? 'border-[rgba(239,68,68,.4)] text-[#ef4444]' : 'border-theme2'}`}>
      {toast.msg}
    </div>
  );
}

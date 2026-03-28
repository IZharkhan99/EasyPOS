import { useApp } from '../context/AppContext';
import { useEffect, useState } from 'react';

const TOAST_STYLES = {
  success: { bg: 'bg-[#10b981]', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> },
  error: { bg: 'bg-[#ef4444]', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> },
  info: { bg: 'bg-[#3b82f6]', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> },
  warning: { bg: 'bg-[#f59e0b]', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
};

export default function Toast() {
  const { toast } = useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
      // Fade out slightly before the toast object is cleared from state
      const timer = setTimeout(() => setVisible(false), 2700);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.success;

  return (
    <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl text-white text-[14px] font-bold z-[500] shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex items-center gap-4 min-w-[320px] justify-center transition-all duration-300 transform ${visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'} ${style.bg}`}>
      <span className="flex-shrink-0 p-1.5 rounded-full bg-white/20">
        {style.icon}
      </span>
      <span className="tracking-tight leading-tight">{toast.message}</span>
    </div>
  );
}

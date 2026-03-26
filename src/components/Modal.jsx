import { useApp } from '../context/AppContext';

export default function Modal({ id, title, subtitle, children, wide }) {
  const { activeModal, closeModal } = useApp();
  if (activeModal !== id) return null;
  return (
    <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-[200] animate-[fadeIn_.2s]" onClick={closeModal}>
      <div className={`bg-theme-surface border border-theme2 rounded-2xl p-6 max-h-[90vh] overflow-y-auto ${wide ? 'w-[500px]' : 'w-[400px]'} max-w-[92vw]`}
        onClick={e => e.stopPropagation()}>
        {title && <div className="text-[17px] font-extrabold mb-1 text-theme">{title}</div>}
        {subtitle && <div className="text-[12.5px] text-theme3 mb-4">{subtitle}</div>}
        {children}
      </div>
    </div>
  );
}

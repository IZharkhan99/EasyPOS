export default function Pagination({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }) {
  const pages = [];
  const maxPagesToShow = 7;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-4 border-t border-theme bg-theme-elevated">
      <div className="text-xs text-theme3">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-2 py-1.5 rounded-md border border-theme bg-theme-elevated text-theme2 text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-theme-hover hover:text-theme disabled:hover:bg-theme-elevated"
        >
          ‹‹
        </button>
        
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1.5 rounded-md border border-theme bg-theme-elevated text-theme2 text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-theme-hover hover:text-theme disabled:hover:bg-theme-elevated"
        >
          ‹
        </button>

        {startPage > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="px-2 py-1.5 rounded-md border border-theme bg-theme-elevated text-theme2 text-xs font-semibold cursor-pointer hover:bg-theme-hover hover:text-theme">1</button>
            {startPage > 2 && <span className="px-1.5 text-theme3">…</span>}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-2.5 py-1.5 rounded-md border text-xs font-semibold cursor-pointer transition-all ${
              page === currentPage
                ? 'border-[#3b82f6] bg-[#3b82f6] text-white'
                : 'border-theme bg-theme-elevated text-theme2 hover:bg-theme-hover hover:text-theme'
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-1.5 text-theme3">…</span>}
            <button onClick={() => onPageChange(totalPages)} className="px-2 py-1.5 rounded-md border border-theme bg-theme-elevated text-theme2 text-xs font-semibold cursor-pointer hover:bg-theme-hover hover:text-theme">{totalPages}</button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1.5 rounded-md border border-theme bg-theme-elevated text-theme2 text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-theme-hover hover:text-theme disabled:hover:bg-theme-elevated"
        >
          ›
        </button>
        
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2 py-1.5 rounded-md border border-theme bg-theme-elevated text-theme2 text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-theme-hover hover:text-theme disabled:hover:bg-theme-elevated"
        >
          ››
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-theme2 font-semibold">Go to page:</label>
        <input
          type="number"
          min="1"
          max={totalPages}
          defaultValue={currentPage}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const page = Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1));
              onPageChange(page);
              e.target.value = currentPage;
            }
          }}
          className="w-12 px-2 py-1.5 rounded-md border border-theme2 bg-theme-elevated text-xs text-theme outline-none focus:border-[#3b82f6]"
        />
      </div>
    </div>
  );
}

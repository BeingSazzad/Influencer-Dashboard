import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [8, 16, 24, 50],
  onPageChange,
  onPageSizeChange,
  className = '',
  itemLabel = 'items',
}) => {
  if (totalItems === 0) return null;

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with smart ellipsis window
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2 px-2 text-xs select-none ${className}`}
    >
      {/* Left: Summary Count */}
      <div className="text-neutral-500 font-medium order-2 sm:order-1 text-center sm:text-left">
        Showing <span className="font-black text-neutral-950">{startItem}</span> to{' '}
        <span className="font-black text-neutral-950">{endItem}</span> of{' '}
        <span className="font-black text-neutral-950">{totalItems}</span> {itemLabel}
      </div>

      {/* Right: Controls & Page Numbers */}
      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 order-1 sm:order-2 w-full sm:w-auto">
        {/* Rows per page selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 mr-2">
            <span className="text-neutral-500 font-semibold text-xs hidden md:inline">Rows:</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => {
                  onPageSizeChange(Number(e.target.value));
                  onPageChange(1);
                }}
                className="h-8 pl-2.5 pr-7 text-xs font-bold bg-white border border-neutral-200 rounded-lg text-neutral-800 outline-none focus:border-brand-pink cursor-pointer appearance-none shadow-2xs"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} / page
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Page Nav Buttons */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
          {/* First Page Button */}
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            title="First Page"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          {/* Prev Button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Previous Page"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Numbered Page Buttons */}
          <div className="flex items-center gap-1 px-1">
            {getPageNumbers().map((page, idx) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-6 text-center text-neutral-400 font-bold tracking-widest text-[11px]"
                  >
                    …
                  </span>
                );
              }

              const isCurrent = currentPage === page;
              return (
                <button
                  key={`page-${page}`}
                  type="button"
                  onClick={() => onPageChange(Number(page))}
                  className={`w-7 h-7 text-xs font-bold rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="Next Page"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Last Page Button */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            title="Last Page"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { EmptyState } from './PageHeader';

export type ColumnType =
  | 'row-number'
  | 'checkbox'
  | 'date'
  | 'status'
  | 'amount'
  | 'number'
  | 'short-text'
  | 'main-text'
  | 'actions';

export interface ColumnDef<T> {
  key: string;
  header: string;
  type: ColumnType;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  // Selection
  selectedIds?: string[];
  onSelectRow?: (id: string) => void;
  onSelectAll?: (selectAll: boolean) => void;
  // Bulk action banner
  bulkActions?: React.ReactNode;
  // Pagination
  pageSize?: number;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  isLoading = false,
  error = null,
  emptyMessage = 'Belum ada data',
  emptyActionLabel,
  onEmptyAction,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  bulkActions,
  pageSize = 10,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Column width & alignment calculation by type
  const getColumnStyle = (col: ColumnDef<T>) => {
    if (col.width) return { width: col.width, minWidth: col.width };

    switch (col.type) {
      case 'row-number':
        return { width: '56px', minWidth: '56px', textAlign: 'center' as const };
      case 'checkbox':
        return { width: '48px', minWidth: '48px', textAlign: 'center' as const };
      case 'date':
        return { width: '120px', minWidth: '120px', textAlign: 'left' as const };
      case 'status':
        return { width: '120px', minWidth: '120px', textAlign: 'left' as const };
      case 'amount':
      case 'number':
        return { width: '130px', minWidth: '130px', textAlign: 'right' as const };
      case 'short-text':
        return { width: '140px', minWidth: '140px', textAlign: 'left' as const };
      case 'actions':
        return { width: '96px', minWidth: '96px', textAlign: 'right' as const };
      case 'main-text':
      default:
        return { width: '260px', minWidth: '220px', textAlign: 'left' as const };
    }
  };

  const getCellAlignment = (col: ColumnDef<T>) => {
    if (col.align) {
      if (col.align === 'center') return 'text-center';
      if (col.align === 'right') return 'text-right';
      return 'text-left';
    }
    switch (col.type) {
      case 'row-number':
      case 'checkbox':
        return 'text-center';
      case 'amount':
      case 'number':
      case 'actions':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  // Calculate table minimum width based on columns
  const tableMinWidth = columns.reduce((acc, col) => {
    if (col.width && col.width.endsWith('px')) {
      return acc + parseInt(col.width, 10);
    }
    switch (col.type) {
      case 'row-number': return acc + 56;
      case 'checkbox': return acc + 48;
      case 'date': return acc + 120;
      case 'status': return acc + 120;
      case 'amount':
      case 'number': return acc + 130;
      case 'short-text': return acc + 140;
      case 'actions': return acc + 96;
      case 'main-text':
      default: return acc + 240;
    }
  }, onSelectAll ? 48 : 0);

  // Pagination calculation
  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, data.length);
  const paginatedData = data.slice(startIndex, endIndex);

  const isAllSelected =
    data.length > 0 && paginatedData.every((item) => selectedIds.includes(rowKey(item)));
  const isSomeSelected =
    paginatedData.some((item) => selectedIds.includes(rowKey(item))) && !isAllSelected;

  return (
    <div className="w-full flex flex-col my-2 min-w-0">
      {/* Bulk action banner if items selected */}
      {selectedIds.length > 0 && bulkActions && (
        <div className="flex items-center justify-between px-4 py-2.5 mb-2 bg-[#EEE4FA] border border-[#DEC9F5] rounded-[6px] text-sm text-[#6D3FA6]">
          <span className="font-medium">{selectedIds.length} baris data dipilih</span>
          <div className="flex items-center gap-2">{bulkActions}</div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="w-full bg-white border border-[#E6DFF1] rounded-[8px] overflow-hidden shadow-none">
        <div className="w-full overflow-x-auto">
          <table
            className="w-full text-left border-collapse"
            style={{ minWidth: `${Math.max(760, tableMinWidth)}px`, tableLayout: 'fixed' }}
          >
            {/* Header */}
            <thead>
              <tr className="h-[40px] bg-[#FAF8FD] border-b border-[#E6DFF1] sticky top-0 z-10">
                {onSelectAll && (
                  <th style={{ width: '48px', minWidth: '48px' }} className="px-4 py-2 text-center align-middle">
                    <input
                      type="checkbox"
                      aria-label="Pilih semua baris pada halaman ini"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={(e) => onSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-[#E6DFF1] text-[#8650C4] focus:ring-[#8650C4]"
                    />
                  </th>
                )}
                {columns.map((col) => {
                  const style = getColumnStyle(col);
                  const alignClass = getCellAlignment(col);
                  return (
                    <th
                      key={col.key}
                      style={style}
                      className={`px-4 py-2 text-xs font-semibold text-[#6B6480] uppercase tracking-wider align-middle whitespace-nowrap overflow-hidden text-ellipsis ${alignClass}`}
                    >
                      {col.header}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-[#E6DFF1]">
              {isLoading ? (
                // Skeleton Rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skel-${idx}`} className="h-[44px] animate-pulse">
                    {onSelectAll && (
                      <td className="px-4 py-2 text-center align-middle">
                        <div className="w-4 h-4 bg-[#EEE4FA] rounded mx-auto" />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={`skel-td-${col.key}`} className="px-4 py-2 align-middle">
                        <div className="h-4 bg-[#EEE4FA] rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                // Error State
                <tr>
                  <td
                    colSpan={columns.length + (onSelectAll ? 1 : 0)}
                    className="h-[120px] px-4 py-6 text-center text-sm text-[#B4303C]"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-5 h-5 text-[#B4303C]" strokeWidth={1.5} />
                      <span>{error}</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                // Empty State
                <tr>
                  <td
                    colSpan={columns.length + (onSelectAll ? 1 : 0)}
                    className="p-8 text-center"
                  >
                    <EmptyState
                      title={emptyMessage}
                      description="Data belum tersedia untuk filter atau kriteria ini."
                      actionLabel={emptyActionLabel}
                      onAction={onEmptyAction}
                    />
                  </td>
                </tr>
              ) : (
                // Data Rows
                paginatedData.map((row, index) => {
                  const id = rowKey(row);
                  const isSelected = selectedIds.includes(id);

                  return (
                    <tr
                      key={id}
                      className={`h-[44px] text-sm text-[#2D2640] transition-colors border-b border-[#E6DFF1] hover:bg-[#FAF8FD] ${
                        isSelected ? 'bg-[#F7F2FD]' : 'bg-white'
                      }`}
                    >
                      {onSelectRow && (
                        <td className="px-4 py-2 text-center align-middle">
                          <input
                            type="checkbox"
                            aria-label={`Pilih baris ${startIndex + index + 1}`}
                            checked={isSelected}
                            onChange={() => onSelectRow(id)}
                            className="w-4 h-4 rounded border-[#E6DFF1] text-[#8650C4] focus:ring-[#8650C4]"
                          />
                        </td>
                      )}
                      {columns.map((col) => {
                        const alignClass = getCellAlignment(col);
                        const isTabular =
                          col.type === 'amount' ||
                          col.type === 'number' ||
                          col.type === 'row-number' ||
                          col.type === 'date';

                        // Content
                        let content: React.ReactNode;
                        if (col.render) {
                          content = col.render(row, startIndex + index);
                        } else if (col.type === 'row-number') {
                          content = startIndex + index + 1;
                        } else {
                          const val = (row as any)[col.key];
                          content = val !== undefined && val !== null ? String(val) : '-';
                        }

                        const textContent =
                          typeof content === 'string' || typeof content === 'number'
                            ? String(content)
                            : undefined;

                        const style = getColumnStyle(col);
                        return (
                          <td
                            key={col.key}
                            style={style}
                            title={textContent}
                            className={`px-4 py-2 align-middle truncate overflow-hidden text-ellipsis ${alignClass} ${
                              isTabular ? 'tabular-nums' : ''
                            }`}
                          >
                            {content}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with strict 48px height */}
        {!isLoading && !error && data.length > 0 && (
          <div className="h-[48px] px-4 border-t border-[#E6DFF1] bg-[#FAF8FD] flex items-center justify-between text-xs text-[#6B6480] tabular-nums">
            <div>
              Menampilkan {startIndex + 1}–{endIndex} dari {data.length} total data
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={validCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="hidden sm:inline">Sebelumnya</span>
              </Button>

              <span className="px-2 py-1 font-medium text-[#2D2640]">
                Hal {validCurrentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={validCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Halaman selanjutnya"
              >
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

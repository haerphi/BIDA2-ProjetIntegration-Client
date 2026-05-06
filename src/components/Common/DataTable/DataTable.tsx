import { type ReactNode } from 'react';
import type { ColumnDef, FilterFieldDef } from './data-table.types';
import DebouncedInput from '../../form/debounced-input';

const DEFAULT_PAGE_SIZES = [5, 10, 25, 50];

export interface DataTableProps<T> {
  filters?: FilterFieldDef[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;

  columns: ColumnDef<T>[];
  data: T[];
  rowKey: (row: T) => string | number;

  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  loadingLabel?: string;

  page?: number;
  total?: number;
  limit?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  debounceMs?: number;

  renderFooter?: () => ReactNode;
}
export function DataTable<T>(props: DataTableProps<T>) {
  const {
    /* filters */
    filters,
    filterValues = {},
    onFilterChange,
    /* data */
    columns,
    data,
    rowKey,
    /* state */
    isLoading = false,
    error = null,
    emptyMessage = 'Aucun résultat ne correspond aux critères sélectionnés.',
    loadingLabel = 'des données',
    /* pagination */
    page = 1,
    total = 0,
    limit = 10,
    totalPages = 1,
    onPageChange,
    onLimitChange,
    pageSizeOptions = DEFAULT_PAGE_SIZES,
    itemLabel = 'résultat',
    debounceMs = 500,
    /* footer override */
    renderFooter,
  } = props;

  const colSpan = columns.length;

  /* ── Pagination helpers ─────────────────────────── */
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && onPageChange) {
      onPageChange(newPage);
    }
  };

  /** Build the array of page numbers + ellipsis markers. */
  const buildPageNumbers = (): (number | 'ellipsis')[] => {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter((p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
      .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
        if (i > 0 && p - (arr[i - 1] as number) > 1) {
          acc.push('ellipsis');
        }
        acc.push(p);
        return acc;
      }, []);
  };

  /* ── Render ─────────────────────────────────────── */
  return (
    <div className="p-4 overflow-auto mx-auto w-100" style={{ maxWidth: '1200px' }}>
      {/* Filter bar */}
      {filters && filters.length > 0 && (
        <div className="card bg-white rounded-3 border-stone-200 mb-4 shadow-sm border-0 p-4">
          <div className="d-flex gap-3 align-items-end flex-wrap">
            {filters.map((f) => {
              const grow = f.grow !== false;
              return (
                <div
                  key={f.key}
                  className={grow ? 'flex-grow-1' : undefined}
                  style={{ minWidth: f.minWidth ?? '160px' }}
                >
                  <label htmlFor={f.key} className="form-label fw-medium small mb-1">
                    {f.label}
                  </label>

                  {f.type === 'text' ? (
                    <DebouncedInput
                      id={f.key}
                      className="form-control custom-input"
                      placeholder={f.placeholder}
                      value={filterValues[f.key] ?? ''}
                      onChange={(val) => onFilterChange?.(f.key, val)}
                      debounceMs={debounceMs}
                    />
                  ) : (
                    <select
                      id={f.key}
                      className="form-select custom-select"
                      value={filterValues[f.key] ?? ''}
                      onChange={(e) => onFilterChange?.(f.key, e.target.value)}
                    >
                      {f.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table card */}
      <div className="card bg-white rounded-3 border-stone-200 shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0 text-start align-middle">
            <thead className="bg-stone-50 border-stone-200 text-stone-700">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-3 px-4 bg-stone-50 border-stone-200 fw-medium ${col.className ?? ''}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="border-stone-100">
              {/* Loading */}
              {isLoading && (
                <tr>
                  <td colSpan={colSpan} className="text-center py-5 text-stone-400">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Chargement…</span>
                    </div>
                    Chargement {loadingLabel}…
                  </td>
                </tr>
              )}

              {/* Error */}
              {!isLoading && error && (
                <tr>
                  <td colSpan={colSpan} className="text-center py-5 text-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!isLoading && !error && data.length === 0 && (
                <tr>
                  <td colSpan={colSpan} className="text-center py-5 text-stone-400">
                    {emptyMessage}
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!isLoading &&
                !error &&
                data.map((row) => (
                  <tr key={rowKey(row)}>
                    {columns.map((col) => (
                      <td key={col.key} className={`py-3 px-4 ${col.className ?? ''}`}>
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        {renderFooter ? (
          renderFooter()
        ) : onPageChange ? (
          <div className="p-3 d-flex justify-content-between align-items-center border-top border-stone-200 bg-stone-50 flex-wrap gap-2">
            {/* Left side – item counter + page size */}
            <div className="d-flex align-items-center gap-3">
              <div className="text-stone-500 small">
                {total === 0
                  ? 'Aucun résultat'
                  : `${startItem}–${endItem} sur ${total} ${itemLabel}${total !== 1 ? 's' : ''}`}
              </div>
              {onLimitChange && (
                <div className="d-flex align-items-center gap-2">
                  <label htmlFor="dt-page-size" className="text-stone-500 small mb-0">
                    Lignes :
                  </label>
                  <select
                    id="dt-page-size"
                    className="form-select form-select-sm"
                    style={{ width: 'auto' }}
                    value={limit}
                    onChange={(e) => onLimitChange(Number(e.target.value))}
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right side – page buttons */}
            <nav aria-label={`Pagination des ${itemLabel}s`}>
              <ul className="pagination pagination-sm mb-0">
                {/* First */}
                <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(1)}
                    disabled={page <= 1}
                    aria-label="Première page"
                  >
                    «
                  </button>
                </li>
                {/* Prev */}
                <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    aria-label="Page précédente"
                  >
                    ‹
                  </button>
                </li>

                {/* Page numbers */}
                {buildPageNumbers().map((item, idx) =>
                  item === 'ellipsis' ? (
                    <li key={`ellipsis-${idx}`} className="page-item disabled">
                      <span className="page-link">…</span>
                    </li>
                  ) : (
                    <li key={item} className={`page-item ${page === item ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(item)}>
                        {item}
                      </button>
                    </li>
                  ),
                )}

                {/* Next */}
                <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    aria-label="Page suivante"
                  >
                    ›
                  </button>
                </li>
                {/* Last */}
                <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={page >= totalPages}
                    aria-label="Dernière page"
                  >
                    »
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        ) : null}
      </div>
    </div>
  );
}

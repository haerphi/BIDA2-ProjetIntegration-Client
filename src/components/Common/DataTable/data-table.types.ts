import type { ReactNode } from 'react';

/**
 * Single column in the DataTable.
 */
export interface ColumnDef<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

/**
 * Single filter field rendered above the table.
 */
export interface FilterFieldDef {
  key: string;
  label: string;
  type: 'text' | 'select';
  placeholder?: string;
  minWidth?: string;
  grow?: boolean;
  options?: { value: string; label: string }[];
}

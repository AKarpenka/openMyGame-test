import { useMemo } from 'react';
import { TableConfigContext } from './TableConfigContext';
import type { ITableConfig, ITableConfigProviderProps } from './types';

export function TableConfigProvider({
  children,
  columns,
  onSave,
}: ITableConfigProviderProps) {
  const value = useMemo<ITableConfig>(
    () => ({
      columns,
      onSave,
    }),
    [columns, onSave]
  );

  return (
    <TableConfigContext.Provider value={value}>
      {children}
    </TableConfigContext.Provider>
  );
}


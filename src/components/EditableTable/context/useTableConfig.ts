import { useContext } from 'react';
import { TableConfigContext } from './TableConfigContext';
import type { ITableConfig } from './types';

/**
 * Хук для доступа к конфигурации таблицы
 */
export function useTableConfig(): ITableConfig {
  const context = useContext(TableConfigContext);
  
  if (context === undefined) {
    throw new Error('useTableConfig должен использоваться внутри TableConfigProvider');
  }
  
  return context;
}


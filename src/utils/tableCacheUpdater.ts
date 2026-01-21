import type { QueryClient } from '@tanstack/react-query';
import type { ITableRow } from './types';

type LazyTableCache = {
  pages: Array<{ data: ITableRow[]; hasMore: boolean; total: number }>;
  pageParams: number[];
};

type TableUpdater = ITableRow[] | ((old: ITableRow[]) => ITableRow[]);

export function updateTableCache(
  queryClient: QueryClient,
  updater: TableUpdater
): void {
  queryClient.setQueryData<ITableRow[]>(['table'], (old = []) => {
    return typeof updater === 'function' ? updater(old) : updater;
  });
}

export function updateLazyTableCache(
  queryClient: QueryClient,
  updater: TableUpdater
): void {
  queryClient.setQueryData<LazyTableCache>(['table', 'lazy'], (old) => {
    if (!old) return old;
    
    const currentData = old.pages.flatMap((page) => page.data);
    const newData = typeof updater === 'function' ? updater(currentData) : updater;
    const updatedMap = new Map(newData.map((row) => [row.id, row]));
    const total = old.pages[old.pages.length - 1]?.total || 0;
    
    const newPages = old.pages.map((page) => ({
      data: page.data.map((row) => updatedMap.get(row.id) ?? row),
      hasMore: page.hasMore,
      total,
    }));
    
    return {
      pages: newPages,
      pageParams: old.pageParams,
    };
  });
}

export function rollbackTableCaches(
  queryClient: QueryClient,
  previousData?: ITableRow[],
  previousLazyData?: LazyTableCache
): void {
  if (previousData) {
    queryClient.setQueryData(['table'], previousData);
  }
  if (previousLazyData) {
    queryClient.setQueryData(['table', 'lazy'], previousLazyData);
  }
}


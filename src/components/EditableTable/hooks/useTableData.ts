import { useCallback, useEffect, useOptimistic, useTransition } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ITableRow } from '../../../utils/types';

interface IUseTableDataProps {
  initialData: ITableRow[];
  enableLazyLoading: boolean;
}

/**
 * хук твечает за загрузку данных и обновление кеша react-query
 */
export function useTableData({ initialData, enableLazyLoading }: IUseTableDataProps) {
  const queryClient = useQueryClient();

  const { data: queryData = initialData } = useQuery({
    queryKey: ['table'],
    queryFn: () => initialData,
    initialData,
    placeholderData: initialData,
    staleTime: Infinity,
    enabled: !enableLazyLoading,
  });

  const [optimisticData, setOptimisticData] = useOptimistic(
    queryData,
    (_currentData: ITableRow[], newData: ITableRow[]) => newData
  );

  useEffect(() => {
    if (!enableLazyLoading) {
      const cachedData = queryClient.getQueryData<ITableRow[]>(['table']);

      if (!cachedData) {
        queryClient.setQueryData(['table'], initialData);
        setOptimisticData(initialData);
      }
    }
  }, [initialData, queryClient, setOptimisticData, enableLazyLoading]);

  const [isPending, startTransition] = useTransition();

  const setData = useCallback((updater: ITableRow[] | ((prev: ITableRow[]) => ITableRow[])) => {
    startTransition(() => {
      if (enableLazyLoading) {
        // обновляем кэш для ленивой загрузки
        queryClient.setQueryData<{
          pages: Array<{ data: ITableRow[]; hasMore: boolean; total: number }>;
          pageParams: number[];
        }>(['table', 'lazy'], (old) => {
          if (!old) {
            return old;
          }
          
          const currentData = old.pages.flatMap((page) => page.data);
          const newData = typeof updater === 'function' ? updater(currentData) : updater;
          const updatedMap = new Map(newData.map((row) => [row.id, row]));
          const total = old.pages[old.pages.length - 1]?.total || 0;
          
          const newPages = old.pages.map((page) => {
            // обновлям данные в странице, сохраняя порядок
            const updatedPageData = page.data.map((row) => {
              const updated = updatedMap.get(row.id);

              return updated || row;
            });
            
            return {
              data: updatedPageData,
              hasMore: page.hasMore,
              total,
            };
          });
          
          return {
            pages: newPages,
            pageParams: old.pageParams,
          };
        });
      } else {
        // Обновляем обычный кэш
        queryClient.setQueryData<ITableRow[]>(['table'], (old = []) => {
          const newData = typeof updater === 'function' ? updater(old) : updater;

          setOptimisticData(newData);

          return newData;
        });
      }
    });
  }, [queryClient, setOptimisticData, enableLazyLoading]);

  return {
    data: enableLazyLoading ? undefined : optimisticData,
    setData,
    isPending,
    queryData,
    setOptimisticData,
  };
}


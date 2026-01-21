import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { tableDataService } from '../../../services';
import type { ITableRow } from '../../../utils/types';
import { errorHandler } from '../../../utils/errorHandler';
import { PAGE_SIZE } from '../constants';

interface IUseLazyTableDataProps {
  initialData?: ITableRow[];
  pageSize?: number;
  enabled?: boolean;
}

// Проверяем, используется ли mock API
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';

/**
 * Хук для ленивой загрузки данных таблицы
 */
export function useLazyTableData({
  initialData,
  pageSize = PAGE_SIZE,
  enabled = true,
}: IUseLazyTableDataProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['table', 'lazy'],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        return await tableDataService.fetchTableData({
          page: pageParam,
          pageSize,
        });
      } catch (error) {
        errorHandler.handleLoadError(error, {
          page: pageParam,
          pageSize,
          operation: 'useLazyTableData',
        });
        throw error;
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) {
        return undefined;
      }
      return allPages.length;
    },
    initialPageParam: 0,
    enabled,
    staleTime: Infinity,
    // Используем initialData только для mock API (для реального API данные загружаются с сервера)
    ...(USE_MOCK_API && initialData && initialData.length > 0 && {
      initialData: {
        pages: [
          {
            data: initialData.slice(0, pageSize),
            hasMore: initialData.length > pageSize,
            total: initialData.length,
          },
        ],
        pageParams: [0],
      },
    }),
  });

  // Объединяем все загруженные страницы в один массив
  const allData = data?.pages.flatMap((page) => page.data) ?? [];

  // Функция для загрузки следующей страницы
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    data: allData,
    loadMore,
    hasMore: hasNextPage ?? false,
    isLoading,
    isFetchingNextPage,
    isError,
    error,
  };
}


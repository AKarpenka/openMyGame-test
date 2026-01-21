import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tableDataService, type IBatchChange } from '../../../services';
import type { ITableRow } from '../../../utils/types';
import { updateTableCache, updateLazyTableCache, rollbackTableCaches } from '../../../utils/tableCacheUpdater';
import { errorHandler } from '../../../utils/errorHandler';

/**
 * Хук для сохранения изменений в таблице с оптимистичным обновлением и откатом при ошибках
 */
export function useSaveBatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (changes: IBatchChange[]) => {
      await tableDataService.saveBatch(changes);
      return changes;
    },
    onMutate: async (changes) => {
      // Отменяем все исходящие запросы
      await queryClient.cancelQueries({ queryKey: ['table'] });
      await queryClient.cancelQueries({ queryKey: ['table', 'lazy'] });

      // Сохраняем предыдущие данные для отката (проверяем оба кэша)
      const previousData = queryClient.getQueryData<ITableRow[]>(['table']) || [];
      const previousLazyData = queryClient.getQueryData<{
        pages: Array<{ data: ITableRow[]; hasMore: boolean; total: number }>;
        pageParams: number[];
      }>(['table', 'lazy']);

      // Функция обновления строки для всех изменений
      // Обрабатывает случай, когда одна строка имеет несколько изменений
      const updateRow = (row: ITableRow) => {
        const rowChanges = changes.filter((c) => c.rowId === row.id);

        if (rowChanges.length === 0) {
          return row;
        }

        return rowChanges.reduce(
          (updatedRow, change) => ({
            ...updatedRow,
            [change.cellKey]: change.value,
          }),
          row
        );
      };

      // Оптимистичное обновление обычного кэша
      updateTableCache(queryClient, (old) => old.map(updateRow));

      // Оптимистичное обновление кэша ленивой загрузки
      if (previousLazyData) {
        updateLazyTableCache(queryClient, (old) => old.map(updateRow));
      }

      return { previousData, previousLazyData };
    },
    onError: (error, changes, context) => {
      errorHandler.handleSaveError(error, {
        operation: 'useSaveBatchMutation',
        changesCount: changes.length,
        changes: changes.map((c) => ({ rowId: c.rowId, cellKey: c.cellKey })),
      });

      // Откатываем оптимистичное обновление при ошибке
      rollbackTableCaches(
        queryClient,
        context?.previousData,
        context?.previousLazyData
      );
    },
  });
}


import { useCallback } from 'react';
import type { ITableRow, IColumnDefinition, TAnyCellValue } from '../../utils/types';
import { TableConfigProvider } from './context/TableConfigProvider';
import { useTableConfig } from './context/useTableConfig';
import { useTableEditing } from './hooks/useTableEditing';
import { useTableData } from './hooks/useTableData';
import { useCellHandlers } from './hooks/useCellHandlers';
import { useSaveBatchMutation } from './hooks/useSaveBatchMutation';
import { useLazyTableData } from './hooks/useLazyTableData';
import { useInfiniteScroll } from './hooks/useInfiniteScroll';
import TableHeader from './components/TableHeader';
import TableBody from './components/TableBody';
import { errorHandler } from '../../utils/errorHandler';
import styles from './EditableTable.module.scss';
import { PAGE_SIZE } from './constants';

interface IEditableTableProps {
  data: ITableRow[];
  columns: IColumnDefinition[];
  onSave?: (rowId: string, cellKey: string, value: TAnyCellValue) => void | Promise<void>;
  enableLazyLoading?: boolean;
  pageSize?: number;
}

function EditableTableInner({ 
  data: initialData, 
  enableLazyLoading = true,
  pageSize = PAGE_SIZE,
}: Omit<IEditableTableProps, 'columns' | 'onSave'>) {
  const { columns, onSave: onSaveFromContext } = useTableConfig();
  const saveBatchMutation = useSaveBatchMutation();

  const {
    data: lazyData,
    loadMore,
    hasMore,
    isFetchingNextPage,
    isLoading: isLazyLoading,
  } = useLazyTableData({
    initialData,
    pageSize,
    enabled: enableLazyLoading,
  });

  const loadMoreRef = useInfiniteScroll(
    loadMore,
    hasMore,
    isFetchingNextPage,
    200
  );

  const { data: tableData, setData, isPending } = useTableData({
    initialData,
    enableLazyLoading,
  });

  const data = enableLazyLoading ? lazyData : (tableData || initialData);

  const {
    editingCell,
    tempValue,
    errors,
    isCellDirty,
    getDirtyChanges,
    clearDirtyState,
    handleCellClick,
    handleCellChange,
    handleCellSave,
    handleKeyDown,
    handleDirectCellSave,
  } = useTableEditing({
    data,
    setData,
  });

  const dirtyChanges = getDirtyChanges();
  const hasChanges = dirtyChanges.length > 0;

  const handleSaveAllChanges = useCallback(async () => {
    if (!hasChanges) {
      return;
    }

    try {
      await saveBatchMutation.mutateAsync(dirtyChanges);
      
      clearDirtyState();

      // Вызываем onSave для каждого изменения (для обратной совместимости)
      if (onSaveFromContext) {
        await Promise.all(
          dirtyChanges.map(({ rowId, cellKey, value }) => onSaveFromContext(rowId, cellKey, value))
        );
      }
    } catch (error) {
      errorHandler.handleSaveError(error, {
        operation: 'handleSaveAllChanges',
        changesCount: dirtyChanges.length,
      });
    }
  }, [hasChanges, dirtyChanges, saveBatchMutation, clearDirtyState, onSaveFromContext]);

  const { getCellHandlers } = useCellHandlers({
    handleCellClick,
    handleCellChange,
    handleCellSave,
    handleKeyDown,
    handleDirectCellSave,
  });

  return (
    <div className={styles.editableTableContainer}>
      <TableHeader
        hasChanges={hasChanges}
        changesCount={dirtyChanges.length}
        isSaving={saveBatchMutation.isPending || isPending}
        onSaveAll={handleSaveAllChanges}
      />

      <div className={styles.tableScrollWrapper}>
        <table className={styles.editableTable}>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            
            <TableBody
              data={data}
              editingCell={editingCell}
              tempValue={tempValue}
              errors={errors}
              isCellDirty={isCellDirty}
              getCellHandlers={getCellHandlers}
              enableLazyLoading={enableLazyLoading}
              loadMoreRef={loadMoreRef}
              isFetchingNextPage={isFetchingNextPage}
              hasMore={hasMore}
              isLazyLoading={isLazyLoading}
            />
          </table>
      </div>
    </div>
  );
}

export default function EditableTable(props: IEditableTableProps) {
  const { columns, onSave, ...restProps } = props;

  return (
    <TableConfigProvider columns={columns} onSave={onSave}>
      <EditableTableInner {...restProps} />
    </TableConfigProvider>
  );
}


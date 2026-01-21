import { Spin } from 'antd';
import type { RefObject } from 'react';
import type { ITableRow, TAnyCellValue, TCellHandlers } from '../../../utils/types';
import { useTableConfig } from '../context/useTableConfig';
import TableRow from './TableRow';
import styles from '../EditableTable.module.scss';

interface ITableBodyProps {
  data: ITableRow[];
  editingCell: { rowId: string; cellKey: string } | null;
  tempValue: TAnyCellValue;
  errors: Record<string, string>;
  isCellDirty: (rowId: string, cellKey: string) => boolean;
  getCellHandlers: (rowId: string, cellKey: string) => TCellHandlers;
  enableLazyLoading?: boolean;
  loadMoreRef?: RefObject<HTMLDivElement | null>;
  isFetchingNextPage?: boolean;
  hasMore?: boolean;
  isLazyLoading?: boolean;
}

export default function TableBody({
  data,
  editingCell,
  tempValue,
  errors,
  isCellDirty,
  getCellHandlers,
  enableLazyLoading = false,
  loadMoreRef,
  isFetchingNextPage = false,
  hasMore = false,
  isLazyLoading = false,
}: ITableBodyProps) {
  const { columns } = useTableConfig();
  return (
    <tbody>
      {data.map((row) => (
        <TableRow
          key={row.id}
          row={row}
          editingCell={editingCell}
          tempValue={tempValue}
          errors={errors}
          isCellDirty={isCellDirty}
          cellHandlersCache={getCellHandlers}
        />
      ))}

      {enableLazyLoading && (
        <tr>
          <td colSpan={columns.length} className={styles.tableBodyLoadMoreCell}>
            <div ref={loadMoreRef}>
              {(isFetchingNextPage || (isLazyLoading && data.length === 0)) && (
                <Spin size="small" tip="">
                  <div className={styles.tableBodyLoadMoreSpinner} />
                </Spin>
              )}
              {!hasMore && data.length > 0 && (
                <span className={styles.tableBodyLoadMoreMessage}>
                  Все данные загружены
                </span>
              )}
            </div>
          </td>
        </tr>
      )}
    </tbody>
  );
}


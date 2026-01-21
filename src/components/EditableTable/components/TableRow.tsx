import { memo } from 'react';
import type { ITableRow, TAnyCellValue, TCellHandlers } from '../../../utils/types';
import { getCellKey } from '../../../utils/tableUtils';
import { useTableConfig } from '../context/useTableConfig';
import TableCell from './TableCell';

interface ITableRowProps {
  row: ITableRow;
  editingCell: { rowId: string; cellKey: string } | null;
  tempValue: TAnyCellValue;
  errors: Record<string, string>;
  isCellDirty: (rowId: string, cellKey: string) => boolean;
  cellHandlersCache: (rowId: string, cellKey: string) => TCellHandlers;
}

/**
 * Сравнивает пропсы строки таблицы для оптимизации перерисовок, возвращает true, если пропсы равны (перерисовка не нужна)
 */
function areRowPropsEqual(prevProps: ITableRowProps, nextProps: ITableRowProps): boolean {
  if (prevProps === nextProps) {
    return true;
  }

  const { row: prevRow, editingCell: prevEditingCell, tempValue: prevTempValue, errors: prevErrors } = prevProps;
  const { row: nextRow, editingCell: nextEditingCell, tempValue: nextTempValue, errors: nextErrors } = nextProps;

  if (prevRow.id !== nextRow.id) {
    return false;
  }

  const rowId = prevRow.id;
  const prevIsEditing = prevEditingCell?.rowId === rowId;
  const nextIsEditing = nextEditingCell?.rowId === rowId;
  if (
    prevIsEditing !== nextIsEditing ||
    (prevIsEditing && nextIsEditing && prevTempValue !== nextTempValue) ||
    JSON.stringify(prevRow) !== JSON.stringify(nextRow)
  ) {
    return false;
  }

  const rowKeys = Object.keys(prevRow);

  // сравнение ошибок валидации для ячеек этой строки
  for (const key of rowKeys) {
    if (key === 'id') {
      continue;
    }

    const errorKey = getCellKey(rowId, key);
    
    if (prevErrors[errorKey] !== nextErrors[errorKey]) {
      return false;
    }
  }

  return true;
}

const TableRow = memo<ITableRowProps>(({
  row,
  editingCell,
  tempValue,
  errors,
  isCellDirty,
  cellHandlersCache,
}) => {
  const { columns } = useTableConfig();

  return (
    <tr>
      {columns.map((column) => {
        const isEditing = editingCell?.rowId === row.id && editingCell?.cellKey === column.key;
        const errorKey = getCellKey(row.id, column.key);
        const error = errors[errorKey];
        const isDirty = isCellDirty(row.id, column.key);
        const isEditable = column.editable !== false && column.key !== 'id';
        const handlers = cellHandlersCache(row.id, column.key);

        return (
          <TableCell
            key={column.key}
            row={row}
            column={column}
            isEditing={isEditing}
            tempValue={isEditing ? tempValue : null}
            error={error}
            isDirty={isDirty}
            isEditable={isEditable}
            {...handlers}
          />
        );
      })}
    </tr>
  );
}, areRowPropsEqual);

TableRow.displayName = 'TableRow';

export default TableRow;


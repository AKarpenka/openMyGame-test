import { memo, useMemo, Suspense } from 'react';
import { Tooltip, Spin } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { ITableRow, IColumnDefinition, TAnyCellValue, TCellHandlers } from '../../../utils/types';
import { formatCellValue } from '../../../utils/formatters';
import { areValuesEqual } from '../../../utils/valueComparison';
import { LazyTagsEditor, LazyComplexValueEditor } from '../../CellEditors/lazy';
import { getCellEditor } from '../helpers/getCellEditor';
import styles from '../EditableTable.module.scss';

interface ICellData {
  row: ITableRow;
  column: IColumnDefinition;
}

interface ICellEditingState {
  isEditing: boolean;
  tempValue: TAnyCellValue;
  error?: string;
}

interface ICellState {
  isDirty: boolean;
  isEditable: boolean;
}

interface ITableCellProps extends ICellData, ICellEditingState, ICellState, TCellHandlers {}

/**
 * Мемоизированный компонент ячейки таблицы
 * перерисовывается только при изменении своих пропсов
 */
const TableCell = memo<ITableCellProps>(({
  row,
  column,
  isEditing,
  tempValue,
  error,
  isDirty,
  isEditable,
  onCellClick,
  onCellChange,
  onCellSave,
  onKeyDown,
  onDirectCellSave,
}) => {
  const cellValue = row[column.key];

  const displayValue = useMemo(() => {
    return formatCellValue(cellValue, column);
  }, [cellValue, column]);

  const cellClassName = useMemo(() => {
    return [
      styles.editableCell,
      isEditing && styles.editing,
      error && styles.error,
      isDirty && styles.dirty,
      !isEditable && styles.readonly,
    ]
      .filter(Boolean)
      .join(' ');
  }, [isEditing, error, isDirty, isEditable]);

  const tagsValue = useMemo(() => {
    return Array.isArray(cellValue) ? (cellValue as string[]) : [];
  }, [cellValue]);

  const cellContent = useMemo(() => {
    if (isEditing) {
      const editor = getCellEditor({
        column,
        tempValue,
        handleCellChange: onCellChange,
        handleCellSave: onCellSave,
        onKeyDown,
        error,
        autoFocus: true,
      });

      if (editor) {
        return <div className={styles.cellEditorWrapper}>{editor}</div>;
      }

      return null;
    }

    if (column.type === 'array') {
      return (
        <div className={styles.cellDisplay}>
          <Suspense fallback={<Spin size="small" />}>
            <LazyTagsEditor value={tagsValue} onChange={onDirectCellSave} error={error} />
          </Suspense>
        </div>
      );
    }

    if (column.type === 'object') {
      return (
        <div className={styles.cellDisplay}>
          <Suspense fallback={<Spin size="small" />}>
            <LazyComplexValueEditor
              value={cellValue as Record<string, unknown>}
              onChange={onDirectCellSave}
              error={error}
            />
          </Suspense>
        </div>
      );
    }

    return (
      <div className={styles.cellDisplay}>
        {error ? (
          <div className={styles.cellDisplayWrapper}>
            <span>{displayValue}</span>
            <Tooltip title={error} placement="topLeft">
              <ExclamationCircleOutlined className={styles.cellDisplayErrorIcon} />
            </Tooltip>
          </div>
        ) : (
          displayValue
        )}
      </div>
    );
  }, [
    isEditing,
    column,
    tempValue,
    onCellChange,
    onCellSave,
    onKeyDown,
    error,
    tagsValue,
    onDirectCellSave,
    cellValue,
    displayValue,
  ]);

  return (
    <td className={cellClassName} onClick={onCellClick}>
      {cellContent}
    </td>
  );
}, areCellPropsEqual);

function areCellPropsEqual(prevProps: ITableCellProps, nextProps: ITableCellProps): boolean {
  if (prevProps === nextProps) {
    return true;
  }

  const {
    row: prevRow,
    column: prevColumn,
    isEditing: prevIsEditing,
    tempValue: prevTempValue,
    error: prevError,
    isDirty: prevIsDirty,
    isEditable: prevIsEditable,
  } = prevProps;
  const {
    row: nextRow,
    column: nextColumn,
    isEditing: nextIsEditing,
    tempValue: nextTempValue,
    error: nextError,
    isDirty: nextIsDirty,
    isEditable: nextIsEditable,
  } = nextProps;

  if (
    prevRow.id !== nextRow.id ||
    prevColumn.key !== nextColumn.key ||
    prevIsEditing !== nextIsEditing ||
    prevIsDirty !== nextIsDirty ||
    prevIsEditable !== nextIsEditable ||
    prevError !== nextError
  ) {
    return false;
  }

  if (prevIsEditing && prevTempValue !== nextTempValue) {
    return false;
  }

  if (!prevIsEditing) {
    const prevValue = prevRow[prevColumn.key];
    const nextValue = nextRow[nextColumn.key];
    
    if (!areValuesEqual(prevValue, nextValue)) {
      return false;
    }
  }

  return true;
}

TableCell.displayName = 'TableCell';

export default TableCell;


import { useState, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import type { ITableRow, IEditingState, TAnyCellValue } from '../../../utils/types';
import { useTableConfig } from '../context/useTableConfig';
import { getCellKey } from '../../../utils/tableUtils';
import { validateNumber } from '../../../utils/validation';
import { useOriginalValues } from './useOriginalValues';
import { clearError } from './utils/errorUtils';

interface IUseTableEditingProps {
  data: ITableRow[];
  setData: (updater: ITableRow[] | ((prev: ITableRow[]) => ITableRow[])) => void;
}

/**
 * основной хук для редактирования ячеек таблицы
 * Управляет состоянием редактирования и отслеживает изменения
 */
export function useTableEditing({ data, setData }: IUseTableEditingProps) {
  const { columns } = useTableConfig();
  const [editingCell, setEditingCell] = useState<IEditingState | null>(null);
  const [tempValue, setTempValue] = useState<TAnyCellValue>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirtyCells, setDirtyCells] = useState<Set<string>>(new Set());
  
  const {
    saveOriginalValue,
    getOriginalValue,
    removeOriginalValue,
    isValueChanged,
    getDirtyChanges: getDirtyChangesFromOriginal,
    clearAllBaselineValues: clearOriginalValues,
  } = useOriginalValues();

  const getColumnByKey = useCallback((cellKey: string) => {
    return columns.find((col) => col.key === cellKey);
  }, [columns]);


  const updateDirtyCell = useCallback((errorKey: string, isDirty: boolean) => {
    setDirtyCells((prev) => {
      const newSet = new Set(prev);

      if (isDirty) {
        newSet.add(errorKey);
      } else {
        newSet.delete(errorKey);
      }

      return newSet;
    });
  }, []);

  const addDirtyCell = useCallback((errorKey: string) => {
    setDirtyCells((prev) => {
      const newSet = new Set(prev);

      newSet.add(errorKey);

      return newSet;
    });
  }, []);

  const removeDirtyCell = useCallback((errorKey: string) => {
    setDirtyCells((prev) => {
      const newSet = new Set(prev);

      newSet.delete(errorKey);

      return newSet;
    });
  }, []);

  const updateCellValue = useCallback((rowId: string, cellKey: string, value: TAnyCellValue) => {
    setData((prevData) =>
      prevData.map((row) =>
        row.id === rowId
          ? { ...row, [cellKey]: value }
          : row
      )
    );
  }, [setData]);

  const validateNumberValue = useCallback((value: TAnyCellValue, errorKey: string): boolean => {
    const validationError = validateNumber(value);

    if (validationError) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: validationError.message,
      }));

      return false;
    }

    return true;
  }, []);

  const handleCellClick = useCallback((rowId: string, cellKey: string) => {
    const selectedColumn = getColumnByKey(cellKey);
    const selectedRow = data.find((row) => row.id === rowId);

    if (selectedColumn?.editable === false || cellKey === 'id' || !selectedRow) {
      return;
    }

    const currentValue = selectedRow[cellKey];
    const errorKey = getCellKey(rowId, cellKey);

    saveOriginalValue(rowId, cellKey, currentValue);
    setEditingCell({ rowId, cellKey });
    setTempValue(currentValue);
    setErrors((prev) => clearError(prev, errorKey));
  }, [data, getColumnByKey, saveOriginalValue]);

  const handleCellChange = useCallback((value: TAnyCellValue) => {
    if (!editingCell) {
      return;
    }

    setTempValue(value);

    // проверяем изменилось ли значение относительно исходного
    const errorKey = getCellKey(editingCell.rowId, editingCell.cellKey);
    const isDirty = isValueChanged(editingCell.rowId, editingCell.cellKey, value);

    updateDirtyCell(errorKey, isDirty);
  }, [editingCell, isValueChanged, updateDirtyCell]);

  const handleCellSave = useCallback(async (valueToSave?: TAnyCellValue) => {
    if (!editingCell) {
      return;
    }

    const { rowId, cellKey } = editingCell;
    const column = getColumnByKey(cellKey);

    if (!column) {
      return;
    }

    const value = valueToSave !== undefined ? valueToSave : tempValue;
    const errorKey = getCellKey(rowId, cellKey);

    // Валидация только для числовых полей (остальные типы валидируются компонентами)
    if (column.type === 'number') {
      if (!validateNumberValue(value, errorKey)) {
        const originalValue = getOriginalValue(rowId, cellKey);
        if (originalValue !== undefined) {
          setTempValue(originalValue);
        }
        return;
      }
    }

    setErrors((prev) => clearError(prev, errorKey));

    updateCellValue(rowId, cellKey, value);

    const originalValue = getOriginalValue(rowId, cellKey);
    const isValueBackToOriginal = originalValue !== undefined && !isValueChanged(rowId, cellKey, value);

    if (isValueBackToOriginal) {
      // Если значение вернулось к исходному, очищаем dirty state и удаляем исходное значение
      removeDirtyCell(errorKey);
      removeOriginalValue(rowId, cellKey);
    } else {
      // если значение отличается от исходного, сохраняем dirty state
      addDirtyCell(errorKey);
    }

    setEditingCell(null);
    setTempValue(null);
  }, [editingCell, tempValue, getColumnByKey, validateNumberValue, getOriginalValue, isValueChanged, removeOriginalValue, updateCellValue, removeDirtyCell, addDirtyCell]);

  const handleCellCancel = useCallback(() => {
    if (!editingCell) {
      return;
    }

    const { rowId, cellKey } = editingCell;
    const errorKey = getCellKey(rowId, cellKey);

    setErrors((prev) => clearError(prev, errorKey));

    // Очищаем dirty state и исходное значение при отмене
    removeDirtyCell(errorKey);
    removeOriginalValue(rowId, cellKey);

    setEditingCell(null);
    setTempValue(null);
  }, [editingCell, removeOriginalValue, removeDirtyCell]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      handleCellSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();

      handleCellCancel();
    }
  }, [handleCellSave, handleCellCancel]);

  const handleDirectCellSave = useCallback(async (rowId: string, cellKey: string, value: TAnyCellValue) => {
    const column = getColumnByKey(cellKey);

    if (!column) {
      return;
    }

    const errorKey = getCellKey(rowId, cellKey);

    // Сохраняем исходное значение из текущих данных, если еще не сохранено
    const currentRow = data.find((row) => row.id === rowId);

    if (currentRow) {
      saveOriginalValue(rowId, cellKey, currentRow[cellKey]);
    }

    if (column.type === 'number') {
      if (!validateNumberValue(value, errorKey)) {
        return;
      }
    }

    setErrors((prev) => clearError(prev, errorKey));

    const isDirty = isValueChanged(rowId, cellKey, value);
    updateDirtyCell(errorKey, isDirty);
    updateCellValue(rowId, cellKey, value);
  }, [getColumnByKey, data, saveOriginalValue, validateNumberValue, isValueChanged, updateDirtyCell, updateCellValue]);

  const isCellDirty = useCallback((rowId: string, cellKey: string): boolean => {
    const errorKey = getCellKey(rowId, cellKey);
    
    // Если ячейка в режиме редактирования, используем dirtyCells
    if (editingCell?.rowId === rowId && editingCell?.cellKey === cellKey) {
      return dirtyCells.has(errorKey);
    }

    // Если ячейка не редактируется, сравниваем текущее значение с исходным
    const currentRow = data.find((row) => row.id === rowId);

    if (!currentRow) {
      return false;
    }

    return isValueChanged(rowId, cellKey, currentRow[cellKey]);
  }, [dirtyCells, editingCell, data, isValueChanged]);

  /**
   * Получает все измененные ячейки в формате для batch сохранения
   */
  const getDirtyChanges = useCallback((): Array<{ rowId: string; cellKey: string; value: TAnyCellValue }> => {
    return getDirtyChangesFromOriginal(data);
  }, [data, getDirtyChangesFromOriginal]);

  const clearDirtyState = useCallback(() => {
    setDirtyCells(new Set());
    clearOriginalValues();
  }, [clearOriginalValues]);

  return {
    editingCell,
    tempValue,
    errors,
    dirtyCells,
    isCellDirty,
    getDirtyChanges,
    clearDirtyState,
    handleCellClick,
    handleCellChange,
    handleCellSave,
    handleCellCancel,
    handleKeyDown,
    handleDirectCellSave,
  };
}

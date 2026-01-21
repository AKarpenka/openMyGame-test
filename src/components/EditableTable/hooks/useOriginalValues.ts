import { useRef, useCallback } from 'react';
import type { TAnyCellValue } from '../../../utils/types';
import { getCellKey } from '../../../utils/tableUtils';
import { deepCopyValue } from './utils/valueUtils';
import { areValuesEqual } from '../../../utils/valueComparison';
import type { ITableRow } from '../../../utils/types';

/**
 * Хук для управления значениями ячеек в процессе изменений
 */
export function useOriginalValues() {
  const originalValuesRef = useRef<Record<string, TAnyCellValue>>({});

  const saveOriginalValue = useCallback((rowId: string, cellKey: string, value: TAnyCellValue) => {
    const cellKeyStr = getCellKey(rowId, cellKey);
    
    if (!(cellKeyStr in originalValuesRef.current)) {
      originalValuesRef.current[cellKeyStr] = deepCopyValue(value);
    }
  }, []);

  const getOriginalValue = useCallback((rowId: string, cellKey: string): TAnyCellValue | undefined => {
    const cellKeyStr = getCellKey(rowId, cellKey);
    
    return originalValuesRef.current[cellKeyStr];
  }, []);

  /**
   * удаляет базовое значение для ячейки (когда значение вернулось к исходному)
   */
  const removeOriginalValue = useCallback((rowId: string, cellKey: string) => {
    const cellKeyStr = getCellKey(rowId, cellKey);

    delete originalValuesRef.current[cellKeyStr];
  }, []);

  /**
   * Проверяет, изменилось ли значение относительно исходного
   */
  const isValueChanged = useCallback((rowId: string, cellKey: string, currentValue: TAnyCellValue): boolean => {
    const originalValue = getOriginalValue(rowId, cellKey);

    if (originalValue === undefined) {
      return false;
    }

    return !areValuesEqual(currentValue, originalValue);
  }, [getOriginalValue]);

  /**
   * получает все измененные ячейки в формате для batch сохранения
   */
  const getDirtyChanges = useCallback((data: ITableRow[]): Array<{ rowId: string; cellKey: string; value: TAnyCellValue }> => {
    const changes: Array<{ rowId: string; cellKey: string; value: TAnyCellValue }> = [];

    Object.keys(originalValuesRef.current).forEach((cellKeyStr) => {
      const lastDashIndex = cellKeyStr.lastIndexOf('-');

      if (lastDashIndex === -1) {
        return;
      }
      
      const rowId = cellKeyStr.substring(0, lastDashIndex);
      const cellKey = cellKeyStr.substring(lastDashIndex + 1);
      
      if (!rowId || !cellKey) {
        return;
      }

      const currentRow = data.find((row) => row.id === rowId);
      if (!currentRow || !(cellKey in currentRow)) {
        return;
      }

      const currentValue = currentRow[cellKey];
      const originalValue = originalValuesRef.current[cellKeyStr];
      
      // Проверяем, что значение действительно изменилось
      if (!areValuesEqual(currentValue, originalValue)) {
        changes.push({ rowId, cellKey, value: currentValue });
      }
    });

    return changes;
  }, []);

  const clearAllBaselineValues = useCallback(() => {
    originalValuesRef.current = {};
  }, []);

  return {
    saveOriginalValue,
    getOriginalValue,
    removeOriginalValue,
    isValueChanged,
    getDirtyChanges,
    clearAllBaselineValues,
  };
}


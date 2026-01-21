import { useCallback, useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import type { TAnyCellValue } from '../../../utils/types';
import { useTableConfig } from '../context/useTableConfig';
import { getCellKey } from '../../../utils/tableUtils';

interface ICellHandlers {
  onCellClick: () => void;
  onCellChange: (value: TAnyCellValue) => void;
  onCellSave: () => void;
  onKeyDown: (event: KeyboardEvent<Element>) => void;
  onDirectCellSave: (value: TAnyCellValue) => void;
}

interface IUseCellHandlersProps {
  handleCellClick: (rowId: string, cellKey: string) => void;
  handleCellChange: (value: TAnyCellValue) => void;
  handleCellSave: () => void;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLElement>) => void;
  handleDirectCellSave: (rowId: string, cellKey: string, value: TAnyCellValue) => void;
}

/**
 * Хук для управления событиями ячеек
 */
export function useCellHandlers({
  handleCellClick,
  handleCellChange,
  handleCellSave,
  handleKeyDown,
  handleDirectCellSave,
}: IUseCellHandlersProps) {
  const { columns } = useTableConfig();
  const handlersCacheRef = useRef<Map<string, ICellHandlers>>(new Map());

  useEffect(() => {
    handlersCacheRef.current.clear();
  }, [columns, handleCellClick, handleCellChange, handleCellSave, handleKeyDown, handleDirectCellSave]);

  const getCellHandlers = useCallback((rowId: string, cellKey: string): ICellHandlers => {
    const key = getCellKey(rowId, cellKey);
    const cache = handlersCacheRef.current;
    
    if (!cache.has(key)) {
      const column = columns.find((col) => col.key === cellKey);
      
      cache.set(key, {
        onCellClick: () => {
          if (column && column.editable !== false && cellKey !== 'id' && column.type !== 'array' && column.type !== 'object') {
            handleCellClick(rowId, cellKey);
          }
        },
        onCellChange: handleCellChange,
        onCellSave: handleCellSave,
        onKeyDown: handleKeyDown as (event: KeyboardEvent<Element>) => void,
        onDirectCellSave: (value: TAnyCellValue) => {
          handleDirectCellSave(rowId, cellKey, value);
        },
      });
    }

    return cache.get(key)!;
  }, [columns, handleCellClick, handleCellChange, handleCellSave, handleKeyDown, handleDirectCellSave]);

  return {
    getCellHandlers,
  };
}


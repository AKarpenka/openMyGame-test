import type { KeyboardEvent, FocusEvent } from 'react';

/**
 * Типы ячеек таблицы
 */
export type TCellType = 'string' | 'number' | 'enum' | 'timestamp' | 'array' | 'object';

/**
 * Тип значения ячейки для любого типа колонки
 */
export type TAnyCellValue = string | number | null | string[] | Record<string, unknown>;

/**
 * Обработчики событий для ячеек таблицы
 */
export type TCellHandlers = {
  onCellClick: () => void;
  onCellChange: (value: TAnyCellValue) => void;
  onCellSave: () => void;
  onKeyDown: (event: KeyboardEvent<Element>) => void;
  onDirectCellSave: (value: TAnyCellValue) => void;
};

/**
 * Пропсы для редакторов ячеек разных типов
 */
export interface IStringEditorProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLElement>) => void;
  onBlur?: (event?: FocusEvent<HTMLInputElement>) => void;
  error?: string;
  autoFocus?: boolean;
}

export interface INumberEditorProps {
  value: number | null;
  onChange: (value: number | null) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLElement>) => void;
  onBlur?: (inputString?: string) => void;
  error?: string;
  autoFocus?: boolean;
  precision?: number;
  isInteger?: boolean;
}

export interface IEnumEditorProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLElement>) => void;
  onBlur?: () => void;
  onSelect?: (value: string) => void;
  options: string[];
  error?: string;
  autoFocus?: boolean;
}

export interface ITimestampEditorProps {
  value: string | null;
  onChange: (value: string | null) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLElement>) => void;
  onBlur?: () => void;
  onSave?: (value: string | null) => void;
  error?: string;
  autoFocus?: boolean;
}

export interface IComplexValueEditorProps {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLElement>) => void;
  onBlur?: () => void;
  error?: string;
  autoFocus?: boolean;
}

export interface ITagsEditorProps {
  value: string[] | null | undefined;
  onChange: (value: string[]) => void;
  error?: string;
}

/**
 * Определение колонки таблицы
 */
export interface IColumnDefinition {
  key: string;
  label: string;
  type: TCellType;
  editable?: boolean;
  enumOptions?: string[];
  precision?: number;
  isInteger?: boolean;
}

/**
 * Строка таблицы
 */
export interface ITableRow {
  id: string;
  [key: string]: TAnyCellValue;
}

/**
 * Состояние редактирования ячейки
 */
export interface IEditingState {
  rowId: string;
  cellKey: string;
}

/**
 * Ошибка валидации
 */
export interface IValidationError {
  message: string;
}


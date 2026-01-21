import type { KeyboardEvent, FocusEvent } from 'react';
import type {
  IStringEditorProps,
  INumberEditorProps,
  IEnumEditorProps,
  ITimestampEditorProps,
  IComplexValueEditorProps,
  TAnyCellValue,
  IColumnDefinition,
} from '../../../utils/types';
import { normalizeNumberString } from '../../../utils/formatters';

export interface IBaseCellEditorProps {
  value: TAnyCellValue;
  onChange: (value: TAnyCellValue) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLElement>) => void;
  onSave: (value?: TAnyCellValue) => void | Promise<void>;
  error?: string;
  autoFocus?: boolean;
  column: IColumnDefinition;
}

/**
 * Адаптеры для преобразования единого интерфейса в специфичные интерфейсы редакторов
 */

export function adaptStringEditorProps(props: IBaseCellEditorProps): IStringEditorProps {
  const { value, onChange, onKeyDown, onSave, error, autoFocus } = props;
  
  return {
    value: value as string,
    onChange: (newValue: string) => onChange(newValue),
    onKeyDown,
    onBlur: (e?: FocusEvent<HTMLInputElement>) => {
      onSave(e?.target?.value ?? (value as string));
    },
    error,
    autoFocus,
  };
}

export function adaptNumberEditorProps(props: IBaseCellEditorProps): INumberEditorProps {
  const { value, onChange, onKeyDown, onSave, error, autoFocus, column } = props;
  
  return {
    value: value as number | null,
    onChange: (newValue: number | null) => onChange(newValue),
    onKeyDown,
    onBlur: (inputString?: string) => {
      if (inputString !== undefined) {
        onSave(normalizeNumberString(inputString));
      } else {
        onSave(value);
      }
    },
    precision: column.precision,
    isInteger: column.isInteger,
    error,
    autoFocus,
  };
}

export function adaptEnumEditorProps(props: IBaseCellEditorProps): IEnumEditorProps {
  const { value, onChange, onKeyDown, onSave, error, autoFocus, column } = props;
  
  if (!column.enumOptions) {
    throw new Error('enumOptions обязателен для редактора enum');
  }
  
  return {
    value: value as string,
    onChange: (newValue: string) => onChange(newValue),
    onSelect: onSave,
    onKeyDown,
    onBlur: () => onSave(),
    options: column.enumOptions,
    error,
    autoFocus,
  };
}

export function adaptTimestampEditorProps(props: IBaseCellEditorProps): ITimestampEditorProps {
  const { value, onChange, onKeyDown, onSave, error, autoFocus } = props;
  
  return {
    value: value as string | null,
    onChange: (newValue: string | null) => onChange(newValue),
    onKeyDown,
    onSave,
    onBlur: () => onSave(value),
    error,
    autoFocus,
  };
}

export function adaptComplexValueEditorProps(props: IBaseCellEditorProps): IComplexValueEditorProps {
  const { value, onChange, onSave, error, autoFocus } = props;
  
  return {
    value: value as Record<string, unknown>,
    onChange: (newValue: Record<string, unknown>) => onChange(newValue),
    onBlur: () => {
      if (!error) onSave();
    },
    error,
    autoFocus,
  };
}


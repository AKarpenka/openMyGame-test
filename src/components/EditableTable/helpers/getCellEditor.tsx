import type { ReactElement } from 'react';
import type { KeyboardEvent } from 'react';
import { Suspense } from 'react';
import { Spin } from 'antd';
import type { IColumnDefinition, TAnyCellValue } from '../../../utils/types';
import { normalizeCellValue } from '../../../utils/formatters';
import {
  adaptStringEditorProps,
  adaptNumberEditorProps,
  adaptEnumEditorProps,
  adaptTimestampEditorProps,
  adaptComplexValueEditorProps,
  type IBaseCellEditorProps,
} from './cellEditorAdapters';
import { StringEditor } from '../../CellEditors/StringEditor';
import { NumberEditor } from '../../CellEditors/NumberEditor';
import { EnumEditor } from '../../CellEditors/EnumEditor';
import { TimestampEditor } from '../../CellEditors/TimestampEditor';
import { LazyComplexValueEditor } from '../../CellEditors/lazy';

export interface IGetCellEditorProps {
  column: IColumnDefinition;
  tempValue: TAnyCellValue;
  handleCellChange: (value: TAnyCellValue) => void;
  handleCellSave: (valueToSave?: TAnyCellValue) => void | Promise<void>;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLElement>) => void;
  error?: string;
  autoFocus?: boolean;
}

/**
 * функция для создания редактора ячейки в зависимости от типа колонки
 * нормализует значение и преобразует единый интерфейс в специфичные пропсы редакторов
 */
export function getCellEditor({
  column,
  tempValue,
  handleCellChange,
  handleCellSave,
  onKeyDown,
  error,
  autoFocus,
}: IGetCellEditorProps): ReactElement | null {
  const normalizedValue = normalizeCellValue(tempValue, column);
  const baseProps: IBaseCellEditorProps = {
    value: normalizedValue,
    onChange: handleCellChange,
    onKeyDown,
    onSave: handleCellSave,
    error,
    autoFocus,
    column,
  };

  switch (column.type) {
    case 'string':
      return <StringEditor {...adaptStringEditorProps(baseProps)} />;

    case 'number':
      return <NumberEditor {...adaptNumberEditorProps(baseProps)} />;

    case 'enum':
      if (!column.enumOptions) {
        return null;
      }
      return <EnumEditor {...adaptEnumEditorProps(baseProps)} />;

    case 'timestamp':
      return <TimestampEditor {...adaptTimestampEditorProps(baseProps)} />;

    case 'object':
      return (
        <Suspense fallback={<Spin size="small" />}>
          <LazyComplexValueEditor {...adaptComplexValueEditorProps(baseProps)} />
        </Suspense>
      );

    case 'array':
      // Массивы обрабатываются отдельно в TableCell (TagsEditor)
      return null;

    default:
      return null;
  }
}


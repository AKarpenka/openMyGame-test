import { InputNumber, Tooltip } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { KeyboardEvent, ComponentRef } from 'react';
import { useRef, useEffect } from 'react';
import { normalizeNumberString } from '../../../utils/formatters';
import type { INumberEditorProps } from '../../../utils/types';
import styles from './NumberEditor.module.scss';

export function NumberEditor({
  value,
  onChange,
  onKeyDown,
  onBlur,
  precision,
  isInteger,
  error,
  autoFocus,
}: INumberEditorProps) {
  const inputRef = useRef<ComponentRef<typeof InputNumber>>(null);
  const rawInputStringRef = useRef<string>(value === null || value === undefined ? '' : String(value));
  const isInternalUpdateRef = useRef(false);
  const prevValueRef = useRef<number | null | undefined>(value);

  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;

      return;
    }

    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      rawInputStringRef.current = value === null || value === undefined ? '' : String(value);
    }
  }, [value]);

  // Это нужно для валидации, так как InputNumber парсит и удаляет нечисловые символы
  useEffect(() => {
    const refValue = inputRef.current;
    const nativeElement = refValue && 'nativeElement' in refValue ? refValue.nativeElement : null;
    const inputElement = nativeElement?.querySelector('input') as HTMLInputElement | null;
    
    if (!inputElement) {
      return;
    }

    let isComposing = false;
    let valueBeforeChange = '';

    // Проверяет, содержит ли строка нечисловые символы (кроме минуса и точки)
    const hasNonNumericChars = (str: string): boolean => {
      return /[^\d.-]/.test(str);
    };

    const wasStringTrimmedByParser = (before: string, after: string): boolean => {
      return hasNonNumericChars(before) && !hasNonNumericChars(after);
    };

    const handleCompositionStart = () => {
      isComposing = true;
      valueBeforeChange = inputElement.value;
    };

    const handleCompositionEnd = () => {
      isComposing = false;

      if (!isInternalUpdateRef.current) {
        rawInputStringRef.current = inputElement.value;
      }
    };

    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;

      if (isInternalUpdateRef.current || !target || isComposing) {
        return;
      }

      const currentValue = target.value;
      
      // Если значение изменилось, проверяем, не обрезал ли parser строку
      if (valueBeforeChange && valueBeforeChange !== currentValue) {
        if (wasStringTrimmedByParser(valueBeforeChange, currentValue)) {
          rawInputStringRef.current = valueBeforeChange;

          return;
        }
      }
      
      rawInputStringRef.current = currentValue;
    };

    // Захватывает значение input перед его изменением
    // Нужно для определения, что именно изменилось после парсинга
    const captureValueBeforeChange = (e: Event) => {
      if (!isInternalUpdateRef.current) {
        const target = e.target as HTMLInputElement;

        if (target) {
          valueBeforeChange = target.value;
        }
      }
    };

    inputElement.addEventListener('compositionstart', handleCompositionStart);
    inputElement.addEventListener('compositionend', handleCompositionEnd);
    inputElement.addEventListener('input', handleInput);
    inputElement.addEventListener('keydown', captureValueBeforeChange);
    inputElement.addEventListener('beforeinput', captureValueBeforeChange);
    
    return () => {
      inputElement.removeEventListener('compositionstart', handleCompositionStart);
      inputElement.removeEventListener('compositionend', handleCompositionEnd);
      inputElement.removeEventListener('input', handleInput);
      inputElement.removeEventListener('keydown', captureValueBeforeChange);
      inputElement.removeEventListener('beforeinput', captureValueBeforeChange);
    };
  }, []);

  // Парсит строку в число, сохраняя исходную строку для валидации
  const parseInputValue = (value: string | undefined): number => {
    if (!isInternalUpdateRef.current && value) {
      rawInputStringRef.current = value;
    }

    if (!value) {
      return 0;
    }

    const cleaned = value.replace(/[^\d.-]/g, '');
    const numValue = Number.parseFloat(cleaned);

    return Number.isNaN(numValue) ? 0 : numValue;
  };

  const handleChange = (newValue: number | null) => {
    isInternalUpdateRef.current = true;
    
    if (newValue === null) {
      onChange(null);
      
      return;
    }

    // Нормализация: если значение близко к 0, нормализуем
    if (Math.abs(newValue) < Number.EPSILON) {
      onChange(0);
      return;
    }

    const finalValue = isInteger 
      ? Math.round(newValue)
      : precision !== undefined 
        ? Number.parseFloat(newValue.toFixed(precision))
        : newValue;

    onChange(finalValue);
  };

  // Обработка валидации и нормализации значения
  const handleValidation = () => {
    const trimmed = (rawInputStringRef.current || '').trim();
    const normalized = normalizeNumberString(trimmed);
    
    if (normalized === 0) {
      isInternalUpdateRef.current = true;

      onChange(0);
      onBlur?.('0');

      return;
    }

    // Если normalizeNumberString вернул строку - это невалидное число, передаем для валидации
    // Если вернул число - передаем исходную строку для валидации
    onBlur?.(typeof normalized === 'string' ? normalized : trimmed);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleValidation();

      return;
    }

    onKeyDown?.(event);
  };

  return (
    <div className={styles['number-editor']} onClick={(e) => e.stopPropagation()}>
      <div className={styles['number-editor__wrapper']}>
        <InputNumber
          ref={inputRef}
          value={value ?? null}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleValidation}
          precision={isInteger ? 0 : precision}
          status={error ? 'error' : undefined}
          size="small"
          className={styles['number-editor__input']}
          autoFocus={autoFocus}
          controls
          parser={parseInputValue}
        />
        {error && (
          <Tooltip title={error} placement="topLeft">
            <ExclamationCircleOutlined className={styles['number-editor__error-icon']} />
          </Tooltip>
        )}
      </div>
    </div>
  );
}


import dayjs from 'dayjs';
import type { IColumnDefinition, TAnyCellValue } from './types';

const EMPTY_VALUE_DISPLAY = '-';
const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const JSON_INDENT = 2;
const ZERO_PATTERN = /^0+\.?0*$/;
const NUMBER_REGEX = /^-?\d*\.?\d+$|^-?\d+\.?\d*$/;
const CLOSING_BRACE_REGEX = /^}|},?$/;
const KEY_PATTERN = /"([^"\\]*(\\.[^"\\]*)*)":/g;

/**
 * Форматирует timestamp для отображения
 */
function formatTimestamp(date: string | null | undefined): string {
  if (!date) {
    return EMPTY_VALUE_DISPLAY;
  }

  return dayjs(date).format(TIMESTAMP_FORMAT);
}

/**
 * Форматирует сложные значения (массивы и объекты) для отображения
 */
function formatComplexValue(value: TAnyCellValue): string {
  try {
    return JSON.stringify(value, null, JSON_INDENT);
  } catch {
    return String(value);
  }
}

function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Парсит значение в число, возвращает null если невалидно
 */
function parseToNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return value;
  }

  const parsed = Number.parseFloat(String(value));

  return !isNaN(parsed) && isFinite(parsed) ? parsed : null;
}

/**
 * Преобразует значение в формат, подходящий для конкретного типа редактора
 */
export function normalizeCellValue(cellValue: TAnyCellValue, column: IColumnDefinition): TAnyCellValue {
  if (isNullOrUndefined(cellValue)) {
    switch (column.type) {
      case 'number':
      case 'timestamp':
        return null;
      case 'object':
        return {};
      case 'array':
        return [];
      default:
        return '';
    }
  }

  switch (column.type) {
    case 'string':
    case 'enum':
      return String(cellValue);
    
    case 'number':
      return parseToNumber(cellValue);
    
    case 'timestamp':
      return String(cellValue);
    
    case 'object':
    case 'array':
      return cellValue;
    
    default:
      return String(cellValue);
  }
}

/**
 * Обрабатывает специальные случаи: "00" => 0, пустая строка => null
 */
export function normalizeNumberString(inputString: string): number | string | null {
  const trimmed = inputString.trim();
  
  if (trimmed === '') {
    return null;
  }
  
  if (trimmed === '0' || ZERO_PATTERN.test(trimmed)) {
    return 0;
  }
  
  if (!NUMBER_REGEX.test(trimmed)) {
    return trimmed;
  }
  
  const parsed = Number.parseFloat(trimmed);
  return !isNaN(parsed) && isFinite(parsed) ? parsed : trimmed;
}

/**
 * Форматирует число с учетом опций колонки
 */
function formatNumberValue(value: number, column: IColumnDefinition): string {
  if (column.precision !== undefined) {
    return value.toFixed(column.precision);
  }

  if (column.isInteger) {
    return Math.round(value).toString();
  }

  return value.toString();
}

/**
 * функция для отображения значения (форматирование в строку)
 */
export function formatCellValue(cellValue: TAnyCellValue, column: IColumnDefinition): string {
  if (isNullOrUndefined(cellValue)) {
    return EMPTY_VALUE_DISPLAY;
  }

  switch (column.type) {
    case 'timestamp':
      return formatTimestamp(cellValue as string | null);
    
    case 'array':
    case 'object':
      return formatComplexValue(cellValue);
    
    case 'number': {
      const numValue = Number(cellValue);

      if (Number.isNaN(numValue)) {
        return String(cellValue);
      }

      return formatNumberValue(numValue, column);
    }
    
    case 'enum':
    case 'string':
    default:
      return String(cellValue);
  }
}

/**
 * Проверяет наличие дублирующихся ключей в JSON строке
 * Анализирует исходную строку, так как JSON.parse удаляет дубликаты
 */
function findDuplicateKeys(jsonString: string): string[] | null {
  const duplicates = new Set<string>();
  const objectStack: Array<Set<string>> = [new Set()];
  
  for (const line of jsonString.split('\n')) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('//')) {
      continue;
    }
    
    const indent = (line.match(/^(\s*)/)?.[1]?.length ?? 0) >> 1;
    
    if (CLOSING_BRACE_REGEX.test(trimmed)) {
      objectStack.length = Math.min(objectStack.length, indent + 1);

      continue;
    }
    
    while (objectStack.length <= indent) {
      objectStack.push(new Set());
    }

    objectStack.length = indent + 1;
    KEY_PATTERN.lastIndex = 0;

    let match;
    const level = objectStack[indent];

    while ((match = KEY_PATTERN.exec(line)) !== null) {
      const key = match[1];

      if (level.has(key)) {
        duplicates.add(key);
      } else {
        level.add(key);
      }
    }
  }
  
  return duplicates.size > 0 ? Array.from(duplicates) : null;
}

interface IParseJSONResult {
  success: boolean;
  data?: unknown;
  error?: string;
  duplicateKeys?: string[];
}

/**
 * Безопасный парсинг JSON с проверкой на дублирующиеся ключи
 */
export function parseJSON(value: string): IParseJSONResult {
  try {
    const duplicateKeys = findDuplicateKeys(value);
    const data = JSON.parse(value);
    
    if (duplicateKeys && duplicateKeys.length > 0) {
      return {
        success: true,
        data,
        duplicateKeys,
      };
    }

    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid JSON';
    
    return { success: false, error: errorMessage };
  }
}


/**
 * Генерирует уникальный ключ для идентификации ячейки таблицы
 */
export function getCellKey(rowId: string, cellKey: string): string {
  return `${rowId}-${cellKey}`;
}


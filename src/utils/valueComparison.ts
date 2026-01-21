/**
 * Используется для определения, изменилось ли значение ячейки (dirty state)
 */
export function areValuesEqual(value1: unknown, value2: unknown): boolean {
  if (value1 === value2) {
    return true;
  }

  if (value1 === null || value1 === undefined || value2 === null || value2 === undefined) {
    return value1 === value2;
  }

  if (typeof value1 !== 'object' || typeof value2 !== 'object') {
    return value1 === value2;
  }

  try {
    return JSON.stringify(value1) === JSON.stringify(value2);
  } catch {
    return false;
  }
}



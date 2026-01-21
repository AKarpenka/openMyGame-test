import type { TAnyCellValue } from '../../../../utils/types';

export function deepCopyValue(value: TAnyCellValue): TAnyCellValue {
  if (value === null || value === undefined || typeof value !== 'object') {
    return value;
  }
  
  return structuredClone(value);
}


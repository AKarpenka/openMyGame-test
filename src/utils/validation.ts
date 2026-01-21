import type { IValidationError } from './types';

const ERROR_MESSAGE_NUMBER = 'Значение должно быть числом';

export function validateNumber(value: unknown): IValidationError | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  let numValue: number;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    
    if (trimmed === '') {
      return null;
    }
    
    // проверяем, что строка является валидным числом (не содержит нечисловых символов)
    // Разрешаем числа, отрицательные числа, десятичные числа
    const numberRegex = /^-?\d*\.?\d+$|^-?\d+\.?\d*$/;
    if (!numberRegex.test(trimmed)) {
      return { message: ERROR_MESSAGE_NUMBER };
    }
    
    numValue = parseFloat(trimmed);
  } else if (typeof value === 'number') {
    numValue = value;
  } else {
    return { message: ERROR_MESSAGE_NUMBER };
  }

  if (isNaN(numValue)) {
    return { message: ERROR_MESSAGE_NUMBER };
  }

  return null;
}



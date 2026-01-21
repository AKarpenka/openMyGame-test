/**
 * Утилиты для работы с ошибками валидации
 */
export function clearError(
  errors: Record<string, string>,
  errorKey: string
): Record<string, string> {
  const newErrors = { ...errors };

  delete newErrors[errorKey];
  
  return newErrors;
}

export function setError(
  errors: Record<string, string>,
  errorKey: string,
  message: string
): Record<string, string> {
  return {
    ...errors,
    [errorKey]: message,
  };
}


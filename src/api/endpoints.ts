/**
 * Эндпоинты API для работы с таблицей, заглушки
 */

export const API_ENDPOINTS = {
  table: {
    getPaginated: (page: number, pageSize: number) => 
      `/table?page=${page}&pageSize=${pageSize}`,
    saveBatch: '/table/batch',
  },
} as const;


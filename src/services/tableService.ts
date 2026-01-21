import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { ITableDataService, IFetchTableDataParams, IFetchTableDataResult, IBatchChange } from './types';

/**
 * реализация сервиса для работы с данными таблицы
 */
export const tableService: ITableDataService = {
  async fetchTableData(params: IFetchTableDataParams): Promise<IFetchTableDataResult> {
    const { page, pageSize } = params;
    
    const response = await apiClient.get<IFetchTableDataResult>(
      API_ENDPOINTS.table.getPaginated(page, pageSize)
    );

    return response.data;
  },

  async saveBatch(changes: IBatchChange[]): Promise<void> {
    if (changes.length === 0) {
      return;
    }

    await apiClient.post(API_ENDPOINTS.table.saveBatch, { changes });
  },
};


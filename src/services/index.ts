import type { ITableDataService } from './types';
import { mockTableService } from './mockTableService';
import { tableService } from './tableService';

/**
 * Переключение между mock и реальным API
 * установите VITE_USE_MOCK_API=false в .env для использования реального API
 */
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';

export const tableDataService: ITableDataService = USE_MOCK_API 
  ? mockTableService 
  : tableService;

export type { IBatchChange, IFetchTableDataResult, IFetchTableDataParams } from './types';


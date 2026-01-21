import type { ITableRow, TAnyCellValue } from '../utils/types';

export interface IBatchChange {
  rowId: string;
  cellKey: string;
  value: TAnyCellValue;
}

export interface IFetchTableDataResult {
  data: ITableRow[];
  hasMore: boolean;
  total: number;
}

export interface IFetchTableDataParams {
  page: number;
  pageSize: number;
}

/**
 * Единый интерфейс для работы с данными таблицы
 * Реализуется как mock, так и реальным API сервисом
 */
export interface ITableDataService {
  fetchTableData(params: IFetchTableDataParams): Promise<IFetchTableDataResult>;
  saveBatch(changes: IBatchChange[]): Promise<void>;
}


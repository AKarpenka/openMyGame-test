import type { ITableDataService, IFetchTableDataParams, IFetchTableDataResult, IBatchChange } from './types';
import { mockData } from '../data/mockData';

const DELAY_BASE = 500;
const DELAY_PER_ITEM = 100;
const DELAY_MIN = 300;
const DELAY_RANGE = 500;
const ERROR_PROBABILITY = 0.05;

const delay = (ms: number): Promise<void> => 
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock реализация сервиса для работы с данными таблицы
 * Используется для разработки без бэкенда
 */
export const mockTableService: ITableDataService = {
  async fetchTableData(params: IFetchTableDataParams): Promise<IFetchTableDataResult> {
    const { page, pageSize } = params;
    
    const delayMs = Math.random() * DELAY_RANGE + DELAY_MIN;
    await delay(delayMs);

    if (Math.random() < ERROR_PROBABILITY) {
      throw new Error(`Ошибка сети при загрузке страницы ${page}`);
    }

    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      data: mockData.slice(startIndex, endIndex),
      hasMore: endIndex < mockData.length,
      total: mockData.length,
    };
  },

  async saveBatch(changes: IBatchChange[]): Promise<void> {
    if (changes.length === 0) {
      return;
    }

    const delayMs = DELAY_BASE + changes.length * DELAY_PER_ITEM;
    await delay(delayMs);

    if (Math.random() < ERROR_PROBABILITY) {
      throw new Error(`Ошибка сети при batch сохранении ${changes.length} изменений`);
    }
  },
};


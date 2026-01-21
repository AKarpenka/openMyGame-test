import { createContext } from 'react';
import type { ITableConfig } from './types';

export const TableConfigContext = createContext<ITableConfig | undefined>(undefined);


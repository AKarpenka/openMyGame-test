import type { ReactNode } from "react";
import type { IColumnDefinition, TAnyCellValue } from "../../../utils/types";

export interface ITableConfig {
    columns: IColumnDefinition[];
    onSave?: (rowId: string, cellKey: string, value: TAnyCellValue) => void | Promise<void>;
}

export interface ITableConfigProviderProps {
    children: ReactNode;
    columns: IColumnDefinition[];
    onSave?: (rowId: string, cellKey: string, value: TAnyCellValue) => void | Promise<void>;
}
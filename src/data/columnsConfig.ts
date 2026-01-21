import type { IColumnDefinition } from '../utils/types';

export const columnsConfig: IColumnDefinition[] = [
  {
    key: 'id',
    label: 'ID',
    type: 'string',
    editable: false,
  },
  {
    key: 'name',
    label: 'Название',
    type: 'string',
  },
  {
    key: 'status',
    label: 'Статус',
    type: 'enum',
    enumOptions: ['active', 'inactive', 'draft'],
  },
  {
    key: 'count',
    label: 'Количество',
    type: 'number',
    isInteger: true,
  },
  {
    key: 'price',
    label: 'Цена',
    type: 'number',
    precision: 2,
  },
  {
    key: 'created_at',
    label: 'Создано',
    type: 'timestamp',
  },
  {
    key: 'updated_at',
    label: 'Обновлено',
    type: 'timestamp',
  },
  {
    key: 'tags',
    label: 'Теги',
    type: 'array',
  },
  {
    key: 'metadata',
    label: 'Метаданные',
    type: 'object',
  },
];


import { lazy } from 'react';

// Загружается только когда пользователь редактирует JSON объект
export const LazyComplexValueEditor = lazy(() => 
  import('./ComplexValueEditor').then(module => ({ default: module.ComplexValueEditor }))
);

// Загружается только когда пользователь редактирует теги
export const LazyTagsEditor = lazy(() => 
  import('./TagsEditor').then(module => ({ default: module.TagsEditor }))
);

// Остальные легкие, можно загружать синхронно
export { StringEditor } from './StringEditor';
export { EnumEditor } from './EnumEditor';
export { NumberEditor } from './NumberEditor';
export { TimestampEditor } from './TimestampEditor';


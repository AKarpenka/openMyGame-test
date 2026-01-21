import { Select } from 'antd';
import type { IEnumEditorProps } from '../../../utils/types';
import styles from './EnumEditor.module.scss';

export function EnumEditor({
  value,
  onChange,
  onSelect,
  onKeyDown,
  onBlur,
  options,
  error,
}: IEnumEditorProps) {
  const selectOptions = options.map((option) => ({
    label: option,
    value: option,
  }));

  const handleChange = (newValue: string | null) => {
    const stringValue = newValue || '';
    
    onChange(stringValue);

    if (onSelect && newValue) {
      onSelect(stringValue);
    }
  };

  return (
    <div className={styles['enum-editor']} onClick={(e) => e.stopPropagation()}>
      <div className={styles['enum-editor__wrapper']}>
        <Select
          value={value || null}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          options={selectOptions}
          status={error ? 'error' : undefined}
          size="small"
          className={styles['enum-editor__select']}
          showSearch={false}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}


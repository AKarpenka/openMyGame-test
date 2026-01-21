import { Input } from 'antd';
import type { IStringEditorProps } from '../../../utils/types';

export function StringEditor({
  value,
  onChange,
  onKeyDown,
  onBlur,
  error,
  autoFocus,
}: IStringEditorProps) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      autoFocus={autoFocus}
      status={error ? 'error' : undefined}
      size="small"
    />
  );
}


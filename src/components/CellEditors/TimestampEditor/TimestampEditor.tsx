import { DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import { useState, useEffect, useRef } from 'react';
import type { ITimestampEditorProps } from '../../../utils/types';
import dayjs from '../../../utils/dayjsConfig';
import styles from './TimestampEditor.module.scss';

export function TimestampEditor({
  value,
  onChange,
  onKeyDown,
  onBlur,
  onSave,
  error,
  autoFocus,
}: ITimestampEditorProps) {
  const [open, setOpen] = useState(autoFocus ?? false);
  const savedViaOkRef = useRef(false);

  const parsed = value ? dayjs(value) : null;
  const dayjsValue: Dayjs | null = parsed && parsed.isValid() ? parsed : null;

  const convertDateToString = (date: Dayjs | null): string | null => {
    return date && date.isValid() ? date.toISOString() : null;
  };

  const handleChange = (date: Dayjs | null) => {
    onChange(convertDateToString(date));
  };

  const handleOk = (date: Dayjs | null) => {
    const newValue = convertDateToString(date);
    
    onChange(newValue);
    
    if (onSave) {
      onSave(newValue);
    }
    
    savedViaOkRef.current = true;
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    
    if (!isOpen && !savedViaOkRef.current && onBlur) {
      onBlur();
    }
    
    if (!isOpen) {
      savedViaOkRef.current = false;
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        if (onBlur) {
          onBlur();
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, onBlur]);

  return (
    <div 
      className={styles['timestamp-editor']} 
      onClick={(e) => { e.stopPropagation(); }}
    >
      <div className={styles['timestamp-editor__wrapper']}>
        <DatePicker
          value={dayjsValue}
          onChange={handleChange}
          onOk={handleOk}
          onKeyDown={onKeyDown}
          open={open}
          onOpenChange={handleOpenChange}
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          status={error ? 'error' : undefined}
          size="small"
          className={styles['timestamp-editor__picker']}
          autoFocus={autoFocus}
          inputReadOnly
          allowClear
        />
      </div>
    </div>
  );
}


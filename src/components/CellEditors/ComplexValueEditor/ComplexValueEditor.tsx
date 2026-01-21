import { useState, useEffect, useCallback, useMemo, useDeferredValue } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';
import { Modal, Button, Space, Tooltip } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { IComplexValueEditorProps } from '../../../utils/types';
import { parseJSON } from '../../../utils/formatters';
import styles from './ComplexValueEditor.module.scss';

export function ComplexValueEditor({
  value,
  onChange,
  onBlur,
  error: externalError,
  autoFocus,
}: IComplexValueEditorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [text, setText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [duplicateKeys, setDuplicateKeys] = useState<string[] | null>(null);
  
  // для отложенной валидации тяжелых JSON
  const deferredText = useDeferredValue(text);

  const clearErrors = useCallback(() => {
    setParseError(null);
    setValidationError(null);
    setDuplicateKeys(null);
  }, []);

  const initialText = useMemo(() => {
    if (value === null || value === undefined) {
      return '{}';
    }
    
    return JSON.stringify(value, null, 2);
  }, [value]);

  // Валидация текста в реальном времени
  const validateText = useCallback((textValue: string) => {
    const parseResult = parseJSON(textValue);
    
    if (!parseResult.success) {
      setParseError(parseResult.error || 'Невалидный JSON');
      setValidationError(null);
      setDuplicateKeys(null);

      return false;
    }

    setParseError(null);
    
    // Проверка валидации структуры (только объект, не массив)
    if (Array.isArray(parseResult.data) || typeof parseResult.data !== 'object' || parseResult.data === null) {
      setValidationError('Значение должно быть объектом');
      setDuplicateKeys(null);
      
      return false;
    }

    // Проверка на дублирующиеся ключи
    if (parseResult.duplicateKeys && parseResult.duplicateKeys.length > 0) {
      setDuplicateKeys(parseResult.duplicateKeys);
      setValidationError(
        `Обнаружены дублирующиеся ключи: ${parseResult.duplicateKeys.join(', ')}. ` +
        `При сохранении будет использовано только последнее значение для каждого ключа.`
      );
    } else {
      setDuplicateKeys(null);
      setValidationError(null);
    }
    
    return true;
  }, []);

  const handleModalOpen = useCallback(() => {
    setText(initialText);
    clearErrors();
    setIsModalOpen(true);
    validateText(initialText);
  }, [initialText, clearErrors, validateText]);

  // Автоматическое открытие при autoFocus
  useEffect(() => {
    if (autoFocus && !isModalOpen) {
      setTimeout(() => {
        handleModalOpen();
      }, 0);
    }
  }, [autoFocus, isModalOpen, handleModalOpen]);

  // Валидация отложенного значения (выполняется когда пользователь перестает печатать)
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        validateText(deferredText);
      }, 0);
    }
  }, [deferredText, isModalOpen, validateText]);

  const handleSave = useCallback(() => {
    const parseResult = parseJSON(text);
    
    if (
      !parseResult.success || 
      Array.isArray(parseResult.data) || 
      typeof parseResult.data !== 'object' || 
      parseResult.data === null
    ) {
      return;
    }

    onChange(parseResult.data as Record<string, unknown>);
    clearErrors();
    setIsModalOpen(false);
    onBlur?.();
  }, [text, onChange, onBlur, clearErrors]);

  const handleModalCancel = useCallback(() => {
    setIsModalOpen(false);
    setText(initialText);
    clearErrors();
    onBlur?.();
  }, [initialText, onBlur, clearErrors]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleModalCancel();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, handleModalCancel, handleSave]);

  const hasError = parseError !== null || (validationError !== null && duplicateKeys === null) || externalError !== undefined;
  const displayError = parseError || validationError || externalError;

  // Отображение в ячейке (кнопка для открытия модального окна)
  if (!isModalOpen) {
    return (
      <div className={styles['complex-value-editor']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['complex-value-editor__wrapper']}>
          <Button 
            type="link" 
            onClick={handleModalOpen}
            size="small"
            className={styles['complex-value-editor__trigger']}
          >
            {value === null || value === undefined ? '-' : '{Посмотреть JSON}'}
          </Button>
          {externalError && (
            <Tooltip title={externalError} placement="topLeft">
              <ExclamationCircleOutlined className={styles['complex-value-editor__error-icon']} />
            </Tooltip>
          )}
        </div>
      </div>
    );
  }

  // Модальное окно с редактором
  return (
    <Modal
        title="Редактирование JSON"
        open={isModalOpen}
        onCancel={handleModalCancel}
        onOk={handleSave}
        okText="Сохранить"
        cancelText="Отменить"
        okButtonProps={{ disabled: hasError }}
        width={800}
        className={styles['complex-value-editor__modal']}
      >
        <div className={styles['complex-value-editor__content']}>
          <div className={styles['complex-value-editor__editor-wrapper']}>
            <Editor
              value={text}
              onValueChange={setText}
              highlight={(code) => Prism.highlight(code, Prism.languages.json, 'json')}
              padding={10}
              className={`${styles['complex-value-editor__editor']} ${hasError ? styles['complex-value-editor__editor--error'] : ''}`}
            />
          </div>
          {displayError && (
            <div className={styles['complex-value-editor__error-message']} title={displayError}>
              <strong>Ошибка:</strong> {displayError}
            </div>
          )}
          <div className={styles['complex-value-editor__hint']}>
            <Space orientation="vertical" size="small">
              <div>• Используйте Ctrl+Enter (Cmd+Enter на Mac) для сохранения</div>
              <div>• Используйте Escape для отмены</div>
              <div>• Значение должно быть JSON объектом</div>
            </Space>
          </div>
        </div>
      </Modal>
  );
}


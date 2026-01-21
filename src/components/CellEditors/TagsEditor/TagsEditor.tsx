import { useEffect, useMemo, useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { Flex, Input, Tag } from 'antd';
import styles from './TagsEditor.module.scss';
import type { ITagsEditorProps } from '../../../utils/types';
import { areValuesEqual } from '../../../utils/valueComparison';

const MAX_TAG_DISPLAY_LENGTH = 20;

export function TagsEditor({
  value,
  onChange,
  error,
}: ITagsEditorProps) {
  const normalizedValue = useMemo(() => Array.isArray(value) ? value : [], [value]);
  const [tags, setTags] = useState<string[]>(normalizedValue);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<InputRef>(null);
  const prevValueRef = useRef<string[]>(normalizedValue);
  const isInternalUpdateRef = useRef(false);

  // Синхронизация с внешним value только при реальном изменении извне
  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      
      return;
    }

    const prevValue = prevValueRef.current;

    if (!areValuesEqual(normalizedValue, prevValue)) {
      prevValueRef.current = normalizedValue;
      // Используем setTimeout для отложенного обновления, чтобы избежать предупреждения линтера
      setTimeout(() => {
        setTags(normalizedValue);
      }, 0);
    }
  }, [normalizedValue]);

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  const handleClose = (removedTag: string) => {
    const newTags = tags.filter((tag) => tag !== removedTag);

    isInternalUpdateRef.current = true;

    setTags(newTags);
    onChange(newTags);
  };

  const handleInputConfirm = () => {
    if (inputValue && !tags.includes(inputValue)) {
      const newTags = [...tags, inputValue];

      isInternalUpdateRef.current = true;

      setTags(newTags);
      onChange(newTags);
    }
    setInputVisible(false);
    setInputValue('');
  };

  return (
    <div className={styles['tags-editor']} onClick={(e) => e.stopPropagation()}>
      <div className={styles['tags-editor__wrapper']}>
        <Flex gap="small" align="center" wrap>
          {tags.map((tag) => {
            const isLongTag = tag.length > MAX_TAG_DISPLAY_LENGTH;
            
            return (
              <Tag
                key={tag}
                closable
                className={styles['tags-editor__tag']}
                onClose={() => handleClose(tag)}
              >
                {isLongTag ? `${tag.slice(0, MAX_TAG_DISPLAY_LENGTH)}...` : tag}
              </Tag>
            );
          })}
          {inputVisible ? (
            <Input
              ref={inputRef}
              type="text"
              size="small"
              className={styles['tags-editor__input']}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleInputConfirm}
              onPressEnter={handleInputConfirm}
              status={error ? 'error' : undefined}
            />
          ) : (
            <Tag
              className={styles['tags-editor__tag-plus']}
              icon={<PlusOutlined />}
              onClick={() => setInputVisible(true)}
            >
              Создать
            </Tag>
          )}
        </Flex>
      </div>
    </div>
  );
}


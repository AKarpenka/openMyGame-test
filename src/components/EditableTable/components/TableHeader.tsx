import { Button } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import styles from '../EditableTable.module.scss';

interface ITableHeaderProps {
  hasChanges: boolean;
  changesCount: number;
  isSaving: boolean;
  onSaveAll: () => void;
}

export default function TableHeader({
  hasChanges,
  changesCount,
  isSaving,
  onSaveAll,
}: ITableHeaderProps) {
  return (
    <div className={styles.editableTableHeader}>
      <Button
        type="primary"
        icon={<SaveOutlined />}
        onClick={onSaveAll}
        disabled={!hasChanges || isSaving}
        loading={isSaving}
      >
        Сохранить изменения {hasChanges ? `(${changesCount})` : ''}
      </Button>
    </div>
  );
}


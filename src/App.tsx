import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import { mockData } from './data/mockData';
import { columnsConfig } from './data/columnsConfig';
import './App.css';

const EditableTable = lazy(() => import('./components/EditableTable'));

function App() {
  return (
    <div className="app-container">
      <h1>Таблица данных</h1>

      <Suspense fallback={
        <div className="app-suspense-fallback">
          <Spin size="large" tip="">
            <div className="app-suspense-spinner" />
          </Spin>
        </div>
      }>
        <EditableTable
          data={mockData}
          columns={columnsConfig}
        />
      </Suspense>
    </div>
  );
}

export default App;

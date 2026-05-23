import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { DatasetDetail } from './pages/DatasetDetail';
import { Incidents } from './pages/Incidents';
import { PipelineDetail } from './pages/PipelineDetail';
import { ProductDetail } from './pages/ProductDetail';
import { Products } from './pages/Products';
import './App.css';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:productId" element={<ProductDetail />} />
            <Route
              path="products/:productId/pipelines/:pipelineId"
              element={<PipelineDetail />}
            />
            <Route
              path="products/:productId/pipelines/:pipelineId/datasets/:datasetId"
              element={<DatasetDetail />}
            />
            <Route path="incidents" element={<Incidents />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

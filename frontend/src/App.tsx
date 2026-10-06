import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Datasets } from './pages/Datasets';
import { DatasetDetail } from './pages/DatasetDetail';
import { DataQuality } from './pages/DataQuality';
import { Anomalies } from './pages/Anomalies';
import { Drift } from './pages/Drift';
import { DataReliability } from './pages/DataReliability';
import { Models } from './pages/Models';
import { ModelImpact } from './pages/ModelImpact';
import { DecisionImpact } from './pages/DecisionImpact';
import { Alerts } from './pages/Alerts';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { MainLayout } from './layouts/MainLayout';
import { useAuthStore } from './stores/authStore';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="datasets" element={<Datasets />} />
          <Route path="datasets/:id" element={<DatasetDetail />} />
          <Route path="quality" element={<DataQuality />} />
          <Route path="anomalies" element={<Anomalies />} />
          <Route path="drift" element={<Drift />} />
          <Route path="reliability" element={<DataReliability />} />
          <Route path="models" element={<Models />} />
          <Route path="model-impact" element={<ModelImpact />} />
          <Route path="decision-impact" element={<DecisionImpact />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;


import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { UsersPage } from './pages/Users';
import { ServicesPage } from './pages/Services';
import { DevicesPage } from './pages/Devices';
import { UsagePage } from './pages/Usage';
import { PaymentsPage } from './pages/Payments';
import { Login } from './pages/Login';
import { PortalLogin } from './pages/portal/PortalLogin';
import { PortalLayout } from './pages/portal/PortalLayout';
import { PortalDashboard } from './pages/portal/PortalDashboard';
import { PortalRequest } from './pages/portal/PortalRequest';
import { PortalHistory } from './pages/portal/PortalHistory';
import { Landing } from './pages/Landing';
import { AppProvider, useApp } from './context/AppContext';

// Component to handle routing logic based on auth state
const AppRoutes = () => {
  const { isAuthenticated } = useApp();

  return (
    <Routes>
      {/* Public Landing */}
      <Route path="/" element={<Landing />} />

      {/* Portal Routes */}
      <Route path="/portal/login" element={<PortalLogin />} />
      <Route
        path="/portal/*"
        element={
          <PortalLayout>
            <Routes>
              <Route path="/" element={<PortalDashboard />} />
              <Route path="/request" element={<PortalRequest />} />
              <Route path="/history" element={<PortalHistory />} />
              <Route path="*" element={<Navigate to="/portal" replace />} />
            </Routes>
          </PortalLayout>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/login"
        element={isAuthenticated ? <Navigate to="/admin" replace /> : <Login />}
      />

      <Route
        path="/admin/*"
        element={
          isAuthenticated ? (
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/devices" element={<DevicesPage />} />
                <Route path="/usage" element={<UsagePage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

export default App;

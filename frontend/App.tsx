
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
import { AppProvider, useApp } from './context/AppContext';

// Component to handle routing logic based on auth state
const AppRoutes = () => {
  const { isAuthenticated } = useApp();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      
      <Route 
        path="/*" 
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
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
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

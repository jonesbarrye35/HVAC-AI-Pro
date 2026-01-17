import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Schedule } from './pages/Schedule';
import { JobDetails } from './pages/JobDetails';

const AppContent: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/jobs" element={<Schedule />} /> {/* Reusing schedule list for now */}
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
}

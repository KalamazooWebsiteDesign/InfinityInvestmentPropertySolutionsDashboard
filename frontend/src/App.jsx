import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Public pages
import HomePage   from './pages/public/HomePage';
import DealPage   from './pages/public/DealPage';
import NotFound   from './pages/public/NotFound';

// Admin pages
import LoginPage      from './pages/admin/LoginPage';
import DashboardPage  from './pages/admin/DashboardPage';
import DealsListPage  from './pages/admin/DealsListPage';
import DealEditorPage from './pages/admin/DealEditorPage';
import SettingsPage   from './pages/admin/SettingsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* ── Public ────────────────────────────────────────────── */}
      <Route path="/"              element={<HomePage />} />
      <Route path="/deals/:slug"   element={<DealPage />} />

      {/* ── Auth ──────────────────────────────────────────────── */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/admin" replace /> : <LoginPage />}
      />

      {/* ── Admin (protected) ─────────────────────────────────── */}
      <Route path="/admin" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/admin/deals" element={<ProtectedRoute><DealsListPage /></ProtectedRoute>} />
      <Route path="/admin/deals/new" element={<ProtectedRoute><DealEditorPage /></ProtectedRoute>} />
      <Route path="/admin/deals/:id/edit" element={<ProtectedRoute><DealEditorPage /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      {/* ── 404 ───────────────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

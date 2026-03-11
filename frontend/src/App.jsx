import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Public pages
import HomePage   from './pages/public/HomePage';
import DealPage   from './pages/public/DealPage';
import NotFound   from './pages/public/NotFound';

// Admin pages
import LoginPage        from './pages/admin/LoginPage';
import DashboardPage    from './pages/admin/DashboardPage';
import DealsListPage    from './pages/admin/DealsListPage';
import DealEditorPage   from './pages/admin/DealEditorPage';
import SettingsPage     from './pages/admin/SettingsPage';
import InvestorsPage    from './pages/admin/InvestorsPage';

// Investor pages
import InvestorDashboardPage from './pages/investor/InvestorDashboardPage';
import InvestorDealPage      from './pages/investor/InvestorDealPage';

// ── Route guards ──────────────────────────────────────────────────────────────
function RequireAdmin({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin)         return <Navigate to="/investor" replace />;
  return children;
}

function RequireInvestor({ children }) {
  const { isAuthenticated, isInvestor, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isInvestor)      return <Navigate to="/admin" replace />;
  return children;
}

function Spinner() {
  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, isAdmin, isInvestor } = useAuth();

  return (
    <Routes>
      {/* ── Public ────────────────────────────────────────────── */}
      <Route path="/"            element={<HomePage />} />
      <Route path="/deals/:slug" element={<DealPage />} />

      {/* ── Auth ──────────────────────────────────────────────── */}
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to={isAdmin ? '/admin' : '/investor'} replace />
            : <LoginPage />
        }
      />

      {/* ── Admin (protected, admin role only) ────────────────── */}
      <Route path="/admin"                   element={<RequireAdmin><DashboardPage /></RequireAdmin>} />
      <Route path="/admin/deals"             element={<RequireAdmin><DealsListPage /></RequireAdmin>} />
      <Route path="/admin/deals/new"         element={<RequireAdmin><DealEditorPage /></RequireAdmin>} />
      <Route path="/admin/deals/:id/edit"    element={<RequireAdmin><DealEditorPage /></RequireAdmin>} />
      <Route path="/admin/investors"         element={<RequireAdmin><InvestorsPage /></RequireAdmin>} />
      <Route path="/admin/settings"          element={<RequireAdmin><SettingsPage /></RequireAdmin>} />

      {/* ── Investor portal (protected, investor role only) ────── */}
      <Route path="/investor"                element={<RequireInvestor><InvestorDashboardPage /></RequireInvestor>} />
      <Route path="/investor/deals/:slug"    element={<RequireInvestor><InvestorDealPage /></RequireInvestor>} />

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

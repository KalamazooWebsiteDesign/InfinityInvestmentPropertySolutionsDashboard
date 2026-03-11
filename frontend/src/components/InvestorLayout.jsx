import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard } from 'lucide-react';

export default function InvestorLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-primary-50">
      {/* Top nav bar */}
      <header className="sticky top-0 z-30 bg-primary-900 border-b border-primary-800 px-4 sm:px-6 h-14 flex items-center gap-4">
        <Link to="/investor" className="flex items-center gap-2 mr-auto">
          <div className="w-7 h-7 bg-accent-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">II</span>
          </div>
          <span className="text-white font-semibold text-sm hidden sm:block">Investor Portal</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-white text-xs font-medium leading-none">{user?.name || user?.email}</div>
            <div className="text-primary-400 text-xs leading-none mt-0.5">Investor</div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="flex items-center gap-1.5 text-primary-400 hover:text-red-400 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-primary-800 transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      <footer className="border-t border-primary-200 py-4 text-center text-xs text-primary-400">
        Infinity Investment Property Solutions &nbsp;·&nbsp; Private Investor Portal
      </footer>
    </div>
  );
}

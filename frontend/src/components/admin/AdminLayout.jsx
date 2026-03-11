import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, FileText, Plus, Settings, LogOut,
  Menu, X, ChevronRight, Home, ExternalLink, Users
} from 'lucide-react';

const navItems = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/deals',      icon: FileText,         label: 'Deals' },
  { to: '/admin/investors',  icon: Users,            label: 'Investors' },
  { to: '/admin/settings',   icon: Settings,         label: 'Settings' },
];

function NavItem({ to, icon: Icon, label, exact, onClick }) {
  const { pathname } = useLocation();
  const active = exact ? pathname === to : pathname.startsWith(to);

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-accent-500/10 text-accent-500'
          : 'text-primary-400 hover:text-white hover:bg-primary-800'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
      {active && <ChevronRight size={14} className="ml-auto text-accent-500" />}
    </Link>
  );
}

export default function AdminLayout({ children, title, actions }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-primary-900 ${mobile ? '' : 'w-60'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-primary-800">
        <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">II</span>
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-none">Infinity Investment Property Solutions</div>
          <div className="text-primary-500 text-xs leading-none mt-0.5">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(item => (
          <NavItem key={item.to} {...item} onClick={() => setSidebarOpen(false)} />
        ))}

        <div className="mt-4 pt-4 border-t border-primary-800">
          <Link
            to="/admin/deals/new"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-accent-400 hover:text-accent-300 hover:bg-primary-800 transition-colors"
          >
            <Plus size={18} />
            <span>New Deal</span>
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-400 hover:text-white hover:bg-primary-800 transition-colors"
          >
            <ExternalLink size={18} />
            <span>View Site</span>
          </a>
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-primary-800 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-white text-xs font-medium truncate">{user?.email}</div>
            <div className="text-primary-500 text-xs">Administrator</div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-primary-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-primary-800 transition-colors shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-primary-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-60 fixed inset-y-0 left-0 z-40 border-r border-primary-800">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-primary-950/80" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 flex flex-col">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-primary-200 px-4 sm:px-6 h-14 flex items-center gap-4">
          <button
            className="md:hidden text-primary-400 hover:text-primary-700 p-1"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <h1 className="font-bold text-primary-900 text-base flex-1">{title}</h1>

          <div className="flex items-center gap-2">
            {actions}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

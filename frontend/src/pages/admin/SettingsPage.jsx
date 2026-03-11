import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { Eye, EyeOff, CheckCircle, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { user: admin, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [status, setStatus]   = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMessage('New passwords do not match');
      setStatus('error');
      return;
    }
    if (form.newPassword.length < 8) {
      setMessage('New password must be at least 8 characters');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      await api.auth.changePassword(form.currentPassword, form.newPassword);
      setStatus('success');
      setMessage('Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AdminLayout title="Settings">
      <div className="max-w-lg flex flex-col gap-6">
        {/* Account info */}
        <div className="bg-white border border-primary-200 rounded-xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-accent-600" />
            </div>
            <div>
              <div className="font-bold text-primary-900">Account</div>
              <div className="text-primary-500 text-sm">{admin?.email}</div>
            </div>
          </div>
          <div className="text-xs text-primary-400 bg-primary-50 rounded-lg px-4 py-3 border border-primary-100">
            This is the admin account for Infinity Investment Property Solutions. Only authorized users should have access.
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white border border-primary-200 rounded-xl p-5 sm:p-6 shadow-sm">
          <h2 className="font-bold text-primary-900 mb-1">Change Password</h2>
          <p className="text-primary-500 text-sm mb-5">
            Use a strong, unique password. At least 8 characters recommended.
          </p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="field">
              <label className="label">Current Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showCurrent ? 'text' : 'password'}
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handle}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button type="button" tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600"
                  onClick={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="field">
              <label className="label">New Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showNew ? 'text' : 'password'}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handle}
                  placeholder="Minimum 8 characters"
                  required
                  autoComplete="new-password"
                />
                <button type="button" tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600"
                  onClick={() => setShowNew(!showNew)}>
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="field">
              <label className="label">Confirm New Password</label>
              <input
                className="input"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handle}
                placeholder="Repeat new password"
                required
                autoComplete="new-password"
              />
            </div>

            {status === 'success' && (
              <div className="flex items-center gap-2 bg-accent-50 border border-accent-200 text-accent-700 text-sm px-4 py-3 rounded-lg">
                <CheckCircle size={16} />
                {message}
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {message}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Production credentials note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm">
          <h3 className="font-bold text-amber-800 mb-2">Production Setup Notes</h3>
          <div className="text-amber-700 space-y-1.5">
            <p>• Default credentials are stored in <code className="bg-amber-100 px-1 rounded font-mono text-xs">backend/.env</code></p>
            <p>• The admin is <strong>seeded once</strong> on first server start. To change credentials for production:</p>
            <ol className="list-decimal list-inside pl-2 space-y-1">
              <li>Update <code className="bg-amber-100 px-1 rounded font-mono text-xs">ADMIN_EMAIL</code> and <code className="bg-amber-100 px-1 rounded font-mono text-xs">ADMIN_PASSWORD</code> in <code className="bg-amber-100 px-1 rounded font-mono text-xs">.env</code></li>
              <li>Delete <code className="bg-amber-100 px-1 rounded font-mono text-xs">backend/data/garcia.db</code></li>
              <li>Restart the server to re-seed with new credentials</li>
            </ol>
            <p>• Or use this form to change the password <strong>after</strong> first login (recommended).</p>
            <p>• Also update <code className="bg-amber-100 px-1 rounded font-mono text-xs">JWT_SECRET</code> in <code className="bg-amber-100 px-1 rounded font-mono text-xs">.env</code> to a long random string for production.</p>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-white border border-primary-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-bold text-primary-900 mb-1">Sign Out</h2>
          <p className="text-primary-500 text-sm mb-4">Sign out of the admin panel on this device.</p>
          <button onClick={handleLogout} className="btn-secondary text-sm py-2">
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { authApi } from '@/lib/api';
import { User, Moon, Sun, Bell, Shield, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useUIStore();
  const [profile, setProfile] = useState({ name: user?.name || '', timezone: user?.timezone || 'UTC' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await authApi.updateProfile(profile);
      updateUser(data.data);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSavingProfile(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 8) { toast.error('Password too short'); return; }
    setSavingPassword(true);
    try {
      await authApi.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed! Please log in again.');
      logout();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPassword(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-brand-50 dark:bg-brand-950/20 rounded-xl flex items-center justify-center">
            <User size={18} className="text-brand-600" />
          </div>
          <h2 className="section-title">Profile</h2>
        </div>

        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-brand-600">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label">Timezone</label>
            <select value={profile.timezone} onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))} className="input">
              {['UTC','America/New_York','America/Los_Angeles','Europe/London','Europe/Paris','Asia/Tokyo','Asia/Beirut','Africa/Cairo'].map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Appearance */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-brand-50 dark:bg-brand-950/20 rounded-xl flex items-center justify-center">
            {darkMode ? <Sun size={18} className="text-brand-600" /> : <Moon size={18} className="text-brand-600" />}
          </div>
          <h2 className="section-title">Appearance</h2>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-sm text-gray-500">Switch between light and dark theme</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`w-12 h-6 rounded-full transition-all duration-200 relative ${darkMode ? 'bg-brand-400' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all duration-200 ${darkMode ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-brand-50 dark:bg-brand-950/20 rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-brand-600" />
          </div>
          <h2 className="section-title">Security</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} className="input" placeholder="••••••••" />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} className="input" placeholder="Min. 8 characters" />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} className="input" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={savingPassword} className="btn-primary">
            {savingPassword ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="card p-6 border-red-100 dark:border-red-900/30">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-red-50 dark:bg-red-950/20 rounded-xl flex items-center justify-center">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Danger Zone</h2>
        </div>
        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-xl">
          <div>
            <p className="font-medium text-red-800 dark:text-red-300">Sign out of all devices</p>
            <p className="text-sm text-red-600 dark:text-red-400">This will invalidate all sessions</p>
          </div>
          <button onClick={() => logout()} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

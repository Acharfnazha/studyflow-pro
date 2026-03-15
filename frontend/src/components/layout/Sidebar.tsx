'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, CheckSquare, Calendar,
  FileText, BarChart2, Settings, LogOut, ChevronLeft, Moon, Sun, GraduationCap
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/courses', icon: BookOpen, label: 'Courses' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/notes', icon: FileText, label: 'Notes' },
  { href: '/analytics', icon: BarChart2, label: 'Analytics' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { darkMode, sidebarCollapsed, toggleDarkMode, toggleSidebar } = useUIStore();

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col z-40 transition-all duration-200',
      sidebarCollapsed ? 'w-16' : 'w-56'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-400 rounded-xl flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">
              Study<span className="text-brand-400">Flow</span>
            </span>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-8 h-8 bg-brand-400 rounded-xl flex items-center justify-center mx-auto">
            <GraduationCap size={16} className="text-white" />
          </div>
        )}
        <button onClick={toggleSidebar} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ml-auto">
          <ChevronLeft size={14} className={cn('text-gray-400 transition-transform', sidebarCollapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} className={cn('sidebar-item', active && 'active', sidebarCollapsed && 'justify-center px-2')}>
              <Icon size={18} className="flex-shrink-0" />
              {!sidebarCollapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
        <Link href="/settings" className={cn('sidebar-item', pathname === '/settings' && 'active', sidebarCollapsed && 'justify-center px-2')}>
          <Settings size={18} className="flex-shrink-0" />
          {!sidebarCollapsed && <span>Settings</span>}
        </Link>

        <button onClick={toggleDarkMode} className={cn('sidebar-item w-full', sidebarCollapsed && 'justify-center px-2')}>
          {darkMode ? <Sun size={18} className="flex-shrink-0" /> : <Moon size={18} className="flex-shrink-0" />}
          {!sidebarCollapsed && <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>}
        </button>

        {!sidebarCollapsed && user && (
          <div className="flex items-center gap-2 px-3 py-2 mt-2">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-brand-600">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <button onClick={logout} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        )}

        {sidebarCollapsed && (
          <button onClick={logout} className="sidebar-item w-full justify-center px-2 text-gray-400 hover:text-red-500">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}

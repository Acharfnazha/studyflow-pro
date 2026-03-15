'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import Sidebar from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { accessToken, user, fetchUser } = useAuthStore();
  const { darkMode, sidebarCollapsed } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) { router.push('/login'); return; }
    if (!user) fetchUser();
  }, [accessToken]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  if (!accessToken) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className={cn(
        'transition-all duration-200 min-h-screen',
        sidebarCollapsed ? 'pl-16' : 'pl-56'
      )}>
        <div className="p-6 max-w-7xl mx-auto animate-in">
          {children}
        </div>
      </main>
    </div>
  );
}

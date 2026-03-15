'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function useAuth(requireAuth = true) {
  const { user, accessToken, isLoading, fetchUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (accessToken && !user) {
      fetchUser();
    }
    if (requireAuth && !isLoading && !accessToken) {
      router.push('/login');
    }
  }, [accessToken, user, isLoading, requireAuth]);

  return { user, isLoading, isAuthenticated: !!accessToken };
}

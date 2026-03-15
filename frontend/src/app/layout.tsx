import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'StudyFlow Pro — Academic Productivity Platform',
  description: 'Manage your courses, tasks, notes, and study sessions in one smart dashboard.',
  keywords: ['study', 'productivity', 'university', 'student', 'academic planner'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#1D9E75', secondary: '#fff' } },
            error: { iconTheme: { primary: '#E24B4A', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}

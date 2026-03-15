'use client';
import { useState, useEffect } from 'react';
import { analyticsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { DashboardStats, WeeklyProgress } from '@/types';
import { formatDate, PRIORITY_COLORS, STATUS_COLORS } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, BookOpen, CheckCircle, AlertCircle, Clock, Zap, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weekly, setWeekly] = useState<WeeklyProgress[]>([]);
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, weeklyRes, recRes] = await Promise.all([
          analyticsApi.dashboard(),
          analyticsApi.weekly(),
          analyticsApi.recommendations(),
        ]);
        setStats(statsRes.data.data);
        setWeekly(weeklyRes.data.data);
        setRecommendation(recRes.data.data.suggestion);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const STAT_CARDS = [
    { label: 'Completed This Week', value: stats?.completedThisWeek ?? 0, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30' },
    { label: 'Pending Tasks', value: stats?.pendingTasks ?? 0, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Overdue', value: stats?.overdueTasks ?? 0, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
    { label: 'Study Hours', value: `${stats?.studyHoursThisWeek ?? 0}h`, icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-950/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {stats?.overdueTasks ? `You have ${stats.overdueTasks} overdue task${stats.overdueTasks > 1 ? 's' : ''} — let's tackle them.` : "You're all caught up! Keep it up."}
          </p>
        </div>
        <Link href="/tasks" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Task
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</span>
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon size={16} className={color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Smart suggestion */}
      {recommendation && (
        <div className="card p-4 bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950/20 dark:to-purple-950/20 border-brand-100 dark:border-brand-800/30">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-brand-400 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <Zap size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-800 dark:text-brand-300">Smart Suggestion</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{recommendation}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Weekly chart */}
        <div className="card p-5 lg:col-span-3">
          <h2 className="section-title mb-4">Weekly Progress</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekly} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }}
                cursor={{ fill: 'rgba(127,119,221,0.05)' }}
              />
              <Bar dataKey="completed" name="Completed" fill="#7F77DD" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Today's tasks */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Today's Tasks</h2>
            <span className="badge bg-brand-50 text-brand-600 border-brand-100">
              {stats?.todayTasks?.length ?? 0} tasks
            </span>
          </div>
          <div className="space-y-2">
            {stats?.todayTasks?.length ? stats.todayTasks.map(task => (
              <Link key={task.id} href={`/tasks`} className="block p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: task.course?.color || '#7F77DD' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(task.dueDate)}</p>
                  </div>
                  <span className={`badge ${PRIORITY_COLORS[task.priority]} text-xs`}>
                    {task.priority.toLowerCase()}
                  </span>
                </div>
              </Link>
            )) : (
              <div className="text-center py-8">
                <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No tasks due today!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion rate */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="section-title">Overall Completion Rate</h2>
            <p className="text-sm text-gray-500 mt-0.5">Based on tasks this week</p>
          </div>
          <span className="text-3xl font-bold text-brand-400">{stats?.completionRate ?? 0}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-brand-400 to-brand-600 h-2 rounded-full transition-all duration-700"
            style={{ width: `${stats?.completionRate ?? 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}

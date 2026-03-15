'use client';
import { useState, useEffect } from 'react';
import { analyticsApi } from '@/lib/api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { TrendingUp, Award, Target, Zap } from 'lucide-react';

export default function AnalyticsPage() {
  const [weekly, setWeekly] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [suggestion, setSuggestion] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [w, c, r, s] = await Promise.all([
          analyticsApi.weekly(), analyticsApi.courses(),
          analyticsApi.recommendations(), analyticsApi.dashboard(),
        ]);
        setWeekly(w.data.data);
        setCourses(c.data.data);
        setRecommendations(r.data.data.recommendations);
        setSuggestion(r.data.data.suggestion);
        setStats(s.data.data);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const STAT_CARDS = [
    { label: 'Completion Rate', value: `${stats?.completionRate ?? 0}%`, icon: Target, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-950/20' },
    { label: 'Completed This Week', value: stats?.completedThisWeek ?? 0, icon: Award, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/20' },
    { label: 'Study Hours (Week)', value: `${stats?.studyHoursThisWeek ?? 0}h`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' },
    { label: 'Overdue Tasks', value: stats?.overdueTasks ?? 0, icon: Zap, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20' },
  ];

  const COLORS = ['#7F77DD', '#1D9E75', '#EF9F27', '#378ADD', '#E24B4A', '#D4537E'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Your academic performance insights</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{label}</span>
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon size={16} className={color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Tasks Chart */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Tasks This Week</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekly} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }} cursor={{ fill: 'rgba(127,119,221,0.05)' }} />
              <Bar dataKey="completed" name="Completed" fill="#7F77DD" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Study Hours Line Chart */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Study Hours</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }} />
              <Line type="monotone" dataKey="studyHours" name="Study Hours" stroke="#1D9E75" strokeWidth={2.5} dot={{ fill: '#1D9E75', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Course Progress */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Progress by Course</h2>
        {courses.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No course data yet</p>
        ) : (
          <div className="space-y-4">
            {courses.map(course => (
              <div key={course.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: course.color }} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{course.name}</span>
                    <span className="text-xs text-gray-400 font-mono">{course.code}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{course.rate}%</span>
                    <span className="text-xs text-gray-400 ml-1">({course.completed}/{course.total})</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${course.rate}%`, background: course.color }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Smart Recommendations */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-brand-400 rounded-xl flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h2 className="section-title">Smart Recommendations</h2>
            {suggestion && <p className="text-sm text-gray-500 mt-0.5">{suggestion}</p>}
          </div>
        </div>
        <div className="space-y-2">
          {recommendations.map((task, i) => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {task.course && <span className="text-xs text-gray-400">{task.course.name}</span>}
                  <span className="text-xs text-gray-400">
                    {task.hoursUntilDue < 0 ? '⚠️ Overdue' : `${task.hoursUntilDue}h until due`}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs font-bold text-brand-600">Score: {Math.round(task.score)}</span>
              </div>
            </div>
          ))}
          {recommendations.length === 0 && (
            <p className="text-center text-gray-400 py-4 text-sm">All caught up — great work!</p>
          )}
        </div>
      </div>
    </div>
  );
}

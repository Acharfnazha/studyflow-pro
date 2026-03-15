'use client';
import { useState, useEffect } from 'react';
import { tasksApi } from '@/lib/api';
import { Task } from '@/types';
import { PRIORITY_COLORS, formatDate, cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, getDay, addMonths, subMonths } from 'date-fns';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await tasksApi.getAll({ limit: 200 });
        setTasks(data.data.filter((t: Task) => t.dueDate));
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const getTasksForDay = (day: Date) =>
    tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day));

  const selectedTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Your task deadlines at a glance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 card p-5">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-600 dark:text-gray-400">
                Today
              </button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
            {days.map(day => {
              const dayTasks = getTasksForDay(day);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const today = isToday(day);
              const hasOverdue = dayTasks.some(t => t.status === 'OVERDUE');
              const hasUrgent = dayTasks.some(t => t.priority === 'URGENT');

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    'p-1.5 rounded-xl flex flex-col items-center gap-0.5 min-h-[52px] transition-all text-left',
                    isSelected && 'bg-brand-400 text-white',
                    !isSelected && today && 'bg-brand-50 dark:bg-brand-950/20',
                    !isSelected && !today && 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                    !isSameMonth(day, currentDate) && 'opacity-30',
                  )}
                >
                  <span className={cn(
                    'text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full',
                    today && !isSelected && 'text-brand-600 font-bold',
                    isSelected && 'text-white',
                    !today && !isSelected && 'text-gray-700 dark:text-gray-300',
                  )}>
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <div className="flex gap-0.5 flex-wrap justify-center">
                      {dayTasks.slice(0, 3).map(t => (
                        <div key={t.id} className="w-1.5 h-1.5 rounded-full"
                          style={{ background: isSelected ? 'white' : (t.course?.color || '#7F77DD') }} />
                      ))}
                      {dayTasks.length > 3 && (
                        <span className={cn('text-xs', isSelected ? 'text-white/70' : 'text-gray-400')}>+{dayTasks.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail */}
        <div className="card p-5 flex flex-col">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {selectedDay ? format(selectedDay, 'EEEE, MMM d') : 'Select a day'}
          </h3>

          {selectedTasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <Calendar size={32} className="text-gray-200 dark:text-gray-700 mb-3" />
              <p className="text-sm text-gray-400">No tasks due</p>
              {selectedDay && isToday(selectedDay) && (
                <p className="text-xs text-green-500 mt-1 font-medium">You're free today!</p>
              )}
            </div>
          ) : (
            <div className="space-y-2 flex-1 overflow-y-auto">
              {selectedTasks.map(task => (
                <div key={task.id} className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                  <div className="flex items-start gap-2">
                    {task.course && <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: task.course.color }} />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                      {task.course && <p className="text-xs text-gray-400 mt-0.5">{task.course.name}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(task.dueDate)}</p>
                    </div>
                    <span className={`badge ${PRIORITY_COLORS[task.priority]} flex-shrink-0`}>
                      {task.priority.toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

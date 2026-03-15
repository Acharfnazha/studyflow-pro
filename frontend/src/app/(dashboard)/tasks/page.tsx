'use client';
import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useCourses } from '@/hooks/useCourses';
import { Task } from '@/types';
import { PRIORITY_COLORS, STATUS_COLORS, TYPE_LABELS, formatDate, cn } from '@/lib/utils';
import { Plus, Search, Filter, CheckCircle2, Circle, Clock, AlertCircle, Trash2, Edit } from 'lucide-react';
import TaskModal from '@/components/tasks/TaskModal';

const STATUSES = ['', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'];
const PRIORITIES = ['', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function TasksPage() {
  const [filters, setFilters] = useState<any>({});
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks({ ...filters, search: search || undefined });
  const { courses } = useCourses();

  const handleSave = async (data: any) => {
    if (editing) await updateTask(editing.id, data);
    else await createTask(data);
    setShowModal(false);
    setEditing(null);
  };

  const toggleStatus = async (task: Task) => {
    const next = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    await updateTask(task.id, { status: next });
  };

  const statusIcon = (status: string) => {
    if (status === 'COMPLETED') return <CheckCircle2 size={18} className="text-green-500" />;
    if (status === 'OVERDUE') return <AlertCircle size={18} className="text-red-500" />;
    if (status === 'IN_PROGRESS') return <Clock size={18} className="text-blue-500" />;
    return <Circle size={18} className="text-gray-300" />;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="input pl-8"
          />
        </div>
        <select value={filters.courseId || ''} onChange={e => setFilters((p: any) => ({ ...p, courseId: e.target.value || undefined }))} className="input w-auto">
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
        </select>
        <select value={filters.status || ''} onChange={e => setFilters((p: any) => ({ ...p, status: e.target.value || undefined }))} className="input w-auto">
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <select value={filters.priority || ''} onChange={e => setFilters((p: any) => ({ ...p, priority: e.target.value || undefined }))} className="input w-auto">
          {PRIORITIES.map(p => <option key={p} value={p}>{p || 'All Priorities'}</option>)}
        </select>
        {Object.values(filters).some(Boolean) && (
          <button onClick={() => setFilters({})} className="btn-ghost text-red-500 hover:bg-red-50">Clear</button>
        )}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="card p-4 h-16 animate-pulse bg-gray-100 dark:bg-gray-800" />)}
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle2 size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-4">Create your first task to get started</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">Create Task</button>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <div key={task.id} className={cn('card p-4 flex items-center gap-4 hover:shadow-sm transition-all group', task.status === 'COMPLETED' && 'opacity-60')}>
              <button onClick={() => toggleStatus(task)} className="flex-shrink-0 transition-transform hover:scale-110">
                {statusIcon(task.status)}
              </button>

              <div className="flex items-center gap-2 flex-shrink-0">
                {task.course && (
                  <div className="w-2 h-2 rounded-full" style={{ background: task.course.color }} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('text-sm font-medium text-gray-900 dark:text-white', task.status === 'COMPLETED' && 'line-through text-gray-400')}>
                    {task.title}
                  </span>
                  {task.course && (
                    <span className="text-xs text-gray-400 font-mono">{task.course.code}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-gray-400">{TYPE_LABELS[task.type]}</span>
                  {task.dueDate && (
                    <span className={cn('text-xs', task.status === 'OVERDUE' ? 'text-red-500 font-medium' : 'text-gray-400')}>
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                  {task.estimatedMinutes && (
                    <span className="text-xs text-gray-400">{task.estimatedMinutes}min</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>{task.priority.toLowerCase()}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(task); setShowModal(true); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <Edit size={13} className="text-gray-400" />
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg">
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <TaskModal
          task={editing}
          courses={courses}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

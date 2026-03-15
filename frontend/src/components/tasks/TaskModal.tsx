'use client';
import { useState, useEffect } from 'react';
import { Task, Course } from '@/types';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  task: Task | null;
  courses: Course[];
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}

const SEL = ({ label, name, value, onChange, options }: any) => (
  <div>
    <label className="label">{label}</label>
    <select name={name} value={value} onChange={onChange} className="input">
      {options.map(([v, l]: [string, string]) => <option key={v} value={v}>{l}</option>)}
    </select>
  </div>
);

export default function TaskModal({ task, courses, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    title: '', description: '', courseId: '',
    type: 'ASSIGNMENT', priority: 'MEDIUM', status: 'PENDING', difficulty: 'MEDIUM',
    dueDate: '', dueTime: '', estimatedMinutes: '', notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      const d = task.dueDate ? new Date(task.dueDate) : null;
      setForm({
        title: task.title, description: task.description || '',
        courseId: task.courseId || '', type: task.type, priority: task.priority,
        status: task.status, difficulty: task.difficulty,
        dueDate: d ? format(d, 'yyyy-MM-dd') : '',
        dueTime: d ? format(d, 'HH:mm') : '',
        estimatedMinutes: task.estimatedMinutes?.toString() || '',
        notes: task.notes || '',
      });
    }
  }, [task]);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    set(e.target.name, e.target.value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload: any = {
      title: form.title, description: form.description || undefined,
      courseId: form.courseId || undefined, type: form.type,
      priority: form.priority, status: form.status, difficulty: form.difficulty,
      estimatedMinutes: form.estimatedMinutes ? parseInt(form.estimatedMinutes) : undefined,
      notes: form.notes || undefined,
    };
    if (form.dueDate) {
      payload.dueDate = form.dueTime
        ? new Date(`${form.dueDate}T${form.dueTime}`).toISOString()
        : new Date(`${form.dueDate}T23:59:59`).toISOString();
    }
    try { await onSave(payload); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-xl shadow-2xl animate-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Task Title *</label>
            <input name="title" value={form.title} onChange={onChange} className="input" placeholder="e.g. ER Diagram Assignment" required />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={onChange} className="input resize-none h-20" placeholder="Optional details..." />
          </div>

          <div>
            <label className="label">Course</label>
            <select name="courseId" value={form.courseId} onChange={onChange} className="input">
              <option value="">No course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SEL label="Type" name="type" value={form.type} onChange={onChange} options={[
              ['ASSIGNMENT','Assignment'],['QUIZ','Quiz'],['EXAM','Exam'],
              ['PROJECT','Project'],['STUDY_SESSION','Study Session'],['OTHER','Other'],
            ]} />
            <SEL label="Priority" name="priority" value={form.priority} onChange={onChange} options={[
              ['LOW','Low'],['MEDIUM','Medium'],['HIGH','High'],['URGENT','Urgent'],
            ]} />
            <SEL label="Status" name="status" value={form.status} onChange={onChange} options={[
              ['PENDING','Pending'],['IN_PROGRESS','In Progress'],['COMPLETED','Completed'],
            ]} />
            <SEL label="Difficulty" name="difficulty" value={form.difficulty} onChange={onChange} options={[
              ['EASY','Easy'],['MEDIUM','Medium'],['HARD','Hard'],['EXPERT','Expert'],
            ]} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Due Date</label>
              <input type="date" name="dueDate" value={form.dueDate} onChange={onChange} className="input" />
            </div>
            <div>
              <label className="label">Due Time</label>
              <input type="time" name="dueTime" value={form.dueTime} onChange={onChange} className="input" />
            </div>
          </div>

          <div>
            <label className="label">Estimated Time (minutes)</label>
            <input type="number" name="estimatedMinutes" value={form.estimatedMinutes} onChange={onChange} className="input" placeholder="e.g. 120" min="0" />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea name="notes" value={form.notes} onChange={onChange} className="input resize-none h-16" placeholder="Any extra notes..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

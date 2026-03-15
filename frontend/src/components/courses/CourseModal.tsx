'use client';
import { useState, useEffect } from 'react';
import { Course } from '@/types';
import { COURSE_COLORS } from '@/lib/utils';
import { X } from 'lucide-react';

interface Props {
  course: Course | null;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}

export default function CourseModal({ course, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    name: '', code: '', instructor: '', semester: '',
    color: COURSE_COLORS[0], description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (course) {
      setForm({ name: course.name, code: course.code, instructor: course.instructor || '',
        semester: course.semester || '', color: course.color, description: course.description || '' });
    }
  }, [course]);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onSave(form); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl animate-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {course ? 'Edit Course' : 'Add Course'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Course Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className="input" placeholder="Algorithms & Data Structures" required />
            </div>
            <div>
              <label className="label">Course Code *</label>
              <input value={form.code} onChange={e => set('code', e.target.value)} className="input font-mono" placeholder="CS401" required />
            </div>
            <div>
              <label className="label">Semester</label>
              <input value={form.semester} onChange={e => set('semester', e.target.value)} className="input" placeholder="Spring 2026" />
            </div>
            <div className="col-span-2">
              <label className="label">Instructor</label>
              <input value={form.instructor} onChange={e => set('instructor', e.target.value)} className="input" placeholder="Dr. Smith" />
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input resize-none h-20" placeholder="Brief course description..." />
            </div>
          </div>

          <div>
            <label className="label">Color Label</label>
            <div className="flex gap-2 flex-wrap">
              {COURSE_COLORS.map(color => (
                <button key={color} type="button" onClick={() => set('color', color)}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                  style={{ background: color, outline: form.color === color ? `3px solid ${color}` : 'none', outlineOffset: '2px' }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : course ? 'Update Course' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

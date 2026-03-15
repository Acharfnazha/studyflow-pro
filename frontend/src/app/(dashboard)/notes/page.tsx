'use client';
import { useState } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { useCourses } from '@/hooks/useCourses';
import { Note } from '@/types';
import { Plus, Search, FileText, Trash2, X, Save } from 'lucide-react';
import { formatRelative } from '@/lib/utils';

export default function NotesPage() {
  const [filters, setFilters] = useState<any>({});
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Note | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const { notes, loading, createNote, updateNote, deleteNote } = useNotes({ ...filters, search: search || undefined });
  const { courses } = useCourses();

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const note = await createNote({ title: newTitle, courseId: newCourse || undefined, content: '' });
    setSelected(note);
    setEditContent('');
    setShowNew(false);
    setNewTitle('');
    setNewCourse('');
  };

  const handleSelect = (note: Note) => {
    setSelected(note);
    setEditContent(note.content);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    await updateNote(selected.id, { content: editContent });
    setSelected(prev => prev ? { ...prev, content: editContent } : null);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await deleteNote(id);
    if (selected?.id === id) { setSelected(null); setEditContent(''); }
  };

  return (
    <div className="flex gap-5 h-[calc(100vh-5rem)]">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notes</h1>
          <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-1.5 py-1.5 px-3 text-xs">
            <Plus size={14} /> New
          </button>
        </div>

        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." className="input pl-8 text-sm" />
        </div>

        <select value={filters.courseId || ''} onChange={e => setFilters((p: any) => ({ ...p, courseId: e.target.value || undefined }))} className="input text-sm">
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
        </select>

        {showNew && (
          <div className="card p-3 space-y-2 border-brand-200 dark:border-brand-800">
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Note title..." className="input text-sm" autoFocus onKeyDown={e => e.key === 'Enter' && handleCreate()} />
            <select value={newCourse} onChange={e => setNewCourse(e.target.value)} className="input text-sm">
              <option value="">No course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setShowNew(false)} className="btn-secondary flex-1 py-1.5 text-xs">Cancel</button>
              <button onClick={handleCreate} className="btn-primary flex-1 py-1.5 text-xs">Create</button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-1">
          {loading ? [...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />) :
          notes.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No notes yet</p>
            </div>
          ) : notes.map(note => (
            <div
              key={note.id}
              onClick={() => handleSelect(note)}
              className={`p-3 rounded-xl cursor-pointer transition-all group ${selected?.id === note.id ? 'bg-brand-50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{note.title}</p>
                  {note.course && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: note.course.color }} />
                      <span className="text-xs text-gray-400">{note.course.name}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{formatRelative(note.updatedAt)}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(note.id); }}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                >
                  <Trash2 size={12} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 card p-6 flex flex-col">
        {selected ? (
          <>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selected.title}</h2>
                {selected.course && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: selected.course.color }} />
                    <span className="text-sm text-gray-500">{selected.course.name}</span>
                  </div>
                )}
              </div>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                <Save size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              placeholder="Start writing your notes here... (Markdown supported)"
              className="flex-1 w-full resize-none text-sm text-gray-700 dark:text-gray-300 bg-transparent outline-none leading-relaxed font-mono"
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <FileText size={48} className="text-gray-200 dark:text-gray-700 mb-4" />
            <p className="text-lg font-medium text-gray-400 dark:text-gray-600">Select a note to edit</p>
            <p className="text-sm text-gray-400 mt-1">or create a new one</p>
            <button onClick={() => setShowNew(true)} className="btn-primary mt-4 flex items-center gap-2">
              <Plus size={15} /> New Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

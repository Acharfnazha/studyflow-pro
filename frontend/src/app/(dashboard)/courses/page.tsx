'use client';
import { useState } from 'react';
import { useCourses } from '@/hooks/useCourses';
import { Course } from '@/types';
import { Plus, BookOpen, Trash2, Edit, MoreVertical, Users, FileText } from 'lucide-react';
import CourseModal from '@/components/courses/CourseModal';
import toast from 'react-hot-toast';

export default function CoursesPage() {
  const { courses, loading, createCourse, updateCourse, deleteCourse } = useCourses();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleSave = async (data: any) => {
    if (editing) { await updateCourse(editing.id, data); }
    else { await createCourse(data); }
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course? All tasks and notes will also be removed.')) return;
    await deleteCourse(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Courses</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{courses.length} course{courses.length !== 1 ? 's' : ''} this semester</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Course
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card p-5 h-44 animate-pulse bg-gray-100 dark:bg-gray-800" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No courses yet</h3>
          <p className="text-gray-500 mb-4">Add your first course to get started</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">Add Course</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <div key={course.id} className="card p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold" style={{ background: course.color }}>
                    {course.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{course.name}</h3>
                    <span className="text-xs text-gray-400 font-mono">{course.code}</span>
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setOpenMenu(openMenu === course.id ? null : course.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-all">
                    <MoreVertical size={14} className="text-gray-400" />
                  </button>
                  {openMenu === course.id && (
                    <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg z-10 py-1 w-36" onClick={() => setOpenMenu(null)}>
                      <button onClick={() => { setEditing(course); setShowModal(true); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                        <Edit size={13} /> Edit
                      </button>
                      <button onClick={() => handleDelete(course.id)} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500">
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {course.instructor && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <Users size={11} /> {course.instructor}
                </div>
              )}
              {course.semester && (
                <p className="text-xs text-gray-400 mb-3">{course.semester}</p>
              )}
              {course.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{course.description}</p>
              )}

              <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: course.color }} />
                  {course._count?.tasks ?? 0} tasks
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <FileText size={11} />
                  {course._count?.notes ?? 0} notes
                </div>
                <div className="ml-auto">
                  <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ background: course.color, width: '40%' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CourseModal
          course={editing}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

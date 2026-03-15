'use client';
import { useState, useEffect } from 'react';
import { coursesApi } from '@/lib/api';
import { Course } from '@/types';
import toast from 'react-hot-toast';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await coursesApi.getAll();
      setCourses(data.data);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const createCourse = async (d: any) => {
    const { data } = await coursesApi.create(d);
    setCourses(prev => [data.data, ...prev]);
    toast.success('Course created!');
    return data.data;
  };

  const updateCourse = async (id: string, d: any) => {
    const { data } = await coursesApi.update(id, d);
    setCourses(prev => prev.map(c => c.id === id ? data.data : c));
    toast.success('Course updated!');
    return data.data;
  };

  const deleteCourse = async (id: string) => {
    await coursesApi.delete(id);
    setCourses(prev => prev.filter(c => c.id !== id));
    toast.success('Course deleted');
  };

  return { courses, loading, refetch: fetch, createCourse, updateCourse, deleteCourse };
}

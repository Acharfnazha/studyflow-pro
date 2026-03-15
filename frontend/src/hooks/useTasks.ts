'use client';
import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '@/lib/api';
import { Task } from '@/types';
import toast from 'react-hot-toast';

export function useTasks(filters?: any) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await tasksApi.getAll(filters);
      setTasks(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  const createTask = async (taskData: any) => {
    const { data } = await tasksApi.create(taskData);
    setTasks(prev => [data.data, ...prev]);
    toast.success('Task created!');
    return data.data;
  };

  const updateTask = async (id: string, taskData: any) => {
    const { data } = await tasksApi.update(id, taskData);
    setTasks(prev => prev.map(t => t.id === id ? data.data : t));
    toast.success('Task updated!');
    return data.data;
  };

  const deleteTask = async (id: string) => {
    await tasksApi.delete(id);
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.success('Task deleted');
  };

  return { tasks, loading, pagination, refetch: fetch, createTask, updateTask, deleteTask };
}

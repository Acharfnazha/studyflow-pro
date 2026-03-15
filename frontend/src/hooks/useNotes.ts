'use client';
import { useState, useEffect, useCallback } from 'react';
import { notesApi } from '@/lib/api';
import { Note } from '@/types';
import toast from 'react-hot-toast';

export function useNotes(filters?: any) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await notesApi.getAll(filters);
      setNotes(data.data);
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  const createNote = async (d: any) => {
    const { data } = await notesApi.create(d);
    setNotes(prev => [data.data, ...prev]);
    toast.success('Note created!');
    return data.data;
  };

  const updateNote = async (id: string, d: any) => {
    const { data } = await notesApi.update(id, d);
    setNotes(prev => prev.map(n => n.id === id ? data.data : n));
    toast.success('Note saved!');
    return data.data;
  };

  const deleteNote = async (id: string) => {
    await notesApi.delete(id);
    setNotes(prev => prev.filter(n => n.id !== id));
    toast.success('Note deleted');
  };

  return { notes, loading, refetch: fetch, createNote, updateNote, deleteNote };
}

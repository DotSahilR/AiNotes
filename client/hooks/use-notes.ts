'use client';

import { useCallback, useState } from 'react';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import api from '@/lib/api';
import type { Note } from '@/types';

interface ApiError {
  message?: string;
}

interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  fetchNotes: (search?: string) => Promise<void>;
  getNote: (id: string) => Promise<Note | null>;
  createNote: () => Promise<Note | null>;
  updateNote: (id: string, payload: Partial<Note>) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<void>;
}

export function useNotes(): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotes = useCallback(async (search?: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.get<Note[]>('/notes', { params: { search: search || '' } });
      setNotes(response.data);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      toast.error(error.response?.data?.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  const getNote = useCallback(async (id: string): Promise<Note | null> => {
    try {
      const response = await api.get<Note>(`/notes/${id}`);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      toast.error(error.response?.data?.message || 'Failed to load note');
      return null;
    }
  }, []);

  const createNote = useCallback(async (): Promise<Note | null> => {
    try {
      const response = await api.post<Note>('/notes', { title: 'Untitled', content: '' });
      toast.success('Note created');
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      toast.error(error.response?.data?.message || 'Failed to create note');
      return null;
    }
  }, []);

  const updateNote = useCallback(async (id: string, payload: Partial<Note>): Promise<Note | null> => {
    try {
      const response = await api.put<Note>(`/notes/${id}`, payload);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      toast.error(error.response?.data?.message || 'Failed to update note');
      return null;
    }
  }, []);

  const deleteNote = useCallback(async (id: string): Promise<void> => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      toast.success('Note deleted');
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      toast.error(error.response?.data?.message || 'Failed to delete note');
    }
  }, []);

  return { notes, loading, fetchNotes, getNote, createNote, updateNote, deleteNote };
}

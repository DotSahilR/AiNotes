'use client';

import { useState } from 'react';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import api from '@/lib/api';
import type { AIFeature } from '@/types';

interface ApiError {
  message?: string;
}

interface UseAIReturn {
  processLoading: boolean;
  summarizeLoading: boolean;
  improveLoading: boolean;
  tagsLoading: boolean;
  process: (payload: {
    content: string;
    feature: AIFeature;
    language?: string;
    format?: string;
    question?: string;
  }) => Promise<string>;
  summarize: (content: string) => Promise<string>;
  improve: (content: string) => Promise<string>;
  generateTags: (title: string, content: string) => Promise<string[]>;
}

export function useAI(): UseAIReturn {
  const [processLoading, setProcessLoading] = useState<boolean>(false);
  const [summarizeLoading, setSummarizeLoading] = useState<boolean>(false);
  const [improveLoading, setImproveLoading] = useState<boolean>(false);
  const [tagsLoading, setTagsLoading] = useState<boolean>(false);

  const process = async (payload: {
    content: string;
    feature: AIFeature;
    language?: string;
    format?: string;
    question?: string;
  }): Promise<string> => {
    setProcessLoading(true);
    try {
      const response = await api.post<{ feature: AIFeature; output: string }>('/ai/process', payload);
      toast.success('AI output generated');
      return response.data.output;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      toast.error(error.response?.data?.message || 'Failed to process content');
      return '';
    } finally {
      setProcessLoading(false);
    }
  };

  const summarize = async (content: string): Promise<string> => {
    setSummarizeLoading(true);
    try {
      const response = await api.post<{ summary: string }>('/ai/summarize', { content });
      toast.success('Summary generated');
      return response.data.summary;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      toast.error(error.response?.data?.message || 'Failed to summarize content');
      return '';
    } finally {
      setSummarizeLoading(false);
    }
  };

  const improve = async (content: string): Promise<string> => {
    setImproveLoading(true);
    try {
      const response = await api.post<{ improved: string }>('/ai/improve', { content });
      toast.success('Writing improved');
      return response.data.improved;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      toast.error(error.response?.data?.message || 'Failed to improve writing');
      return '';
    } finally {
      setImproveLoading(false);
    }
  };

  const generateTags = async (title: string, content: string): Promise<string[]> => {
    setTagsLoading(true);
    try {
      const response = await api.post<{ tags: string[] }>('/ai/tags', { title, content });
      toast.success('Tags generated');
      return response.data.tags;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      toast.error(error.response?.data?.message || 'Failed to generate tags');
      return [];
    } finally {
      setTagsLoading(false);
    }
  };

  return {
    processLoading,
    summarizeLoading,
    improveLoading,
    tagsLoading,
    process,
    summarize,
    improve,
    generateTags
  };
}

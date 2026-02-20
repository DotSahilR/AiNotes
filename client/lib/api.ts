'use client';

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

let tokenGetter: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (getter: (() => Promise<string | null>) | null): void => {
  tokenGetter = getter;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (tokenGetter) {
    const token = await tokenGetter();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

export default api;

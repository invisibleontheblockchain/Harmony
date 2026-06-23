'use client';
import { QueryClient, QueryFunction } from '@tanstack/react-query';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const queryFn: QueryFunction<any, string> = async ({ queryKey }) => {
  const [path] = queryKey as [string];
  return apiFetch(path);
};

if (typeof window !== 'undefined' && !(window as any).__HARMONY_QUERY_CLIENT__) {
  (window as any).__HARMONY_QUERY_CLIENT__ = new QueryClient({
    defaultOptions: { queries: { staleTime: 1000 * 60, refetchOnWindowFocus: false, queryFn } },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const client = (window as any).__HARMONY_QUERY_CLIENT__ || new QueryClient({
    defaultOptions: { queries: { staleTime: 1000 * 60, refetchOnWindowFocus: false, queryFn } },
  });
  return children;
}

/* eslint-disable @next/next/no-img-element */

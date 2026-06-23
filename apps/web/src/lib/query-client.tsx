'use client';
import { QueryClient, QueryClientProvider, QueryFunction } from '@tanstack/react-query';
import React from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const queryFn: QueryFunction<any, any> = async ({ queryKey }) => {
  const [path] = queryKey as [string];
  return apiFetch(path);
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 1000 * 60, refetchOnWindowFocus: false, queryFn } },
      })
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

/* eslint-disable @next/next/no-img-element */

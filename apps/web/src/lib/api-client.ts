'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchTracks(options?: { genre?: string; limit?: number; offset?: number }) {
  const params = new URLSearchParams();
  if (options?.genre) params.set('genre', options.genre);
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.offset) params.set('offset', String(options.offset));
  const query = params.toString();
  return apiFetch(`/api/tracks${query ? `?${query}` : ''}`);
}

export async function searchTracks(query: string, limit = 20) {
  return apiFetch<{ id: string; title: string; artist: string }[]>(`/api/tracks/search?q=${encodeURIComponent(query)}&limit=${limit}`);
}

export async function fetchRecommendations(userId = 'me') {
  return apiFetch(`/api/recommendations?userId=${userId}`);
}

export async function fetchTrackById(id: string) {
  return apiFetch(`/api/tracks/${id}`);
}

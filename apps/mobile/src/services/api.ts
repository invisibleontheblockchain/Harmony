/**
 * Harmony API Service Layer
 * 
 * Centralized client for all backend API calls.
 * All mobile screens should use this instead of mock data.
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  token?: string;
}

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed: ${response.status}`);
  }

  return response.json();
}

// ─── Track Endpoints ─────────────────────────────────────────────────────────

export interface ApiTrack {
  id: string;
  artist_id: string;
  title: string;
  duration_seconds: number;
  file_url_hls: string;
  genre?: string;
  bpm?: number;
  key_signature?: string;
  created_at: string;
  artist_name: string;
  artist_avatar?: string;
}

export async function fetchTracks(options?: {
  genre?: string;
  limit?: number;
  offset?: number;
}): Promise<ApiTrack[]> {
  const params = new URLSearchParams();
  if (options?.genre) params.set('genre', options.genre);
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.offset) params.set('offset', String(options.offset));

  const query = params.toString();
  return apiFetch<ApiTrack[]>(`/api/tracks${query ? `?${query}` : ''}`);
}

export async function fetchTrackById(id: string): Promise<ApiTrack & { splits: any[] }> {
  return apiFetch(`/api/tracks/${id}`);
}

export async function searchTracks(query: string, limit = 20): Promise<ApiTrack[]> {
  return apiFetch<ApiTrack[]>(`/api/tracks/search?q=${encodeURIComponent(query)}&limit=${limit}`);
}

export async function getUploadUrl(
  trackId: string,
  fileExtension: string,
  token: string
): Promise<{ uploadUrl: string; objectKey: string }> {
  return apiFetch(`/api/tracks/upload-url?trackId=${trackId}&fileExtension=${fileExtension}`, { token });
}

export async function registerTrack(
  trackData: {
    artistId: string;
    title: string;
    durationSeconds: number;
    fileUrlHls: string;
    fileUrlRaw: string;
    genre?: string;
    bpm?: number;
    keySignature?: string;
    isrcCode?: string;
    splits: { rightsHolderId: string; splitPercentage: number; role: string }[];
  },
  token: string
): Promise<{ message: string; trackId: string }> {
  return apiFetch('/api/tracks', { method: 'POST', body: trackData, token });
}

// ─── Recommendation Endpoints ────────────────────────────────────────────────

export async function fetchRecommendations(userId: string): Promise<ApiTrack[]> {
  return apiFetch<ApiTrack[]>(`/api/recommendations?userId=${userId}`);
}

// ─── Payment Endpoints ───────────────────────────────────────────────────────

export async function createOnboardingLink(
  artistId: string,
  email: string,
  token: string
): Promise<{ onboardUrl: string }> {
  return apiFetch('/api/payments/onboard', {
    method: 'POST',
    body: { artistId, email },
    token,
  });
}

export async function createPurchase(
  listenerId: string,
  artistConnectId: string,
  amountInCents: number,
  token: string
): Promise<{ clientSecret: string }> {
  return apiFetch('/api/payments/purchase', {
    method: 'POST',
    body: { listenerId, artistConnectId, amountInCents },
    token,
  });
}

// ─── Health Check ────────────────────────────────────────────────────────────

export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  return apiFetch('/api/health');
}

// ─── Helper: Convert API track to Player track format ────────────────────────

export function apiTrackToPlayerTrack(track: ApiTrack) {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist_name,
    artistId: track.artist_id,
    artwork: track.artist_avatar || '',
    fileUrlHls: track.file_url_hls,
    genre: track.genre,
    durationSeconds: track.duration_seconds,
  };
}

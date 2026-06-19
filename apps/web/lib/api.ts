import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  PaginatedResponse,
  RegisterRequest,
  Slide,
  SlideQueryParams,
  UpdateSlideRequest,
} from '@casevault/types';

// ─── Token Management (in-memory only) ──────────────────────────────
let accessToken: string | null = null;

export function setAccessToken(token: string): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearAccessToken(): void {
  accessToken = null;
}

// ─── Core Fetch ──────────────────────────────────────────────────────
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;

  const headers = new Headers(options.headers);

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // Only set Content-Type for non-FormData bodies
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // On 401: attempt a silent token refresh, then retry once
  if (response.status === 401) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      headers.set('Authorization', `Bearer ${accessToken}`);
      const retryResponse = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (!retryResponse.ok) {
        const body = await safeParseJson(retryResponse);
        throw new ApiError(
          body?.error ?? retryResponse.statusText,
          retryResponse.status,
        );
      }
      return retryResponse.json() as Promise<T>;
    }

    const body = await safeParseJson(response);
    throw new ApiError(body?.error ?? 'Unauthorized', 401);
  }

  if (!response.ok) {
    const body = await safeParseJson(response);
    throw new ApiError(
      body?.error ?? response.statusText,
      response.status,
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function safeParseJson(
  res: Response,
): Promise<{ error?: string } | null> {
  try {
    return (await res.json()) as { error?: string };
  } catch {
    return null;
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function attemptTokenRefresh(): Promise<boolean> {
  // Deduplicate concurrent refresh calls
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { accessToken: string };
      accessToken = data.accessToken;
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Slides ──────────────────────────────────────────────────────────
export async function getSlides(
  params?: SlideQueryParams,
): Promise<PaginatedResponse<Slide>> {
  const searchParams = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    }
  }
  const query = searchParams.toString();
  return apiFetch<PaginatedResponse<Slide>>(
    `/slides${query ? `?${query}` : ''}`,
  );
}

export async function getSlideById(
  id: string,
): Promise<ApiResponse<Slide>> {
  return apiFetch<ApiResponse<Slide>>(`/slides/${id}`);
}

export async function createSlide(
  formData: FormData,
): Promise<ApiResponse<Slide>> {
  return apiFetch<ApiResponse<Slide>>('/slides', {
    method: 'POST',
    body: formData,
  });
}

export async function updateSlide(
  id: string,
  data: UpdateSlideRequest,
): Promise<ApiResponse<Slide>> {
  return apiFetch<ApiResponse<Slide>>(`/slides/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSlide(
  id: string,
): Promise<ApiResponse<void>> {
  return apiFetch<ApiResponse<void>>(`/slides/${id}`, {
    method: 'DELETE',
  });
}

// ─── Auth ────────────────────────────────────────────────────────────
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await apiFetch<ApiResponse<AuthResponse>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const auth = res.data!;
  accessToken = auth.accessToken;
  return auth;
}

export async function register(
  data: RegisterRequest,
): Promise<AuthResponse> {
  const res = await apiFetch<ApiResponse<AuthResponse>>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const auth = res.data!;
  accessToken = auth.accessToken;
  return auth;
}

export async function logout(): Promise<void> {
  await apiFetch<void>('/auth/logout', { method: 'POST' });
  accessToken = null;
}

export async function refreshToken(): Promise<{ accessToken: string }> {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await safeParseJson(res);
    throw new ApiError(body?.error ?? 'Refresh failed', res.status);
  }
  const json = (await res.json()) as ApiResponse<{ accessToken: string }>;
  const data = json.data!;
  accessToken = data.accessToken;
  return data;
}

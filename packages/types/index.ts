// ─── User ────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  created_at: number;
}

// ─── Slide ───────────────────────────────────────────────────────────
export type SlideCategory =
  | 'Technology'
  | 'Finance'
  | 'Healthcare'
  | 'Marketing'
  | 'Operations'
  | 'Sustainability'
  | 'Other';

export interface Slide {
  id: string;
  user_id: string;
  title: string;
  competition_name: string;
  year: number;
  category: SlideCategory;
  executive_summary: string | null;
  file_path: string;
  preview_image: string | null;
  views: number;
  created_at: number;
  updated_at: number;
}

// ─── API Responses ───────────────────────────────────────────────────
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  user: Pick<User, 'id' | 'email'>;
  accessToken: string;
}

// ─── Request DTOs ────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface CreateSlideRequest {
  title: string;
  competition_name: string;
  year: number;
  category: SlideCategory;
  executive_summary?: string;
}

export interface UpdateSlideRequest {
  title?: string;
  competition_name?: string;
  year?: number;
  category?: SlideCategory;
  executive_summary?: string;
}

export interface SlideQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: SlideCategory;
  sort?: 'newest' | 'oldest' | 'views';
  year?: number;
}

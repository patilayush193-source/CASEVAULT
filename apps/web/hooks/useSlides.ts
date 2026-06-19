'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  Slide,
  SlideQueryParams,
  PaginatedResponse,
} from '@casevault/types';
import * as api from '@/lib/api';

interface UseSlidesReturn {
  slides: Slide[];
  pagination: PaginatedResponse<Slide>['pagination'] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setParams: (params: SlideQueryParams) => void;
}

export function useSlides(
  initialParams?: SlideQueryParams,
): UseSlidesReturn {
  const [params, setParams] = useState<SlideQueryParams>(
    initialParams ?? {},
  );
  const [slides, setSlides] = useState<Slide[]>([]);
  const [pagination, setPagination] = useState<
    PaginatedResponse<Slide>['pagination'] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSlides(params);
      setSlides(res.data);
      setPagination(res.pagination);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch slides';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    void fetchSlides();
  }, [fetchSlides, refreshKey]);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return { slides, pagination, loading, error, refetch, setParams };
}

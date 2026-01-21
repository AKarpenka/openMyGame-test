import { useEffect, useRef } from 'react';

const THRESHOLD = 200;

/**
 * Хук для автоматической загрузки данных при скролле
 * 
 * Здесь можно было бы прикрутить виртуализацию из-под капота (react-window, например), 
 * но нужно больше времени и понимание объема данных в таблице, может оно и не нужно
 */
export function useInfiniteScroll(
  loadMore: () => void,
  hasMore: boolean,
  isLoading: boolean,
  threshold: number = THRESHOLD
) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentElement = loadMoreRef.current;

    if (!hasMore || isLoading) {
      // Отключаем observer, если он был создан
      if (observerRef.current && currentElement) {
        observerRef.current.unobserve(currentElement);
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      return;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0,
      }
    );

    if (currentElement) {
      observerRef.current.observe(currentElement);
    }

    return () => {
      if (observerRef.current) {
        if (currentElement) {
          observerRef.current.unobserve(currentElement);
        }

        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [loadMore, hasMore, isLoading, threshold]);

  return loadMoreRef;
}

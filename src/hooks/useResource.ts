import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

// Focus refresh is sufficient for this small inventory; no global cache is needed.
export function useResource<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true);
    setError(undefined);
    try {
      const value = await load();
      if (current === generation.current) setData(value);
    } catch (failure) {
      if (current === generation.current) {
        setData(undefined);
        setError(failure instanceof Error ? failure.message : 'Unable to load. Please try again.');
      }
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, [load]);
  useFocusEffect(useCallback(() => {
    void refresh();
    return () => { generation.current += 1; };
  }, [refresh]));
  return { data, loading, error, refresh };
}

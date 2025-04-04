import { useCallback, useEffect, useState, useRef } from "react";

export function usePolling(fetchFunction, interval, enabled = true) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const intervalRef = useRef(null);

  // Polling function (can be triggered automatically or manually)
  const poll = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchFunction();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    if (!enabled) return;

    poll(); // Run immediately

    intervalRef.current = setInterval(poll, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [poll, interval, enabled]);

  return { refetch: poll, loading, error, data }; // Return refetch function
}

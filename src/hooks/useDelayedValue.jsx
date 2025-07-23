import { useEffect, useState } from "react";

export function useDelayedValue(value, delay, initialValue = value) {
  const [delayedValue, setDelayedValue] = useState(initialValue);

  useEffect(() => {
    setTimeout(() => {
      setDelayedValue(value);
    }, delay);
  }, [value, delay]);

  return delayedValue;
}

import { useCallback, useEffect, useRef, useState } from 'react';

const TOAST_DURATION_MS = 4000;

// Holds a single short-lived confirmation message. Call showToast only after
// the corresponding state change has been applied, so the message is truthful.
export function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const dismissToast = useCallback(() => {
    clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const showToast = useCallback((message, tone = 'success') => {
    clearTimeout(timerRef.current);
    setToast({ id: Date.now(), message, tone });
    timerRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { toast, showToast, dismissToast };
}

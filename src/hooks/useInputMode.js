import { useCallback, useEffect, useState } from 'react';
import { InputMode, isValidInputMode } from '../domain/InputMode.js';

const STORAGE_KEY = 'mirror-talk-input-mode';

function loadStoredMode() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isValidInputMode(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function useInputMode() {
  const [mode, setMode] = useState(loadStoredMode);

  useEffect(() => {
    if (mode == null) return;
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // storage may be unavailable; mode lives in memory only
    }
  }, [mode]);

  const choose = useCallback((nextMode) => {
    if (!isValidInputMode(nextMode)) return;
    setMode(nextMode);
  }, []);

  const reset = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setMode(null);
  }, []);

  return { mode, choose, reset, hasChosen: mode != null, InputMode };
}

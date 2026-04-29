import { useCallback, useEffect, useState } from 'react';
import { WebSpeechRecognizer } from '../infrastructure/WebSpeechRecognizer.js';

function buildDefaultRecognizer() {
  return new WebSpeechRecognizer({ lang: 'ko-KR' });
}

/**
 * Drives a LiveSpeechRecognizer from React.
 *
 * The caller passes onFinal — that's where finalized phrases are pushed
 * to the message store (i.e. auto-sent to the TV display). interim text
 * is exposed as state so the UI can preview "currently being said".
 */
export function useLiveSpeechRecognition({
  build = buildDefaultRecognizer,
  onFinal,
} = {}) {
  // Lazy state init constructs once per hook instance. The construct
  // itself can throw (browser unsupported) so we capture that into
  // initError instead of crashing the render.
  const [{ recognizer, initError }] = useState(() => {
    try {
      return { recognizer: build(), initError: null };
    } catch (err) {
      return { recognizer: null, initError: err?.message ?? String(err) };
    }
  });

  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(initError);

  useEffect(() => {
    if (!recognizer) return undefined;

    recognizer.onInterim((text) => setInterim(text));
    recognizer.onFinal((text) => {
      setInterim('');
      if (onFinal) onFinal(text);
    });
    recognizer.onError((err) => setError(typeof err === 'string' ? err : String(err)));
    recognizer.onEnd(() => setIsListening(false));

    return () => {
      recognizer.abort();
    };
  }, [recognizer, onFinal]);

  const start = useCallback(() => {
    if (!recognizer) return;
    setError(null);
    setInterim('');
    try {
      recognizer.start();
      setIsListening(true);
    } catch (err) {
      console.error('[useLiveSpeechRecognition] start failed', err);
      setError(err?.message ?? String(err));
    }
  }, [recognizer]);

  const stop = useCallback(() => {
    if (!recognizer) return;
    recognizer.stop();
    setIsListening(false);
    setInterim('');
  }, [recognizer]);

  const clearError = useCallback(() => setError(null), []);

  return {
    isSupported: recognizer != null,
    isListening,
    interim,
    error,
    start,
    stop,
    clearError,
  };
}

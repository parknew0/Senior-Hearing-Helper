import { useCallback, useEffect, useState } from 'react';
import { AudioRecorder } from '../infrastructure/AudioRecorder.js';
import { ClovaSttProvider } from '../infrastructure/ClovaSttProvider.js';
import { SpeechTranscriber } from '../application/SpeechTranscriber.js';

function buildDefaultTranscriber() {
  return new SpeechTranscriber(new AudioRecorder(), new ClovaSttProvider());
}

/**
 * Drives a SpeechTranscriber from React. Exposes flags the UI needs:
 *   - isRecording: mic is currently capturing
 *   - isTranscribing: audio captured, waiting for the API
 *   - lastTranscript: most recent recognized text (cleared by reset)
 *   - error: last error message, if any
 */
export function useSpeechTranscriber({ build = buildDefaultTranscriber } = {}) {
  // Lazy state init constructs the transcriber exactly once per hook
  // instance — no refs are touched during render.
  const [transcriber] = useState(build);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      transcriber.cancel();
    };
  }, [transcriber]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      await transcriber.startRecording();
      setIsRecording(true);
    } catch (err) {
      setError(err?.message ?? String(err));
    }
  }, [transcriber]);

  const stopAndTranscribe = useCallback(async () => {
    if (!transcriber.isRecording()) return '';
    setIsRecording(false);
    setIsTranscribing(true);
    try {
      const text = await transcriber.stopAndTranscribe();
      setLastTranscript(text);
      return text;
    } catch (err) {
      setError(err?.message ?? String(err));
      return '';
    } finally {
      setIsTranscribing(false);
    }
  }, [transcriber]);

  const cancel = useCallback(() => {
    transcriber.cancel();
    setIsRecording(false);
    setIsTranscribing(false);
  }, [transcriber]);

  const clearTranscript = useCallback(() => setLastTranscript(''), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    isRecording,
    isTranscribing,
    lastTranscript,
    error,
    startRecording,
    stopAndTranscribe,
    cancel,
    clearTranscript,
    clearError,
    providerName: transcriber.providerName,
  };
}

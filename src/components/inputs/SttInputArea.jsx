import { useEffect, useRef, useState } from 'react';
import { MessageType } from '../../domain/MessageType.js';
import { useSpeechTranscriber } from '../../hooks/useSpeechTranscriber.js';

const MAX_RECORD_MS = 60_000; // Clova CSR /recog/v1/stt accepts up to 60s.

export function SttInputArea({ messageType, onSubmit }) {
  const {
    isRecording,
    isTranscribing,
    error,
    startRecording,
    stopAndTranscribe,
    cancel,
    clearError,
    providerName,
  } = useSpeechTranscriber();

  // The transcript is editable before sending, so the user can correct
  // mishearings instead of being forced to re-record.
  const [draft, setDraft] = useState('');
  const textareaRef = useRef(null);
  const autoStopTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
    };
  }, []);

  const handleStart = async () => {
    clearError();
    await startRecording();
    autoStopTimerRef.current = setTimeout(() => {
      handleStop();
    }, MAX_RECORD_MS);
  };

  const handleStop = async () => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    const text = await stopAndTranscribe();
    if (text) {
      setDraft((prev) => (prev ? `${prev} ${text}` : text));
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  };

  const handleCancel = () => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    cancel();
  };

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const placeholder =
    messageType === MessageType.CAPTION
      ? '🎙️ 마이크 버튼을 눌러 말씀하시면 여기에 받아써집니다. 보내기 전에 직접 고치셔도 됩니다.'
      : '지금 어떤 이야기를 하고 있는지 음성으로 설명해 주세요. 받아쓴 내용을 보내기 전에 다듬을 수 있어요.';

  return (
    <div className="stt-input-area">
      <div className="stt-status-row">
        {isRecording && (
          <span className="stt-status stt-status--recording">
            <span className="stt-dot" /> 녹음 중… (최대 60초)
          </span>
        )}
        {isTranscribing && (
          <span className="stt-status stt-status--processing">
            ⏳ {providerName}로 받아쓰는 중…
          </span>
        )}
        {!isRecording && !isTranscribing && (
          <span className="stt-status stt-status--idle">
            🎤 마이크 버튼을 눌러 말씀하세요
          </span>
        )}
      </div>

      <div className="input-row">
        <textarea
          ref={textareaRef}
          className="text-input"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
        />
        {isRecording ? (
          <button
            className="send-btn stt-btn--stop"
            onClick={handleStop}
            type="button"
          >
            ⏹ 정지
          </button>
        ) : (
          <button
            className="send-btn stt-btn--record"
            onClick={handleStart}
            disabled={isTranscribing}
            type="button"
          >
            🎙️ 녹음
          </button>
        )}
      </div>

      <div className="stt-action-row">
        {isRecording && (
          <button
            type="button"
            className="stt-cancel"
            onClick={handleCancel}
          >
            취소
          </button>
        )}
        <button
          type="button"
          className="send-btn stt-btn--send"
          onClick={handleSend}
          disabled={!draft.trim() || isRecording || isTranscribing}
        >
          전송 (Ctrl+Enter)
        </button>
      </div>

      {error && (
        <div className="stt-error" role="alert">
          ⚠️ {error}
          <button type="button" className="stt-error-close" onClick={clearError}>닫기</button>
        </div>
      )}
    </div>
  );
}

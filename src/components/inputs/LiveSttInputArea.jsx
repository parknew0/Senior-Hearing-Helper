import { useCallback, useEffect } from 'react';
import { MessageType } from '../../domain/MessageType.js';
import { useLiveSpeechRecognition } from '../../hooks/useLiveSpeechRecognition.js';

/**
 * Live captioning mode: while the mic is on, every finalized phrase
 * (Web Speech decides what "final" means based on a pause) is pushed
 * straight to the message store so it appears on the TV display in
 * near real time. Interim guesses are shown locally as a preview only.
 */
export function LiveSttInputArea({ messageType, onSubmit }) {
  const handleFinal = useCallback(
    (text) => {
      const trimmed = text.trim();
      if (trimmed) onSubmit(trimmed);
    },
    [onSubmit]
  );

  const {
    isSupported,
    isListening,
    interim,
    error,
    start,
    stop,
    flush,
    clearError,
  } = useLiveSpeechRecognition({ onFinal: handleFinal });

  // Spacebar = "cut here". The user can mark the boundary they hear
  // better than the algorithm can. We don't intercept when a button
  // or text field has focus, so native space-activates-button and
  // typing in textareas keep working.
  useEffect(() => {
    if (!isListening) return undefined;
    const onKey = (e) => {
      if (e.code !== 'Space' || e.repeat) return;
      const t = e.target;
      if (t && t.matches?.('button, input, textarea, select, [contenteditable=""], [contenteditable="true"]')) {
        return;
      }
      e.preventDefault();
      flush();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isListening, flush]);

  if (!isSupported) {
    return (
      <div className="stt-input-area">
        <div className="stt-error" role="alert">
          ⚠️ {error ?? '이 브라우저는 실시간 음성 인식을 지원하지 않습니다. Chrome 또는 Edge에서 사용해 주세요.'}
        </div>
      </div>
    );
  }

  const hint =
    messageType === MessageType.CONTEXT
      ? '말씀하시면 문장이 끝날 때마다 “상황 설명”으로 자동 전송됩니다.'
      : '말씀하시면 문장이 끝날 때마다 자동으로 TV에 표시됩니다.';

  return (
    <div className="stt-input-area">
      <div className="stt-status-row">
        {isListening ? (
          <span className="stt-status stt-status--recording">
            <span className="stt-dot" /> 듣는 중… (실시간)
          </span>
        ) : (
          <span className="stt-status stt-status--idle">
            🎙️ 듣기 시작 버튼을 눌러 주세요
          </span>
        )}
      </div>

      <div className="live-preview" aria-live="polite">
        {interim ? (
          <span className="live-preview-interim">{interim}</span>
        ) : (
          <span className="live-preview-empty">
            {isListening ? '말씀해 주세요…' : hint}
          </span>
        )}
      </div>

      <div className="stt-action-row">
        {isListening ? (
          <>
            <button
              type="button"
              className="stt-cancel"
              onClick={flush}
              title="여기까지를 한 문장으로 잘라 TV에 표시"
            >
              ✂ 여기서 끊기 <span className="stt-shortcut">Space</span>
            </button>
            <button
              type="button"
              className="send-btn stt-btn--stop stt-btn--send"
              onClick={stop}
            >
              ⏹ 듣기 중지
            </button>
          </>
        ) : (
          <button
            type="button"
            className="send-btn stt-btn--record stt-btn--send"
            onClick={start}
          >
            🎙️ 듣기 시작
          </button>
        )}
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

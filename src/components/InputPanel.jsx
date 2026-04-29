import { useState, useRef, useEffect } from 'react';
import { MessageType } from '../domain/MessageType.js';
import { InputMode } from '../domain/InputMode.js';
import { useCaptionSession } from '../hooks/useCaptionSession.js';
import { ManualInputArea } from './inputs/ManualInputArea.jsx';
import { SttInputArea } from './inputs/SttInputArea.jsx';
import { LiveSttInputArea } from './inputs/LiveSttInputArea.jsx';
import './InputPanel.css';

function SentMessage({ message }) {
  const isContext = message.type === MessageType.CONTEXT;
  return (
    <div className={`sent-msg sent-msg--${message.type}`}>
      {isContext && <span className="sent-badge">📌 상황</span>}
      <span className="sent-text">{message.text}</span>
    </div>
  );
}

function MessageHistory({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="message-history">
      {messages.length === 0 ? (
        <div className="history-empty">
          <span className="history-empty-icon">💬</span>
          <p>입력한 내용이 TV 화면에 크게 표시됩니다</p>
        </div>
      ) : (
        messages.map((msg) => <SentMessage key={msg.id} message={msg} />)
      )}
      <div ref={bottomRef} />
    </div>
  );
}

function MessageTypeToggle({ messageType, onChange }) {
  return (
    <div className="mode-toggle" role="group" aria-label="메시지 종류 선택">
      <button
        className={`mode-btn ${messageType === MessageType.CAPTION ? 'active' : ''}`}
        onClick={() => onChange(MessageType.CAPTION)}
      >
        💬 대화
      </button>
      <button
        className={`mode-btn ${messageType === MessageType.CONTEXT ? 'active' : ''}`}
        onClick={() => onChange(MessageType.CONTEXT)}
      >
        📌 상황 설명
      </button>
    </div>
  );
}

function ContextHint() {
  return (
    <div className="context-hint">
      대화 흐름 요약을 전송합니다&nbsp;&nbsp;예)&nbsp;"지금 손주 성적 이야기 중이에요"
    </div>
  );
}

export function InputPanel({ inputMode, onChangeInputMode }) {
  const { messages, sendCaption, sendContext, clearAll } = useCaptionSession();
  const [messageType, setMessageType] = useState(MessageType.CAPTION);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const displayUrl = `${window.location.origin}/?view=display`;

  const submit = (text) => {
    messageType === MessageType.CAPTION ? sendCaption(text) : sendContext(text);
  };

  const handleClear = () => {
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      return;
    }
    clearAll();
    setShowClearConfirm(false);
  };

  const inputModeLabel = (() => {
    switch (inputMode) {
      case InputMode.CLOVA_STT:    return '🎙️ 클로바 STT';
      case InputMode.BROWSER_LIVE: return '⚡ 실시간 자막';
      default:                     return '⌨️ 직접 타자';
    }
  })();

  return (
    <div className="input-panel">
      <header className="panel-header">
        <div className="brand">
          <span className="brand-icon">🔊</span>
          <h1 className="brand-name">MirrorTalk</h1>
        </div>
        <div className="header-meta">
          <button
            type="button"
            className="input-mode-pill"
            onClick={onChangeInputMode}
            title="입력 방식을 다시 고릅니다"
          >
            {inputModeLabel} <span className="input-mode-pill-edit">변경</span>
          </button>
          <div className="tv-link-group">
            <span className="tv-label">TV 화면</span>
            <a
              className="tv-url"
              href={displayUrl}
              target="_blank"
              rel="noreferrer"
            >
              {displayUrl}
            </a>
          </div>
        </div>
      </header>

      <MessageHistory messages={messages} />

      <footer className="input-footer">
        <MessageTypeToggle messageType={messageType} onChange={setMessageType} />

        {messageType === MessageType.CONTEXT && <ContextHint />}

        {inputMode === InputMode.CLOVA_STT && (
          <SttInputArea messageType={messageType} onSubmit={submit} />
        )}
        {inputMode === InputMode.BROWSER_LIVE && (
          <LiveSttInputArea messageType={messageType} onSubmit={submit} />
        )}
        {inputMode === InputMode.MANUAL && (
          <ManualInputArea messageType={messageType} onSubmit={submit} />
        )}

        {messages.length > 0 && (
          <button
            className={`clear-btn ${showClearConfirm ? 'confirm' : ''}`}
            onClick={handleClear}
            onBlur={() => setShowClearConfirm(false)}
          >
            {showClearConfirm ? '⚠️ 한 번 더 누르면 전체 삭제됩니다' : '전체 지우기'}
          </button>
        )}
      </footer>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { MessageType } from '../domain/MessageType.js';
import { useCaptionSession } from '../hooks/useCaptionSession.js';
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

function ModeToggle({ mode, onChange }) {
  return (
    <div className="mode-toggle" role="group" aria-label="입력 모드 선택">
      <button
        className={`mode-btn ${mode === MessageType.CAPTION ? 'active' : ''}`}
        onClick={() => onChange(MessageType.CAPTION)}
      >
        💬 대화
      </button>
      <button
        className={`mode-btn ${mode === MessageType.CONTEXT ? 'active' : ''}`}
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

export function InputPanel() {
  const { messages, sendCaption, sendContext, clearAll } = useCaptionSession();
  const [text, setText] = useState('');
  const [mode, setMode] = useState(MessageType.CAPTION);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const textareaRef = useRef(null);

  const displayUrl = `${window.location.origin}/?view=display`;

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    mode === MessageType.CAPTION ? sendCaption(trimmed) : sendContext(trimmed);
    setText('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      return;
    }
    clearAll();
    setShowClearConfirm(false);
  };

  return (
    <div className="input-panel">
      <header className="panel-header">
        <div className="brand">
          <span className="brand-icon">🔊</span>
          <h1 className="brand-name">MirrorTalk</h1>
        </div>
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
      </header>

      <MessageHistory messages={messages} />

      <footer className="input-footer">
        <ModeToggle mode={mode} onChange={setMode} />

        {mode === MessageType.CONTEXT && <ContextHint />}

        <div className="input-row">
          <textarea
            ref={textareaRef}
            className="text-input"
            placeholder={
              mode === MessageType.CAPTION
                ? '대화 내용 입력 (Enter로 전송 / Shift+Enter 줄바꿈)'
                : '지금 어떤 이야기를 하고 있는지 설명해 주세요'
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            autoFocus
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!text.trim()}
          >
            전송
          </button>
        </div>

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

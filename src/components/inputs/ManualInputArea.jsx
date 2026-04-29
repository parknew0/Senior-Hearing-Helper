import { useRef, useState } from 'react';
import { MessageType } from '../../domain/MessageType.js';

export function ManualInputArea({ messageType, onSubmit }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const isComposingRef = useRef(false);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposingRef.current) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-row">
      <textarea
        ref={textareaRef}
        className="text-input"
        placeholder={
          messageType === MessageType.CAPTION
            ? '대화 내용 입력 (Enter로 전송 / Shift+Enter 줄바꿈)'
            : '지금 어떤 이야기를 하고 있는지 설명해 주세요'
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
        onCompositionStart={() => { isComposingRef.current = true; }}
        onCompositionEnd={() => { isComposingRef.current = false; }}
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
  );
}

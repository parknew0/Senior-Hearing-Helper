import { useCaptionSession } from '../hooks/useCaptionSession.js';
import { MessageType } from '../domain/MessageType.js';
import './DisplayScreen.css';

const MAX_VISIBLE = 6;

function CaptionBubble({ message, ageFromNewest }) {
  const isContext = message.type === MessageType.CONTEXT;
  const opacity = Math.max(0.15, 1 - ageFromNewest * 0.18);

  return (
    <div
      className={`caption-bubble caption-bubble--${message.type}`}
      style={{ '--opacity': opacity }}
    >
      {isContext && <span className="context-pin" aria-hidden="true">📌</span>}
      <span className="caption-text">{message.text}</span>
    </div>
  );
}

function WaitingScreen() {
  return (
    <div className="waiting-screen">
      <div className="waiting-logo">
        <span className="waiting-icon">🔊</span>
        <span className="waiting-name">MirrorTalk</span>
      </div>
      <p className="waiting-hint">대화가 시작되면 여기에 크게 표시됩니다</p>
    </div>
  );
}

export function DisplayScreen() {
  const { messages } = useCaptionSession();
  // newest first: index 0 = most recent
  const visible = messages.slice(-MAX_VISIBLE).reverse();

  return (
    <div className="display-screen">
      {visible.length === 0 ? (
        <WaitingScreen />
      ) : (
        <div className="caption-feed">
          {visible.map((msg, i) => (
            <CaptionBubble
              key={msg.id}
              message={msg}
              ageFromNewest={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

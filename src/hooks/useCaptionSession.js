import { useEffect, useRef, useState } from 'react';
import { CaptionChannel } from '../domain/CaptionChannel.js';
import { MessageStore } from '../domain/MessageStore.js';
import { CaptionSession } from '../application/CaptionSession.js';

function createSession() {
  const channel = new CaptionChannel();
  const store = new MessageStore(channel);
  return { session: new CaptionSession(store), channel };
}

export function useCaptionSession() {
  const ref = useRef(null);

  if (!ref.current) {
    ref.current = createSession();
  }

  const { session } = ref.current;
  const [messages, setMessages] = useState(() => session.getMessages());

  useEffect(() => {
    setMessages(session.getMessages());
    return session.subscribe(setMessages);
  }, [session]);

  return {
    messages,
    sendCaption: (text) => session.sendCaption(text),
    sendContext: (text) => session.sendContext(text),
    clearAll: () => session.clearAll(),
  };
}

import { Message } from '../domain/Message.js';
import { MessageType } from '../domain/MessageType.js';

export class CaptionSession {
  #store;

  constructor(store) {
    this.#store = store;
  }

  sendCaption(text) {
    if (!text?.trim()) return;
    this.#store.add(new Message({ text, type: MessageType.CAPTION }));
  }

  sendContext(text) {
    if (!text?.trim()) return;
    this.#store.add(new Message({ text, type: MessageType.CONTEXT }));
  }

  clearAll() {
    this.#store.clear();
  }

  getMessages() {
    return this.#store.getAll();
  }

  subscribe(listener) {
    return this.#store.subscribe(listener);
  }
}

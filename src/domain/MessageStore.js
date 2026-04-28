export class MessageStore {
  static #STORAGE_KEY = 'mirror-talk-messages';
  static #MAX_PERSIST = 50;

  #messages = [];
  #listeners = new Set();
  #channel;

  constructor(channel) {
    this.#channel = channel;
    this.#messages = MessageStore.#loadFromStorage();

    this.#channel.onReceive((event) => {
      if (event.type === 'ADD_MESSAGE') {
        this.#messages = [...this.#messages, event.message];
        MessageStore.#saveToStorage(this.#messages);
        this.#notify();
      } else if (event.type === 'CLEAR_MESSAGES') {
        this.#messages = [];
        MessageStore.#saveToStorage([]);
        this.#notify();
      }
    });
  }

  add(message) {
    this.#messages = [...this.#messages, message];
    MessageStore.#saveToStorage(this.#messages);
    this.#channel.send({ type: 'ADD_MESSAGE', message });
    this.#notify();
  }

  clear() {
    this.#messages = [];
    MessageStore.#saveToStorage([]);
    this.#channel.send({ type: 'CLEAR_MESSAGES' });
    this.#notify();
  }

  getAll() {
    return [...this.#messages];
  }

  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #notify() {
    this.#listeners.forEach((l) => l(this.getAll()));
  }

  static #loadFromStorage() {
    try {
      const raw = localStorage.getItem(MessageStore.#STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static #saveToStorage(messages) {
    try {
      localStorage.setItem(
        MessageStore.#STORAGE_KEY,
        JSON.stringify(messages.slice(-MessageStore.#MAX_PERSIST))
      );
    } catch {
      // storage quota exceeded — silently ignore
    }
  }
}

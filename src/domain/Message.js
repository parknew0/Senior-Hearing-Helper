import { MessageType } from './MessageType.js';

export class Message {
  constructor({ text, type = MessageType.CAPTION }) {
    this.id = crypto.randomUUID();
    this.text = text.trim();
    this.type = type;
    this.timestamp = Date.now();
  }
}

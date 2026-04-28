export class CaptionChannel {
  static #NAME = 'mirror-talk-v1';
  #channel;
  #handler = null;

  constructor() {
    this.#channel = new BroadcastChannel(CaptionChannel.#NAME);
    this.#channel.onmessage = (e) => this.#handler?.(e.data);
  }

  send(event) {
    this.#channel.postMessage(event);
  }

  onReceive(handler) {
    this.#handler = handler;
  }

  close() {
    this.#channel.close();
  }
}

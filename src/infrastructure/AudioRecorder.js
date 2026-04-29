/**
 * Thin wrapper around MediaRecorder + getUserMedia.
 *
 * Clova CSR accepts MP3/AAC/AC3/OGG/FLAC/WAV. Browser MediaRecorder
 * implementations typically emit either audio/ogg (Firefox) or
 * audio/webm (Chromium). We prefer audio/ogg when available because
 * it's on Clova's accepted list; otherwise we fall back to whatever
 * the browser offers and let the user know if Clova rejects it.
 */
export class AudioRecorder {
  static PREFERRED_MIME_TYPES = Object.freeze([
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/webm;codecs=opus',
    'audio/webm',
  ]);

  #stream = null;
  #recorder = null;
  #chunks = [];

  isRecording() {
    return this.#recorder?.state === 'recording';
  }

  async start() {
    if (this.isRecording()) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('이 브라우저는 마이크 입력을 지원하지 않습니다.');
    }

    this.#stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.#chunks = [];

    const mimeType = AudioRecorder.#pickMimeType();
    this.#recorder = new MediaRecorder(
      this.#stream,
      mimeType ? { mimeType } : undefined
    );

    this.#recorder.addEventListener('dataavailable', (event) => {
      if (event.data && event.data.size > 0) this.#chunks.push(event.data);
    });

    this.#recorder.start();
  }

  /**
   * @returns {Promise<Blob>} Captured audio in the recorder's mimeType.
   */
  async stop() {
    if (!this.#recorder) {
      throw new Error('AudioRecorder.stop() called before start()');
    }

    const recorder = this.#recorder;
    const stream = this.#stream;
    const chunks = this.#chunks;

    this.#recorder = null;
    this.#stream = null;
    this.#chunks = [];

    return new Promise((resolve, reject) => {
      recorder.addEventListener('stop', () => {
        stream?.getTracks().forEach((track) => track.stop());
        resolve(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
      });
      recorder.addEventListener('error', (event) => {
        stream?.getTracks().forEach((track) => track.stop());
        reject(event.error ?? new Error('MediaRecorder error'));
      });
      recorder.stop();
    });
  }

  cancel() {
    if (this.#recorder && this.#recorder.state !== 'inactive') {
      try { this.#recorder.stop(); } catch { /* ignore */ }
    }
    this.#stream?.getTracks().forEach((track) => track.stop());
    this.#recorder = null;
    this.#stream = null;
    this.#chunks = [];
  }

  static #pickMimeType() {
    if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) {
      return null;
    }
    return AudioRecorder.PREFERRED_MIME_TYPES.find((type) =>
      MediaRecorder.isTypeSupported(type)
    ) ?? null;
  }
}

import { SttProvider } from '../domain/SttProvider.js';

/**
 * Orchestrates record-then-transcribe. UI talks to this; this talks to
 * an AudioRecorder and an SttProvider. Swapping vendors is just passing
 * a different SttProvider into the constructor.
 */
export class SpeechTranscriber {
  #recorder;
  #provider;

  constructor(recorder, provider) {
    if (!(provider instanceof SttProvider)) {
      throw new Error('provider must be an SttProvider instance');
    }
    this.#recorder = recorder;
    this.#provider = provider;
  }

  isRecording() {
    return this.#recorder.isRecording();
  }

  async startRecording() {
    await this.#recorder.start();
  }

  /**
   * Stops the in-progress recording and returns the recognized text.
   * @returns {Promise<string>}
   */
  async stopAndTranscribe() {
    const audio = await this.#recorder.stop();
    return this.#provider.transcribe(audio);
  }

  cancel() {
    this.#recorder.cancel();
  }

  get providerName() {
    return this.#provider.name;
  }
}

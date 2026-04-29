/**
 * Abstract speech-to-text provider.
 *
 * Concrete implementations (e.g. ClovaSttProvider) are the swappable
 * "Strategy" used by SpeechTranscriber. Adding a new vendor — Whisper,
 * Google STT — should mean a new subclass and nothing else.
 */
export class SttProvider {
  /**
   * @param {Blob} _audioBlob Raw audio captured by the recorder.
   * @returns {Promise<string>} Recognized text.
   */
  // eslint-disable-next-line no-unused-vars
  async transcribe(_audioBlob) {
    throw new Error('SttProvider.transcribe() must be implemented by a subclass');
  }

  /**
   * Provider name, surfaced in error messages and the UI.
   * @returns {string}
   */
  get name() {
    throw new Error('SttProvider.name must be implemented by a subclass');
  }
}

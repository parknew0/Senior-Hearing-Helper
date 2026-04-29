/**
 * Streaming counterpart to SttProvider.
 *
 * SttProvider is a *batch* abstraction (Blob → text). Web Speech API and
 * similar realtime engines are fundamentally event-driven — they emit
 * partial ("interim") guesses while the user is still talking and finalize
 * a phrase when a pause is detected. This abstract contract captures that
 * shape so the UI layer can treat any future realtime backend uniformly.
 */
export class LiveSpeechRecognizer {
  start()       { throw new Error('LiveSpeechRecognizer.start() must be implemented'); }
  stop()        { throw new Error('LiveSpeechRecognizer.stop() must be implemented'); }
  /** Force the engine to finalize the current interim now and resume listening. */
  flush()       { throw new Error('LiveSpeechRecognizer.flush() must be implemented'); }
  isListening() { throw new Error('LiveSpeechRecognizer.isListening() must be implemented'); }

  /** @param {(text: string) => void} _handler */
  // eslint-disable-next-line no-unused-vars
  onInterim(_handler) { throw new Error('not implemented'); }
  /** @param {(text: string) => void} _handler */
  // eslint-disable-next-line no-unused-vars
  onFinal(_handler)   { throw new Error('not implemented'); }
  /** @param {(error: unknown) => void} _handler */
  // eslint-disable-next-line no-unused-vars
  onError(_handler)   { throw new Error('not implemented'); }
  /** @param {() => void} _handler */
  // eslint-disable-next-line no-unused-vars
  onEnd(_handler)     { throw new Error('not implemented'); }

  get name() { throw new Error('not implemented'); }
}

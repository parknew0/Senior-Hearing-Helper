import { LiveSpeechRecognizer } from '../domain/LiveSpeechRecognizer.js';

/**
 * Adapter for the browser-native Web Speech API
 * (window.SpeechRecognition / window.webkitSpeechRecognition).
 *
 * Behavior notes worth knowing:
 *   - continuous=true keeps the engine listening across phrases.
 *   - interimResults=true emits partial guesses while the user speaks.
 *   - Chrome auto-stops after long silences regardless of `continuous`.
 *     We auto-restart from the `end` handler unless the user explicitly
 *     called stop(), so the experience is "always-on" from their side.
 *   - Korean (ko-KR) is well-supported by Chrome's engine.
 */
export class WebSpeechRecognizer extends LiveSpeechRecognizer {
  #recognition;
  #lang;
  #userStopped = false;
  #listening = false;
  #restartTimer = null;
  #maxInterimChars;
  #hardLimitChars;
  #micropauseMs;
  #micropauseTimer = null;
  #forceFinalizing = false;

  #onInterim = null;
  #onFinal = null;
  #onError = null;
  #onEnd = null;

  static isSupported() {
    return typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  constructor({
    lang = 'ko-KR',
    // Soft ceiling: once interim crosses this, we wait for a brief
    // pause in updates and finalize at that "word boundary".
    maxInterimChars = 30,
    // Hard ceiling: a non-stop talker can grow interim past the soft
    // ceiling indefinitely; cut anyway at this length, even mid-word.
    hardLimitChars = 50,
    // How long interim must stay unchanged to be considered a
    // micropause (i.e. word boundary) once over the soft ceiling.
    micropauseMs = 200,
  } = {}) {
    super();
    const Ctor = WebSpeechRecognizer.isSupported();
    if (!Ctor) {
      throw new Error(
        '이 브라우저는 실시간 음성 인식(Web Speech API)을 지원하지 않습니다. ' +
        'Chrome 또는 Edge에서 사용해 주세요.'
      );
    }

    this.#lang = lang;
    this.#maxInterimChars = maxInterimChars;
    this.#hardLimitChars = Math.max(hardLimitChars, maxInterimChars);
    this.#micropauseMs = micropauseMs;
    this.#recognition = new Ctor();
    this.#recognition.lang = lang;
    this.#recognition.continuous = true;
    this.#recognition.interimResults = true;
    this.#recognition.maxAlternatives = 1;

    this.#recognition.onresult = (event) => {
      let interim = '';
      let finals = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? '';
        if (result.isFinal) finals += transcript;
        else interim += transcript;
      }
      const trimmedFinal = finals.trim();
      if (trimmedFinal && this.#onFinal) this.#onFinal(trimmedFinal);
      if (interim && this.#onInterim) this.#onInterim(interim);

      // If the speaker keeps going without a natural pause, the
      // interim string can balloon. Cutting mid-word hurts the next
      // session's recognition (the cold-start engine sees only a
      // partial syllable), so we wait for a brief silence before
      // calling stop(). A hard limit guards against speakers who
      // never pause.
      this.#maybeForceFinalize(interim);
    };

    this.#recognition.onerror = (event) => {
      // 'no-speech' and 'aborted' are routine and don't deserve the alarm.
      const code = event?.error;
      console.warn('[WebSpeechRecognizer] error', code, event);
      if (code !== 'no-speech' && code !== 'aborted' && this.#onError) {
        this.#onError(code ?? 'unknown error');
      }
    };

    this.#recognition.onend = () => {
      this.#listening = false;
      console.log(
        '[WebSpeechRecognizer] session end; userStopped=', this.#userStopped
      );
      if (!this.#userStopped) {
        // Chrome throws InvalidStateError if start() is called
        // synchronously inside onend, so defer to the next task.
        // We also keep retrying with backoff until either start()
        // succeeds or the user explicitly stops.
        this.#scheduleRestart(150);
        return;
      }
      if (this.#onEnd) this.#onEnd();
    };
  }

  #scheduleRestart(delayMs) {
    if (this.#userStopped) return;
    if (this.#restartTimer != null) return; // already scheduled
    this.#restartTimer = setTimeout(() => {
      this.#restartTimer = null;
      if (this.#userStopped || this.#listening) return;
      try {
        this.#recognition.start();
        this.#listening = true;
        // The previous session has now fully ended and a new one
        // started — safe to allow another forced finalization.
        this.#forceFinalizing = false;
        console.log('[WebSpeechRecognizer] auto-restarted');
      } catch (err) {
        const next = Math.min(delayMs * 2, 2000);
        console.warn(
          '[WebSpeechRecognizer] auto-restart failed, retrying in', next, 'ms',
          err?.message ?? err
        );
        this.#scheduleRestart(next);
      }
    }, delayMs);
  }

  #maybeForceFinalize(interim) {
    if (this.#forceFinalizing || this.#userStopped) return;

    if (interim.length >= this.#hardLimitChars) {
      // Talker never paused; cut now even though we may split a word.
      this.#cancelMicropause();
      this.#forceFinalize('hard limit');
    } else if (interim.length >= this.#maxInterimChars) {
      // Past the soft ceiling — arm the trailing-debounce timer.
      // Each new onresult cancels and re-arms it; if interim stays
      // unchanged for micropauseMs, the user is between words and
      // we cut there.
      this.#cancelMicropause();
      this.#micropauseTimer = setTimeout(() => {
        this.#micropauseTimer = null;
        this.#forceFinalize('micropause');
      }, this.#micropauseMs);
    } else {
      // Back below the soft ceiling (Chrome may revise interim
      // shorter); cancel any pending cut.
      this.#cancelMicropause();
    }
  }

  #cancelMicropause() {
    if (this.#micropauseTimer != null) {
      clearTimeout(this.#micropauseTimer);
      this.#micropauseTimer = null;
    }
  }

  #forceFinalize(reason) {
    if (this.#forceFinalizing || this.#userStopped) return;
    this.#forceFinalizing = true;
    console.log(`[WebSpeechRecognizer] force-finalize (${reason})`);
    // recognition.stop() makes Chrome flush the current best guess
    // as a final result, then fire onend. userStopped stays false,
    // so the existing onend handler will auto-restart cleanly.
    try { this.#recognition.stop(); } catch { /* ignore */ }
  }

  #cancelRestart() {
    if (this.#restartTimer != null) {
      clearTimeout(this.#restartTimer);
      this.#restartTimer = null;
    }
  }

  get name() {
    return 'Web Speech API';
  }

  isListening() {
    return this.#listening;
  }

  start() {
    if (this.#listening) return;
    this.#userStopped = false;
    this.#forceFinalizing = false;
    this.#cancelRestart();
    this.#cancelMicropause();
    this.#recognition.start();
    this.#listening = true;
    console.log('[WebSpeechRecognizer] start; lang=', this.#lang);
  }

  stop() {
    this.#userStopped = true;
    this.#forceFinalizing = false;
    this.#cancelRestart();
    this.#cancelMicropause();
    try { this.#recognition.stop(); } catch { /* ignore */ }
    this.#listening = false;
  }

  abort() {
    this.#userStopped = true;
    this.#forceFinalizing = false;
    this.#cancelRestart();
    this.#cancelMicropause();
    try { this.#recognition.abort(); } catch { /* ignore */ }
    this.#listening = false;
  }

  /**
   * User-initiated cut. The auto-restart loop picks listening back up
   * after the engine flushes its current best guess as a final result.
   */
  flush() {
    if (!this.#listening) return;
    this.#cancelMicropause();
    this.#forceFinalize('user');
  }

  onInterim(handler) { this.#onInterim = handler; }
  onFinal(handler)   { this.#onFinal = handler; }
  onError(handler)   { this.#onError = handler; }
  onEnd(handler)     { this.#onEnd = handler; }
}

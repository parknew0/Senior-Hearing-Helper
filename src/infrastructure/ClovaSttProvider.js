import { SttProvider } from '../domain/SttProvider.js';

/**
 * Adapter for Naver Clova Speech Recognition (CSR).
 *
 * Documented endpoint (https://api.ncloud-docs.com/docs/ai-naver-clovaspeechrecognition-stt):
 *   POST https://naveropenapi.apigw.ntruss.com/recog/v1/stt?lang={Kor|Eng|Jpn|Chn}
 *   headers:
 *     X-NCP-APIGW-API-KEY-ID:  <client id>
 *     X-NCP-APIGW-API-KEY:     <client secret>
 *     Content-Type:            application/octet-stream
 *   body:     binary audio data (MP3 / AAC / AC3 / OGG / FLAC / WAV, max 60s)
 *   response: { "text": "<recognized utterance>" }
 *
 * The auth headers are NOT set here — they're injected by the Vite dev
 * proxy (see vite.config.js) so the secret never ships in the browser
 * bundle. This adapter therefore points at a same-origin path
 * (default: "/api/clova/recog/v1/stt") instead of the public endpoint.
 */
export class ClovaSttProvider extends SttProvider {
  static SUPPORTED_LANGS = Object.freeze(['Kor', 'Eng', 'Jpn', 'Chn']);

  #endpoint;
  #lang;

  constructor({ endpoint = '/api/clova/recog/v1/stt', lang = 'Kor' } = {}) {
    super();
    if (!ClovaSttProvider.SUPPORTED_LANGS.includes(lang)) {
      throw new Error(
        `Clova CSR does not support lang="${lang}". ` +
        `Use one of: ${ClovaSttProvider.SUPPORTED_LANGS.join(', ')}`
      );
    }
    this.#endpoint = endpoint;
    this.#lang = lang;
  }

  get name() {
    return 'Naver Clova CSR';
  }

  async transcribe(audioBlob) {
    if (!(audioBlob instanceof Blob) || audioBlob.size === 0) {
      throw new Error('audioBlob must be a non-empty Blob');
    }

    const url = `${this.#endpoint}?lang=${encodeURIComponent(this.#lang)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: audioBlob,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(
        `Clova CSR ${response.status} ${response.statusText}` +
        (detail ? `: ${detail}` : '')
      );
    }

    const data = await response.json();
    if (typeof data?.text !== 'string') {
      throw new Error(`Unexpected Clova CSR response: ${JSON.stringify(data)}`);
    }
    return data.text;
  }
}

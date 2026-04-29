export const InputMode = Object.freeze({
  MANUAL: 'manual',
  CLOVA_STT: 'clova_stt',
  BROWSER_LIVE: 'browser_live',
});

export function isValidInputMode(value) {
  return Object.values(InputMode).includes(value);
}

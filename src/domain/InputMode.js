export const InputMode = Object.freeze({
  MANUAL: 'manual',
  CLOVA_STT: 'clova_stt',
});

export function isValidInputMode(value) {
  return value === InputMode.MANUAL || value === InputMode.CLOVA_STT;
}

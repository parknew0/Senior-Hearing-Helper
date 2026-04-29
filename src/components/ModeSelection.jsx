import { InputMode } from '../domain/InputMode.js';
import './ModeSelection.css';

export function ModeSelection({ onChoose }) {
  return (
    <div className="mode-selection">
      <div className="mode-selection-inner">
        <header className="mode-selection-header">
          <span className="brand-icon">🔊</span>
          <h1>MirrorTalk</h1>
          <p>입력 방식을 선택해 주세요</p>
        </header>

        <div className="mode-card-list">
          <button
            type="button"
            className="mode-card"
            onClick={() => onChoose(InputMode.MANUAL)}
          >
            <span className="mode-card-icon">⌨️</span>
            <span className="mode-card-title">직접 타자 입력</span>
            <span className="mode-card-desc">
              키보드로 직접 글자를 입력해 TV에 띄웁니다. 가장 정확하고 안정적입니다.
            </span>
          </button>

          <button
            type="button"
            className="mode-card"
            onClick={() => onChoose(InputMode.CLOVA_STT)}
          >
            <span className="mode-card-icon">🎙️</span>
            <span className="mode-card-title">네이버 클로바 음성 인식 (정확)</span>
            <span className="mode-card-desc">
              녹음 → 정지 후 클로바 STT가 한국어로 받아써 줍니다.
              한 번에 최대 60초, 보내기 전에 직접 다듬을 수 있어요.
            </span>
          </button>

          <button
            type="button"
            className="mode-card"
            onClick={() => onChoose(InputMode.BROWSER_LIVE)}
          >
            <span className="mode-card-icon">⚡</span>
            <span className="mode-card-title">실시간 자막 (브라우저)</span>
            <span className="mode-card-desc">
              말씀하시는 동안 문장이 끝날 때마다 TV에 자동으로 표시됩니다.
              Chrome / Edge 전용. (네이버 클로바가 아닌 브라우저 내장 엔진을 사용합니다.)
            </span>
          </button>
        </div>

        <p className="mode-selection-footnote">
          선택은 나중에 헤더의 “모드 변경” 버튼으로 다시 바꿀 수 있어요.
        </p>
      </div>
    </div>
  );
}

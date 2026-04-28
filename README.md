# MirrorTalk

청각이 불편한 어르신과 대화할 때, 스마트폰에서 입력한 내용을 TV 화면에 크게 띄워주는 웹 앱입니다.

- **입력 화면** (스마트폰/태블릿): 대화 내용을 타이핑
- **표시 화면** (TV/대형 모니터): 입력된 내용이 크게 표시

> 같은 브라우저 내 탭 간 통신(BroadcastChannel)을 사용하므로, 두 화면을 같은 기기에서 열어야 합니다.

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | React 19 |
| 빌드 도구 | Vite 8 |
| 스타일 | CSS (번들러 없음) |
| 탭 간 통신 | BroadcastChannel API |

---

## 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 시작
npm run dev

# 3. 빌드
npm run build
```

개발 서버 실행 후:

- **입력 화면**: `http://localhost:5173/`
- **표시 화면**: `http://localhost:5173/?view=display` (별도 탭에서 열기)

---

## 폴더 구조

```
src/
├── components/
│   ├── InputPanel.jsx      # 스마트폰용 입력 UI
│   └── DisplayScreen.jsx   # TV용 자막 표시 UI
├── hooks/
│   └── useCaptionSession.js  # 세션 상태 관리 훅
├── application/
│   └── CaptionSession.js   # 메시지 전송/구독 로직
├── domain/
│   ├── Message.js          # 메시지 모델
│   ├── MessageType.js      # 메시지 타입 (대화 / 상황 설명)
│   ├── MessageStore.js     # 메시지 저장소
│   └── CaptionChannel.js   # BroadcastChannel 래퍼
└── App.jsx                 # URL 파라미터로 화면 분기
```

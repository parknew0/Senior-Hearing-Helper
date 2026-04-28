청각이 불편한 어르신과 대화할 때, 노트북/스마트폰에서 입력한 내용을 TV 화면에 크게 띄워주는 웹 앱입니다.

- **입력 화면** (노트북/스마트폰): 대화 내용을 타이핑
- **표시 화면** (TV/대형 모니터): 입력된 내용이 크게 표시

> 같은 브라우저 내 탭 간 통신(BroadcastChannel)을 사용하므로, 두 화면을 같은 기기에서 열어야 합니다.

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | React 19 |
| 빌드 도구 | Vite 8 |
| 스타일 | CSS |
| 탭 간 통신 | BroadcastChannel API |

---

## 설치 및 실행 (macOS)

**사전 준비: Node.js**

터미널(Command + Space → '터미널')을 열고 확인하세요.

```bash
node -v
```

버전이 안 뜨면 [Node.js 공식 사이트](https://nodejs.org)에서 LTS 버전을 설치하거나, nvm을 쓰고 있다면:

```bash
nvm install 24
```

**프로젝트 실행**

```bash
# 클론
git clone https://github.com/parknew0/Senior-Hearing-Helper.git
cd Senior-Hearing-Helper

# 의존성 설치 후 실행
npm install
npm run dev
```

브라우저에서 열기:

| 화면 | URL |
|------|-----|
| 입력 화면 | `http://localhost:5173/` |
| 표시 화면 | `http://localhost:5173/?view=display` |

> 표시 화면은 별도 탭에서 열어야 합니다.

---

## 폴더 구조

```
src/
├── components/
│   ├── InputPanel.jsx       # 스마트폰용 입력 UI
│   └── DisplayScreen.jsx    # TV용 자막 표시 UI
├── hooks/
│   └── useCaptionSession.js # 세션 상태 관리 훅
├── application/
│   └── CaptionSession.js    # 메시지 전송/구독 로직
├── domain/
│   ├── Message.js           # 메시지 모델
│   ├── MessageType.js       # 메시지 타입 (대화 / 상황 설명)
│   ├── MessageStore.js      # 메시지 저장소
│   └── CaptionChannel.js    # BroadcastChannel 래퍼
└── App.jsx                  # URL 파라미터로 화면 분기
```

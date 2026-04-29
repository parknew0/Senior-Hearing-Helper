import { InputPanel } from './components/InputPanel.jsx';
import { DisplayScreen } from './components/DisplayScreen.jsx';
import { ModeSelection } from './components/ModeSelection.jsx';
import { useInputMode } from './hooks/useInputMode.js';

function resolveView() {
  return new URLSearchParams(window.location.search).get('view');
}

export default function App() {
  const view = resolveView();
  const { mode, choose, reset, hasChosen } = useInputMode();

  if (view === 'display') {
    // The TV display side is independent of input mode.
    return <DisplayScreen />;
  }

  if (!hasChosen) {
    return <ModeSelection onChoose={choose} />;
  }

  return <InputPanel inputMode={mode} onChangeInputMode={reset} />;
}

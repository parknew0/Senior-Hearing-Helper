import { InputPanel } from './components/InputPanel.jsx';
import { DisplayScreen } from './components/DisplayScreen.jsx';

function resolveView() {
  return new URLSearchParams(window.location.search).get('view');
}

export default function App() {
  const view = resolveView();
  return view === 'display' ? <DisplayScreen /> : <InputPanel />;
}

import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './app/i18n';
import { Buffer } from 'buffer';

window.Buffer = Buffer;
const root = createRoot(document.getElementById('root'));
root.render(<App />);

import { Buffer } from 'buffer';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
window.Buffer = Buffer;

const root = createRoot(document.getElementById('root'));
root.render(<App />);

import '@/index.css';
import { AppQueryClientProvider } from '@/providers/query-client';
import { App } from './App';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

root.render(
  <AppQueryClientProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AppQueryClientProvider>
);

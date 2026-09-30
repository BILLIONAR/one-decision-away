import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getAppBase, publicAssetPath } from './utils/routing';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

import { isNative, nativeReady, syncStatusBar, watchNativeResume } from './services/native';

// Progressive Web App only: the iPhone app ships its files inside the app.
if (isNative()) {
  void nativeReady();
  const stopNativeResume = watchNativeResume(() => {
    // Existing day-rollover and notebook listeners can also respond to a native
    // foreground transition, where a browser focus event is not guaranteed.
    window.dispatchEvent(new Event('focus'));
    void syncStatusBar(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  });
  if (import.meta.hot) import.meta.hot.dispose(stopNativeResume);
  // Pro purchases (RevenueCat) follow the signed-in ODA account across phones.
  void import('./services/purchases').then(async ({ purchases }) => {
    await purchases.init();
    const { cloudSync } = await import('./services/cloudSync');
    let last: string | null | undefined;
    const sync = () => { const id = cloudSync.getState().session?.user.id ?? null; if (id !== last) { last = id; void purchases.identify(id); } };
    cloudSync.subscribe(sync); sync();
  });
}
else if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(publicAssetPath('sw.js'), { scope: getAppBase() }).catch(() => {});
  });
}

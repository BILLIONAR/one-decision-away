import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/reference.css';
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
    const { cloudSync } = await import('./services/cloudSync');
    const { bindPurchaseIdentity } = await import('./services/purchaseIdentityBinding');
    const binding = bindPurchaseIdentity(cloudSync, purchases);
    // If account hydration is unavailable, purchases stay unbound and closed.
    void binding.ready.catch(() => {});
    if (import.meta.hot) import.meta.hot.dispose(binding.dispose);
  });
}
else if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(publicAssetPath('sw.js'), { scope: getAppBase() }).catch(() => {});
  });
}

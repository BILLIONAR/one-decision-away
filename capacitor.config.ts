import type { CapacitorConfig } from '@capacitor/cli';

/**
 * iPhone app shell for ODA. Build the web app for the app with
 * `npm run build:ios` (base path "/"), then `npx cap sync ios` and open
 * ios/App/App.xcodeproj in Xcode. See docs/APP_STORE.md.
 */
const config: CapacitorConfig = {
  appId: 'com.yahya.onedecisionaway',
  appName: 'ODA',
  webDir: 'dist',
  backgroundColor: '#F7F3EA',
  // The web view may only show the app itself; every other link opens in Safari.
  server: { allowNavigation: [] },
  ios: {
    contentInset: 'never',
    backgroundColor: '#F7F3EA',
    scheme: 'ODA',
    limitsNavigationsToAppBoundDomains: false,
    // Safari Web Inspector cannot attach to release builds.
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      launchShowDuration: 3000,
      backgroundColor: '#F7F3EA',
      showSpinner: false,
    },
    LocalNotifications: {
      presentationOptions: ['banner', 'sound'],
    },
  },
};

export default config;

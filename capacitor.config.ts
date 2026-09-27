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
  backgroundColor: '#F6F4EE',
  ios: {
    contentInset: 'never',
    backgroundColor: '#F6F4EE',
    scheme: 'ODA',
    limitsNavigationsToAppBoundDomains: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      launchShowDuration: 3000,
      backgroundColor: '#F6F4EE',
      showSpinner: false,
    },
    LocalNotifications: {
      presentationOptions: ['banner', 'sound'],
    },
  },
};

export default config;

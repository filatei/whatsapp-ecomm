import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'MyApp',
  webDir: 'out', // Next.js output folder
  server: {
    url: 'http://localhost:3000', // Optional: Useful for development
    cleartext: true
  },
  android: {
    webContentsDebuggingEnabled: true
  }
};

export default config;
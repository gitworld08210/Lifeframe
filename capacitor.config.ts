import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lifeframe.app',
  appName: 'Lifeframe',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;

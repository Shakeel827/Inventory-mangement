import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inventoryq.app',
  appName: 'Inventory Management',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // For development, you can use your Vercel URL
    // url: 'https://inventory-mangement-lyart.vercel.app',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0f172a",
      showSpinner: false
    }
  }
};

export default config;

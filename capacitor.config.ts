import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.webguard.app',
  appName: 'Web Guard AI',
  webDir: 'dist',
  server: {
    url: 'https://9ca332e9-8374-446f-b117-89e9c7385484.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
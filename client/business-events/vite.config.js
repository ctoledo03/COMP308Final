import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
//
export default defineConfig({
  server: {
    port: 3003, // Specify the port to avoid conflicts
  },
  plugins: [
    react(),
    federation({
      name: 'businessAndEvents',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App', // Adjust the path to your main App or specific component
      },
      shared: ['react', 'react-dom', '@apollo/client', 'graphql'],
    }),
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },

});


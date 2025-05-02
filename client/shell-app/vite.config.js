// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
//
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shellApp',
      remotes: {
        userAuth: 'http://localhost:3001/assets/remoteEntry.js',
        commEngagement: 'http://localhost:3002/assets/remoteEntry.js',
        businessAndEvents: 'http://localhost:3003/assets/remoteEntry.js'
      },
      shared: ['react', 'react-dom', '@apollo/client', 'graphql'],
    }),
  ],
  build: {
    target: 'es2022' 
  }
});

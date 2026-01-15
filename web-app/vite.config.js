import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Séparation des chunks pour optimiser le chargement
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendors React séparés
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    },
    // Taille max avant warning
    chunkSizeWarningLimit: 500,
    // Minification optimisée
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprime console.log en production
      }
    }
  },
  // Optimisation des dépendances
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})

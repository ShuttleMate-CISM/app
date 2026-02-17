import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Ensure no inline scripts in production build
        inlineDynamicImports: false,
      }
    },
    // Generate source maps for debugging without eval
    sourcemap: true,
    // Minify without eval
    minify: 'terser',
    terserOptions: {
      compress: {
        // Disable eval usage in minified code
        unsafe: false,
        unsafe_comps: false,
        unsafe_Function: false,
        unsafe_regexp: false,
      }
    }
  }
})

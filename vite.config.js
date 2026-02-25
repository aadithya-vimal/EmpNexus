import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// sql.js is loaded via a plain <script> tag from /public/sql-wasm.js
// so it does NOT need to go through Vite's bundler at all.
export default defineConfig({
  plugins: [react()],
  base: './',
})

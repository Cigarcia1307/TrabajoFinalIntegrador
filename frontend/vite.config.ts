import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Tailwind CSS v4 se integra como plugin de Vite: no hace falta tailwind.config.js
// ni postcss.config.js. Los tokens de diseño viven en src/styles/tokens.css.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})

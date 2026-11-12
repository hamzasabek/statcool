import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { citeIndex } from './tools/cites.mjs'

// `virtual:cites`: which references each topic folder and the About page cite (read from the
// sources at build time), for the reference lists of the topic pages and of /references.
const root = fileURLToPath(new URL('.', import.meta.url))
const ID = 'virtual:cites'
const RESOLVED = '\0' + ID // Vite's convention for virtual modules
function cites() {
  return {
    name: 'statscool-cites',
    resolveId: (s) => (s === ID ? RESOLVED : null),
    load: (s) => (s === RESOLVED ? `export default ${JSON.stringify(citeIndex(root))}` : null),
    handleHotUpdate({ file, server }) {
      if (!/[\\/]src[\\/]/.test(file)) return
      const mod = server.moduleGraph.getModuleById(RESOLVED)
      if (mod) server.moduleGraph.invalidateModule(mod)
    },
  }
}

// Relative base ('./') allows deploying to any host:
// GitHub Pages (/statscool/) or local preview.
export default defineConfig({
  plugins: [react(), cites()],
  base: './',
})

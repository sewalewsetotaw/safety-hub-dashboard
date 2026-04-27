import { defineConfig } from '@tanstack/start/config'
import { vercelAdapter } from '@tanstack/start-adapter-vercel'

export default defineConfig({
  server: {
    preset: 'vercel',
  },
  adapter: vercelAdapter(), 
})
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const isGithubPages = env.GITHUB_PAGES === 'true'

  return {
    base: env.VITE_BASE_PATH || (isGithubPages ? '/Samvidhan_Law/' : '/'),
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
    ],
  }
})

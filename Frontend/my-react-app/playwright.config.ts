import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '../../qa',
  timeout: 240000,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'node server.cjs',
      port: 3001,
      reuseExistingServer: true,
      env: { MOCK_FEISHU: '1', NODE_ENV: 'test' }
    },
    {
      command: 'vite',
      port: 5173,
      reuseExistingServer: true
    }
  ],
  projects: [
    { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
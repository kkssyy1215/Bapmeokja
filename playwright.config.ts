import { defineConfig } from '@playwright/test';

const webPort = 8081;
const apiUrl = process.env.E2E_API_URL ?? 'http://127.0.0.1:8080/v1';

export default defineConfig({
  testDir: './e2e',
  // 시나리오마다 계정을 새로 만들지만 요청 횟수 제한을 넘지 않도록 순서대로 실행한다.
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    ['json', { outputFile: 'docs/test/results/e2e-result.json' }],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  outputDir: 'test-results',
  use: {
    baseURL: process.env.E2E_WEB_URL ?? `http://127.0.0.1:${webPort}`,
    // PC에 설치된 Chrome을 쓴다. GitHub Actions 러너에도 기본으로 있다.
    channel: 'chrome',
    viewport: { width: 390, height: 844 },
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    geolocation: { latitude: 37.5665, longitude: 126.978 },
    permissions: ['geolocation'],
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: process.env.E2E_WEB_URL
    ? undefined
    : {
        // 실제 배포와 같은 운영 빌드로 테스트한다. 개발 서버는 .env.local의 목업 설정을 다시 읽는다 (ISSUE-007).
        command: `EXPO_NO_DOTENV=1 EXPO_PUBLIC_USE_MOCKS=false EXPO_PUBLIC_API_URL=${apiUrl} npx expo export --platform web --output-dir e2e-dist && node e2e/serve.mjs e2e-dist ${webPort}`,
        url: `http://127.0.0.1:${webPort}`,
        reuseExistingServer: false,
        timeout: 240_000,
      },
});

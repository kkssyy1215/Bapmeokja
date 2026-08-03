import { create } from 'axios';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export const api = create({
  baseURL: baseURL || 'http://localhost:8080/api',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = globalThis.__BAPMEOKJA_ACCESS_TOKEN__;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

declare global {
  // 토큰 저장 방식은 백엔드 인증 구현 시 SecureStore로 교체합니다.
  var __BAPMEOKJA_ACCESS_TOKEN__: string | undefined;
}

export const isMockMode = !baseURL;

export async function simulateRequest<T>(data: T, delay = 650): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return data;
}

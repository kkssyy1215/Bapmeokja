import { AxiosError, AxiosRequestConfig, create, InternalAxiosRequestConfig, isAxiosError } from 'axios';

import { ApiEnvelope, ApiFailure, TokenResponse } from '@/types/api';

import { tokenStore } from './token-store';

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
export const API_BASE_URL = configuredBaseUrl || 'https://api.babmukja.com/v1';
export const isMockMode = process.env.EXPO_PUBLIC_USE_MOCKS === 'true' || !configuredBaseUrl;

function apiOrigin() {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return API_BASE_URL.replace(/\/(?:v\d+)(?:\/.*)?$/, '');
  }
}

/**
 * The API stores uploaded assets as relative paths (for example `/uploads/a.jpg`).
 * Expo Image needs an absolute URL, so resolve those paths against the API host
 * while leaving device files and already absolute URLs untouched.
 */
export function resolveApiAssetUrl(value?: string | null) {
  const path = value?.trim();
  if (!path) return undefined;
  if (/^(?:https?:|data:|blob:|file:)/i.test(path)) return path;

  try {
    return new URL(path, `${apiOrigin()}/`).toString();
  } catch {
    return path;
  }
}

const assetUrlKeys = new Set(['imageUrl', 'thumbnailUrl', 'iconUrl']);

function normalizeApiAssetUrls<T>(value: T): T {
  if (Array.isArray(value)) return value.map(normalizeApiAssetUrls) as T;
  if (!value || typeof value !== 'object') return value;

  const normalized = Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      assetUrlKeys.has(key) && typeof entry === 'string'
        ? resolveApiAssetUrl(entry)
        : normalizeApiAssetUrls(entry),
    ]),
  );
  return normalized as T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly code = 'NET_001',
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const api = create({
  baseURL: API_BASE_URL,
  timeout: 12_000,
  headers: { Accept: 'application/json', 'Accept-Language': 'ko' },
});

const refreshClient = create({
  baseURL: API_BASE_URL,
  timeout: 12_000,
  headers: { Accept: 'application/json', 'Accept-Language': 'ko' },
});

let refreshPromise: Promise<string> | null = null;
let sessionExpiredHandler: (() => void) | undefined;

export function setSessionExpiredHandler(handler?: () => void) {
  sessionExpiredHandler = handler;
}

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) throw new ApiError('로그인이 필요합니다.', 'AUTH_004', 401);

  refreshPromise = refreshClient
    .post<ApiEnvelope<TokenResponse>>('/auth/token/refresh', { refreshToken })
    .then(async ({ data }) => {
      await tokenStore.set(data.data);
      return data.data.accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => {
    response.data = normalizeApiAssetUrls(response.data);
    return response;
  },
  async (error: AxiosError<ApiFailure>) => {
    const original = error.config as RetryConfig | undefined;
    const code = error.response?.data?.errorCode;
    const shouldRefresh = original
      && !original._retry
      && error.response?.status === 401
      && code === 'AUTH_004'
      && !original.url?.includes('/auth/token/refresh');

    if (shouldRefresh) {
      original._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        await tokenStore.clear();
        sessionExpiredHandler?.();
        throw new ApiError('로그인이 만료되었습니다. 다시 로그인해 주세요.', 'AUTH_004', 401);
      }
    }

    if (code === 'AUTH_003') {
      await tokenStore.clear();
      sessionExpiredHandler?.();
    }

    throw toApiError(error);
  },
);

function toApiError(error: unknown) {
  if (error instanceof ApiError) return error;
  if (isAxiosError<ApiFailure>(error)) {
    const data = error.response?.data;
    if (data?.message) return new ApiError(data.message, data.errorCode, error.response?.status);
    if (error.code === 'ECONNABORTED') return new ApiError('응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.', 'AI_002');
    if (!error.response) return new ApiError('서버에 연결할 수 없어요. 네트워크 상태를 확인해 주세요.', 'NET_001');
  }
  return new ApiError('요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.', 'SERVER_001');
}

export async function requestData<T>(config: AxiosRequestConfig) {
  const response = await api.request<ApiEnvelope<T>>(config);
  if (!response.data.success) throw new ApiError(response.data.message);
  return response.data.data;
}

export function getErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.';
}

export async function simulateRequest<T>(data: T, delay = 450): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return data;
}

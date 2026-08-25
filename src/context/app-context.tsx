import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { defaultProfile, initialFridge, initialMeals, initialNotifications, initialPosts } from '@/data/mock';
import { getErrorMessage, isMockMode, setSessionExpiredHandler, simulateRequest } from '@/services/api';
import { authApi, dietApi, fridgeApi, homeApi, userApi } from '@/services/bapmeokja-api';
import {
  createLocalDashboard,
  fridgeItemFromApi,
  mealFromApi,
  notificationSettingsFromApi,
  profileFromApi,
} from '@/services/mappers';
import { tokenStore } from '@/services/token-store';
import { CommunityPost, FridgeItem, Meal, MealType, NotificationSettings, UserProfile } from '@/types';
import {
  AnalyzeDietResponse,
  DashboardResponse,
  DuplicateCheckResponse,
  InitialProfileRequest,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
} from '@/types/api';

type PersistedState = {
  isAuthenticated: boolean;
  profile: UserProfile;
  meals: Meal[];
  posts: CommunityPost[];
  fridgeItems: FridgeItem[];
  notifications: NotificationSettings;
};

type ManualMealInput = {
  name: string;
  type: MealType;
  eatenAt: string;
  weightGram: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
};

type AppContextValue = PersistedState & {
  hydrated: boolean;
  apiMode: 'mock' | 'server';
  dashboard: DashboardResponse;
  lastError: string;
  login: (credentials: LoginRequest) => Promise<{ isNewUser: boolean }>;
  registerAccount: (payload: RegisterRequest) => Promise<RegisterResponse>;
  checkDuplicate: (field: 'username' | 'email' | 'nickname', value: string) => Promise<DuplicateCheckResponse>;
  signOut: () => Promise<void>;
  completeInitialProfile: (payload: InitialProfileRequest) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => void;
  refreshDashboard: () => Promise<void>;
  saveManualMeal: (meal: ManualMealInput) => Promise<void>;
  saveAnalyzedMeal: (analysis: AnalyzeDietResponse, type: MealType) => Promise<void>;
  addMeal: (meal: Meal) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  createPost: (content: string, mealName: string) => void;
  refreshFridge: () => Promise<void>;
  addFridgeItem: (item: Omit<FridgeItem, 'id'>) => Promise<void>;
  removeFridgeItem: (id: string) => Promise<void>;
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
};

const STORAGE_KEY = '@bapmeokja/state/v2';
const initialState: PersistedState = {
  isAuthenticated: false,
  profile: defaultProfile,
  meals: initialMeals,
  posts: initialPosts,
  fridgeItems: initialFridge,
  notifications: initialNotifications,
};

const emptyProfile: UserProfile = {
  ...defaultProfile,
  name: '',
  nickname: '',
  email: '',
  age: 0,
  height: 0,
  weight: 0,
  activity: '낮음',
};

const emptyNotifications: NotificationSettings = {
  pushEnabled: false,
  waterReminder: false,
  mealReminder: false,
  expiryAlert: false,
  breakfastTime: '08:00',
  lunchTime: '12:30',
  dinnerTime: '19:00',
};

const mealTypeCode = { 아침: 'BREAKFAST', 점심: 'LUNCH', 저녁: 'DINNER', 간식: 'SNACK' } as const;
const AppContext = createContext<AppContextValue | null>(null);

function localDate() {
  return new Date().toLocaleDateString('en-CA');
}

function signedOutState(): PersistedState {
  if (isMockMode) {
    return {
      ...initialState,
      isAuthenticated: false,
      meals: [...initialMeals],
      posts: [...initialPosts],
      fridgeItems: [...initialFridge],
      notifications: { ...initialNotifications },
    };
  }
  return {
    isAuthenticated: false,
    profile: { ...emptyProfile },
    meals: [],
    posts: [],
    fridgeItems: [],
    notifications: { ...emptyNotifications },
  };
}

function storedMockState(saved: string | null): PersistedState {
  if (!saved) return signedOutState();
  try {
    return { ...initialState, ...JSON.parse(saved) } as PersistedState;
  } catch {
    return signedOutState();
  }
}

type ServerSnapshot = {
  state: PersistedState;
  dashboard: DashboardResponse;
  error?: unknown;
};

async function fetchServerSnapshot(fallbackNickname = ''): Promise<ServerSnapshot> {
  const date = localDate();
  const [profileResult, dashboardResult, recordsResult, fridgeResult] = await Promise.allSettled([
    userApi.getProfile(),
    homeApi.dashboard(),
    dietApi.getRecords(date),
    fridgeApi.list(),
  ]);
  const failed = [profileResult, dashboardResult, recordsResult, fridgeResult]
    .find((result): result is PromiseRejectedResult => result.status === 'rejected');

  // A rejected authentication request clears the token in the API interceptor.
  // Do not revive that session just because another parallel request succeeded.
  if (!tokenStore.getAccessToken()) {
    throw failed?.reason ?? new Error('로그인 세션이 만료되었습니다.');
  }

  const remoteDashboard = dashboardResult.status === 'fulfilled' ? dashboardResult.value : undefined;
  const profile = profileResult.status === 'fulfilled'
    ? profileFromApi(profileResult.value)
    : { ...emptyProfile, nickname: remoteDashboard?.nickname ?? fallbackNickname };
  const meals = recordsResult.status === 'fulfilled'
    ? recordsResult.value.records.map(mealFromApi)
    : [];
  const fridgeItems = fridgeResult.status === 'fulfilled'
    ? fridgeResult.value.ingredients.map(fridgeItemFromApi)
    : [];
  const notifications = profileResult.status === 'fulfilled'
    ? notificationSettingsFromApi(profileResult.value)
    : { ...emptyNotifications };

  return {
    state: {
      isAuthenticated: true,
      profile,
      meals,
      posts: [],
      fridgeItems,
      notifications,
    },
    dashboard: remoteDashboard ?? createLocalDashboard(profile, meals),
    error: failed?.reason,
  };
}

export function AppProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(initialState);
  const [dashboard, setDashboard] = useState(() => createLocalDashboard(initialState.profile, initialState.meals));
  const [hydrated, setHydrated] = useState(false);
  const [lastError, setLastError] = useState('');
  const sessionRevision = useRef(0);

  const resetUserScope = useCallback(async (clearTokens = true) => {
    sessionRevision.current += 1;
    if (clearTokens) await tokenStore.clear();
    const reset = signedOutState();
    setState(reset);
    setDashboard(createLocalDashboard(reset.profile, reset.meals));
    setLastError('');
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
  }, []);

  useEffect(() => {
    let mounted = true;
    const restore = async () => {
      try {
        const [saved, tokens] = await Promise.all([AsyncStorage.getItem(STORAGE_KEY), tokenStore.hydrate()]);
        if (!mounted) return;

        if (isMockMode) {
          const stored = storedMockState(saved);
          setState(stored);
          setDashboard(createLocalDashboard(stored.profile, stored.meals));
          return;
        }

        if (!tokens.accessToken) {
          const reset = signedOutState();
          setState(reset);
          setDashboard(createLocalDashboard(reset.profile, reset.meals));
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
          return;
        }

        const revision = sessionRevision.current;
        const snapshot = await fetchServerSnapshot();
        if (!mounted || revision !== sessionRevision.current) return;
        setState(snapshot.state);
        setDashboard(snapshot.dashboard);
        setLastError(snapshot.error ? getErrorMessage(snapshot.error) : '');
      } catch (error) {
        if (!mounted) return;
        const reset = signedOutState();
        setState(reset);
        setDashboard(createLocalDashboard(reset.profile, reset.meals));
        setLastError(getErrorMessage(error));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
      } finally {
        if (mounted) setHydrated(true);
      }
    };
    void restore();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => { void resetUserScope(false); });
    return () => setSessionExpiredHandler();
  }, [resetUserScope]);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const login = useCallback(async (credentials: LoginRequest) => {
    setLastError('');
    const revision = ++sessionRevision.current;
    try {
      const session = isMockMode
        ? await simulateRequest({ accessToken: 'demo-access', refreshToken: 'demo-refresh', isNewUser: false, userId: 'u_demo', nickname: state.profile.nickname })
        : await authApi.login(credentials);
      if (revision !== sessionRevision.current) throw new Error('로그인 요청이 취소되었습니다.');

      if (isMockMode) {
        setState((prev) => ({ ...prev, isAuthenticated: true, profile: { ...prev.profile, nickname: session.nickname } }));
      } else {
        const snapshot = await fetchServerSnapshot(session.nickname);
        if (revision !== sessionRevision.current) throw new Error('로그인 요청이 취소되었습니다.');
        setState(snapshot.state);
        setDashboard(snapshot.dashboard);
        setLastError(snapshot.error ? getErrorMessage(snapshot.error) : '');
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot.state));
      }
      return { isNewUser: session.isNewUser };
    } catch (error) {
      const message = getErrorMessage(error);
      setLastError(message);
      throw error;
    }
  }, [state.profile.nickname]);

  const registerAccount = useCallback(async (payload: RegisterRequest) => {
    if (isMockMode) return simulateRequest({ userId: `u_${Date.now()}`, nickname: payload.nickname, isNewUser: true as const });
    return authApi.register(payload);
  }, []);

  const checkDuplicate = useCallback(async (field: 'username' | 'email' | 'nickname', value: string) => {
    if (isMockMode) return simulateRequest({ isDuplicated: false }, 250);
    if (field === 'username') return authApi.checkUsername(value);
    if (field === 'email') return authApi.checkEmail(value);
    return authApi.checkNickname(value);
  }, []);

  const signOut = useCallback(async () => {
    if (!isMockMode) await authApi.logout().catch(() => tokenStore.clear());
    await resetUserScope();
  }, [resetUserScope]);

  const completeInitialProfile = useCallback(async (payload: InitialProfileRequest) => {
    const goals = isMockMode
      ? await simulateRequest({ dailyCalorieGoal: payload.goal === 'LOSE' ? 1650 : payload.goal === 'GAIN' ? 2350 : 2000, carbGoalGram: 250, proteinGoalGram: 120, fatGoalGram: 55, isPreciseMode: Boolean(payload.skeletalMuscleMass && payload.bodyFatMass && payload.bodyFatPercentage) })
      : await userApi.createInitialProfile(payload);
    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      profile: {
        ...prev.profile,
        gender: payload.gender === 'M' ? '남성' : '여성',
        age: payload.age,
        height: payload.height,
        weight: payload.weight,
        activity: ['SEDENTARY', 'LIGHT'].includes(payload.activityLevel) ? '낮음' : payload.activityLevel === 'MODERATE' ? '보통' : '높음',
        goal: payload.goal === 'LOSE' ? '감량' : payload.goal === 'GAIN' ? '증량' : '유지',
        dailyCalories: goals.dailyCalorieGoal,
        carbGoal: goals.carbGoalGram,
        proteinGoal: goals.proteinGoalGram,
        fatGoal: goals.fatGoalGram,
        skeletalMuscleMass: payload.skeletalMuscleMass,
        bodyFatMass: payload.bodyFatMass,
        bodyFatPercentage: payload.bodyFatPercentage,
        isPreciseMode: goals.isPreciseMode,
      },
    }));
  }, []);

  const refreshDashboard = useCallback(async () => {
    if (isMockMode) {
      setState((current) => {
        setDashboard(createLocalDashboard(current.profile, current.meals));
        return current;
      });
      return;
    }
    try {
      const revision = sessionRevision.current;
      const [summary, records] = await Promise.all([homeApi.dashboard(), dietApi.getRecords(localDate())]);
      if (revision !== sessionRevision.current) return;
      setDashboard(summary);
      const remoteMeals = records.records.map(mealFromApi);
      setState((prev) => ({
        ...prev,
        profile: { ...prev.profile, nickname: summary.nickname },
        // Server mode keeps only today's authoritative records. Persisted mock
        // meals and records from a previous account must never be merged here.
        meals: remoteMeals,
      }));
    } catch (error) {
      setLastError(getErrorMessage(error));
      throw error;
    }
  }, []);

  const saveManualMeal = useCallback(async (meal: ManualMealInput) => {
    const request = {
      mealType: mealTypeCode[meal.type],
      eatenAt: meal.eatenAt,
      items: [{ name: meal.name, weightGram: meal.weightGram, calorie: meal.calories, carb: meal.carbs, protein: meal.protein, fat: meal.fat }],
    };
    const revision = sessionRevision.current;
    const result = isMockMode ? { recordId: `rec_${Date.now()}` } : await dietApi.createManualRecord(request);
    if (revision !== sessionRevision.current) return;
    setState((prev) => ({ ...prev, meals: [{ id: result.recordId, name: meal.name, type: meal.type, emoji: '🍽️', eatenAt: meal.eatenAt, calories: meal.calories, carbs: meal.carbs, protein: meal.protein, fat: meal.fat }, ...prev.meals] }));
  }, []);

  const saveAnalyzedMeal = useCallback(async (analysis: AnalyzeDietResponse, type: MealType) => {
    const eatenAt = new Date().toISOString();
    const revision = sessionRevision.current;
    const result = isMockMode
      ? { recordId: `rec_${Date.now()}`, eatenAt, totalCalorie: analysis.totalCalorie }
      : await dietApi.createRecord({ analyzeId: analysis.analyzeId, mealType: mealTypeCode[type], eatenAt, items: analysis.items });
    if (revision !== sessionRevision.current) return;
    setState((prev) => ({ ...prev, meals: [{ id: result.recordId, type, name: analysis.foodName, emoji: '🍽️', eatenAt: result.eatenAt, calories: analysis.totalCalorie, carbs: analysis.totalCarb, protein: analysis.totalProtein, fat: analysis.totalFat }, ...prev.meals] }));
  }, []);

  const refreshFridge = useCallback(async () => {
    if (isMockMode) return;
    const revision = sessionRevision.current;
    const result = await fridgeApi.list();
    if (revision !== sessionRevision.current) return;
    setState((prev) => ({ ...prev, fridgeItems: result.ingredients.map(fridgeItemFromApi) }));
  }, []);

  const addFridgeItem = useCallback(async (item: Omit<FridgeItem, 'id'>) => {
    const quantityValue = item.quantityValue ?? (Number.parseFloat(item.quantity) || 1);
    const unit = item.unit || item.quantity.replace(/[\d.\s]/g, '') || '개';
    if (isMockMode) {
      setState((prev) => ({ ...prev, fridgeItems: [...prev.fridgeItems, { ...item, id: `ing_${Date.now()}`, quantityValue, unit }] }));
      return;
    }

    const revision = sessionRevision.current;
    await fridgeApi.create([{ name: item.name, quantity: quantityValue, unit, expiryDate: item.expiryDate }]);
    const result = await fridgeApi.list();
    if (revision !== sessionRevision.current) return;
    setState((prev) => ({ ...prev, fridgeItems: result.ingredients.map(fridgeItemFromApi) }));
  }, []);

  const removeFridgeItem = useCallback(async (id: string) => {
    const revision = sessionRevision.current;
    if (!isMockMode) await fridgeApi.remove(id);
    if (revision !== sessionRevision.current) return;
    setState((prev) => ({ ...prev, fridgeItems: prev.fridgeItems.filter((item) => item.id !== id) }));
  }, []);

  const effectiveDashboard = useMemo(() => isMockMode ? createLocalDashboard(state.profile, state.meals) : dashboard, [dashboard, state.meals, state.profile]);

  const value = useMemo<AppContextValue>(() => ({
    ...state,
    hydrated,
    apiMode: isMockMode ? 'mock' : 'server',
    dashboard: effectiveDashboard,
    lastError,
    login,
    registerAccount,
    checkDuplicate,
    signOut,
    completeInitialProfile,
    updateProfile: (profile) => setState((prev) => ({ ...prev, profile: { ...prev.profile, ...profile } })),
    refreshDashboard,
    saveManualMeal,
    saveAnalyzedMeal,
    addMeal: (meal) => setState((prev) => ({ ...prev, meals: [meal, ...prev.meals] })),
    toggleLike: (postId) => setState((prev) => ({ ...prev, posts: prev.posts.map((post) => post.id === postId ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) } : post) })),
    addComment: (postId, content) => setState((prev) => ({ ...prev, posts: prev.posts.map((post) => post.id === postId ? { ...post, comments: [...post.comments, { id: `cmt_${Date.now()}`, author: prev.profile.nickname, content, createdAt: '방금 전' }] } : post) })),
    createPost: (content, mealName) => setState((prev) => ({ ...prev, posts: [{ id: `post_${Date.now()}`, author: prev.profile.nickname, avatar: '🍅', content, mealName, emoji: '🍽️', nutrients: { calories: 0, carbs: 0, protein: 0, fat: 0 }, likes: 0, liked: false, createdAt: '방금 전', comments: [] }, ...prev.posts] })),
    refreshFridge,
    addFridgeItem,
    removeFridgeItem,
    updateNotifications: (settings) => setState((prev) => ({ ...prev, notifications: { ...prev.notifications, ...settings } })),
  }), [state, hydrated, effectiveDashboard, lastError, login, registerAccount, checkDuplicate, signOut, completeInitialProfile, refreshDashboard, saveManualMeal, saveAnalyzedMeal, refreshFridge, addFridgeItem, removeFridgeItem]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}

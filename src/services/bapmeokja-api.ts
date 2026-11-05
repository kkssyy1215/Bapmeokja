import { Platform } from 'react-native';

import {
  AiFeedback,
  AnalyzeDietResponse,
  CommunityPostDetail,
  CommunityPostSummary,
  CreateDietRecordRequest,
  DailyStatistics,
  DietItemDetail,
  DietRecordSummary,
  DiningMenuItem,
  DuplicateCheckResponse,
  FoodSearchItem,
  FridgeIngredient,
  InitialProfileRequest,
  LoginRequest,
  LoginResponse,
  MenuSummary,
  MonthlyStatistics,
  NearbyStore,
  NotificationSettingsRequest,
  NutritionGoals,
  PageMeta,
  RecipeDetail,
  RecipeSummary,
  RecommendationCategory,
  RegisterRequest,
  RegisterResponse,
  ShoppingList,
  UserProfileResponse,
  WeeklyStatistics,
} from '@/types/api';

import { requestData } from './api';
import { tokenStore } from './token-store';

async function imageFormData(uri: string, fieldName = 'image') {
  const form = new FormData();
  const fileName = uri.split('/').pop()?.split('?')[0] || 'meal.jpg';
  const extension = fileName.split('.').pop()?.toLowerCase();
  const mime = extension === 'png' ? 'image/png' : extension === 'heic' ? 'image/heic' : 'image/jpeg';

  if (Platform.OS === 'web') {
    const blob = await fetch(uri).then((response) => response.blob());
    form.append(fieldName, blob, fileName);
  } else {
    form.append(fieldName, { uri, name: fileName, type: mime } as unknown as Blob);
  }
  return form;
}

export const authApi = {
  async login(body: LoginRequest) {
    const session = await requestData<LoginResponse>({ method: 'POST', url: '/auth/login', data: body });
    await tokenStore.set(session);
    return session;
  },
  register: (body: RegisterRequest) => requestData<RegisterResponse>({ method: 'POST', url: '/auth/register', data: body }),
  checkUsername: (value: string) => requestData<DuplicateCheckResponse>({ method: 'GET', url: '/auth/check/username', params: { value } }),
  checkEmail: (value: string) => requestData<DuplicateCheckResponse>({ method: 'GET', url: '/auth/check/email', params: { value } }),
  checkNickname: (value: string) => requestData<DuplicateCheckResponse>({ method: 'GET', url: '/auth/check/nickname', params: { value } }),
  async logout() {
    try {
      await requestData<null>({ method: 'POST', url: '/auth/logout' });
    } finally {
      await tokenStore.clear();
    }
  },
};

export const userApi = {
  createInitialProfile: (body: InitialProfileRequest) => requestData<NutritionGoals>({ method: 'POST', url: '/users/profile/initial', data: body }),
  getProfile: () => requestData<UserProfileResponse>({ method: 'GET', url: '/users/profile' }),
  updateProfile: (body: Partial<InitialProfileRequest> & { nickname?: string }) => requestData<NutritionGoals>({ method: 'PUT', url: '/users/profile', data: body }),
  updateNotifications: (body: NotificationSettingsRequest) => requestData<null>({ method: 'PUT', url: '/users/settings/notification', data: body }),
  updateBudget: (body: { diningOut?: number; homeCooking?: number }) => requestData<null>({ method: 'PUT', url: '/users/settings/budget', data: body }),
  setLocationConsent: (agreed: boolean) => requestData<{ locationConsentGranted: boolean }>({ method: 'POST', url: '/users/location-consent', data: { agreed } }),
  registerDevice: (deviceToken: string, platform: 'IOS' | 'ANDROID') => requestData<null>({ method: 'POST', url: '/users/devices', data: { deviceToken, platform } }),
  changePassword: (body: { currentPassword: string; newPassword: string; newPasswordConfirm: string }) => requestData<null>({ method: 'PUT', url: '/users/password', data: body }),
  deleteAccount: (currentPassword: string) => requestData<null>({ method: 'DELETE', url: '/users/account', data: { currentPassword } }),
};

export const homeApi = {
  dashboard: () => requestData<import('@/types/api').DashboardResponse>({ method: 'GET', url: '/home/dashboard' }),
};

export const dietApi = {
  async analyzeImage(uri: string) {
    const data = await imageFormData(uri);
    return requestData<AnalyzeDietResponse>({ method: 'POST', url: '/diet/analyze', data });
  },
  getItem: (itemId: string) => requestData<DietItemDetail>({ method: 'GET', url: `/diet/items/${itemId}` }),
  createRecord: (body: CreateDietRecordRequest) => requestData<{ recordId: string; eatenAt: string; totalCalorie: number }>({ method: 'POST', url: '/diet/records', data: body }),
  createManualRecord: (body: Omit<CreateDietRecordRequest, 'analyzeId'>) => requestData<{ recordId: string }>({ method: 'POST', url: '/diet/records/manual', data: body }),
  searchFoods: (keyword: string, page = 0, size = 20) => requestData<{ foods: FoodSearchItem[] } & PageMeta>({ method: 'GET', url: '/diet/foods/search', params: { keyword, page, size } }),
  getCalendar: (year: number, month: number) => requestData<{ year: number; month: number; recordedDates: string[] }>({ method: 'GET', url: '/diet/calendar', params: { year, month } }),
  getRecords: (date: string) => requestData<{ date: string; totalCalorie: number; records: DietRecordSummary[] }>({ method: 'GET', url: '/diet/records', params: { date } }),
  updateRecord: (recordId: string, body: Omit<CreateDietRecordRequest, 'analyzeId'>) => requestData<{ recordId: string }>({ method: 'PUT', url: `/diet/records/${recordId}`, data: body }),
  deleteRecord: (recordId: string) => requestData<null>({ method: 'DELETE', url: `/diet/records/${recordId}` }),
};

export const statisticsApi = {
  daily: (date: string) => requestData<DailyStatistics>({ method: 'GET', url: '/statistics/daily', params: { date } }),
  weekly: (startDate: string) => requestData<WeeklyStatistics>({ method: 'GET', url: '/statistics/weekly', params: { startDate } }),
  monthly: (year: number, month: number) => requestData<MonthlyStatistics>({ method: 'GET', url: '/statistics/monthly', params: { year, month } }),
};

export const feedbackApi = {
  daily: (date: string) => requestData<AiFeedback>({ method: 'GET', url: '/ai/feedback/daily', params: { date } }),
  weekly: (startDate: string) => requestData<AiFeedback>({ method: 'GET', url: '/ai/feedback/weekly', params: { startDate } }),
  monthly: (year: number, month: number) => requestData<AiFeedback>({ method: 'GET', url: '/ai/feedback/monthly', params: { year, month } }),
};

export const menuApi = {
  summary: () => requestData<MenuSummary>({ method: 'GET', url: '/menu/recommend/summary' }),
  diningOut: (budget?: number) => requestData<{ recommendedCategories: RecommendationCategory[]; appliedBudget: number }>({ method: 'GET', url: '/menu/recommend/dining-out', params: { budget } }),
  homeCooking: (budget?: number) => requestData<{ recommendedCategories: RecommendationCategory[]; appliedBudget: number }>({ method: 'GET', url: '/menu/recommend/home-cooking', params: { budget } }),
  diningItems: (categoryId: string, budget?: number) => requestData<{ categoryName: string; items: DiningMenuItem[] }>({ method: 'GET', url: `/menu/categories/${categoryId}/items`, params: { budget } }),
  diningItem: (itemId: string) => requestData<DiningMenuItem & { ingredients: { name: string; weightGram: number }[] }>({ method: 'GET', url: `/menu/items/${itemId}` }),
  nearbyStores: (params: { lat: number; lng: number; categoryId: string; radius?: number }) => requestData<{ stores: NearbyStore[] }>({ method: 'GET', url: '/menu/nearby-stores', params }),
  recipes: (categoryId: string, budget?: number) => requestData<{ categoryName: string; recipes: RecipeSummary[] }>({ method: 'GET', url: '/menu/recipes', params: { categoryId, budget } }),
  recipe: (recipeId: string) => requestData<RecipeDetail>({ method: 'GET', url: `/menu/recipes/${recipeId}` }),
  leftover: () => requestData<{ categoryName: string; recipes: RecipeSummary[] }>({ method: 'POST', url: '/menu/recommend/leftover' }),
  shoppingList: (recipeId: string) => requestData<ShoppingList>({ method: 'GET', url: `/menu/recipes/${recipeId}/shopping-list` }),
};

export const fridgeApi = {
  list: () => requestData<{ ingredients: FridgeIngredient[] }>({ method: 'GET', url: '/fridge/ingredients' }),
  create: (ingredients: { name: string; quantity: number; unit: string; expiryDate?: string }[]) => requestData<{ registeredCount: number }>({ method: 'POST', url: '/fridge/ingredients', data: { ingredients } }),
  update: (ingredientId: string, body: { quantity?: number; unit?: string; expiryDate?: string }) => requestData<null>({ method: 'PUT', url: `/fridge/ingredients/${ingredientId}`, data: body }),
  remove: (ingredientId: string) => requestData<null>({ method: 'DELETE', url: `/fridge/ingredients/${ingredientId}` }),
};

export const communityApi = {
  list: (page = 0, size = 20) => requestData<{ posts: CommunityPostSummary[] } & PageMeta>({ method: 'GET', url: '/community/posts', params: { page, size } }),
  detail: (postId: string) => requestData<CommunityPostDetail>({ method: 'GET', url: `/community/posts/${postId}` }),
  async analyzeImage(uri: string) {
    const data = await imageFormData(uri);
    return requestData<{ foodName: string; calorie: number; carb: number; protein: number; fat: number }>({ method: 'POST', url: '/community/analyze-image', data });
  },
  async create(body: { imageUri?: string; content: string; eatenAt?: string; calorie?: number; carb?: number; protein?: number; fat?: number }) {
    const data = body.imageUri ? await imageFormData(body.imageUri) : new FormData();
    data.append('content', body.content);
    if (body.eatenAt) data.append('eatenAt', body.eatenAt);
    for (const key of ['calorie', 'carb', 'protein', 'fat'] as const) {
      if (body[key] !== undefined) data.append(key, String(body[key]));
    }
    return requestData<{ postId: string }>({ method: 'POST', url: '/community/posts', data });
  },
  update: (postId: string, content: string) => requestData<null>({ method: 'PUT', url: `/community/posts/${postId}`, data: { content } }),
  remove: (postId: string) => requestData<null>({ method: 'DELETE', url: `/community/posts/${postId}` }),
  addComment: (postId: string, content: string, parentCommentId?: string) => requestData<{ commentId: string }>({ method: 'POST', url: `/community/posts/${postId}/comments`, data: { content, parentCommentId } }),
  updateComment: (postId: string, commentId: string, content: string) => requestData<null>({ method: 'PUT', url: `/community/posts/${postId}/comments/${commentId}`, data: { content } }),
  removeComment: (postId: string, commentId: string) => requestData<null>({ method: 'DELETE', url: `/community/posts/${postId}/comments/${commentId}` }),
  toggleLike: (postId: string) => requestData<{ isLiked: boolean; likeCount: number }>({ method: 'POST', url: `/community/posts/${postId}/likes` }),
};

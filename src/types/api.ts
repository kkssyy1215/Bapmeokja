export type GenderCode = 'M' | 'F';
export type ActivityLevelCode = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';
export type GoalCode = 'LOSE' | 'MAINTAIN' | 'GAIN';
export type TomatoStatus = 'NORMAL' | 'OVEREATEN' | 'HUNGRY';
export type MealTypeCode = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
export type PeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type DifficultyCode = 'EASY' | 'MEDIUM' | 'HARD';
export type DevicePlatform = 'IOS' | 'ANDROID';

export type ApiEnvelope<T> = {
  success: true;
  data: T;
  message: string;
  timestamp?: string;
};

export type ApiFailure = {
  success: false;
  data: null;
  message: string;
  errorCode: string;
  timestamp?: string;
};

export type PageMeta = {
  totalCount: number;
  page: number;
  size: number;
  hasNext: boolean;
};

export type LoginRequest = { username: string; password: string };
export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  userId: string;
  nickname: string;
};

export type RegisterRequest = {
  nickname: string;
  name: string;
  email: string;
  username: string;
  password: string;
  passwordConfirm: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
};

export type RegisterResponse = { userId: string; nickname: string; isNewUser: true };
export type DuplicateCheckResponse = { isDuplicated: boolean };
export type TokenResponse = { accessToken: string; refreshToken: string };

export type InitialProfileRequest = {
  gender: GenderCode;
  age: number;
  height: number;
  weight: number;
  activityLevel: ActivityLevelCode;
  goal: GoalCode;
  skeletalMuscleMass?: number;
  bodyFatMass?: number;
  bodyFatPercentage?: number;
};

export type NutritionGoals = {
  dailyCalorieGoal: number;
  carbGoalGram: number;
  proteinGoalGram: number;
  fatGoalGram: number;
  isPreciseMode?: boolean;
};

export type GoalProgress = {
  goalGram: number;
  consumedGram: number;
  percentage: number;
};

export type DashboardResponse = {
  nickname: string;
  date: string;
  tomatoStatus: TomatoStatus;
  calorieGoal: number;
  calorieConsumed: number;
  calorieRemaining: number;
  calorieExceeded: number;
  carb: GoalProgress;
  protein: GoalProgress;
  fat: GoalProgress;
};

export type DietItemInput = {
  itemId?: string;
  name: string;
  weightGram: number;
  calorie: number;
  carb: number;
  protein: number;
  fat: number;
};

export type AnalyzeDietResponse = {
  analyzeId: string;
  foodName: string;
  totalCalorie: number;
  totalCarb: number;
  totalProtein: number;
  totalFat: number;
  items: (DietItemInput & { itemId: string })[];
};

export type DietItemDetail = {
  itemId: string;
  name: string;
  totalWeightGram: number;
  totalCalorie: number;
  carb: number;
  protein: number;
  fat: number;
  sodium: number;
  cholesterol: number;
  ingredients: { name: string; weightGram: number }[];
};

export type CreateDietRecordRequest = {
  analyzeId?: string | null;
  mealType: MealTypeCode;
  eatenAt: string;
  items: DietItemInput[];
};

export type DietRecordSummary = {
  recordId: string;
  mealType: MealTypeCode;
  eatenAt: string;
  thumbnailUrl?: string;
  foodName: string;
  totalWeightGram: number;
  totalCalorie: number;
  carb: number;
  protein: number;
  fat: number;
};

export type FoodSearchItem = {
  foodId: string;
  name: string;
  baseWeightGram: number;
  calorie: number;
  carb: number;
  protein: number;
  fat: number;
};

export type DailyStatistics = {
  date: string;
  calorieGoal: number;
  calorieConsumed: number;
  caloriePercentage: number;
  carb: GoalProgress;
  protein: GoalProgress;
  fat: GoalProgress;
};

export type WeeklyStatistics = {
  startDate: string;
  endDate: string;
  daily: {
    date: string;
    calorieConsumed: number;
    calorieGoal: number;
    carbPercentage: number;
    proteinPercentage: number;
    fatPercentage: number;
  }[];
  weeklyAvgCalorie: number;
};

export type MonthlyStatistics = {
  year: number;
  month: number;
  daily: { date: string; calorieConsumed: number; calorieGoal: number }[];
  monthlyAvgCalorie: number;
  monthlyAvgCarbPercentage: number;
  monthlyAvgProteinPercentage: number;
  monthlyAvgFatPercentage: number;
};

export type AiFeedback = {
  period: string;
  periodType: PeriodType;
  calorieAnalysis: Record<string, string | number> & { comment: string };
  nutritionBalance: Record<string, string | number> & { comment: string };
  suggestions: string[];
  overallFeedback: string;
};

export type MenuSummary = {
  date: string;
  calorieRemaining: number;
  calorieGoal: number;
  calorieConsumed: number;
  carb: { percentage: number };
  protein: { percentage: number };
  fat: { percentage: number };
  defaultBudget: { diningOut: number; homeCooking: number };
};

export type RecommendationCategory = {
  categoryId: string;
  categoryName: string;
  iconUrl?: string;
  imageUrl?: string;
  reason: string;
  estimatedCost?: number;
  isWithinBudget?: boolean;
};

export type DiningMenuItem = {
  itemId: string;
  name: string;
  imageUrl: string;
  calorie: number;
  carb: number;
  protein: number;
  fat: number;
  avgPrice?: number;
  isWithinBudget?: boolean;
};

export type RecipeSummary = {
  recipeId: string;
  name: string;
  imageUrl: string;
  calorie: number;
  carb: number;
  protein: number;
  fat: number;
  cookingTimeMinutes: number;
  difficulty: DifficultyCode;
  estimatedCost: number;
  isWithinBudget: boolean;
};

export type RecipeDetail = Omit<RecipeSummary, 'isWithinBudget'> & {
  ingredients: {
    name: string;
    amount: string;
    alternatives: { name: string; reason: string }[];
  }[];
  steps: { stepNo: number; description: string }[];
};

export type NearbyStore = {
  storeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: number;
  menus: { name: string; calorie: number; price: number }[];
};

export type FridgeIngredient = {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  isExpiringSoon: boolean;
};

export type ShoppingList = {
  recipeId: string;
  recipeName: string;
  estimatedTotalCost: number;
  shoppingItems: {
    name: string;
    requiredAmount: string;
    inFridge: boolean;
    products: { mallName: string; productName: string; price: number; productUrl: string }[];
  }[];
  disclaimer: string;
};

export type CommunityPostSummary = {
  postId: string;
  title: string;
  authorNickname: string;
  createdAt: string;
  thumbnailUrl?: string;
  likeCount: number;
  commentCount: number;
};

export type CommunityPostDetail = {
  postId: string;
  content: string;
  imageUrl?: string;
  authorNickname: string;
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
  commentCount: number;
  nutritionInfo?: {
    foodName: string;
    calorie: number;
    carb: number;
    protein: number;
    fat: number;
  };
  comments: { commentId: string; authorNickname: string; content: string; createdAt: string; parentCommentId?: string | null }[];
};

export type NotificationSettingsRequest = {
  pushEnabled?: boolean;
  waterReminderEnabled?: boolean;
  breakfastTime?: string;
  lunchTime?: string;
  dinnerTime?: string;
  expiryAlertEnabled?: boolean;
};

export type NotificationSettingsResponse = {
  pushEnabled: boolean;
  waterReminderEnabled: boolean;
  breakfastTime: string | null;
  lunchTime: string | null;
  dinnerTime: string | null;
  expiryAlertEnabled: boolean;
};

export type UserProfileResponse = {
  nickname: string | null;
  name: string | null;
  email: string | null;
  gender: GenderCode | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  activityLevel: ActivityLevelCode | null;
  goal: GoalCode | null;
  dailyCalorieGoal: number | null;
  carbGoalGram: number | null;
  proteinGoalGram: number | null;
  fatGoalGram: number | null;
  skeletalMuscleMass?: number | null;
  bodyFatMass?: number | null;
  bodyFatPercentage?: number | null;
  isPreciseMode?: boolean;
  preciseMode?: boolean;
  notification: NotificationSettingsResponse | null;
  defaultBudget: { diningOut: number | null; homeCooking: number | null } | null;
};

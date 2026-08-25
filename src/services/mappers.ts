import { FridgeItem, Meal, MealType, NotificationSettings, UserProfile } from '@/types';
import {
  ActivityLevelCode,
  DashboardResponse,
  DietRecordSummary,
  FridgeIngredient,
  GoalCode,
  InitialProfileRequest,
  MealTypeCode,
  UserProfileResponse,
} from '@/types/api';

export { resolveApiAssetUrl } from '@/services/api';

const mealTypeToCode: Record<MealType, MealTypeCode> = {
  아침: 'BREAKFAST',
  점심: 'LUNCH',
  저녁: 'DINNER',
  간식: 'SNACK',
};

const mealTypeToLabel: Record<MealTypeCode, MealType> = {
  BREAKFAST: '아침',
  LUNCH: '점심',
  DINNER: '저녁',
  SNACK: '간식',
};

const activityToCode: Record<UserProfile['activity'], ActivityLevelCode> = {
  낮음: 'SEDENTARY',
  보통: 'MODERATE',
  높음: 'ACTIVE',
};

const goalToCode: Record<UserProfile['goal'], GoalCode> = {
  감량: 'LOSE',
  유지: 'MAINTAIN',
  증량: 'GAIN',
};

export function toMealTypeCode(value: MealType) {
  return mealTypeToCode[value];
}

export function toInitialProfileRequest(
  profile: Pick<UserProfile, 'gender' | 'age' | 'height' | 'weight' | 'activity' | 'goal' | 'skeletalMuscleMass' | 'bodyFatMass' | 'bodyFatPercentage'>,
): InitialProfileRequest {
  return {
    gender: profile.gender === '남성' ? 'M' : 'F',
    age: profile.age,
    height: profile.height,
    weight: profile.weight,
    activityLevel: activityToCode[profile.activity],
    goal: goalToCode[profile.goal],
    skeletalMuscleMass: profile.skeletalMuscleMass,
    bodyFatMass: profile.bodyFatMass,
    bodyFatPercentage: profile.bodyFatPercentage,
  };
}

export function profileFromApi(profile: UserProfileResponse): UserProfile {
  const activity: UserProfile['activity'] = profile.activityLevel && ['SEDENTARY', 'LIGHT'].includes(profile.activityLevel)
    ? '낮음'
    : profile.activityLevel === 'MODERATE' ? '보통' : '높음';
  const safeActivity = profile.activityLevel ? activity : '낮음';
  const goal: UserProfile['goal'] = profile.goal === 'LOSE' ? '감량' : profile.goal === 'GAIN' ? '증량' : '유지';
  return {
    name: profile.name ?? '',
    nickname: profile.nickname ?? '',
    email: profile.email ?? '',
    gender: profile.gender === 'M' ? '남성' : '여성',
    age: profile.age ?? 0,
    height: profile.height ?? 0,
    weight: profile.weight ?? 0,
    activity: safeActivity,
    goal,
    dailyCalories: profile.dailyCalorieGoal ?? 2000,
    carbGoal: profile.carbGoalGram ?? 250,
    proteinGoal: profile.proteinGoalGram ?? 125,
    fatGoal: profile.fatGoalGram ?? 55,
    skeletalMuscleMass: profile.skeletalMuscleMass ?? undefined,
    bodyFatMass: profile.bodyFatMass ?? undefined,
    bodyFatPercentage: profile.bodyFatPercentage ?? undefined,
    isPreciseMode: profile.isPreciseMode ?? profile.preciseMode ?? false,
    defaultDiningBudget: profile.defaultBudget?.diningOut ?? undefined,
    defaultHomeBudget: profile.defaultBudget?.homeCooking ?? undefined,
  };
}

export function notificationSettingsFromApi(profile: UserProfileResponse): NotificationSettings {
  const notification = profile.notification;
  return {
    pushEnabled: notification?.pushEnabled ?? false,
    waterReminder: notification?.waterReminderEnabled ?? false,
    mealReminder: Boolean(notification?.breakfastTime || notification?.lunchTime || notification?.dinnerTime),
    expiryAlert: notification?.expiryAlertEnabled ?? false,
    breakfastTime: notification?.breakfastTime ?? '08:00',
    lunchTime: notification?.lunchTime ?? '12:30',
    dinnerTime: notification?.dinnerTime ?? '19:00',
  };
}

export function mealFromApi(record: DietRecordSummary): Meal {
  return {
    id: record.recordId,
    type: mealTypeToLabel[record.mealType],
    name: record.foodName,
    emoji: record.mealType === 'BREAKFAST' ? '🥣' : record.mealType === 'SNACK' ? '🍎' : '🍽️',
    eatenAt: record.eatenAt,
    calories: record.totalCalorie,
    carbs: record.carb,
    protein: record.protein,
    fat: record.fat,
  };
}

function daysUntil(date?: string) {
  if (!date) return '';
  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return `D-${Math.max(0, Math.ceil((target.getTime() - today.getTime()) / 86_400_000))}`;
}

export function fridgeItemFromApi(item: FridgeIngredient): FridgeItem {
  return {
    id: item.ingredientId,
    name: item.name,
    quantity: `${item.quantity}${item.unit}`,
    expiry: daysUntil(item.expiryDate),
    quantityValue: item.quantity,
    unit: item.unit,
    expiryDate: item.expiryDate,
    isExpiringSoon: item.isExpiringSoon,
  };
}

export function createLocalDashboard(profile: UserProfile, meals: Meal[]): DashboardResponse {
  const todayKey = new Date().toLocaleDateString('en-CA');
  const todayMeals = meals.filter((meal) => meal.eatenAt.slice(0, 10) === todayKey);
  const consumed = todayMeals.reduce(
    (sum, meal) => ({ calories: sum.calories + meal.calories, carbs: sum.carbs + meal.carbs, protein: sum.protein + meal.protein, fat: sum.fat + meal.fat }),
    { calories: 0, carbs: 0, protein: 0, fat: 0 },
  );
  const progress = (value: number, goal: number) => ({ goalGram: goal, consumedGram: value, percentage: Math.round((value / goal) * 100) });
  return {
    nickname: profile.nickname,
    date: todayKey,
    tomatoStatus: consumed.calories > profile.dailyCalories ? 'OVEREATEN' : consumed.calories < profile.dailyCalories * 0.45 ? 'HUNGRY' : 'NORMAL',
    calorieGoal: profile.dailyCalories,
    calorieConsumed: consumed.calories,
    calorieRemaining: Math.max(0, profile.dailyCalories - consumed.calories),
    calorieExceeded: Math.max(0, consumed.calories - profile.dailyCalories),
    carb: progress(consumed.carbs, profile.carbGoal),
    protein: progress(consumed.protein, profile.proteinGoal),
    fat: progress(consumed.fat, profile.fatGoal),
  };
}

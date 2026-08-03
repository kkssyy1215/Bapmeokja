export type MealType = '아침' | '점심' | '저녁' | '간식';

export type Nutrients = {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
};

export type Meal = Nutrients & {
  id: string;
  type: MealType;
  name: string;
  emoji: string;
  eatenAt: string;
  confidence?: number;
};

export type UserProfile = {
  name: string;
  nickname: string;
  email: string;
  gender: '여성' | '남성';
  age: number;
  height: number;
  weight: number;
  activity: '낮음' | '보통' | '높음';
  goal: '감량' | '유지' | '증량';
  dailyCalories: number;
  carbGoal: number;
  proteinGoal: number;
  fatGoal: number;
};

export type NotificationSettings = {
  pushEnabled: boolean;
  waterReminder: boolean;
  mealReminder: boolean;
  expiryAlert: boolean;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
};

export type FridgeItem = {
  id: string;
  name: string;
  quantity: string;
  expiry: string;
};

export type Comment = { id: string; author: string; content: string; createdAt: string };

export type CommunityPost = {
  id: string;
  author: string;
  avatar: string;
  content: string;
  mealName: string;
  emoji: string;
  nutrients: Nutrients;
  likes: number;
  liked: boolean;
  createdAt: string;
  comments: Comment[];
};

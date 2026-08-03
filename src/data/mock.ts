import { CommunityPost, FridgeItem, Meal, NotificationSettings, UserProfile } from '@/types';

export const defaultProfile: UserProfile = {
  name: '김밥풀',
  nickname: '밥풀님',
  email: 'demo@bapmeokja.app',
  gender: '여성',
  age: 24,
  height: 163,
  weight: 55,
  activity: '보통',
  goal: '유지',
  dailyCalories: 2000,
  carbGoal: 260,
  proteinGoal: 95,
  fatGoal: 55,
};

export const initialMeals: Meal[] = [
  { id: 'meal-1', type: '아침', name: '그릭요거트와 블루베리', emoji: '🫐', eatenAt: new Date().toISOString(), calories: 318, carbs: 42, protein: 19, fat: 8 },
  { id: 'meal-2', type: '점심', name: '닭가슴살 포케', emoji: '🥗', eatenAt: new Date().toISOString(), calories: 542, carbs: 68, protein: 38, fat: 14 },
];

export const initialFridge: FridgeItem[] = [
  { id: 'fridge-1', name: '두부', quantity: '1모', expiry: 'D-2' },
  { id: 'fridge-2', name: '달걀', quantity: '6개', expiry: 'D-7' },
  { id: 'fridge-3', name: '애호박', quantity: '1개', expiry: 'D-3' },
];

export const initialNotifications: NotificationSettings = {
  pushEnabled: true,
  waterReminder: true,
  mealReminder: true,
  expiryAlert: true,
  breakfastTime: '08:00',
  lunchTime: '12:30',
  dinnerTime: '19:00',
};

export const initialPosts: CommunityPost[] = [
  {
    id: 'post-1', author: '건강한한끼', avatar: '🥑', content: '바쁜 날에도 채소 세 가지 챙기기 성공! 소스는 절반만 넣었어요.', mealName: '연어 아보카도 포케', emoji: '🥗',
    nutrients: { calories: 521, carbs: 57, protein: 31, fat: 19 }, likes: 34, liked: false, createdAt: '12분 전',
    comments: [{ id: 'comment-1', author: '토마토러버', content: '색감도 영양도 정말 좋네요!', createdAt: '5분 전' }],
  },
  {
    id: 'post-2', author: '오늘도집밥', avatar: '🍳', content: '냉장고에 남은 두부와 애호박으로 만든 한 끼예요. 20분 만에 완성!', mealName: '두부 애호박 덮밥', emoji: '🍲',
    nutrients: { calories: 486, carbs: 63, protein: 24, fat: 14 }, likes: 21, liked: true, createdAt: '1시간 전', comments: [],
  },
];

export const recommendations = {
  outside: [
    { id: 'out-1', name: '닭가슴살 포케', place: '포케올데이 · 도보 6분', emoji: '🥗', calories: 520, protein: 37, price: 10900, reason: '오늘 부족한 단백질을 채우기 좋아요' },
    { id: 'out-2', name: '들깨 순두부', place: '서울두부 · 도보 9분', emoji: '🍲', calories: 480, protein: 28, price: 10000, reason: '부담 없는 지방과 따뜻한 한 끼예요' },
    { id: 'out-3', name: '연어 샌드위치', place: '그린테이블 · 도보 11분', emoji: '🥪', calories: 455, protein: 25, price: 9500, reason: '남은 칼로리 안에서 균형이 좋아요' },
  ],
  home: [
    { id: 'home-1', name: '두부 달걀 덮밥', place: '약 20분 · 쉬움', emoji: '🍳', calories: 495, protein: 29, price: 4800, reason: '냉장고 재료 3개를 바로 활용해요' },
    { id: 'home-2', name: '애호박 닭가슴살 볶음', place: '약 25분 · 쉬움', emoji: '🍛', calories: 460, protein: 42, price: 5900, reason: '단백질 목표를 채우는 가장 빠른 조합이에요' },
    { id: 'home-3', name: '참치 두부전', place: '약 30분 · 보통', emoji: '🥘', calories: 410, protein: 31, price: 5200, reason: '남은 두부를 맛있게 소진할 수 있어요' },
  ],
};

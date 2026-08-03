import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { defaultProfile, initialFridge, initialMeals, initialNotifications, initialPosts } from '@/data/mock';
import { CommunityPost, FridgeItem, Meal, NotificationSettings, UserProfile } from '@/types';

type PersistedState = {
  isAuthenticated: boolean;
  profile: UserProfile;
  meals: Meal[];
  posts: CommunityPost[];
  fridgeItems: FridgeItem[];
  notifications: NotificationSettings;
};

type AppContextValue = PersistedState & {
  hydrated: boolean;
  signIn: () => void;
  signOut: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addMeal: (meal: Meal) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  createPost: (content: string, mealName: string) => void;
  addFridgeItem: (item: Omit<FridgeItem, 'id'>) => void;
  removeFridgeItem: (id: string) => void;
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
};

const STORAGE_KEY = '@bapmeokja/state/v1';
const initialState: PersistedState = {
  isAuthenticated: false,
  profile: defaultProfile,
  meals: initialMeals,
  posts: initialPosts,
  fridgeItems: initialFridge,
  notifications: initialNotifications,
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setState({ ...initialState, ...JSON.parse(saved) });
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const value = useMemo<AppContextValue>(() => ({
    ...state,
    hydrated,
    signIn: () => setState((prev) => ({ ...prev, isAuthenticated: true })),
    signOut: () => setState((prev) => ({ ...prev, isAuthenticated: false })),
    updateProfile: (profile) => setState((prev) => ({ ...prev, profile: { ...prev.profile, ...profile } })),
    addMeal: (meal) => setState((prev) => ({ ...prev, meals: [meal, ...prev.meals] })),
    toggleLike: (postId) => setState((prev) => ({
      ...prev,
      posts: prev.posts.map((post) => post.id === postId
        ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) }
        : post),
    })),
    addComment: (postId, content) => setState((prev) => ({
      ...prev,
      posts: prev.posts.map((post) => post.id === postId ? {
        ...post,
        comments: [...post.comments, { id: `comment-${Date.now()}`, author: prev.profile.nickname, content, createdAt: '방금 전' }],
      } : post),
    })),
    createPost: (content, mealName) => setState((prev) => ({
      ...prev,
      posts: [{
        id: `post-${Date.now()}`, author: prev.profile.nickname, avatar: '🍅', content, mealName,
        emoji: '🍽️', nutrients: { calories: 510, carbs: 64, protein: 29, fat: 16 }, likes: 0, liked: false,
        createdAt: '방금 전', comments: [],
      }, ...prev.posts],
    })),
    addFridgeItem: (item) => setState((prev) => ({ ...prev, fridgeItems: [...prev.fridgeItems, { ...item, id: `fridge-${Date.now()}` }] })),
    removeFridgeItem: (id) => setState((prev) => ({ ...prev, fridgeItems: prev.fridgeItems.filter((item) => item.id !== id) })),
    updateNotifications: (settings) => setState((prev) => ({ ...prev, notifications: { ...prev.notifications, ...settings } })),
  }), [hydrated, state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}

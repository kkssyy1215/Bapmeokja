import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { NotificationSettings } from '@/types';

const STORAGE_KEY = '@bapmeokja/local-notification-ids/v1';
const CHANNEL_ID = 'bapmeokja-reminders';

if (Platform.OS !== 'web') {
  void import('expo-notifications').then((Notifications) => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }).catch(() => undefined);
}

export type NotificationSyncResult = {
  status: 'scheduled' | 'disabled' | 'denied' | 'unsupported';
  scheduledCount: number;
};

function parseTime(value: string) {
  const [hour, minute] = value.split(':').map(Number);
  return { hour, minute };
}

async function cancelStoredNotifications() {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return;
  }

  const Notifications = await import('expo-notifications');
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  let identifiers: string[] = [];
  try {
    identifiers = stored ? JSON.parse(stored) : [];
  } catch {
    identifiers = [];
  }
  await Promise.all(identifiers.map((identifier) => Notifications.cancelScheduledNotificationAsync(identifier).catch(() => undefined)));
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function cancelLocalNotifications() {
  await cancelStoredNotifications();
}

export async function syncLocalNotifications(settings: NotificationSettings): Promise<NotificationSyncResult> {
  await cancelStoredNotifications();

  if (!settings.pushEnabled) return { status: 'disabled', scheduledCount: 0 };
  if (Platform.OS === 'web') return { status: 'unsupported', scheduledCount: 0 };

  const Notifications = await import('expo-notifications');
  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) return { status: 'denied', scheduledCount: 0 };

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: '식사와 건강 리마인더',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180, 120, 180],
      lightColor: '#E6532F',
    });
  }

  const identifiers: string[] = [];
  const meals = [
    { time: settings.breakfastTime, title: '아침 먹을 시간이에요', body: '가벼운 아침으로 오늘의 영양 기록을 시작해 볼까요?' },
    { time: settings.lunchTime, title: '점심 먹을 시간이에요', body: '점심을 먹고 오늘의 식단에 바로 기록해 보세요.' },
    { time: settings.dinnerTime, title: '저녁 먹을 시간이에요', body: '오늘 부족한 영양을 확인하고 저녁 메뉴를 골라 보세요.' },
  ];

  for (const meal of meals) {
    const { hour, minute } = parseTime(meal.time);
    identifiers.push(await Notifications.scheduleNotificationAsync({
      content: { title: meal.title, body: meal.body, data: { route: '/(tabs)/records' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CHANNEL_ID },
    }));
  }

  if (settings.waterReminder) {
    identifiers.push(await Notifications.scheduleNotificationAsync({
      content: { title: '물 한 잔 어떠세요?', body: '잠깐 쉬면서 수분을 채워 주세요. 💧' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 60 * 60 * 2, repeats: true, channelId: CHANNEL_ID },
    }));
  }

  if (settings.expiryAlert) {
    identifiers.push(await Notifications.scheduleNotificationAsync({
      content: { title: '냉장고 재료를 확인해 주세요', body: '유통기한이 가까운 재료가 있는지 확인하고 먼저 사용해 보세요.', data: { route: '/fridge' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 9, minute: 0, channelId: CHANNEL_ID },
    }));
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(identifiers));
  return { status: 'scheduled', scheduledCount: identifiers.length };
}

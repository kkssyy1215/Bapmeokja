import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Header, Icon, IconButton, ListGroup, ListRow, MealRow, Pressable, Screen } from '@/components/ui';
import { font, palette, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { isMockMode } from '@/services/api';
import { dietApi } from '@/services/bapmeokja-api';
import { mealFromApi } from '@/services/mappers';
import { Meal } from '@/types';

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function HistoryScreen() {
  const { meals } = useApp();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(dateKey(today));
  const [recordedDates, setRecordedDates] = useState<string[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMonth = useCallback(async () => {
    await Promise.resolve();
    if (isMockMode) {
      setRecordedDates(Array.from(new Set(meals.map((meal) => meal.eatenAt.slice(0, 10)))));
      return;
    }
    const result = await dietApi.getCalendar(cursor.getFullYear(), cursor.getMonth() + 1);
    setRecordedDates(result.recordedDates);
  }, [cursor, meals]);

  const loadDay = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      if (isMockMode) setSelectedMeals(meals.filter((meal) => meal.eatenAt.slice(0, 10) === selected));
      else setSelectedMeals((await dietApi.getRecords(selected)).records.map(mealFromApi));
    } finally {
      setLoading(false);
    }
  }, [meals, selected]);

  useEffect(() => {
    const timer = setTimeout(() => { loadMonth().catch(() => setRecordedDates([])); }, 0);
    return () => clearTimeout(timer);
  }, [loadMonth]);
  useEffect(() => {
    const timer = setTimeout(() => { loadDay().catch(() => setSelectedMeals([])); }, 0);
    return () => clearTimeout(timer);
  }, [loadDay]);

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const leading = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return [...Array.from({ length: leading }, () => null), ...Array.from({ length: days }, (_, index) => index + 1)];
  }, [cursor]);
  const totalCalories = selectedMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const selectedDate = new Date(`${selected}T00:00:00`);

  const moveMonth = (offset: number) => {
    const next = new Date(cursor.getFullYear(), cursor.getMonth() + offset, 1);
    setCursor(next);
    setSelected(dateKey(next));
  };

  return <Screen><Header title="식단 캘린더" subtitle={`${cursor.getFullYear()}년 ${cursor.getMonth() + 1}월`} left={<IconButton label="←" onPress={() => router.back()} />} right={<IconButton label="오늘" onPress={() => { setCursor(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(dateKey(today)); }} />} />
    <Card style={styles.calendar}><View style={styles.monthNav}><Pressable accessibilityRole="button" accessibilityLabel="이전 달" hitSlop={8} onPress={() => moveMonth(-1)}><Icon name="chevron-left" size={22} /></Pressable><Text style={styles.monthTitle}>{cursor.getFullYear()}.{String(cursor.getMonth() + 1).padStart(2, '0')}</Text><Pressable accessibilityRole="button" accessibilityLabel="다음 달" hitSlop={8} onPress={() => moveMonth(1)}><Icon name="chevron-right" size={22} /></Pressable></View><View style={styles.week}>{['일','월','화','수','목','금','토'].map((day) => <Text key={day} style={styles.weekDay}>{day}</Text>)}</View><View style={styles.grid}>{cells.map((day, index) => {
      if (!day) return <View key={`empty-${index}`} style={styles.date} />;
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const active = key === selected;
      return <Pressable key={key} style={[styles.date, active && styles.dateActive]} onPress={() => { setLoading(true); setSelected(key); }}><Text style={[styles.dateText, active && styles.dateTextActive]}>{day}</Text>{recordedDates.includes(key) ? <View style={[styles.dot, active && styles.dotActive]} /> : null}</Pressable>;
    })}</View></Card>
    <View style={styles.dailySummary}><Text style={styles.dailyTitle}>{selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}</Text><Text style={styles.total}>{totalCalories.toLocaleString()} kcal</Text></View>
    {loading ? <ActivityIndicator color={palette.tomato} /> : selectedMeals.length ? <ListGroup>{selectedMeals.map((meal) => <MealRow key={meal.id} meal={meal} onPress={() => router.push({ pathname: '/meal-analysis', params: { saved: '1', id: meal.id, type: meal.type, name: meal.name, eatenAt: meal.eatenAt, calories: String(meal.calories), carbs: String(meal.carbs), protein: String(meal.protein), fat: String(meal.fat) } })} />)}</ListGroup> : <Card><EmptyState icon="calendar" title="기록된 식단이 없어요" description="이 날짜에는 아직 저장한 식사가 없습니다." /></Card>}
    {selectedMeals.length ? <ListGroup><ListRow icon="zap" tone="accent" title="이날의 식단 피드백" subtitle="섭취량과 영양 균형을 확인해 보세요" onPress={() => router.push('/ai-feedback')} /></ListGroup> : null}
  </Screen>;
}

const styles = StyleSheet.create({
  calendar: { gap: spacing.sm },
  monthNav: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthTitle: { color: palette.ink, fontSize: 16, fontWeight: '600' },
  week: { flexDirection: 'row' },
  weekDay: { flex: 1, textAlign: 'center', color: palette.muted, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  date: { width: '14.285%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  dateActive: { backgroundColor: palette.accent },
  dateText: { color: palette.ink, fontSize: 14, fontWeight: '400' },
  dateTextActive: { color: palette.onAccent, fontWeight: '600' },
  dot: { position: 'absolute', bottom: 5, width: 4, height: 4, borderRadius: 2, backgroundColor: palette.tomatoFill },
  dotActive: { backgroundColor: palette.onAccent },
  dailySummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  dailyTitle: { ...font.heading, color: palette.ink },
  total: { color: palette.tomato, fontSize: 14, fontWeight: '500' },
});

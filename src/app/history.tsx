import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Header, IconButton, NutrientChips, Screen } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
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
    <Card style={styles.calendar}><View style={styles.monthNav}><Pressable onPress={() => moveMonth(-1)}><Text style={styles.navButton}>‹</Text></Pressable><Text style={styles.monthTitle}>{cursor.getFullYear()}.{String(cursor.getMonth() + 1).padStart(2, '0')}</Text><Pressable onPress={() => moveMonth(1)}><Text style={styles.navButton}>›</Text></Pressable></View><View style={styles.week}>{['일','월','화','수','목','금','토'].map((day) => <Text key={day} style={styles.weekDay}>{day}</Text>)}</View><View style={styles.grid}>{cells.map((day, index) => {
      if (!day) return <View key={`empty-${index}`} style={styles.date} />;
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const active = key === selected;
      return <Pressable key={key} style={[styles.date, active && styles.dateActive]} onPress={() => { setLoading(true); setSelected(key); }}><Text style={[styles.dateText, active && styles.dateTextActive]}>{day}</Text>{recordedDates.includes(key) ? <View style={[styles.dot, active && styles.dotActive]} /> : null}</Pressable>;
    })}</View></Card>
    <View style={styles.dailySummary}><View><Text style={styles.dateLabel}>{selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}</Text><Text style={styles.dailyTitle}>식단 기록</Text></View><View style={styles.calorieSummary}><Text style={styles.calorieValue}>{totalCalories.toLocaleString()}</Text><Text style={styles.calorieLabel}>총 kcal</Text></View></View>
    {loading ? <ActivityIndicator color={palette.tomato} /> : selectedMeals.length ? selectedMeals.map((meal) => <Pressable key={meal.id} style={styles.meal} onPress={() => router.push({ pathname: '/meal-analysis', params: { saved: '1', id: meal.id, type: meal.type, name: meal.name, eatenAt: meal.eatenAt, calories: String(meal.calories), carbs: String(meal.carbs), protein: String(meal.protein), fat: String(meal.fat) } })}><View style={styles.mealInitial}><Text style={styles.mealInitialText}>{meal.name.slice(0, 1)}</Text></View><View style={styles.info}><Text style={styles.type}>{meal.type} · {new Date(meal.eatenAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</Text><Text style={styles.name}>{meal.name}</Text><NutrientChips carbs={meal.carbs} protein={meal.protein} fat={meal.fat} /></View><Text style={styles.kcal}>{meal.calories}{`\n`}<Text style={styles.unit}>kcal</Text></Text></Pressable>) : <Card><EmptyState emoji="🍽️" title="기록된 식단이 없어요" description="이 날짜에는 아직 저장한 식사가 없습니다." /></Card>}
    {selectedMeals.length ? <Pressable style={styles.feedback} onPress={() => router.push('/ai-feedback')}><View><Text style={styles.feedbackTitle}>이날의 식단 피드백</Text><Text style={styles.feedbackText}>섭취량과 영양 균형을 자세히 확인해 보세요.</Text></View><Text style={styles.arrow}>›</Text></Pressable> : null}
  </Screen>;
}

const styles = StyleSheet.create({
  calendar: { gap: spacing.sm },
  monthNav: { minHeight: 35, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthTitle: { color: palette.ink, fontSize: 15, fontWeight: '900' },
  navButton: { color: palette.ink, fontSize: 28, paddingHorizontal: spacing.sm },
  week: { flexDirection: 'row' },
  weekDay: { flex: 1, textAlign: 'center', color: palette.muted, fontSize: 10, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  date: { width: '14.285%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md },
  dateActive: { backgroundColor: palette.tomato },
  dateText: { color: palette.ink, fontSize: 12, fontWeight: '700' },
  dateTextActive: { color: '#fff' },
  dot: { position: 'absolute', bottom: 7, width: 4, height: 4, borderRadius: 2, backgroundColor: palette.leaf },
  dotActive: { backgroundColor: '#fff' },
  dailySummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  dateLabel: { color: palette.tomato, fontSize: 11, fontWeight: '800' },
  dailyTitle: { ...font.title, color: palette.ink, fontSize: 24, marginTop: 3 },
  calorieSummary: { minWidth: 72, borderRadius: radii.md, backgroundColor: palette.leafSoft, padding: spacing.sm, alignItems: 'center' },
  calorieValue: { color: palette.leaf, fontWeight: '900', fontSize: 17 },
  calorieLabel: { color: palette.muted, fontSize: 8 },
  meal: { backgroundColor: palette.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: palette.line, padding: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  mealInitial: { width: 60, height: 65, backgroundColor: palette.surfaceWarm, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  mealInitialText: { color: palette.tomatoDark, fontSize: 20, fontWeight: '900' },
  info: { flex: 1, gap: 4 },
  type: { color: palette.tomato, fontSize: 10, fontWeight: '900' },
  name: { color: palette.ink, fontSize: 13, fontWeight: '800' },
  kcal: { color: palette.ink, textAlign: 'right', fontWeight: '900' },
  unit: { color: palette.muted, fontSize: 9 },
  feedback: { backgroundColor: palette.ink, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center' },
  feedbackTitle: { color: '#fff', fontWeight: '800' },
  feedbackText: { color: '#C7C2B9', fontSize: 10, marginTop: 3 },
  arrow: { color: '#fff', fontSize: 26, marginLeft: 'auto' },
});

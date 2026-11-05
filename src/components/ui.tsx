import Feather from '@expo/vector-icons/Feather';
import { Children, ComponentProps, Fragment, PropsWithChildren, ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable as RNPressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Switch as RNSwitch,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { font, palette, radii, shadow, shadowSm, spacing } from '@/constants/design';
import { Meal } from '@/types';

export type IconName = ComponentProps<typeof Feather>['name'];

export function Icon({ name, size = 20, color = palette.ink }: { name: IconName; size?: number; color?: string }) {
  return <Feather name={name} size={size} color={color} accessible={false} />;
}

/** 눌렀을 때 살짝 옅어지는 공통 터치 영역. 위치는 움직이지 않는다. */
export function Pressable({ style, disabled, ...props }: ComponentProps<typeof RNPressable>) {
  return (
    <RNPressable
      {...props}
      disabled={disabled}
      style={(state) => [
        disabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
        state.pressed && styles.pressed,
      ]}
    />
  );
}

export function Switch(props: ComponentProps<typeof RNSwitch>) {
  const webColors = Platform.OS === 'web' ? ({ activeThumbColor: palette.onAccent } as object) : {};
  return <RNSwitch thumbColor={palette.onAccent} trackColor={{ true: palette.accent, false: palette.sunken }} {...webColors} {...props} />;
}

export function Screen({ children, scroll = true, style }: PropsWithChildren<{ scroll?: boolean; style?: StyleProp<ViewStyle> }>) {
  const content = scroll ? (
    <ScrollView contentContainerStyle={[styles.screenContent, style]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : <View style={[styles.screenContent, styles.flex, style]}>{children}</View>;
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** 탭 화면은 왼쪽 정렬 큰 제목, 뒤로 가기가 있는 화면은 가운데 작은 제목을 쓴다. */
export function Header({ title, subtitle, left, right }: { title: string; subtitle?: string; left?: ReactNode; right?: ReactNode }) {
  if (!left) {
    return (
      <View style={styles.largeHeader}>
        <View style={styles.flex}>
          <Text style={styles.largeTitle}>{title}</Text>
          {subtitle ? <Text style={styles.largeSubtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    );
  }
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>{left}</View>
      <View style={styles.headerTitleWrap}>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.headerSide, styles.headerRight]}>{right}</View>
    </View>
  );
}

const iconLabels: Record<string, { icon: IconName; label: string }> = {
  '←': { icon: 'chevron-left', label: '뒤로' },
  '＋': { icon: 'plus', label: '글쓰기' },
  '⚙': { icon: 'settings', label: '설정' },
  '▦': { icon: 'calendar', label: '식단 달력' },
  '◫': { icon: 'calendar', label: '식단 달력' },
};

export function IconButton({ label, onPress, accessibilityLabel }: { label: string; onPress?: () => void; accessibilityLabel?: string }) {
  const mapped = iconLabels[label];
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? mapped?.label ?? label} hitSlop={8} style={styles.iconButton}>
      {mapped ? <Icon name={mapped.icon} size={label === '←' ? 24 : 20} /> : <Text style={styles.iconText}>{label}</Text>}
    </Pressable>
  );
}

export function PrimaryButton({ title, onPress, variant = 'primary', loading = false, disabled = false, icon }: { title: string; onPress?: () => void; variant?: 'primary' | 'secondary' | 'ghost'; loading?: boolean; disabled?: boolean; icon?: IconName }) {
  const inactive = disabled && !loading;
  const color = inactive ? palette.muted : variant === 'primary' ? palette.onAccent : palette.ink;
  const surface = inactive ? styles.buttonDisabled : variant === 'primary' ? styles.buttonPrimary : variant === 'secondary' ? styles.buttonSecondary : styles.buttonGhost;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" disabled={disabled || loading} style={[styles.button, surface]}>
      {loading ? <ActivityIndicator color={color} /> : <>
        {icon ? <Icon name={icon} size={18} color={color} /> : null}
        <Text style={[styles.buttonText, { color }]} numberOfLines={1}>{title}</Text>
      </>}
    </Pressable>
  );
}

export function Field({ label, error, onFocus, onBlur, style, ...props }: TextInputProps & { label?: string; error?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={palette.muted}
        accessibilityLabel={label}
        style={[styles.field, props.multiline && styles.fieldMultiline, focused && styles.fieldFocused, style]}
        onFocus={(event) => { setFocused(true); onFocus?.(event); }}
        onBlur={(event) => { setFocused(false); onBlur?.(event); }}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function SectionTitle({ title, action, onAction, small = false }: { title: string; action?: string; onAction?: () => void; small?: boolean }) {
  return <View style={[styles.sectionRow, small && styles.sectionRowSmall]}><Text style={small ? styles.sectionTitleSmall : styles.sectionTitle}>{title}</Text>{action ? <Pressable onPress={onAction} hitSlop={8}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}</View>;
}

export function Pill({ label, active = false, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }} style={[styles.pill, active && styles.pillActive]}><Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text></Pressable>;
}

/** 일간/주간/월간, 외식/집밥처럼 보기를 바꾸는 선택 막대 */
export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (value: T) => void }) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const active = option.value === value;
        return <Pressable key={option.value} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => onChange(option.value)} style={[styles.segment, active && styles.segmentActive]}><Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text></Pressable>;
      })}
    </View>
  );
}

export function MacroBar({ label, value, goal, color, unit = 'g' }: { label: string; value: number; goal: number; color: string; unit?: string }) {
  const percent = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  return (
    <View style={styles.macroWrap}>
      <View style={styles.macroTextRow}><Text style={styles.macroLabel}>{label}</Text><Text style={styles.macroValue}>{value}{unit !== '%' ? <Text style={styles.macroGoal}> / {goal}{unit}</Text> : unit}</Text></View>
      <View style={styles.track}><View style={[styles.fill, { width: `${percent}%`, backgroundColor: color }]} /></View>
    </View>
  );
}

/** 칼로리 달성률을 보여 주는 원형 게이지. 가운데에 캐릭터나 숫자를 넣는다. */
export function Ring({ percent, size = 128, stroke = 10, children }: PropsWithChildren<{ percent: number; size?: number; stroke?: number }>) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={palette.sunken} strokeWidth={stroke} fill="none" />
        {clamped > 0 ? <Circle cx={size / 2} cy={size / 2} r={radius} stroke={palette.tomatoFill} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${circumference * clamped / 100} ${circumference}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} /> : null}
      </Svg>
      {children}
    </View>
  );
}

export function NutrientChips({ carbs, protein, fat }: { carbs: number; protein: number; fat: number }) {
  return <Text style={styles.nutrients}>탄 {carbs}g · 단 {protein}g · 지 {fat}g</Text>;
}

/** 목록의 한 줄. 설정, 냉장고, 추천 바로가기 등에서 같은 모양으로 쓴다. */
export function ListRow({ icon, title, subtitle, right, onPress, tone = 'default' }: { icon?: IconName; title: string; subtitle?: string; right?: ReactNode; onPress?: () => void; tone?: 'default' | 'accent' | 'danger' }) {
  const color = tone === 'danger' ? palette.danger : palette.ink;
  const body = <>
    {icon ? <View style={[styles.rowIcon, tone === 'accent' && styles.rowIconAccent]}><Icon name={icon} size={18} color={tone === 'danger' ? palette.danger : tone === 'accent' ? palette.tomato : palette.slate} /></View> : null}
    <View style={styles.flex}>
      <Text style={[styles.rowTitle, { color }]}>{title}</Text>
      {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
    </View>
    {right ?? (onPress ? <Icon name="chevron-right" size={18} color={palette.muted} /> : null)}
  </>;
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>{body}</Pressable> : <View style={styles.row}>{body}</View>;
}

/** 여러 줄을 한 묶음으로 보여 준다. 줄 사이에는 얇은 구분선을 자동으로 넣는다. */
export function ListGroup({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const rows = Children.toArray(children);
  return <View style={[styles.group, style]}>{rows.map((row, index) => <Fragment key={index}>{index > 0 ? <View style={styles.separator} /> : null}{row}</Fragment>)}</View>;
}

const mealIcons: Record<string, IconName> = { 아침: 'sunrise', 점심: 'sun', 저녁: 'moon', 간식: 'coffee' };

export function MealRow({ meal, onPress }: { meal: Meal; onPress?: () => void }) {
  const time = new Date(meal.eatenAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <View style={[styles.rowIcon, styles.rowIconAccent]}><Icon name={mealIcons[meal.type] ?? 'circle'} size={18} color={palette.tomato} /></View>
      <View style={styles.flex}>
        <Text style={styles.rowTitle} numberOfLines={1}>{meal.name}</Text>
        <Text style={styles.rowSubtitle}>{meal.type} · {time}</Text>
      </View>
      <Text style={styles.mealKcal}>{meal.calories.toLocaleString()} kcal</Text>
    </Pressable>
  );
}

/** 짧은 안내 문구. 큰 안내 카드 대신 쓴다. */
export function Note({ children, icon = 'info' }: PropsWithChildren<{ icon?: IconName }>) {
  return <View style={styles.note}><Icon name={icon} size={15} color={palette.muted} /><Text style={styles.noteText}>{children}</Text></View>;
}

export function EmptyState({ icon = 'inbox', title, description }: { icon?: IconName; title: string; description: string }) {
  return <View style={styles.empty}><View style={styles.emptyIcon}><Icon name={icon} size={22} color={palette.tomato} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyDescription}>{description}</Text></View>;
}

const webNoOutline = Platform.select({ web: { outlineStyle: 'none' } as object, default: {} });

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: palette.background },
  screenContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 120, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
  card: { backgroundColor: palette.surface, borderRadius: radii.lg, padding: 18, ...shadow },
  largeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.md, paddingBottom: 6, paddingHorizontal: 2 },
  largeTitle: { ...font.title, color: palette.ink },
  largeSubtitle: { fontSize: 13, color: palette.muted, marginTop: 1 },
  header: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  headerSide: { width: 56, alignItems: 'flex-start' },
  headerRight: { alignItems: 'flex-end' },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', letterSpacing: -0.3, color: palette.ink },
  headerSubtitle: { fontSize: 12, color: palette.muted, marginTop: 1 },
  iconButton: { minWidth: 42, height: 42, borderRadius: 21, paddingHorizontal: 8, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', ...shadowSm },
  iconText: { fontSize: 13, fontWeight: '500', color: palette.ink },
  button: { minHeight: 52, flexDirection: 'row', gap: 8, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  buttonPrimary: { backgroundColor: palette.accent },
  buttonSecondary: { backgroundColor: palette.sunken },
  buttonGhost: { backgroundColor: 'transparent' },
  buttonDisabled: { backgroundColor: palette.sunken, opacity: 1 },
  buttonText: { fontSize: 16, fontWeight: '500', letterSpacing: -0.2 },
  pressed: { opacity: 0.65 },
  disabled: { opacity: 0.4 },
  fieldWrap: { gap: spacing.xs },
  fieldLabel: { color: palette.muted, fontSize: 13, marginLeft: 2 },
  field: { minHeight: 50, borderRadius: radii.md, paddingHorizontal: 14, backgroundColor: palette.sunken, borderWidth: 1.5, borderColor: 'transparent', color: palette.ink, fontSize: 15, ...webNoOutline },
  fieldMultiline: { minHeight: 120, paddingTop: 12, textAlignVertical: 'top' },
  fieldFocused: { backgroundColor: palette.surface, borderColor: palette.tomatoFill },
  error: { color: palette.danger, fontSize: 13, marginLeft: 2 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, paddingHorizontal: 2 },
  sectionRowSmall: { marginTop: spacing.xs, marginBottom: -6 },
  sectionTitle: { ...font.heading, color: palette.ink },
  sectionTitleSmall: { fontSize: 13, color: palette.muted },
  sectionAction: { color: palette.tomato, fontSize: 13, fontWeight: '500' },
  pill: { paddingHorizontal: 14, minHeight: 36, borderRadius: radii.pill, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', ...shadowSm },
  pillActive: { backgroundColor: palette.accent },
  pillText: { color: palette.ink, fontSize: 13, fontWeight: '500' },
  pillTextActive: { color: palette.onAccent },
  segmented: { flexDirection: 'row', backgroundColor: palette.sunken, borderRadius: radii.md, padding: 3 },
  segment: { flex: 1, minHeight: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: palette.surface, ...shadowSm },
  segmentText: { color: palette.muted, fontSize: 14, fontWeight: '500' },
  segmentTextActive: { color: palette.tomato, fontWeight: '600' },
  macroWrap: { gap: 7 },
  macroTextRow: { flexDirection: 'row', justifyContent: 'space-between' },
  macroLabel: { color: palette.ink, fontSize: 13, fontWeight: '500' },
  macroValue: { color: palette.ink, fontSize: 13, fontWeight: '600' },
  macroGoal: { color: palette.muted, fontWeight: '400' },
  track: { height: 8, borderRadius: 4, backgroundColor: palette.sunken, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  nutrients: { color: palette.muted, fontSize: 13, marginTop: 2 },
  group: { backgroundColor: palette.surface, borderRadius: radii.lg, paddingHorizontal: 14, paddingVertical: 2, ...shadow },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: palette.line, marginLeft: 50 },
  row: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  rowIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: palette.sunken, alignItems: 'center', justifyContent: 'center' },
  rowIconAccent: { backgroundColor: palette.accentSoft },
  rowTitle: { color: palette.ink, fontSize: 15, fontWeight: '500', letterSpacing: -0.2 },
  rowSubtitle: { color: palette.muted, fontSize: 13, marginTop: 2 },
  mealKcal: { color: palette.ink, fontSize: 14, fontWeight: '500' },
  note: { flexDirection: 'row', gap: 6, paddingHorizontal: 4 },
  noteText: { flex: 1, color: palette.muted, fontSize: 13, lineHeight: 18 },
  empty: { alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.md, gap: 4 },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: palette.accentSoft, marginBottom: 8, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { ...font.subheading, color: palette.ink },
  emptyDescription: { ...font.caption, color: palette.muted, textAlign: 'center' },
});

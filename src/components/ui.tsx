import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { font, palette, radii, shadow, spacing } from '@/constants/design';

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

export function Header({ title, subtitle, left, right }: { title: string; subtitle?: string; left?: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>{left}</View>
      <View style={styles.headerTitleWrap}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.headerSide, styles.headerRight]}>{right}</View>
    </View>
  );
}

export function IconButton({ label, onPress, accessibilityLabel }: { label: string; onPress?: () => void; accessibilityLabel?: string }) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><Text style={styles.iconText}>{label}</Text></Pressable>;
}

export function PrimaryButton({ title, onPress, variant = 'primary', loading = false, disabled = false }: { title: string; onPress?: () => void; variant?: 'primary' | 'secondary' | 'ghost'; loading?: boolean; disabled?: boolean }) {
  const content = loading ? <ActivityIndicator color={variant === 'primary' ? '#fff' : palette.tomato} /> : <Text style={[styles.buttonText, variant !== 'primary' && styles.buttonTextSecondary]}>{title}</Text>;
  if (variant === 'primary') {
    return (
      <Pressable onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [styles.buttonOuter, (pressed || disabled) && styles.pressed]}>
        <LinearGradient colors={[palette.tomato, '#F47C55']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>{content}</LinearGradient>
      </Pressable>
    );
  }
  return <Pressable onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [styles.button, variant === 'secondary' ? styles.buttonSecondary : styles.buttonGhost, pressed && styles.pressed]}>{content}</Pressable>;
}

export function Field({ label, error, ...props }: TextInputProps & { label?: string; error?: string }) {
  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput placeholderTextColor="#AAA49A" style={[styles.field, props.multiline && styles.fieldMultiline]} {...props} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <View style={styles.sectionRow}><Text style={styles.sectionTitle}>{title}</Text>{action ? <Pressable onPress={onAction}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}</View>;
}

export function Pill({ label, active = false, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}><Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text></Pressable>;
}

export function MacroBar({ label, value, goal, color, unit = 'g' }: { label: string; value: number; goal: number; color: string; unit?: string }) {
  const percent = Math.min(100, Math.round((value / goal) * 100));
  return (
    <View style={styles.macroWrap}>
      <View style={styles.macroTextRow}><Text style={styles.macroLabel}>{label}</Text><Text style={styles.macroValue}>{value}{unit} <Text style={styles.macroGoal}>/ {goal}{unit}</Text></Text></View>
      <View style={styles.track}><View style={[styles.fill, { width: `${percent}%`, backgroundColor: color }]} /></View>
    </View>
  );
}

export function NutrientChips({ carbs, protein, fat }: { carbs: number; protein: number; fat: number }) {
  return <View style={styles.chips}><Text style={[styles.chip, { backgroundColor: palette.leafSoft }]}>탄 {carbs}g</Text><Text style={[styles.chip, { backgroundColor: palette.yellowSoft }]}>단 {protein}g</Text><Text style={[styles.chip, { backgroundColor: palette.tomatoSoft }]}>지 {fat}g</Text></View>;
}

export function EmptyState({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return <View style={styles.empty}><Text style={styles.emptyEmoji}>{emoji}</Text><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyDescription}>{description}</Text></View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: palette.background },
  screenContent: { paddingHorizontal: spacing.md, paddingBottom: 110, gap: spacing.md, width: '100%', maxWidth: 680, alignSelf: 'center' },
  card: { backgroundColor: palette.surface, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: '#F0ECE4', ...shadow },
  header: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  headerSide: { width: 48, alignItems: 'flex-start' },
  headerRight: { alignItems: 'flex-end' },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  headerTitle: { ...font.heading, color: palette.ink },
  headerSubtitle: { ...font.caption, color: palette.muted, marginTop: 2 },
  iconButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: palette.line },
  iconText: { fontSize: 19 },
  buttonOuter: { borderRadius: radii.md, overflow: 'hidden' },
  button: { minHeight: 54, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  buttonSecondary: { backgroundColor: palette.surface, borderWidth: 1.5, borderColor: palette.tomato },
  buttonGhost: { backgroundColor: 'transparent' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  buttonTextSecondary: { color: palette.tomato },
  pressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
  fieldWrap: { gap: spacing.xs },
  fieldLabel: { color: palette.ink, fontSize: 13, fontWeight: '700', marginLeft: 2 },
  field: { minHeight: 52, borderRadius: radii.md, paddingHorizontal: spacing.md, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, color: palette.ink, fontSize: 15 },
  fieldMultiline: { minHeight: 120, paddingTop: spacing.md, textAlignVertical: 'top' },
  error: { color: palette.danger, fontSize: 12 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  sectionTitle: { ...font.heading, color: palette.ink },
  sectionAction: { color: palette.tomato, fontSize: 13, fontWeight: '700' },
  pill: { paddingHorizontal: 15, minHeight: 38, borderRadius: radii.pill, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: palette.ink, borderColor: palette.ink },
  pillText: { color: palette.muted, fontSize: 13, fontWeight: '700' },
  pillTextActive: { color: '#fff' },
  macroWrap: { gap: spacing.xs },
  macroTextRow: { flexDirection: 'row', justifyContent: 'space-between' },
  macroLabel: { color: palette.ink, fontSize: 13, fontWeight: '700' },
  macroValue: { color: palette.ink, fontSize: 13, fontWeight: '800' },
  macroGoal: { color: palette.muted, fontWeight: '500' },
  track: { height: 10, borderRadius: 5, backgroundColor: '#EEEAE2', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
  chips: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  chip: { overflow: 'hidden', borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 6, color: palette.ink, fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg, gap: spacing.xs },
  emptyEmoji: { fontSize: 42 },
  emptyTitle: { ...font.subheading, color: palette.ink },
  emptyDescription: { ...font.body, color: palette.muted, textAlign: 'center' },
});

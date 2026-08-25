import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Field, PrimaryButton, Screen } from '@/components/ui';
import { font, palette, radii, shadow, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';

export default function LoginScreen() {
  const { hydrated, isAuthenticated, login, apiMode } = useApp();
  const [username, setUsername] = useState(apiMode === 'mock' ? 'demo' : '');
  const [password, setPassword] = useState(apiMode === 'mock' ? '1234' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!hydrated) return <View style={styles.loader}><ActivityIndicator color={palette.tomato} /></View>;
  if (isAuthenticated && !loading) return <Redirect href="/(tabs)/home" />;

  const submit = async () => {
    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해 주세요.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await login({ username: username.trim(), password });
      router.replace(result.isNewUser ? '/onboarding' : '/(tabs)/home');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '로그인하지 못했어요.');
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.content}>
      <View style={styles.hero}>
        <View style={styles.mascotWrap}><Text style={styles.mascot}>🍅</Text></View>
        <Text style={styles.logo}>밥 먹자!</Text>
        <Text style={styles.tagline}>오늘 먹은 것을 가볍게 기록해 보세요</Text>
      </View>
      <View style={styles.formCard}>
        <View style={styles.formTitleRow}><Text style={styles.formTitle}>로그인</Text><Text style={styles.mode}>{apiMode === 'mock' ? '로컬 데모' : '서버 연결'}</Text></View>
        <Field label="아이디" value={username} onChangeText={setUsername} placeholder="아이디를 입력하세요" autoCapitalize="none" />
        <Field label="비밀번호" value={password} onChangeText={setPassword} placeholder="비밀번호를 입력하세요" secureTextEntry error={error} />
        <Pressable><Text style={styles.forgot}>비밀번호를 잊으셨나요?</Text></Pressable>
        <PrimaryButton title="로그인" onPress={submit} loading={loading} />
        {apiMode === 'mock' ? <Pressable style={styles.demoNote} onPress={submit}><Text style={styles.demoNoteTitle}>빠른 시연</Text><Text style={styles.demoNoteText}>입력된 데모 계정으로 바로 시작</Text></Pressable> : null}
        <View style={styles.signupRow}><Text style={styles.signupText}>처음 오셨나요?</Text><Pressable onPress={() => router.push('/signup')}><Text style={styles.signupLink}> 회원가입</Text></Pressable></View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.background },
  content: { paddingTop: spacing.lg, justifyContent: 'center' },
  hero: { minHeight: 220, borderRadius: radii.xl, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: palette.surfaceWarm },
  mascotWrap: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFE0D4' },
  mascot: { fontSize: 68 },
  logo: { fontSize: 34, fontWeight: '900', color: palette.ink, letterSpacing: -1.2, marginTop: 12 },
  tagline: { ...font.body, color: palette.muted, marginTop: 4 },
  formCard: { backgroundColor: palette.surface, borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md, marginTop: -18, marginHorizontal: 10, ...shadow },
  formTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  formTitle: { ...font.heading, color: palette.ink },
  mode: { color: palette.leaf, backgroundColor: palette.leafSoft, overflow: 'hidden', borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 5, fontSize: 10, fontWeight: '800' },
  forgot: { color: palette.muted, fontSize: 12, textAlign: 'right', marginTop: -8 },
  demoNote: { backgroundColor: palette.surfaceWarm, borderRadius: radii.md, padding: spacing.sm, alignItems: 'center' },
  demoNoteTitle: { color: palette.ink, fontSize: 12, fontWeight: '800' },
  demoNoteText: { color: palette.muted, fontSize: 10, marginTop: 2 },
  signupRow: { flexDirection: 'row', justifyContent: 'center' }, signupText: { color: palette.muted, fontSize: 13 }, signupLink: { color: palette.tomato, fontSize: 13, fontWeight: '800' },
});

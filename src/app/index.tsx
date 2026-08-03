import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Field, PrimaryButton, Screen } from '@/components/ui';
import { font, palette, radii, shadow, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { simulateRequest } from '@/services/api';

export default function LoginScreen() {
  const { hydrated, isAuthenticated, signIn } = useApp();
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!hydrated) return <View style={styles.loader}><ActivityIndicator color={palette.tomato} /></View>;
  if (isAuthenticated) return <Redirect href="/(tabs)/home" />;

  const login = async () => {
    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해 주세요.');
      return;
    }
    setLoading(true);
    await simulateRequest(true, 500);
    signIn();
    setLoading(false);
  };

  return (
    <Screen style={styles.content}>
      <LinearGradient colors={['#FFF3D8', '#FFE3DE']} style={styles.hero}>
        <View style={styles.brandBadge}><Text style={styles.brandBadgeText}>AI 영양 코치</Text></View>
        <Text style={styles.mascot}>🍅</Text>
        <Text style={styles.logo}>밥 먹자!</Text>
        <Text style={styles.tagline}>잘 먹는 하루가, 더 나은 나를 만들어요</Text>
      </LinearGradient>
      <View style={styles.formCard}>
        <View style={styles.formTitleRow}><Text style={styles.formTitle}>다시 만나서 반가워요</Text><Text style={styles.wave}>👋</Text></View>
        <Field label="아이디" value={username} onChangeText={setUsername} placeholder="아이디를 입력하세요" autoCapitalize="none" />
        <Field label="비밀번호" value={password} onChangeText={setPassword} placeholder="비밀번호를 입력하세요" secureTextEntry error={error} />
        <Pressable><Text style={styles.forgot}>비밀번호를 잊으셨나요?</Text></Pressable>
        <PrimaryButton title="로그인" onPress={login} loading={loading} />
        <View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.dividerText}>또는</Text><View style={styles.divider} /></View>
        <PrimaryButton title="데모 계정으로 바로 시작" variant="secondary" onPress={login} />
        <View style={styles.signupRow}><Text style={styles.signupText}>처음 오셨나요?</Text><Pressable onPress={() => router.push('/signup')}><Text style={styles.signupLink}> 회원가입</Text></Pressable></View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.background },
  content: { paddingTop: spacing.sm, justifyContent: 'center' },
  hero: { minHeight: 260, borderRadius: radii.xl, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, overflow: 'hidden' },
  brandBadge: { position: 'absolute', top: 18, left: 18, borderRadius: radii.pill, backgroundColor: 'rgba(255,255,255,.75)', paddingHorizontal: 12, paddingVertical: 7 },
  brandBadgeText: { color: palette.tomatoDark, fontSize: 11, fontWeight: '800' },
  mascot: { fontSize: 76 },
  logo: { fontSize: 36, fontWeight: '900', color: palette.ink, letterSpacing: -1.2, marginTop: 4 },
  tagline: { ...font.body, color: palette.muted, marginTop: 6 },
  formCard: { backgroundColor: palette.surface, borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md, marginTop: -32, marginHorizontal: 10, ...shadow },
  formTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  formTitle: { ...font.heading, color: palette.ink }, wave: { fontSize: 20 },
  forgot: { color: palette.muted, fontSize: 12, textAlign: 'right', marginTop: -8 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, divider: { flex: 1, height: 1, backgroundColor: palette.line }, dividerText: { color: palette.muted, fontSize: 11 },
  signupRow: { flexDirection: 'row', justifyContent: 'center' }, signupText: { color: palette.muted, fontSize: 13 }, signupLink: { color: palette.tomato, fontSize: 13, fontWeight: '800' },
});

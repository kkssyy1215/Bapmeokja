import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Field, PrimaryButton, Screen, Pressable } from '@/components/ui';
import { font, palette, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';

const character = require('../../assets/characters/tomato-balanced.png');

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
        <View style={styles.characterWrap}><Image source={character} style={styles.character} contentFit="contain" accessibilityLabel="토마토 캐릭터" /></View>
        <Text style={styles.logo}>밥 먹자!</Text>
        <Text style={styles.tagline}>오늘 먹은 것을 가볍게 기록해 보세요</Text>
      </View>
      <View style={styles.form}>
        <Field label="아이디" value={username} onChangeText={setUsername} placeholder="아이디를 입력하세요" autoCapitalize="none" autoComplete="username" textContentType="username" />
        <Field label="비밀번호" value={password} onChangeText={setPassword} placeholder="비밀번호를 입력하세요" secureTextEntry autoComplete="current-password" textContentType="password" returnKeyType="done" onSubmitEditing={submit} error={error} />
        <PrimaryButton title="로그인" onPress={submit} loading={loading} />
        <View style={styles.signupRow}><Text style={styles.signupText}>처음 오셨나요?</Text><Pressable onPress={() => router.push('/signup')}><Text style={styles.signupLink}> 회원가입</Text></Pressable></View>
      </View>
      <Text style={styles.mode}>{apiMode === 'mock' ? '로컬 데모' : '서버 연결'}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.background },
  content: { paddingTop: spacing.xl, gap: spacing.xl },
  hero: { alignItems: 'center', paddingTop: spacing.lg },
  characterWrap: { width: 150, height: 150, borderRadius: 75, backgroundColor: palette.accentSoft, alignItems: 'center', justifyContent: 'center' },
  character: { width: 108, height: 118 },
  logo: { fontFamily: 'Jua', fontSize: 38, lineHeight: 46, color: palette.tomato, marginTop: spacing.md },
  tagline: { ...font.body, color: palette.muted, marginTop: 4 },
  form: { gap: spacing.md },
  mode: { color: palette.muted, fontSize: 12, textAlign: 'center' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 2 },
  signupText: { color: palette.muted, fontSize: 14 },
  signupLink: { color: palette.tomato, fontSize: 14, fontWeight: '500' },
});

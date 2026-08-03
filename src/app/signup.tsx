import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Field, Header, IconButton, PrimaryButton, Screen } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';

export default function SignupScreen() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(true);

  return (
    <Screen>
      <Header title="회원가입" left={<IconButton label="←" onPress={() => router.back()} accessibilityLabel="뒤로 가기" />} />
      <View style={styles.intro}><Text style={styles.eyebrow}>반가워요!</Text><Text style={styles.title}>나만의 영양 코치를{`\n`}만들어 볼까요?</Text><Text style={styles.description}>기본 계정 정보만 입력하면 바로 시작할 수 있어요.</Text></View>
      <View style={styles.form}>
        <Field label="이름" placeholder="이름을 입력하세요" />
        <Field label="닉네임" placeholder="앱에서 사용할 이름" />
        <Field label="이메일" placeholder="example@email.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="아이디" placeholder="영문·숫자 4자 이상" autoCapitalize="none" />
        <Field label="비밀번호" value={password} onChangeText={setPassword} placeholder="문자·숫자 포함 8자 이상" secureTextEntry />
        <Field label="비밀번호 확인" value={confirm} onChangeText={setConfirm} placeholder="비밀번호를 다시 입력하세요" secureTextEntry error={confirm && password !== confirm ? '비밀번호가 일치하지 않아요.' : undefined} />
      </View>
      <Text onPress={() => setAgreed((value) => !value)} style={[styles.agree, agreed && styles.agreeActive]}>{agreed ? '✓' : '○'} 이용약관 및 개인정보 처리방침에 동의합니다.</Text>
      <PrimaryButton title="다음" disabled={!agreed || !password || password !== confirm} onPress={() => router.push('/onboarding')} />
      <Text style={styles.hint}>발표용 데모에서는 중복 확인과 이메일 인증이 목업 처리됩니다.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { paddingVertical: spacing.md, gap: spacing.sm },
  eyebrow: { color: palette.tomato, fontWeight: '800', fontSize: 14 },
  title: { ...font.title, color: palette.ink, lineHeight: 37 },
  description: { ...font.body, color: palette.muted },
  form: { gap: spacing.md },
  agree: { padding: spacing.md, borderRadius: radii.md, color: palette.muted, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, fontSize: 13 },
  agreeActive: { color: palette.leaf, borderColor: '#A9CDB2', backgroundColor: palette.leafSoft },
  hint: { ...font.caption, color: palette.muted, textAlign: 'center' },
});

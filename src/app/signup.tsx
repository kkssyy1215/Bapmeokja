import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Field, Header, IconButton, PrimaryButton, Screen, Pressable } from '@/components/ui';
import { font, palette, radii, shadow, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';

type CheckState = 'idle' | 'checking' | 'available' | 'duplicate';

export default function SignupScreen() {
  const { registerAccount, checkDuplicate, login } = useApp();
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [checks, setChecks] = useState<Record<'username' | 'email' | 'nickname', CheckState>>({ username: 'idle', email: 'idle', nickname: 'idle' });
  const [loading, setLoading] = useState(false);

  const passwordValid = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const nicknameValid = nickname.trim().length >= 2 && nickname.trim().length <= 20;
  const usernameValid = /^[A-Za-z0-9]{4,20}$/.test(username);
  const checksDone = Object.values(checks).every((value) => value === 'available');
  const canSubmit = useMemo(() => Boolean(name.trim() && nicknameValid && emailValid && usernameValid && passwordValid && password.length <= 72 && password === confirm && agreeTerms && agreePrivacy && checksDone), [name, nicknameValid, emailValid, usernameValid, passwordValid, password, confirm, agreeTerms, agreePrivacy, checksDone]);

  const runCheck = async (field: 'username' | 'email' | 'nickname', value: string) => {
    if (!value.trim()) return;
    setChecks((prev) => ({ ...prev, [field]: 'checking' }));
    try {
      const result = await checkDuplicate(field, value.trim());
      setChecks((prev) => ({ ...prev, [field]: result.isDuplicated ? 'duplicate' : 'available' }));
    } catch (error) {
      setChecks((prev) => ({ ...prev, [field]: 'idle' }));
      Alert.alert('중복 확인 실패', error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.');
    }
  };

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    let registered = false;
    try {
      await registerAccount({ name: name.trim(), nickname: nickname.trim(), email: email.trim(), username: username.trim(), password, passwordConfirm: confirm, agreeTerms, agreePrivacy });
      registered = true;
      await login({ username: username.trim(), password });
      setLoading(false);
      Alert.alert('가입 완료', '이제 기본 정보를 설정할게요.');
      router.replace('/onboarding');
    } catch (error) {
      if (registered) {
        setLoading(false);
        Alert.alert('가입 완료', '자동 로그인에 실패했어요. 방금 만든 계정으로 로그인해 주세요.');
        router.replace('/');
        return;
      }
      Alert.alert('회원가입을 완료하지 못했어요', error instanceof Error ? error.message : '입력한 정보를 확인해 주세요.');
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Header title="회원가입" left={<IconButton label="←" onPress={() => router.back()} accessibilityLabel="뒤로 가기" />} />
      <View style={styles.intro}><Text style={styles.title}>계정을 만들고{`\n`}식단 기록을 시작해요</Text><Text style={styles.description}>중복 확인이 필요한 항목은 입력 후 확인해 주세요.</Text></View>
      <View style={styles.form}>
        <Field label="이름" value={name} onChangeText={setName} placeholder="이름" maxLength={30} autoComplete="name" textContentType="name" />
        <CheckedField label="닉네임" value={nickname} maxLength={20} canCheck={nicknameValid} onChange={(value) => { setNickname(value); setChecks((prev) => ({ ...prev, nickname: 'idle' })); }} state={checks.nickname} onCheck={() => runCheck('nickname', nickname)} error={nickname && !nicknameValid ? '닉네임은 2~20자로 입력해 주세요.' : undefined} />
        <CheckedField label="이메일" value={email} maxLength={254} canCheck={emailValid} keyboard="email-address" onChange={(value) => { setEmail(value); setChecks((prev) => ({ ...prev, email: 'idle' })); }} state={checks.email} onCheck={() => runCheck('email', email)} error={email && !emailValid ? '이메일 형식을 확인해 주세요.' : undefined} />
        <CheckedField label="아이디" value={username} maxLength={20} canCheck={usernameValid} onChange={(value) => { setUsername(value); setChecks((prev) => ({ ...prev, username: 'idle' })); }} state={checks.username} onCheck={() => runCheck('username', username)} error={username && !usernameValid ? '영문과 숫자만 사용해 4~20자로 입력해 주세요.' : undefined} />
        <Field label="비밀번호" value={password} onChangeText={setPassword} placeholder="영문·숫자·특수문자 포함 8자 이상" secureTextEntry maxLength={72} autoComplete="new-password" textContentType="newPassword" error={password && !passwordValid ? '영문, 숫자, 특수문자를 모두 포함해 주세요.' : undefined} />
        <Field label="비밀번호 확인" value={confirm} onChangeText={setConfirm} placeholder="비밀번호를 다시 입력하세요" secureTextEntry maxLength={72} autoComplete="new-password" textContentType="newPassword" error={confirm && password !== confirm ? '비밀번호가 일치하지 않아요.' : undefined} />
      </View>
      <View style={styles.agreementCard}>
        <Agreement checked={agreeTerms} label="이용약관 동의 (필수)" onPress={() => setAgreeTerms((value) => !value)} onView={() => router.push('/settings/legal')} />
        <View style={styles.line} />
        <Agreement checked={agreePrivacy} label="개인정보 처리방침 동의 (필수)" onPress={() => setAgreePrivacy((value) => !value)} onView={() => router.push('/settings/legal')} />
      </View>
      <PrimaryButton title="회원가입" disabled={!canSubmit} loading={loading} onPress={submit} />
    </Screen>
  );
}

function CheckedField({ label, value, onChange, onCheck, state, keyboard, error, canCheck, maxLength }: { label: string; value: string; onChange: (value: string) => void; onCheck: () => void; state: CheckState; keyboard?: 'email-address'; error?: string; canCheck: boolean; maxLength: number }) {
  const status = state === 'duplicate' ? '이미 사용 중이에요.' : error;
  return <View style={styles.checkedWrap}><Field label={label} value={value} onChangeText={onChange} keyboardType={keyboard} autoCapitalize="none" maxLength={maxLength} autoComplete={keyboard === 'email-address' ? 'email' : 'off'} textContentType={keyboard === 'email-address' ? 'emailAddress' : 'none'} error={status} />{state === 'available' ? <Text style={styles.success}>사용 가능해요.</Text> : null}<Pressable style={[styles.checkButton, state === 'available' && styles.checkButtonDone, !canCheck && styles.checkButtonDisabled]} onPress={onCheck} disabled={!canCheck || state === 'checking'}><Text style={[styles.checkText, state === 'available' && styles.checkTextDone]}>{state === 'checking' ? '확인 중' : state === 'available' ? '확인됨' : '중복 확인'}</Text></Pressable></View>;
}

function Agreement({ checked, label, onPress, onView }: { checked: boolean; label: string; onPress: () => void; onView: () => void }) {
  return <View style={styles.agreement}><Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onPress} style={styles.agreementCheck}><Text style={[styles.checkCircle, checked && styles.checkCircleActive]}>{checked ? '✓' : ''}</Text><Text style={styles.agreementText}>{label}</Text></Pressable><Pressable accessibilityRole="link" onPress={onView} hitSlop={8}><Text style={styles.viewLegal}>보기</Text></Pressable></View>;
}

const styles = StyleSheet.create({
  intro: { paddingVertical: spacing.md, gap: spacing.sm },
  title: { ...font.title, color: palette.ink, lineHeight: 37 },
  description: { ...font.body, color: palette.muted },
  form: { gap: spacing.md },
  checkedWrap: { position: 'relative' },
  checkButton: { position: 'absolute', right: 7, top: 31, minWidth: 72, height: 34, borderRadius: 17, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9 },
  checkButtonDone: { backgroundColor: palette.sunken },
  checkButtonDisabled: { opacity: 0.45 },
  checkText: { fontSize: 12, fontWeight: '500', color: palette.ink },
  checkTextDone: { color: palette.leaf },
  success: { color: palette.leaf, fontSize: 12 },
  agreementCard: { backgroundColor: palette.surface, borderRadius: radii.md, paddingHorizontal: spacing.md, ...shadow },
  agreement: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  agreementCheck: { flex: 1, minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  agreementText: { color: palette.ink, fontSize: 13, fontWeight: '500' },
  viewLegal: { color: palette.muted, fontSize: 13, textDecorationLine: 'underline' },
  checkCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#C4C8CD', overflow: 'hidden', textAlign: 'center', lineHeight: 19, color: palette.onAccent, fontSize: 12, fontWeight: '600' },
  checkCircleActive: { backgroundColor: palette.accent, borderColor: palette.accent },
  line: { height: 1, backgroundColor: palette.line },
});

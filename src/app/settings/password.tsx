import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Field, Header, IconButton, PrimaryButton, Screen } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { getErrorMessage, isMockMode, simulateRequest } from '@/services/api';
import { goBack } from '@/services/navigation';
import { userApi } from '@/services/bapmeokja-api';

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function PasswordSettingsScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const passwordError = useMemo(() => {
    if (!newPassword) return '';
    return PASSWORD_PATTERN.test(newPassword) ? '' : '영문, 숫자, 특수문자를 포함해 8자 이상 입력해 주세요.';
  }, [newPassword]);
  const confirmError = newPasswordConfirm && newPassword !== newPasswordConfirm ? '새 비밀번호가 서로 달라요.' : '';
  const canSubmit = Boolean(currentPassword && newPassword && newPasswordConfirm && !passwordError && !confirmError);

  const save = async () => {
    if (!canSubmit) return;
    if (currentPassword === newPassword) {
      Alert.alert('다른 비밀번호를 입력해 주세요', '현재 비밀번호와 새 비밀번호가 같아요.');
      return;
    }

    setSaving(true);
    try {
      if (isMockMode) await simulateRequest(null, 500);
      else await userApi.changePassword({ currentPassword, newPassword, newPasswordConfirm });
      Alert.alert('비밀번호를 변경했어요', '다음 로그인부터 새 비밀번호를 사용해 주세요.', [{ text: '확인', onPress: () => goBack() }]);
    } catch (error) {
      Alert.alert('비밀번호를 변경하지 못했어요', getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Header title="비밀번호 변경" subtitle="본인 확인 후 안전하게 변경해요" left={<IconButton label="←" onPress={() => goBack()} />} />
      <View style={styles.guide}>
        <Text style={styles.guideTitle}>안전한 비밀번호를 사용해 주세요</Text>
        <Text style={styles.guideText}>영문, 숫자, 특수문자를 모두 포함한 8자 이상의 비밀번호가 필요해요.</Text>
      </View>
      <Field label="현재 비밀번호" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry autoCapitalize="none" autoComplete="current-password" placeholder="현재 비밀번호" />
      <Field label="새 비밀번호" value={newPassword} onChangeText={setNewPassword} secureTextEntry autoCapitalize="none" autoComplete="new-password" placeholder="새 비밀번호" error={passwordError} />
      <Field label="새 비밀번호 확인" value={newPasswordConfirm} onChangeText={setNewPasswordConfirm} secureTextEntry autoCapitalize="none" autoComplete="new-password" placeholder="새 비밀번호 다시 입력" error={confirmError} />
      <PrimaryButton title="비밀번호 변경" onPress={save} loading={saving} disabled={!canSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  guide: { backgroundColor: palette.blueSoft, borderRadius: radii.md, padding: spacing.md },
  guideTitle: { ...font.subheading, color: palette.blue },
  guideText: { ...font.caption, lineHeight: 18, marginTop: 4, color: palette.muted },
});

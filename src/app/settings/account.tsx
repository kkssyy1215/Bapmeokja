import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Field, Header, IconButton, Screen } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { getErrorMessage, isMockMode, simulateRequest } from '@/services/api';
import { userApi } from '@/services/bapmeokja-api';

const CONFIRM_TEXT = '회원탈퇴';

export default function AccountSettingsScreen() {
  const { signOut } = useApp();
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const canDelete = Boolean(currentPassword && confirmation === CONFIRM_TEXT);

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      if (isMockMode) await simulateRequest(null, 650);
      else await userApi.deleteAccount(currentPassword);
      await signOut();
      Alert.alert('회원 탈퇴가 완료되었어요', '그동안 밥 먹자!를 이용해 주셔서 감사합니다.', [{ text: '확인', onPress: () => router.replace('/') }]);
    } catch (error) {
      Alert.alert('회원 탈퇴를 완료하지 못했어요', getErrorMessage(error));
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    if (!canDelete) return;
    Alert.alert(
      '정말 탈퇴할까요?',
      '삭제된 계정과 데이터는 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '탈퇴하기', style: 'destructive', onPress: deleteAccount },
      ],
    );
  };

  return (
    <Screen>
      <Header title="회원 탈퇴" subtitle="삭제할 내용을 꼭 확인해 주세요" left={<IconButton label="←" onPress={() => router.back()} />} />
      <View style={styles.warning}>
        <Text style={styles.warningIcon}>!</Text>
        <View style={styles.warningCopy}>
          <Text style={styles.warningTitle}>탈퇴 후에는 복구할 수 없어요</Text>
          <Text style={styles.warningText}>식단 기록, 냉장고 재료, 커뮤니티 게시글과 댓글 등 계정에 연결된 데이터가 삭제됩니다.</Text>
        </View>
      </View>
      <View style={styles.list}>
        <Text style={styles.listTitle}>탈퇴 전에 확인해 주세요</Text>
        <Text style={styles.listItem}>• 필요한 식단 기록은 미리 확인해 주세요.</Text>
        <Text style={styles.listItem}>• 작성한 게시글과 댓글도 함께 삭제됩니다.</Text>
        <Text style={styles.listItem}>• 같은 이메일로 다시 가입해도 이전 데이터는 복원되지 않습니다.</Text>
      </View>
      <Field label="현재 비밀번호" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry autoCapitalize="none" autoComplete="current-password" placeholder="본인 확인을 위해 입력" />
      <Field label={`확인을 위해 '${CONFIRM_TEXT}' 입력`} value={confirmation} onChangeText={setConfirmation} autoCapitalize="none" placeholder={CONFIRM_TEXT} error={confirmation && confirmation !== CONFIRM_TEXT ? `'${CONFIRM_TEXT}'를 정확히 입력해 주세요.` : ''} />
      <Pressable disabled={!canDelete || deleting} onPress={confirmDelete} style={({ pressed }) => [styles.deleteButton, (!canDelete || pressed) && styles.disabled]}>
        {deleting ? <ActivityIndicator color="#fff" /> : <Text style={styles.deleteText}>계정과 데이터 영구 삭제</Text>}
      </Pressable>
      <Text style={styles.cancelText} onPress={() => router.back()}>탈퇴하지 않고 돌아가기</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  warning: { flexDirection: 'row', gap: spacing.sm, backgroundColor: palette.tomatoSoft, borderRadius: radii.lg, padding: spacing.md },
  warningIcon: { width: 34, height: 34, borderRadius: 17, overflow: 'hidden', backgroundColor: palette.tomato, color: '#fff', textAlign: 'center', lineHeight: 34, fontWeight: '900' },
  warningCopy: { flex: 1 },
  warningTitle: { ...font.subheading, color: palette.tomatoDark },
  warningText: { ...font.caption, color: palette.tomatoDark, lineHeight: 18, marginTop: 4 },
  list: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.lg, padding: spacing.md, gap: spacing.xs },
  listTitle: { color: palette.ink, fontSize: 13, fontWeight: '900', marginBottom: 3 },
  listItem: { ...font.caption, color: palette.muted, lineHeight: 19 },
  deleteButton: { minHeight: 54, borderRadius: radii.md, backgroundColor: palette.danger, alignItems: 'center', justifyContent: 'center' },
  deleteText: { color: '#fff', fontSize: 15, fontWeight: '900' },
  disabled: { opacity: 0.45 },
  cancelText: { color: palette.muted, fontSize: 12, fontWeight: '700', textAlign: 'center', paddingVertical: spacing.sm },
});

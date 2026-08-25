import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Field, Header, IconButton, PrimaryButton, Screen } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { getErrorMessage, isMockMode, simulateRequest } from '@/services/api';
import { userApi } from '@/services/bapmeokja-api';

const MAX_BUDGET = 10_000_000;

function parseBudget(value: string) {
  return Number(value.replace(/[^0-9]/g, ''));
}

export default function BudgetSettingsScreen() {
  const { profile, updateProfile } = useApp();
  const [diningOut, setDiningOut] = useState(String(profile.defaultDiningBudget ?? 10_000));
  const [homeCooking, setHomeCooking] = useState(String(profile.defaultHomeBudget ?? 8_000));
  const [saving, setSaving] = useState(false);

  const values = useMemo(() => ({ diningOut: parseBudget(diningOut), homeCooking: parseBudget(homeCooking) }), [diningOut, homeCooking]);
  const error = values.diningOut > MAX_BUDGET || values.homeCooking > MAX_BUDGET
    ? '예산은 항목별 1,000만원 이하로 입력해 주세요.'
    : '';
  const canSubmit = Boolean(diningOut && homeCooking && !error);

  const save = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      if (isMockMode) await simulateRequest(null, 400);
      else await userApi.updateBudget(values);
      updateProfile({ defaultDiningBudget: values.diningOut, defaultHomeBudget: values.homeCooking });
      Alert.alert('예산을 저장했어요', '다음 메뉴 추천부터 새 예산을 반영합니다.');
      router.back();
    } catch (requestError) {
      Alert.alert('예산을 저장하지 못했어요', getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Header title="기본 예산" subtitle="추천에 사용할 1인 기준 금액이에요" left={<IconButton label="←" onPress={() => router.back()} />} />
      <View style={styles.guide}>
        <Text style={styles.guideTitle}>언제든 다시 바꿀 수 있어요</Text>
        <Text style={styles.guideText}>입력한 금액 이하의 메뉴와 레시피를 우선 보여드려요. 실제 매장·상품 가격은 달라질 수 있습니다.</Text>
      </View>
      <Field label="외식 예산 (원)" value={diningOut} onChangeText={(value) => setDiningOut(value.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder="10000" />
      <Field label="집밥 예산 (원)" value={homeCooking} onChangeText={(value) => setHomeCooking(value.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder="8000" error={error} />
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>저장할 예산</Text>
        <Text style={styles.summaryValue}>외식 {values.diningOut.toLocaleString()}원 · 집밥 {values.homeCooking.toLocaleString()}원</Text>
      </View>
      <PrimaryButton title="예산 저장" onPress={save} loading={saving} disabled={!canSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  guide: { backgroundColor: palette.yellowSoft, borderRadius: radii.md, padding: spacing.md },
  guideTitle: { ...font.subheading, color: '#765B21' },
  guideText: { ...font.caption, color: '#765B21', lineHeight: 18, marginTop: 4 },
  summary: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.md, padding: spacing.md, gap: spacing.xs },
  summaryTitle: { ...font.caption, color: palette.muted },
  summaryValue: { ...font.subheading, color: palette.ink },
});

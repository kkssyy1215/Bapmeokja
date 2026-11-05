
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Header, IconButton, Screen } from '@/components/ui';
import { font, palette, radii, shadow, spacing } from '@/constants/design';

const sections = [
  ['서비스 이용', '밥 먹자!는 식단 기록과 영양 정보 관리를 돕는 서비스입니다. 표시되는 분석과 추천은 참고 정보이며 의료 진단이나 전문 영양 상담을 대신하지 않습니다.'],
  ['수집하는 정보', '회원가입 정보, 사용자가 입력한 신체 정보와 식단, 냉장고 재료, 게시물·댓글, 선택한 알림·위치 동의 상태를 서비스 제공을 위해 저장합니다. 비밀번호는 복원할 수 없는 해시로 저장합니다.'],
  ['사진과 위치', '사진은 사용자가 분석 또는 게시를 요청할 때만 처리합니다. 위치는 동의한 경우 주변 식당 검색에 사용하며 현재 구현은 동의 상태만 계정에 저장합니다.'],
  ['사용자 선택권', '프로필과 알림 설정을 변경할 수 있고, 회원 탈퇴 시 계정에 연결된 데이터를 삭제할 수 있습니다. 외부 법적 보존 의무가 적용되는 운영 환경에서는 별도 고지가 필요합니다.'],
  ['커뮤니티', '타인의 권리를 침해하는 콘텐츠를 게시하면 안 됩니다. 운영 배포 전 신고·차단·운영자 moderation 정책을 확정해야 합니다.'],
];

export default function LegalScreen() {
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <Screen>
      <Header
        title="약관 및 개인정보"
        subtitle="캡스톤 서비스 기준 안내"
        left={<IconButton label="←" onPress={handleBack} />}
      />
      <View style={styles.version}>
        <Text style={styles.versionText}>
          시행일 2026.08.25 · 버전 1.0
        </Text>
      </View>
      {sections.map(([title, content], index) => (
        <View key={title} style={styles.section}>
          <Text style={styles.title}>{index + 1}. {title}</Text>
          <Text style={styles.content}>{content}</Text>
        </View>
      ))}
      <Text style={styles.note}>
        실제 상용 배포 전에는 운영 주체, 문의처, 보유 기간, 제3자 제공·처리 위탁, 국외 이전, 미성년자 정책을 법률 검토 후 보완해야 합니다.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  version: {
    alignSelf: 'flex-start',
    backgroundColor: palette.surfaceWarm,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  versionText: {
    ...font.caption,
    color: palette.muted,
    fontWeight: '500',
  },
  section: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadow,
  },
  title: {
    ...font.subheading,
    color: palette.ink,
  },
  content: {
    ...font.body,
    color: palette.muted,
    lineHeight: 21,
  },
  note: {
    ...font.caption,
    color: palette.muted,
    lineHeight: 18,
    padding: spacing.sm,
  },
});

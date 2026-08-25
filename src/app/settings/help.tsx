import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Header, IconButton, Screen } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';

const faqs = [
  ['사진 분석값이 정확한가요?', '사진 속 음식과 양을 바탕으로 계산한 참고용 추정값입니다. 저장 전에 음식명, 중량, 칼로리와 영양소를 직접 확인·수정해 주세요.'],
  ['토마토 색은 무엇을 뜻하나요?', '오늘 칼로리 섭취 비율에 따라 꼬르륵, 균형, 배부른 상태를 보여줍니다. 건강 상태를 진단하는 지표는 아닙니다.'],
  ['위치를 허용하지 않아도 되나요?', '네. 식단·통계·집밥 기능은 계속 사용할 수 있습니다. 주변 식당은 위치 동의 후에만 검색합니다.'],
  ['기록을 삭제할 수 있나요?', '식단 기록과 냉장고 재료는 각 화면에서 삭제할 수 있고, 계정 전체 삭제는 설정의 회원 탈퇴에서 진행합니다.'],
];

export default function HelpScreen() {
  return <Screen><Header title="도움말" subtitle="자주 묻는 내용을 모았어요" left={<IconButton label="←" onPress={() => router.back()} />} />
    {faqs.map(([question, answer]) => <View key={question} style={styles.card}><Text style={styles.question}>{question}</Text><Text style={styles.answer}>{answer}</Text></View>)}
    <View style={styles.notice}><Text style={styles.noticeTitle}>오류가 계속되나요?</Text><Text style={styles.noticeText}>인터넷 연결과 서버 상태를 확인하고 앱을 다시 실행해 주세요. 개발 중에는 Swagger와 API health 주소를 README에서 확인할 수 있습니다.</Text></View>
  </Screen>;
}

const styles = StyleSheet.create({ card: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.lg, padding: spacing.md, gap: spacing.xs }, question: { ...font.subheading, color: palette.ink }, answer: { ...font.body, color: palette.muted, lineHeight: 21 }, notice: { backgroundColor: palette.leafSoft, borderRadius: radii.md, padding: spacing.md }, noticeTitle: { color: palette.leaf, fontWeight: '900' }, noticeText: { ...font.caption, color: palette.leaf, lineHeight: 18, marginTop: 4 } });

import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Header, NutrientChips, Pill, Screen } from '@/components/ui';
import { font, palette, radii, shadow, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';

export default function CommunityScreen() {
  const { posts, toggleLike } = useApp();
  return (
    <Screen>
      <Header title="한끼 이야기" subtitle="함께 먹고, 함께 건강해져요" />
      <View style={styles.tabs}><Pill label="추천" active /><Pill label="최신" /><Pill label="레시피" /><Pill label="질문" /></View>
      <View style={styles.banner}><View><Text style={styles.bannerEyebrow}>이번 주 챌린지</Text><Text style={styles.bannerTitle}>알록달록 채소 5색 먹기</Text><Text style={styles.bannerMeta}>1,248명이 참여 중 · D-3</Text></View><Text style={styles.bannerEmoji}>🥕</Text></View>
      {posts.map((post) => (
        <Pressable key={post.id} style={styles.post} onPress={() => router.push({ pathname: '/community/[id]', params: { id: post.id } })}>
          <View style={styles.authorRow}><View style={styles.avatar}><Text style={styles.avatarText}>{post.avatar}</Text></View><View><Text style={styles.author}>{post.author}</Text><Text style={styles.time}>{post.createdAt}</Text></View><Text style={styles.more}>•••</Text></View>
          <Text style={styles.content}>{post.content}</Text>
          <View style={styles.photo}><Text style={styles.photoEmoji}>{post.emoji}</Text><View style={styles.photoTag}><Text style={styles.photoTagText}>AI 분석 완료</Text></View></View>
          <Card style={styles.nutrition}><View><Text style={styles.mealLabel}>오늘의 한끼</Text><Text style={styles.mealName}>{post.mealName}</Text></View><Text style={styles.kcal}>{post.nutrients.calories} kcal</Text><NutrientChips carbs={post.nutrients.carbs} protein={post.nutrients.protein} fat={post.nutrients.fat} /></Card>
          <View style={styles.actions}><Pressable hitSlop={8} onPress={(event) => { event.stopPropagation(); toggleLike(post.id); }}><Text style={[styles.action, post.liked && styles.liked]}>{post.liked ? '♥' : '♡'} {post.likes}</Text></Pressable><Text style={styles.action}>◯ {post.comments.length}</Text><Text style={styles.share}>↗ 공유</Text></View>
        </Pressable>
      ))}
      <Pressable style={styles.fab} onPress={() => router.push('/community/new-post')}><Text style={styles.fabText}>＋</Text></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: spacing.xs }, banner: { backgroundColor: palette.yellowSoft, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, bannerEyebrow: { color: '#9B6D13', fontSize: 10, fontWeight: '900' }, bannerTitle: { ...font.subheading, color: palette.ink, marginTop: 5 }, bannerMeta: { color: palette.muted, fontSize: 11, marginTop: 5 }, bannerEmoji: { fontSize: 44 },
  post: { backgroundColor: palette.surface, borderRadius: radii.xl, padding: spacing.md, borderWidth: 1, borderColor: palette.line, gap: spacing.md, ...shadow }, authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: palette.surfaceWarm, alignItems: 'center', justifyContent: 'center' }, avatarText: { fontSize: 22 }, author: { color: palette.ink, fontWeight: '800', fontSize: 13 }, time: { color: palette.muted, fontSize: 10, marginTop: 2 }, more: { marginLeft: 'auto', color: palette.muted, letterSpacing: 1 }, content: { ...font.body, color: palette.ink },
  photo: { height: 190, borderRadius: radii.lg, backgroundColor: '#F4E8D5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, photoEmoji: { fontSize: 104 }, photoTag: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(36,35,31,.82)', borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 6 }, photoTagText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  nutrition: { backgroundColor: palette.background, padding: 13 }, mealLabel: { color: palette.tomato, fontSize: 9, fontWeight: '900' }, mealName: { color: palette.ink, fontWeight: '800', marginTop: 2 }, kcal: { position: 'absolute', right: 13, top: 15, color: palette.ink, fontWeight: '900', fontSize: 13 }, actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg }, action: { color: palette.muted, fontSize: 13, fontWeight: '700' }, liked: { color: palette.tomato }, share: { marginLeft: 'auto', color: palette.muted, fontSize: 12 },
  fab: { position: 'absolute', right: 22, bottom: 105, width: 58, height: 58, borderRadius: 29, backgroundColor: palette.tomato, alignItems: 'center', justifyContent: 'center', ...shadow }, fabText: { color: '#fff', fontSize: 30, fontWeight: '300', marginTop: -2 },
});

import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Header, Screen } from '@/components/ui';
import { palette, radii, shadow, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { isMockMode, resolveApiAssetUrl, simulateRequest } from '@/services/api';
import { communityApi } from '@/services/bapmeokja-api';
import { CommunityPostSummary } from '@/types/api';

export default function CommunityScreen() {
  const { posts } = useApp();
  const [items, setItems] = useState<CommunityPostSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = isMockMode
        ? await simulateRequest({ posts: posts.map((post) => ({ postId: post.id, title: post.mealName || post.content.slice(0, 24), authorNickname: post.author, createdAt: post.createdAt, likeCount: post.likes, commentCount: post.comments.length })), totalCount: posts.length, page: 0, size: 20, hasNext: false }, 350)
        : await communityApi.list(0, 20);
      setItems(result.posts);
    } finally { setLoading(false); }
  }, [posts]);

  useFocusEffect(useCallback(() => { load().catch(() => setItems([])); }, [load]));

  return (
    <Screen>
      <Header title="한끼 이야기" subtitle="오늘 먹은 한 끼를 나눠요" />
      <View style={styles.intro}><View><Text style={styles.introTitle}>최근 게시물</Text><Text style={styles.introText}>식단 기록과 간단한 이야기를 확인해 보세요.</Text></View><Pressable style={styles.writeButton} onPress={() => router.push('/community/new-post')}><Text style={styles.writeButtonText}>글쓰기</Text></Pressable></View>
      {loading ? <ActivityIndicator color={palette.tomato} /> : items.length ? items.map((post) => (
        <Pressable key={post.postId} style={styles.post} onPress={() => router.push({ pathname: '/community/[id]', params: { id: post.postId } })}>
          <View style={styles.authorRow}><View style={styles.avatar}><Text style={styles.avatarText}>{post.authorNickname.slice(0, 1)}</Text></View><View><Text style={styles.author}>{post.authorNickname}</Text><Text style={styles.time}>{post.createdAt}</Text></View></View>
          {post.thumbnailUrl ? <Image source={{ uri: resolveApiAssetUrl(post.thumbnailUrl) }} style={styles.photo} contentFit="cover" /> : <View style={styles.photoFallback}><Text style={styles.photoFallbackText}>{post.title.slice(0, 1)}</Text></View>}
          <Text style={styles.title}>{post.title}</Text>
          <View style={styles.actions}><Text style={styles.action}>좋아요 {post.likeCount}</Text><Text style={styles.action}>댓글 {post.commentCount}</Text><Text style={styles.open}>게시물 보기 ›</Text></View>
        </Pressable>
      )) : <Card><EmptyState emoji="🍽️" title="아직 게시물이 없어요" description="첫 번째 식단 이야기를 남겨 보세요." /></Card>}
      <Pressable style={styles.fab} onPress={() => router.push('/community/new-post')}><Text style={styles.fabText}>＋</Text></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  introTitle: { color: palette.ink, fontSize: 17, fontWeight: '900' },
  introText: { color: palette.muted, fontSize: 11, marginTop: 3 },
  writeButton: { borderRadius: radii.pill, backgroundColor: palette.ink, paddingHorizontal: 14, paddingVertical: 9 },
  writeButtonText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  post: { backgroundColor: palette.surface, borderRadius: radii.xl, padding: spacing.md, borderWidth: 1, borderColor: palette.line, gap: spacing.md, ...shadow },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.tomatoSoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: palette.tomatoDark, fontSize: 14, fontWeight: '900' },
  author: { color: palette.ink, fontWeight: '800', fontSize: 13 },
  time: { color: palette.muted, fontSize: 9, marginTop: 2 },
  photo: { height: 190, borderRadius: radii.lg },
  photoFallback: { height: 150, borderRadius: radii.lg, backgroundColor: palette.surfaceWarm, alignItems: 'center', justifyContent: 'center' },
  photoFallbackText: { color: palette.tomatoDark, fontSize: 48, fontWeight: '900' },
  title: { color: palette.ink, fontSize: 15, fontWeight: '900' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  action: { color: palette.muted, fontSize: 11, fontWeight: '700' },
  open: { color: palette.tomato, marginLeft: 'auto', fontSize: 11, fontWeight: '800' },
  fab: { position: 'absolute', right: 22, bottom: 105, width: 56, height: 56, borderRadius: 28, backgroundColor: palette.tomato, alignItems: 'center', justifyContent: 'center', ...shadow },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 },
});

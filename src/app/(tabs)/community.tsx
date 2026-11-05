import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Header, Icon, IconButton, Pressable, Screen, SectionTitle } from '@/components/ui';
import { palette, radii, shadow, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { isMockMode, resolveApiAssetUrl, simulateRequest } from '@/services/api';
import { communityApi } from '@/services/bapmeokja-api';
import { formatRelativeTime } from '@/services/mappers';
import { CommunityPostSummary } from '@/types/api';

/** 사진을 불러오지 못하면 빈 칸을 남기지 않는다. */
function PostPhoto({ uri }: { uri?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <Image source={{ uri }} style={styles.photo} contentFit="cover" onError={() => setFailed(true)} />;
}

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
        <Header title="커뮤니티" subtitle="오늘 먹은 한 끼를 나눠요" right={<IconButton label="＋" onPress={() => router.push('/community/new-post')} accessibilityLabel="글쓰기" />} />
        <SectionTitle title="최근 게시물" />
        {loading ? <ActivityIndicator color={palette.tomato} /> : items.length ? items.map((post) => (
          <Pressable key={post.postId} accessibilityRole="button" style={styles.post} onPress={() => router.push({ pathname: '/community/[id]', params: { id: post.postId } })}>
            <View style={styles.authorRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{post.authorNickname.slice(0, 1)}</Text></View>
              <Text style={styles.author}>{post.authorNickname}</Text>
              <Text style={styles.time}>{formatRelativeTime(post.createdAt)}</Text>
            </View>
            {post.thumbnailUrl ? <PostPhoto uri={resolveApiAssetUrl(post.thumbnailUrl)} /> : null}
            <Text style={styles.title}>{post.title}</Text>
            <View style={styles.actions}>
              <View style={styles.action}><Icon name="heart" size={15} color={palette.tomato} /><Text style={styles.actionText}>{post.likeCount}</Text></View>
              <View style={styles.action}><Icon name="message-circle" size={15} color={palette.muted} /><Text style={styles.actionText}>{post.commentCount}</Text></View>
            </View>
          </Pressable>
        )) : <Card><EmptyState icon="message-circle" title="아직 게시물이 없어요" description="첫 번째 식단 이야기를 남겨 보세요." /></Card>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  post: { backgroundColor: palette.surface, borderRadius: radii.lg, padding: spacing.md, gap: 12, ...shadow },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: palette.accentSoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: palette.tomato, fontSize: 14, fontWeight: '600' },
  author: { flex: 1, color: palette.ink, fontSize: 14, fontWeight: '500' },
  time: { color: palette.muted, fontSize: 12 },
  photo: { height: 200, borderRadius: radii.md },
  title: { color: palette.ink, fontSize: 16, lineHeight: 22, fontWeight: '500', letterSpacing: -0.2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { color: palette.muted, fontSize: 13 },
});

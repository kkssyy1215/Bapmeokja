import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Field, Header, IconButton, NutrientChips, PrimaryButton, Screen } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { getErrorMessage, isMockMode, resolveApiAssetUrl, simulateRequest } from '@/services/api';
import { communityApi } from '@/services/bapmeokja-api';
import { CommunityPostDetail } from '@/types/api';

export default function PostDetailScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { posts, profile, toggleLike, addComment } = useApp();
  const [post, setPost] = useState<CommunityPostDetail | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const local = posts.find((item) => item.id === id) ?? posts[0];
    const demo: CommunityPostDetail = { postId: local.id, content: local.content, authorNickname: local.author, createdAt: local.createdAt, likeCount: local.likes, isLiked: local.liked, commentCount: local.comments.length, nutritionInfo: { foodName: local.mealName, calorie: local.nutrients.calories, carb: local.nutrients.carbs, protein: local.nutrients.protein, fat: local.nutrients.fat }, comments: local.comments.map((item) => ({ commentId: item.id, authorNickname: item.author, content: item.content, createdAt: item.createdAt })) };
    (isMockMode ? simulateRequest(demo, 300) : communityApi.detail(id)).then(setPost).catch((error) => Alert.alert('게시물을 불러오지 못했어요', getErrorMessage(error))).finally(() => setLoading(false));
  }, [id, posts]);

  const like = async () => {
    if (!post) return;
    if (isMockMode) {
      toggleLike(post.postId);
      setPost((prev) => prev ? { ...prev, isLiked: !prev.isLiked, likeCount: prev.likeCount + (prev.isLiked ? -1 : 1) } : prev);
      return;
    }
    try { const result = await communityApi.toggleLike(post.postId); setPost((prev) => prev ? { ...prev, ...result } : prev); }
    catch (error) { Alert.alert('좋아요 처리 실패', getErrorMessage(error)); }
  };

  const submit = async () => {
    if (!post || !comment.trim()) return;
    setSubmitting(true);
    try {
      const result = isMockMode ? { commentId: `cmt_${Date.now()}` } : await communityApi.addComment(post.postId, comment.trim());
      if (isMockMode) addComment(post.postId, comment.trim());
      setPost((prev) => prev ? { ...prev, commentCount: prev.commentCount + 1, comments: [...prev.comments, { commentId: result.commentId, authorNickname: '나', content: comment.trim(), createdAt: '방금 전' }] } : prev);
      setComment('');
    } catch (error) { Alert.alert('댓글 등록 실패', getErrorMessage(error)); }
    finally { setSubmitting(false); }
  };

  const removePost = () => {
    if (!post || deleting) return;
    Alert.alert('게시물을 삭제할까요?', '삭제한 게시물은 복구할 수 없어요.', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: async () => {
        setDeleting(true);
        try {
          await communityApi.remove(post.postId);
          router.replace('/(tabs)/community');
        } catch (error) {
          Alert.alert('게시물 삭제 실패', getErrorMessage(error));
          setDeleting(false);
        }
      } },
    ]);
  };

  const removeComment = (commentId: string) => {
    if (!post) return;
    Alert.alert('댓글을 삭제할까요?', '', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: async () => {
        try {
          await communityApi.removeComment(post.postId, commentId);
          setPost((prev) => prev ? { ...prev, commentCount: Math.max(0, prev.commentCount - 1), comments: prev.comments.filter((item) => item.commentId !== commentId) } : prev);
        } catch (error) {
          Alert.alert('댓글 삭제 실패', getErrorMessage(error));
        }
      } },
    ]);
  };

  if (loading || !post) return <Screen><Header title="게시물" left={<IconButton label="←" onPress={() => router.back()} />} /><ActivityIndicator color={palette.tomato} /></Screen>;

  const isMyPost = !isMockMode && post.authorNickname === profile.nickname;

  return <Screen><Header title="게시물" left={<IconButton label="←" onPress={() => router.back()} />} right={isMyPost ? <Pressable disabled={deleting} onPress={removePost} hitSlop={8}><Text style={styles.delete}>{deleting ? '삭제 중' : '삭제'}</Text></Pressable> : undefined} />
    <View style={styles.authorRow}><View style={styles.avatar}><Text style={styles.avatarText}>{post.authorNickname.slice(0, 1)}</Text></View><View><Text style={styles.author}>{post.authorNickname}</Text><Text style={styles.time}>{post.createdAt}</Text></View></View>
    <Text style={styles.content}>{post.content}</Text>
    {post.imageUrl ? <Image source={{ uri: resolveApiAssetUrl(post.imageUrl) }} style={styles.photo} contentFit="cover" /> : null}
    {post.nutritionInfo ? <Card style={styles.nutrition}><View style={styles.nutritionTop}><View><Text style={styles.analysisLabel}>사진 기반 영양 추정</Text><Text style={styles.mealName}>{post.nutritionInfo.foodName}</Text></View><Text style={styles.kcal}>{post.nutritionInfo.calorie} kcal</Text></View><NutrientChips carbs={post.nutritionInfo.carb} protein={post.nutritionInfo.protein} fat={post.nutritionInfo.fat} /><Text style={styles.estimateNotice}>사진을 바탕으로 계산한 참고용 추정값이며 실제 영양 정보와 다를 수 있어요.</Text></Card> : null}
    <View style={styles.actions}><Pressable onPress={like}><Text style={[styles.action, post.isLiked && styles.liked]}>{post.isLiked ? '♥' : '♡'} 좋아요 {post.likeCount}</Text></Pressable><Text style={styles.action}>댓글 {post.commentCount}</Text></View>
    <View style={styles.divider} /><Text style={styles.commentTitle}>댓글 {post.commentCount}</Text>
    {post.comments.length ? post.comments.map((item) => <View key={item.commentId} style={styles.comment}><View style={styles.commentAvatar}><Text style={styles.commentAvatarText}>{item.authorNickname.slice(0, 1)}</Text></View><View style={styles.commentBody}><View style={styles.commentHead}><Text style={styles.commentAuthor}>{item.authorNickname}</Text><View style={styles.commentMeta}><Text style={styles.commentTime}>{item.createdAt}</Text>{!isMockMode && item.authorNickname === profile.nickname ? <Pressable onPress={() => removeComment(item.commentId)} hitSlop={8}><Text style={styles.commentDelete}>삭제</Text></Pressable> : null}</View></View><Text style={styles.commentText}>{item.content}</Text></View></View>) : <Text style={styles.empty}>첫 댓글을 남겨 보세요.</Text>}
    <Field value={comment} onChangeText={setComment} placeholder="따뜻한 댓글을 남겨 주세요" maxLength={1000} returnKeyType="send" onSubmitEditing={submit} />
    <PrimaryButton title="댓글 등록" variant="secondary" onPress={submit} loading={submitting} disabled={!comment.trim()} />
  </Screen>;
}

const styles = StyleSheet.create({
  authorRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  avatar: { width: 45, height: 45, borderRadius: 23, backgroundColor: palette.surfaceWarm, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: palette.tomatoDark, fontSize: 15, fontWeight: '900' },
  author: { color: palette.ink, fontWeight: '800' },
  time: { color: palette.muted, fontSize: 10, marginTop: 3 },
  content: { ...font.body, color: palette.ink },
  photo: { height: 285, borderRadius: radii.xl },
  nutrition: { backgroundColor: palette.background },
  nutritionTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  analysisLabel: { color: palette.tomato, fontSize: 10, fontWeight: '900' },
  mealName: { color: palette.ink, fontWeight: '800', marginTop: 3 },
  kcal: { color: palette.ink, fontWeight: '900' },
  estimateNotice: { ...font.caption, color: palette.muted, lineHeight: 17, marginTop: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  action: { color: palette.muted, fontWeight: '700', fontSize: 12 },
  liked: { color: palette.tomato },
  delete: { color: palette.danger, fontSize: 12, fontWeight: '900' },
  divider: { height: 1, backgroundColor: palette.line },
  commentTitle: { ...font.subheading, color: palette.ink },
  comment: { flexDirection: 'row', gap: spacing.sm },
  commentAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: palette.tomatoSoft, alignItems: 'center', justifyContent: 'center' },
  commentAvatarText: { color: palette.tomatoDark, fontSize: 11, fontWeight: '900' },
  commentBody: { flex: 1, backgroundColor: palette.surface, borderRadius: radii.md, padding: spacing.sm },
  commentHead: { flexDirection: 'row', justifyContent: 'space-between' },
  commentMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  commentAuthor: { color: palette.ink, fontWeight: '800', fontSize: 11 },
  commentTime: { color: palette.muted, fontSize: 9 },
  commentDelete: { color: palette.danger, fontSize: 9, fontWeight: '800' },
  commentText: { ...font.body, color: palette.ink, marginTop: 4 },
  empty: { ...font.body, color: palette.muted, textAlign: 'center', padding: spacing.lg },
});

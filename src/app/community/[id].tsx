import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { Card, Field, Header, Icon, IconButton, NutrientChips, PrimaryButton, Pressable, Screen } from '@/components/ui';
import { font, palette, radii, shadow, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { getErrorMessage, isMockMode, resolveApiAssetUrl, simulateRequest } from '@/services/api';
import { communityApi } from '@/services/bapmeokja-api';
import { formatRelativeTime } from '@/services/mappers';
import { CommunityPostDetail } from '@/types/api';
import { goBack } from '@/services/navigation';

export default function PostDetailScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { posts, profile, toggleLike, addComment, updatePost, removePost: removeMockPost, updateComment, removeComment: removeMockComment } = useApp();
  const [post, setPost] = useState<CommunityPostDetail | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [photoRatio, setPhotoRatio] = useState(4 / 3);
  const [editingPost, setEditingPost] = useState(false);
  const [postDraft, setPostDraft] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [replyTo, setReplyTo] = useState<{ commentId: string; nickname: string } | null>(null);

  useEffect(() => {
    const load = (): Promise<CommunityPostDetail> => {
      if (!isMockMode) return communityApi.detail(id);
      // 시연 데이터는 시연 모드에서만 있다. 서버 모드의 posts는 비어 있으므로 여기서만 읽는다.
      const local = posts.find((item) => item.id === id) ?? posts[0];
      const demo: CommunityPostDetail = { postId: local.id, content: local.content, authorNickname: local.author, createdAt: local.createdAt, likeCount: local.likes, isLiked: local.liked, commentCount: local.comments.length, nutritionInfo: local.nutrients.calories > 0 ? { foodName: local.mealName, calorie: local.nutrients.calories, carb: local.nutrients.carbs, protein: local.nutrients.protein, fat: local.nutrients.fat } : undefined, comments: local.comments.map((item) => ({ commentId: item.id, authorNickname: item.author, content: item.content, createdAt: item.createdAt, parentCommentId: item.parentId })) };
      return simulateRequest(demo, 300);
    };
    load().then(setPost).catch((error) => Alert.alert('게시물을 불러오지 못했어요', getErrorMessage(error))).finally(() => setLoading(false));
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
    const content = comment.trim();
    if (!post || !content) return;
    setSubmitting(true);
    try {
      const parentCommentId = replyTo?.commentId;
      const result = isMockMode ? { commentId: `cmt_${Date.now()}` } : await communityApi.addComment(post.postId, content, parentCommentId);
      if (isMockMode) addComment(post.postId, content, parentCommentId);
      setPost((prev) => prev ? { ...prev, commentCount: prev.commentCount + 1, comments: [...prev.comments, { commentId: result.commentId, authorNickname: profile.nickname, content, createdAt: new Date().toISOString(), parentCommentId }] } : prev);
      setComment('');
      setReplyTo(null);
    } catch (error) { Alert.alert(replyTo ? '답글 등록 실패' : '댓글 등록 실패', getErrorMessage(error)); }
    finally { setSubmitting(false); }
  };

  const savePost = async () => {
    const content = postDraft.trim();
    if (!post || !content) return;
    setSaving(true);
    try {
      if (isMockMode) updatePost(post.postId, content);
      else await communityApi.update(post.postId, content);
      setPost((prev) => prev ? { ...prev, content } : prev);
      setEditingPost(false);
    } catch (error) { Alert.alert('게시물 수정 실패', getErrorMessage(error)); }
    finally { setSaving(false); }
  };

  const saveComment = async () => {
    const content = commentDraft.trim();
    if (!post || !editingCommentId || !content) return;
    setSaving(true);
    try {
      if (isMockMode) updateComment(post.postId, editingCommentId, content);
      else await communityApi.updateComment(post.postId, editingCommentId, content);
      setPost((prev) => prev ? { ...prev, comments: prev.comments.map((item) => item.commentId === editingCommentId ? { ...item, content } : item) } : prev);
      setEditingCommentId(null);
    } catch (error) { Alert.alert('댓글 수정 실패', getErrorMessage(error)); }
    finally { setSaving(false); }
  };

  const removePost = () => {
    if (!post || deleting) return;
    Alert.alert('게시물을 삭제할까요?', '삭제한 게시물은 복구할 수 없어요.', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: async () => {
        setDeleting(true);
        try {
          if (isMockMode) removeMockPost(post.postId);
          else await communityApi.remove(post.postId);
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
    const replyCount = post.comments.filter((item) => item.parentCommentId === commentId).length;
    Alert.alert('댓글을 삭제할까요?', replyCount ? `달린 답글 ${replyCount}개도 함께 삭제돼요.` : '', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: async () => {
        try {
          if (isMockMode) removeMockComment(post.postId, commentId);
          else await communityApi.removeComment(post.postId, commentId);
          setPost((prev) => prev ? { ...prev, commentCount: Math.max(0, prev.commentCount - 1 - replyCount), comments: prev.comments.filter((item) => item.commentId !== commentId && item.parentCommentId !== commentId) } : prev);
          if (replyTo?.commentId === commentId) setReplyTo(null);
        } catch (error) {
          Alert.alert('댓글 삭제 실패', getErrorMessage(error));
        }
      } },
    ]);
  };

  if (loading || !post) return <Screen><Header title="게시물" left={<IconButton label="←" onPress={() => goBack()} />} /><ActivityIndicator color={palette.tomato} /></Screen>;

  const isMine = (nickname: string) => nickname === profile.nickname;
  const isMyPost = isMine(post.authorNickname);

  // 답글은 원래 댓글 아래에 모은다. 원래 댓글이 사라진 답글은 일반 댓글처럼 보여 준다.
  const commentIds = new Set(post.comments.map((item) => item.commentId));
  const rootComments = post.comments.filter((item) => !item.parentCommentId || !commentIds.has(item.parentCommentId));
  const repliesByParent = new Map<string, typeof post.comments>();
  post.comments.filter((item) => item.parentCommentId && commentIds.has(item.parentCommentId)).forEach((item) => {
    const key = item.parentCommentId as string;
    repliesByParent.set(key, [...(repliesByParent.get(key) ?? []), item]);
  });

  const renderComment = (item: (typeof post.comments)[number], rootId: string) => (
    <View style={styles.comment}>
      <View style={styles.commentAvatar}><Text style={styles.commentAvatarText}>{item.authorNickname.slice(0, 1)}</Text></View>
      <View style={styles.commentBody}>
        <View style={styles.commentHead}><Text style={styles.commentAuthor}>{item.authorNickname}</Text><Text style={styles.commentTime}>{formatRelativeTime(item.createdAt)}</Text></View>
        {editingCommentId === item.commentId ? <View style={styles.editBox}>
          <Field value={commentDraft} onChangeText={setCommentDraft} maxLength={1000} accessibilityLabel="댓글 수정" autoFocus />
          <View style={styles.editButtons}>
            <View style={styles.editButton}><PrimaryButton title="취소" variant="secondary" onPress={() => setEditingCommentId(null)} /></View>
            <View style={styles.editButton}><PrimaryButton title="저장" onPress={saveComment} loading={saving} disabled={!commentDraft.trim()} /></View>
          </View>
        </View> : <>
          <Text style={styles.commentText}>{item.content}</Text>
          <View style={styles.commentActions}>
            <Pressable accessibilityRole="button" accessibilityLabel={`${item.authorNickname}에게 답글 달기`} hitSlop={8} onPress={() => setReplyTo({ commentId: rootId, nickname: item.authorNickname })}><Text style={styles.commentEdit}>답글</Text></Pressable>
            {isMine(item.authorNickname) ? <>
              <Pressable accessibilityRole="button" accessibilityLabel="댓글 수정하기" hitSlop={8} onPress={() => { setCommentDraft(item.content); setEditingCommentId(item.commentId); }}><Text style={styles.commentMuted}>수정</Text></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="댓글 삭제하기" hitSlop={8} onPress={() => removeComment(item.commentId)}><Text style={styles.commentDelete}>삭제</Text></Pressable>
            </> : null}
          </View>
        </>}
      </View>
    </View>
  );

  const composer = (
    <View style={styles.composerWrap}>
      {replyTo ? <View style={styles.replyBar}>
        <Text style={styles.replyBarText} numberOfLines={1}>@{replyTo.nickname}에게 답글 작성 중</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="답글 취소" hitSlop={10} onPress={() => setReplyTo(null)}><Icon name="x" size={16} color={palette.muted} /></Pressable>
      </View> : null}
      <View style={styles.composer}>
      <View style={styles.composerInput}><Field value={comment} onChangeText={setComment} placeholder={replyTo ? '답글을 남겨 주세요' : '따뜻한 댓글을 남겨 주세요'} maxLength={1000} returnKeyType="send" onSubmitEditing={submit} style={styles.composerField} accessibilityLabel="댓글 작성" /></View>
      <Pressable accessibilityRole="button" accessibilityLabel="댓글 등록" disabled={!comment.trim() || submitting} onPress={submit} style={[styles.send, !comment.trim() && styles.sendIdle]}>
        {submitting ? <ActivityIndicator color={palette.onAccent} /> : <Text style={[styles.sendText, !comment.trim() && styles.sendTextIdle]}>등록</Text>}
      </Pressable>
      </View>
    </View>
  );

  return <Screen footer={composer}><Header title="게시물" left={<IconButton label="←" onPress={() => goBack()} />} />
    <View style={styles.authorRow}>
      <View style={styles.avatar}><Text style={styles.avatarText}>{post.authorNickname.slice(0, 1)}</Text></View>
      <View style={styles.authorCopy}><Text style={styles.author}>{post.authorNickname}</Text><Text style={styles.time}>{formatRelativeTime(post.createdAt)}</Text></View>
      {isMyPost && !editingPost ? <View style={styles.ownerActions}>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={() => { setPostDraft(post.content); setEditingPost(true); }}><Text style={styles.edit}>수정</Text></Pressable>
        <Pressable accessibilityRole="button" hitSlop={8} disabled={deleting} onPress={removePost}><Text style={styles.delete}>{deleting ? '삭제 중' : '삭제'}</Text></Pressable>
      </View> : null}
    </View>
    {editingPost ? <View style={styles.editBox}>
      <Field value={postDraft} onChangeText={setPostDraft} placeholder="게시글 내용을 입력하세요" multiline maxLength={5000} accessibilityLabel="게시글 수정" />
      <View style={styles.editButtons}>
        <View style={styles.editButton}><PrimaryButton title="취소" variant="secondary" onPress={() => setEditingPost(false)} /></View>
        <View style={styles.editButton}><PrimaryButton title="저장" onPress={savePost} loading={saving} disabled={!postDraft.trim()} /></View>
      </View>
    </View> : <Text style={styles.content}>{post.content}</Text>}
    {post.imageUrl ? <Image source={{ uri: resolveApiAssetUrl(post.imageUrl) }} style={[styles.photo, { aspectRatio: photoRatio }]} contentFit="contain" accessibilityLabel="게시글 사진" onLoad={(event) => { const { width, height } = event.source; if (width > 0 && height > 0) setPhotoRatio(width / height); }} /> : null}
    {post.nutritionInfo ? <Card style={styles.nutrition}><View style={styles.nutritionTop}><View><Text style={styles.analysisLabel}>사진 기반 영양 추정</Text><Text style={styles.mealName}>{post.nutritionInfo.foodName}</Text></View><Text style={styles.kcal}>{post.nutritionInfo.calorie} kcal</Text></View><NutrientChips carbs={post.nutritionInfo.carb} protein={post.nutritionInfo.protein} fat={post.nutritionInfo.fat} /><Text style={styles.estimateNotice}>사진을 바탕으로 계산한 참고용 추정값이며 실제 영양 정보와 다를 수 있어요.</Text></Card> : null}
    <View style={styles.actions}><Pressable accessibilityRole="button" hitSlop={8} onPress={like}><Text style={[styles.action, post.isLiked && styles.liked]}>{post.isLiked ? '♥' : '♡'} 좋아요 {post.likeCount}</Text></Pressable></View>
    <View style={styles.divider} /><Text style={styles.commentTitle}>댓글 {post.commentCount}</Text>
    {rootComments.length ? rootComments.map((item) => <View key={item.commentId} style={styles.thread}>
      {renderComment(item, item.commentId)}
      {(repliesByParent.get(item.commentId) ?? []).map((reply) => <View key={reply.commentId} style={styles.reply}>{renderComment(reply, item.commentId)}</View>)}
    </View>) : <Text style={styles.empty}>첫 댓글을 남겨 보세요.</Text>}
  </Screen>;
}

const styles = StyleSheet.create({
  authorCopy: { flex: 1 },
  ownerActions: { flexDirection: 'row', gap: 14 },
  edit: { color: palette.tomato, fontSize: 14, fontWeight: '500' },
  editBox: { gap: spacing.sm, marginTop: 4 },
  editButtons: { flexDirection: 'row', gap: spacing.sm },
  editButton: { flex: 1 },
  commentActions: { flexDirection: 'row', gap: 14, marginTop: 8 },
  commentEdit: { color: palette.tomato, fontSize: 13, fontWeight: '500' },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  thread: { gap: spacing.sm },
  reply: { marginLeft: 28 },
  commentMuted: { color: palette.muted, fontSize: 13 },
  composerWrap: { gap: 8 },
  replyBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, backgroundColor: palette.accentSoft, borderRadius: radii.sm, paddingHorizontal: 12, paddingVertical: 8 },
  replyBarText: { flex: 1, color: palette.tomato, fontSize: 13, fontWeight: '500' },
  composerInput: { flex: 1 },
  send: { minWidth: 60, height: 44, borderRadius: 22, paddingHorizontal: 14, backgroundColor: palette.accent, alignItems: 'center', justifyContent: 'center' },
  sendIdle: { backgroundColor: palette.sunken, opacity: 1 },
  sendText: { color: palette.onAccent, fontSize: 14, fontWeight: '600' },
  sendTextIdle: { color: palette.muted },
  composerField: { minHeight: 44, borderRadius: 22, backgroundColor: palette.accentSoft, borderColor: palette.tomatoFill },
  authorRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.accentSoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: palette.tomato, fontSize: 15, fontWeight: '600' },
  author: { color: palette.ink, fontWeight: '500' },
  time: { color: palette.muted, fontSize: 12, marginTop: 3 },
  content: { ...font.body, color: palette.ink },
  photo: { width: '100%', borderRadius: radii.lg, backgroundColor: palette.sunken },
  nutrition: { backgroundColor: palette.accentSoft, boxShadow: 'none' },
  nutritionTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  analysisLabel: { color: palette.tomato, fontSize: 12, fontWeight: '500' },
  mealName: { color: palette.ink, fontWeight: '500', marginTop: 3 },
  kcal: { color: palette.ink, fontWeight: '600' },
  estimateNotice: { ...font.caption, color: palette.muted, lineHeight: 17, marginTop: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  action: { color: palette.muted, fontWeight: '500', fontSize: 12 },
  liked: { color: palette.tomato },
  delete: { color: palette.danger, fontSize: 14 },
  divider: { height: 1, backgroundColor: palette.line },
  commentTitle: { ...font.subheading, color: palette.ink },
  comment: { flexDirection: 'row', gap: spacing.sm },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: palette.accentSoft, alignItems: 'center', justifyContent: 'center' },
  commentAvatarText: { color: palette.tomato, fontSize: 12, fontWeight: '600' },
  commentBody: { flex: 1, backgroundColor: palette.surface, borderRadius: radii.md, padding: spacing.sm, ...shadow },
  commentHead: { flexDirection: 'row', justifyContent: 'space-between' },
  commentAuthor: { color: palette.ink, fontWeight: '500', fontSize: 12 },
  commentTime: { color: palette.muted, fontSize: 12 },
  commentDelete: { color: palette.danger, fontSize: 13 },
  commentText: { ...font.body, color: palette.ink, marginTop: 4 },
  empty: { ...font.body, color: palette.muted, textAlign: 'center', padding: spacing.lg },
});

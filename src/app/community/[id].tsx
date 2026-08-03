import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Field, Header, IconButton, NutrientChips, PrimaryButton, Screen } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { posts, toggleLike, addComment } = useApp();
  const post = posts.find((item) => item.id === id) ?? posts[0];
  const [comment, setComment] = useState('');
  const submit = () => { if (!comment.trim()) return; addComment(post.id, comment); setComment(''); };
  return <Screen><Header title="게시물" left={<IconButton label="←" onPress={() => router.back()} />} right={<IconButton label="⋯" />} />
    <View style={styles.authorRow}><View style={styles.avatar}><Text style={styles.avatarText}>{post.avatar}</Text></View><View><Text style={styles.author}>{post.author}</Text><Text style={styles.time}>{post.createdAt}</Text></View></View>
    <Text style={styles.content}>{post.content}</Text>
    <View style={styles.photo}><Text style={styles.photoEmoji}>{post.emoji}</Text></View>
    <Card style={styles.nutrition}><View style={styles.nutritionTop}><View><Text style={styles.aiLabel}>✦ AI 영양 분석</Text><Text style={styles.mealName}>{post.mealName}</Text></View><Text style={styles.kcal}>{post.nutrients.calories} kcal</Text></View><NutrientChips carbs={post.nutrients.carbs} protein={post.nutrients.protein} fat={post.nutrients.fat} /></Card>
    <View style={styles.actions}><Pressable onPress={() => toggleLike(post.id)}><Text style={[styles.action, post.liked && styles.liked]}>{post.liked ? '♥' : '♡'} 좋아요 {post.likes}</Text></Pressable><Text style={styles.action}>◯ 댓글 {post.comments.length}</Text><Text style={styles.share}>↗ 공유</Text></View>
    <View style={styles.divider} /><Text style={styles.commentTitle}>댓글 {post.comments.length}</Text>
    {post.comments.length ? post.comments.map((item) => <View key={item.id} style={styles.comment}><View style={styles.commentAvatar}><Text>🍅</Text></View><View style={styles.commentBody}><View style={styles.commentHead}><Text style={styles.commentAuthor}>{item.author}</Text><Text style={styles.commentTime}>{item.createdAt}</Text></View><Text style={styles.commentText}>{item.content}</Text></View></View>) : <Text style={styles.empty}>첫 댓글을 남겨 보세요.</Text>}
    <Field value={comment} onChangeText={setComment} placeholder="따뜻한 댓글을 남겨 주세요" />
    <PrimaryButton title="댓글 등록" variant="secondary" onPress={submit} />
  </Screen>;
}

const styles = StyleSheet.create({ authorRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }, avatar: { width: 45, height: 45, borderRadius: 23, backgroundColor: palette.surfaceWarm, alignItems: 'center', justifyContent: 'center' }, avatarText: { fontSize: 23 }, author: { color: palette.ink, fontWeight: '800' }, time: { color: palette.muted, fontSize: 10, marginTop: 3 }, content: { ...font.body, color: palette.ink }, photo: { height: 285, borderRadius: radii.xl, backgroundColor: '#EEE2D1', alignItems: 'center', justifyContent: 'center' }, photoEmoji: { fontSize: 140 }, nutrition: { backgroundColor: palette.background }, nutritionTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }, aiLabel: { color: palette.tomato, fontSize: 10, fontWeight: '900' }, mealName: { color: palette.ink, fontWeight: '800', marginTop: 3 }, kcal: { color: palette.ink, fontWeight: '900' }, actions: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' }, action: { color: palette.muted, fontWeight: '700', fontSize: 12 }, liked: { color: palette.tomato }, share: { marginLeft: 'auto', color: palette.muted, fontSize: 12 }, divider: { height: 1, backgroundColor: palette.line }, commentTitle: { ...font.subheading, color: palette.ink }, comment: { flexDirection: 'row', gap: spacing.sm }, commentAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: palette.tomatoSoft, alignItems: 'center', justifyContent: 'center' }, commentBody: { flex: 1, backgroundColor: palette.surface, borderRadius: radii.md, padding: spacing.sm }, commentHead: { flexDirection: 'row', justifyContent: 'space-between' }, commentAuthor: { color: palette.ink, fontWeight: '800', fontSize: 11 }, commentTime: { color: palette.muted, fontSize: 9 }, commentText: { ...font.body, color: palette.ink, marginTop: 4 }, empty: { ...font.body, color: palette.muted, textAlign: 'center', padding: spacing.lg } });

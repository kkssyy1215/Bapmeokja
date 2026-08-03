import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Field, Header, IconButton, PrimaryButton, Screen } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';

export default function NewPostScreen() {
  const { createPost } = useApp();
  const [content, setContent] = useState('');
  const [mealName, setMealName] = useState('');
  const [hasImage, setHasImage] = useState(false);
  const choose = async () => { const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(); if (!permission.granted) return Alert.alert('사진 권한이 필요해요'); const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] }); if (!result.canceled) setHasImage(true); };
  const submit = () => { if (!content.trim()) return Alert.alert('내용을 입력해 주세요'); createPost(content, mealName || '건강한 한 끼'); router.replace('/(tabs)/community'); };
  return <Screen><Header title="새 게시물" subtitle="오늘의 한 끼를 나눠요" left={<IconButton label="←" onPress={() => router.back()} />} />
    <View style={styles.intro}><Text style={styles.introEmoji}>🍽️</Text><View><Text style={styles.introTitle}>어떤 한 끼였나요?</Text><Text style={styles.introText}>사진과 이야기를 올리면 AI 영양 정보가 함께 표시돼요.</Text></View></View>
    <Pressable style={[styles.photo, hasImage && styles.photoSelected]} onPress={choose}><Text style={styles.photoEmoji}>{hasImage ? '🥗' : '＋'}</Text><Text style={styles.photoTitle}>{hasImage ? '사진을 선택했어요' : '식단 사진 추가'}</Text><Text style={styles.photoSub}>{hasImage ? '탭해서 다른 사진 선택' : '앨범에서 선택하기'}</Text></Pressable>
    <Field label="식단 이름" value={mealName} onChangeText={setMealName} placeholder="예: 연어 아보카도 포케" />
    <Field label="내용" value={content} onChangeText={setContent} placeholder="식단 이야기, 맛, 건강 팁을 자유롭게 적어 주세요." multiline maxLength={500} />
    <View style={styles.ai}><Text style={styles.aiIcon}>✦</Text><View><Text style={styles.aiTitle}>AI 영양 정보 자동 첨부</Text><Text style={styles.aiText}>사진 속 음식을 분석해 칼로리와 탄·단·지를 게시물에 함께 보여줘요.</Text></View></View>
    <PrimaryButton title="게시하기" onPress={submit} />
  </Screen>;
}

const styles = StyleSheet.create({ intro: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, introEmoji: { fontSize: 40 }, introTitle: { ...font.heading, color: palette.ink }, introText: { ...font.caption, color: palette.muted, marginTop: 3, maxWidth: 280 }, photo: { height: 220, borderRadius: radii.xl, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#CFC8BC', backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' }, photoSelected: { backgroundColor: '#F0E5D3', borderStyle: 'solid' }, photoEmoji: { fontSize: 55, color: palette.muted }, photoTitle: { color: palette.ink, fontWeight: '800', marginTop: spacing.sm }, photoSub: { color: palette.muted, fontSize: 11, marginTop: 3 }, ai: { backgroundColor: palette.blueSoft, borderRadius: radii.md, padding: spacing.md, flexDirection: 'row', gap: spacing.sm }, aiIcon: { color: palette.blue, fontSize: 23 }, aiTitle: { color: palette.ink, fontWeight: '800', fontSize: 12 }, aiText: { color: palette.muted, fontSize: 10, marginTop: 4, maxWidth: 300, lineHeight: 15 } });

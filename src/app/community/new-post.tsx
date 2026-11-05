import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Field, Header, IconButton, NutrientChips, PrimaryButton, Screen, Pressable } from '@/components/ui';
import { font, palette, radii, shadow, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { getErrorMessage, isMockMode, simulateRequest } from '@/services/api';
import { communityApi } from '@/services/bapmeokja-api';

type ImageAnalysis = { foodName: string; calorie: number; carb: number; protein: number; fat: number };
type ImageAnalysisDraft = { foodName: string; calorie: string; carb: string; protein: string; fat: string };

export default function NewPostScreen() {
  const { createPost } = useApp();
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [analysisDraft, setAnalysisDraft] = useState<ImageAnalysisDraft | null>(null);
  const [editingAnalysis, setEditingAnalysis] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [posting, setPosting] = useState(false);

  const choose = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('사진 권한이 필요해요', '게시물 사진을 선택하려면 사진 접근을 허용해 주세요.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    setImageUri(uri);
    setAnalysis(null);
    setAnalysisDraft(null);
    setEditingAnalysis(false);
    setAnalyzing(true);
    try {
      const nutrition = isMockMode ? await simulateRequest<ImageAnalysis>({ foodName: '닭가슴살 포케', calorie: 521, carb: 57, protein: 31, fat: 19 }, 700) : await communityApi.analyzeImage(uri);
      setAnalysis(nutrition);
    } catch (error) { Alert.alert('사진 분석 실패', `${getErrorMessage(error)} 직접 입력 없이 글만 게시할 수도 있어요.`); }
    finally { setAnalyzing(false); }
  };

  const beginAnalysisEdit = () => {
    if (!analysis) return;
    setAnalysisDraft({ foodName: analysis.foodName, calorie: String(analysis.calorie), carb: String(analysis.carb), protein: String(analysis.protein), fat: String(analysis.fat) });
    setEditingAnalysis(true);
  };

  const updateAnalysisDraft = (key: keyof ImageAnalysisDraft, value: string) => {
    setAnalysisDraft((current) => current ? { ...current, [key]: value } : current);
  };

  const applyAnalysisEdit = () => {
    if (!analysisDraft?.foodName.trim()) return Alert.alert('음식 이름을 입력해 주세요');
    const values = [analysisDraft.calorie, analysisDraft.carb, analysisDraft.protein, analysisDraft.fat].map(Number);
    if (values.some((value) => !Number.isFinite(value) || value < 0)) return Alert.alert('영양 값을 확인해 주세요', '열량과 영양 값은 0 이상의 숫자로 입력해 주세요.');
    setAnalysis({ foodName: analysisDraft.foodName.trim(), calorie: values[0], carb: values[1], protein: values[2], fat: values[3] });
    setEditingAnalysis(false);
  };

  const submit = async () => {
    if (!content.trim()) return Alert.alert('내용을 입력해 주세요');
    setPosting(true);
    try {
      if (isMockMode) createPost(content.trim(), analysis?.foodName || '오늘의 한 끼');
      else await communityApi.create({ imageUri: imageUri || undefined, content: content.trim(), eatenAt: new Date().toISOString(), calorie: analysis?.calorie, carb: analysis?.carb, protein: analysis?.protein, fat: analysis?.fat });
      router.replace('/(tabs)/community');
    } catch (error) { Alert.alert('게시하지 못했어요', getErrorMessage(error)); setPosting(false); }
  };

  return <Screen><Header title="새 게시물" subtitle="오늘 먹은 한 끼를 기록해요" left={<IconButton label="←" onPress={() => router.back()} />} />
    <Pressable style={[styles.photo, imageUri && styles.photoSelected]} onPress={choose}>{imageUri ? <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" /> : <><Text style={styles.addMark}>＋</Text><Text style={styles.photoTitle}>식단 사진 추가</Text><Text style={styles.photoSub}>선택 사항 · 최대 10MB</Text></>}</Pressable>
    {analyzing ? <View style={styles.analysisStatus}><Text style={styles.analysisStatusText}>사진에 보이는 음식과 양을 바탕으로 영양 정보를 추정하고 있어요...</Text></View> : analysis ? <View style={styles.analysisCard}><View style={styles.analysisTop}><View><Text style={styles.analysisLabel}>사진 기반 영양 추정</Text><Text style={styles.foodName}>{analysis.foodName}</Text></View><View style={styles.analysisValue}><Text style={styles.calorie}>{analysis.calorie} kcal</Text>{!editingAnalysis ? <Pressable onPress={beginAnalysisEdit}><Text style={styles.editAnalysis}>수정</Text></Pressable> : null}</View></View><NutrientChips carbs={analysis.carb} protein={analysis.protein} fat={analysis.fat} /><Text style={styles.estimateNotice}>사진만으로 계산한 추정값이며 실제와 다를 수 있어요. 게시 전에 확인·수정해 주세요.</Text></View> : null}
    {editingAnalysis && analysisDraft ? <View style={styles.editCard}><Field label="음식 이름" value={analysisDraft.foodName} onChangeText={(value) => updateAnalysisDraft('foodName', value)} /><View style={styles.editRow}><View style={styles.editFlex}><Field label="열량 (kcal)" value={analysisDraft.calorie} onChangeText={(value) => updateAnalysisDraft('calorie', value)} keyboardType="decimal-pad" /></View><View style={styles.editFlex}><Field label="탄수화물 (g)" value={analysisDraft.carb} onChangeText={(value) => updateAnalysisDraft('carb', value)} keyboardType="decimal-pad" /></View></View><View style={styles.editRow}><View style={styles.editFlex}><Field label="단백질 (g)" value={analysisDraft.protein} onChangeText={(value) => updateAnalysisDraft('protein', value)} keyboardType="decimal-pad" /></View><View style={styles.editFlex}><Field label="지방 (g)" value={analysisDraft.fat} onChangeText={(value) => updateAnalysisDraft('fat', value)} keyboardType="decimal-pad" /></View></View><View style={styles.editRow}><View style={styles.editFlex}><PrimaryButton title="취소" variant="ghost" onPress={() => setEditingAnalysis(false)} /></View><View style={styles.editFlex}><PrimaryButton title="수정값 반영" onPress={applyAnalysisEdit} /></View></View></View> : null}
    <Field label="내용" value={content} onChangeText={setContent} placeholder="식단 이야기나 간단한 팁을 남겨 보세요." multiline maxLength={500} />
    <View style={styles.notice}><Text style={styles.noticeTitle}>게시 전 확인</Text><Text style={styles.noticeText}>얼굴, 주소, 연락처처럼 공개하고 싶지 않은 정보가 사진이나 글에 포함되지 않았는지 확인해 주세요.</Text></View>
    <PrimaryButton title="게시하기" onPress={submit} loading={posting} disabled={!content.trim() || editingAnalysis} />
  </Screen>;
}

const styles = StyleSheet.create({
  photo: { height: 180, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: palette.surface, ...shadow },
  photoSelected: {},
  image: { width: '100%', height: '100%' },
  addMark: { color: palette.muted, fontSize: 44, fontWeight: '300' },
  photoTitle: { color: palette.ink, fontWeight: '500', marginTop: spacing.sm },
  photoSub: { color: palette.muted, fontSize: 12, marginTop: 3 },
  analysisStatus: { backgroundColor: palette.blueSoft, borderRadius: radii.md, padding: spacing.md },
  analysisStatusText: { color: palette.blue, fontSize: 12, fontWeight: '500' },
  analysisCard: { backgroundColor: palette.leafSoft, borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm },
  analysisTop: { flexDirection: 'row', justifyContent: 'space-between' },
  analysisLabel: { color: palette.leaf, fontSize: 12, fontWeight: '600' },
  analysisValue: { alignItems: 'flex-end', gap: 4 },
  editAnalysis: { color: palette.ink, fontSize: 12, fontWeight: '600' },
  foodName: { color: palette.ink, fontSize: 14, fontWeight: '600', marginTop: 3 },
  calorie: { color: palette.ink, fontSize: 14, fontWeight: '600' },
  estimateNotice: { ...font.caption, color: palette.muted, lineHeight: 17 },
  editCard: { backgroundColor: palette.surface, borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm, ...shadow },
  editRow: { flexDirection: 'row', gap: spacing.sm },
  editFlex: { flex: 1 },
  notice: { backgroundColor: palette.surfaceWarm, borderRadius: radii.md, padding: spacing.md },
  noticeTitle: { color: palette.ink, fontSize: 12, fontWeight: '600' },
  noticeText: { ...font.caption, color: palette.muted, marginTop: 3 },
});

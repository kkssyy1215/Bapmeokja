
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { router } from 'expo-router';
import { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Card, EmptyState, Header, Icon, IconButton, ListGroup, MealRow, Note, Pressable, Screen, SectionTitle } from '@/components/ui';

import { palette, radii, shadow, spacing } from '@/constants/design';

import { useApp } from '@/context/app-context';
import { saveMealImage } from '@/services/meal-image-store';

export default function RecordsScreen() {
  const { meals } = useApp();

  const [picking, setPicking] = useState(false);

  
  const pick = async (camera: boolean) => {
    if (picking) return;

    setPicking(true);

    try {
      const permission = camera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          '권한이 필요해요',
          camera
            ? '식단을 촬영하려면 카메라 권한을 허용해 주세요.'
            : '식단 사진을 선택하려면 사진 권한을 허용해 주세요.'
        );
        return;
      }

      const result = camera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
          });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const originalUri = result.assets[0].uri;

      console.log('[Records] 사진 선택 완료');

      const manipulated =
        await ImageManipulator.manipulateAsync(
          originalUri,
          [{ resize: { width: 800 } }],
          {
            compress: 0.7,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          }
        );

      if (!manipulated.base64) {
        throw new Error(
          '사진 데이터를 생성하지 못했어요.'
        );
      }

      // 원본 URI와 미리보기 데이터는 메모리에 저장한다.
      // 라우터 파라미터는 디코딩되면서 URI가 바뀔 수 있어 짧은 id만 넘긴다.
      const imageId = saveMealImage(
        manipulated.uri,
        manipulated.base64
      );

      console.log('[Records] 사진 변환 성공');

      router.push({
        pathname: '/meal-analysis',
        params: {
          imageId,
        },
      });
    } catch (error) {
      console.log(
        '[Records] 사진 처리 실패:',
        error
      );

      Alert.alert(
        '사진을 불러오지 못했어요',
        error instanceof Error
          ? error.message
          : '사진을 다시 선택해 주세요.'
      );
    } finally {
      setPicking(false);
    }
  };


  return (
    <Screen>
      <Header
        title="식단 기록"
        subtitle="사진 한 장이면 충분해요"
        right={<IconButton label="◫" onPress={() => router.push('/history')} accessibilityLabel="식단 달력" />}
      />

      <View style={styles.bento}>
        <Pressable accessibilityRole="button" style={styles.camera} onPress={() => pick(true)} disabled={picking}>
          <View style={styles.cameraIcon}><Icon name="camera" size={22} color={palette.onAccent} /></View>
          <View>
            <Text style={styles.cameraTitle}>카메라로 촬영</Text>
            <Text style={styles.cameraSub}>찍으면 바로 분석해요</Text>
          </View>
        </Pressable>
        <View style={styles.side}>
          <Pressable accessibilityRole="button" style={styles.tile} onPress={() => pick(false)} disabled={picking}>
            <View style={styles.tileIcon}><Icon name="image" size={17} color={palette.tomato} /></View>
            <Text style={styles.tileTitle}>앨범에서 선택</Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.tile} onPress={() => router.push('/manual-entry')}>
            <View style={styles.tileIcon}><Icon name="edit-3" size={17} color={palette.tomato} /></View>
            <Text style={styles.tileTitle}>직접 입력</Text>
          </Pressable>
        </View>
      </View>

      {picking ? <View style={styles.processing}><ActivityIndicator color={palette.tomato} /><Text style={styles.processingText}>사진을 준비하고 있어요</Text></View> : null}

      <Note>사진 분석은 참고용이에요. 저장 전에 음식명과 양을 확인해 주세요.</Note>

      <SectionTitle title="최근 기록" action="전체 보기" onAction={() => router.push('/history')} />
      {meals.length ? (
        <ListGroup>
          {meals.slice(0, 5).map((meal) => <MealRow key={meal.id} meal={meal} onPress={() => router.push({ pathname: '/meal-analysis', params: { saved: '1', id: meal.id } })} />)}
        </ListGroup>
      ) : <Card><EmptyState icon="edit-3" title="아직 기록이 없어요" description="첫 식사를 사진으로 남겨 보세요." /></Card>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bento: { flexDirection: 'row', gap: 12, minHeight: 172 },
  side: { flex: 1, gap: 12 },
  camera: { flex: 1.1, backgroundColor: palette.accent, borderRadius: radii.lg, padding: 16, justifyContent: 'space-between' },
  cameraIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  cameraTitle: { color: palette.onAccent, fontSize: 17, fontWeight: '600', letterSpacing: -0.3 },
  cameraSub: { color: palette.onAccent, fontSize: 13, marginTop: 2 },
  tile: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.surface, borderRadius: radii.lg, paddingHorizontal: 12, ...shadow },
  tileIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: palette.accentSoft, alignItems: 'center', justifyContent: 'center' },
  tileTitle: { flex: 1, color: palette.ink, fontSize: 14, fontWeight: '500', letterSpacing: -0.2 },
  processing: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  processingText: { color: palette.muted, fontSize: 13 },
});

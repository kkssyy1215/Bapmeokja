/**
 * 식단 사진을 화면 사이에 전달하기 위한 메모리 저장소.
 *
 * 사진 URI를 라우터 파라미터로 직접 넘기면 expo-router의 useLocalSearchParams가
 * 값을 decodeURIComponent로 한 번 더 디코딩한다. Expo Go(Android) 캐시 경로처럼
 * `%2540anonymous%252F...` 같은 퍼센트 인코딩이 들어 있는 URI는 이 과정에서
 * 다른 문자열로 바뀌어 원본 파일을 찾지 못한다.
 *
 * 그래서 라우터에는 URL에 안전한 짧은 id만 넘기고,
 * 원본 파일 URI와 미리보기용 data URI는 이곳에 보관한다.
 */
export type MealImage = {
  id: string;
  /** 분석 요청(업로드)에 쓰는 원본 파일 URI. 디코딩되지 않은 그대로의 값이다. */
  fileUri: string;
  /** 미리보기에 쓰는 data URI. base64가 없으면 null이다. */
  dataUri: string | null;
};

// 뒤로 가기 후 다시 들어오는 경우 등을 위해 최근 몇 장만 보관한다.
const MAX_STORED_IMAGES = 5;

const images = new Map<string, MealImage>();

function createImageId() {
  return `meal_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function toDataUri(
  base64: string | null | undefined,
  mimeType: string
): string | null {
  if (!base64) return null;

  // 이미 data URI 형태로 들어온 경우 접두어를 두 번 붙이지 않는다.
  if (base64.startsWith('data:')) return base64;

  return `data:${mimeType};base64,${base64}`;
}

/**
 * 사진을 저장하고, 라우터 파라미터로 넘길 id를 돌려준다.
 */
export function saveMealImage(
  fileUri: string,
  base64?: string | null,
  mimeType = 'image/jpeg'
): string {
  if (!fileUri) {
    throw new Error('사진 경로가 비어 있어요.');
  }

  const id = createImageId();

  images.set(id, {
    id,
    fileUri,
    dataUri: toDataUri(base64, mimeType),
  });

  // 가장 오래된 사진부터 지운다. (Map은 삽입 순서를 유지한다)
  while (images.size > MAX_STORED_IMAGES) {
    const oldest = images.keys().next().value;
    if (oldest === undefined) break;
    images.delete(oldest);
  }

  return id;
}

export function getMealImage(
  id?: string | string[] | null
): MealImage | null {
  const key = Array.isArray(id) ? id[0] : id;

  if (!key) return null;

  return images.get(key) ?? null;
}

/**
 * 미리보기에 시도할 URI 목록. data URI를 먼저, 원본 파일 URI를 다음으로 쓴다.
 * 빈 문자열은 절대 넣지 않는다. (RN Image는 빈 uri를 "source.uri should not be
 * an empty string" 경고로 처리한다)
 */
export function getMealImagePreviewUris(
  image: MealImage | null
): string[] {
  if (!image) return [];

  return [image.dataUri, image.fileUri].filter(
    (uri, index, list): uri is string =>
      typeof uri === 'string' &&
      uri.length > 0 &&
      list.indexOf(uri) === index
  );
}

export function clearMealImages() {
  images.clear();
}

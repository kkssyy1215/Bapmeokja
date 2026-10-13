
type MealImagePreview = {
  fileUri: string;
  dataUri: string;
};

let currentPreview: MealImagePreview | null = null;

export function setMealImagePreview(
  fileUri: string,
  base64: string
) {
  currentPreview = {
    fileUri,
    dataUri: `data:image/jpeg;base64,${base64}`,
  };

  console.log('[MealImage] 사진 데이터 저장 완료');
}

export function getMealImagePreview(
  fileUri?: string
): string | null {
  if (!fileUri || !currentPreview) {
    return null;
  }

  if (currentPreview.fileUri !== fileUri) {
    return null;
  }

  return currentPreview.dataUri;
}

export function clearMealImagePreview() {
  currentPreview = null;
}

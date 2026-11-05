import { router } from 'expo-router';

/**
 * 이전 화면으로 돌아간다. 주소로 바로 들어왔거나 새로고침해서 돌아갈 화면이 없으면 홈으로 보낸다.
 * 로그인 전이면 홈 화면이 로그인 화면으로 다시 보낸다.
 */
export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/(tabs)/home');
}

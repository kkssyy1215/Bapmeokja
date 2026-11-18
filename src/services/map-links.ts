export type MapPoint = { lat: number; lng: number };

/** 내 위치에서 식당까지 도보 길찾기. 국내 경로가 정확한 카카오맵으로 연다. */
export function directionsUrl(origin: MapPoint, store: MapPoint & { name: string }) {
  const label = (text: string) => encodeURIComponent(text.replaceAll(',', ' '));
  return `https://map.kakao.com/link/by/walk/${label('내 위치')},${origin.lat},${origin.lng}/${label(store.name)},${store.lat},${store.lng}`;
}

export function walkingMinutes(distanceMeters: number) {
  return Math.max(1, Math.round(distanceMeters / 70));
}

/** 메뉴를 파는 실제 식당을 네이버 지도에서 찾는다. 웹은 좌표를 지정할 수 없어 접속 위치 기준으로 열린다. */
export function naverSearchWebUrl(query: string) {
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
}

export function naverSearchAppUrl(query: string) {
  return `nmap://search?query=${encodeURIComponent(query)}&appname=com.bapmeokja.app`;
}

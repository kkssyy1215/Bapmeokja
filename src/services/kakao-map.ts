import { MapPoint } from '@/services/map-links';

/** 카카오맵 JavaScript 키. 브라우저에 노출되는 공개 키이며, 카카오 콘솔에 등록한 도메인에서만 동작한다. */
export const kakaoJsKey = process.env.EXPO_PUBLIC_KAKAO_JS_KEY ?? '';

export const kakaoSdkUrl = (key: string) => `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false`;

/**
 * 지도에 내 위치(점)와 식당(마커)을 함께 보이도록 그리는 스크립트 본문.
 * 웹에서는 직접 실행하고, 앱에서는 WebView 안 HTML에 그대로 넣어 쓴다.
 */
export const drawMapSource = `
function drawStoreMap(kakao, element, origin, store) {
  var maps = kakao.maps;
  var me = new maps.LatLng(origin.lat, origin.lng);
  var shop = new maps.LatLng(store.lat, store.lng);
  element.innerHTML = '';
  var map = new maps.Map(element, { center: shop, level: 4 });
  new maps.Marker({ map: map, position: shop, title: store.name || '' });
  new maps.CustomOverlay({ map: map, position: me, zIndex: 3,
    content: '<div style="width:14px;height:14px;border-radius:50%;background:#B05C48;border:3px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.2)"></div>' });
  var bounds = new maps.LatLngBounds();
  bounds.extend(me);
  bounds.extend(shop);
  map.setBounds(bounds, 48, 48, 48, 48);
  return map;
}`;

type KakaoGlobal = { maps: { load: (callback: () => void) => void } };
let loading: Promise<KakaoGlobal> | null = null;

/** 웹에서 카카오맵 SDK를 한 번만 불러온다. 키가 없거나 도메인이 등록되지 않았으면 실패한다. */
export function loadKakaoMaps(): Promise<KakaoGlobal> {
  if (loading) return loading;
  loading = new Promise<KakaoGlobal>((resolve, reject) => {
    const global = window as unknown as { kakao?: KakaoGlobal };
    const ready = () => (global.kakao?.maps ? global.kakao.maps.load(() => resolve(global.kakao as KakaoGlobal)) : reject(new Error('카카오맵을 불러오지 못했어요.')));
    if (global.kakao?.maps) return ready();
    const script = document.createElement('script');
    script.src = kakaoSdkUrl(kakaoJsKey);
    script.async = true;
    script.onload = ready;
    script.onerror = () => reject(new Error('카카오맵을 불러오지 못했어요.'));
    document.head.append(script);
  }).catch((error) => {
    loading = null;
    throw error;
  });
  return loading;
}

type DrawStoreMap = (kakao: KakaoGlobal, element: HTMLElement, origin: MapPoint, store: MapPoint & { name?: string }) => unknown;
let drawStoreMap: DrawStoreMap | null = null;

export function drawKakaoStoreMap(kakao: KakaoGlobal, element: HTMLElement, origin: MapPoint, store: MapPoint & { name?: string }) {
  // 웹과 앱이 같은 그리기 코드를 쓰도록 문자열로 둔 함수를 한 번만 만든다.
  drawStoreMap ??= new Function(`${drawMapSource}; return drawStoreMap;`)() as DrawStoreMap;
  return drawStoreMap(kakao, element, origin, store);
}

/** 앱(WebView)에서 쓰는 지도 HTML. baseUrl을 카카오에 등록한 웹 주소로 두어야 SDK가 동작한다. */
export function kakaoMapHtml(origin: MapPoint, store: MapPoint & { name?: string }) {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#map{margin:0;width:100%;height:100%}</style></head><body><div id="map"></div>
<script src="${kakaoSdkUrl(kakaoJsKey)}"></script>
<script>${drawMapSource}
kakao.maps.load(function(){ drawStoreMap(kakao, document.getElementById('map'), ${JSON.stringify(origin)}, ${JSON.stringify(store)}); });</script></body></html>`;
}

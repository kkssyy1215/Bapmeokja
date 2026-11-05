// 디자인 규칙: 살짝 따뜻한 뉴트럴 표면에 뮤트 테라코타 한 가지 색만 쓴다.
// 색은 진하기만 달리해서 쓰고, 초록·노랑·파랑 같은 다른 색상은 넣지 않는다. 캐릭터만 예외다.
// tomato 계열 이름은 기존 화면 호환을 위해 남겨 둔 강조색 이름이다.
const sunken = '#EEEBE6';
const secondary = '#57514B';

export const palette = {
  background: '#F6F4F1',
  surface: '#FFFFFF',
  sunken,
  surfaceWarm: sunken,
  ink: '#2C2926',
  muted: '#6A645E',
  line: '#ECE8E3',
  slate: secondary,
  accent: '#B05C48', // 흰 글자를 올리는 면 (주 버튼, 선택 상태)
  tomato: '#A04F3C', // 글자와 아이콘
  tomatoDark: '#A04F3C',
  tomatoFill: '#C98372', // 게이지와 그래프 (글자를 올리지 않음)
  accentSoft: '#F8EAE5', // 연한 면 (상태 카드, 아이콘 칩)
  tomatoSoft: '#F8EAE5',
  leaf: secondary,
  leafFill: '#EACABF', // 그래프 연한 단계
  leafSoft: sunken,
  yellow: '#DBA594', // 그래프 중간 단계
  amber: secondary,
  yellowSoft: sunken,
  blue: secondary,
  blueSoft: sunken,
  bar: '#C98372',
  danger: '#AE4A42', // 채도를 낮춘 빨강. 삭제와 오류에만 쓴다.
  onAccent: '#FFFFFF',
};

export const radii = { sm: 12, md: 14, lg: 20, xl: 24, pill: 999 };
export const spacing = { xs: 6, sm: 10, md: 16, lg: 22, xl: 30, xxl: 40 };

export const shadow = { boxShadow: '0px 4px 18px rgba(70, 50, 40, 0.06)' };
export const shadowSm = { boxShadow: '0px 2px 8px rgba(70, 50, 40, 0.08)' };

export const font = {
  title: { fontSize: 28, lineHeight: 35, fontWeight: '600' as const, letterSpacing: -0.6 },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const, letterSpacing: -0.3 },
  subheading: { fontSize: 15, fontWeight: '500' as const, letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 22 },
  caption: { fontSize: 13, lineHeight: 18 },
};

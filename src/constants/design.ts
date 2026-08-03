import { Platform } from 'react-native';

export const palette = {
  background: '#F7F4ED',
  surface: '#FFFFFF',
  surfaceWarm: '#FFF7E9',
  ink: '#24231F',
  muted: '#77736B',
  line: '#E9E4DA',
  tomato: '#F05A4A',
  tomatoDark: '#D9473B',
  tomatoSoft: '#FFE3DE',
  leaf: '#4D8B62',
  leafSoft: '#E6F2E9',
  yellow: '#F3B63F',
  yellowSoft: '#FFF0C9',
  blue: '#5586D8',
  blueSoft: '#EAF0FB',
  purple: '#7C6DD5',
  danger: '#D94A42',
};

export const radii = { sm: 10, md: 16, lg: 22, xl: 30, pill: 999 };
export const spacing = { xs: 6, sm: 10, md: 16, lg: 22, xl: 30, xxl: 40 };

export const shadow = Platform.select({
  ios: {
    shadowColor: '#4A4034',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  android: { elevation: 3 },
  default: { boxShadow: '0 8px 30px rgba(74, 64, 52, 0.08)' },
});

export const font = {
  title: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.8 },
  heading: { fontSize: 20, fontWeight: '800' as const, letterSpacing: -0.4 },
  subheading: { fontSize: 16, fontWeight: '700' as const },
  body: { fontSize: 15, lineHeight: 22 },
  caption: { fontSize: 12, lineHeight: 17 },
};

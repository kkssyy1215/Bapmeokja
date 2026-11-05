import { ScrollViewStyleReset } from 'expo-router/html';
import { PropsWithChildren } from 'react';

// 웹에서만 쓰는 전역 스타일: 첫 화면 배경색, 키보드 포커스 표시, 움직임 줄이기 설정.
const css = `
html, body { background-color: #F6F4F1; }
body, input, textarea { -webkit-font-smoothing: antialiased; }
[dir='auto'] { word-break: keep-all; overflow-wrap: anywhere; }
:focus-visible:not(input):not(textarea) { outline: 2px solid #A04F3C !important; outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>밥 먹자!</title>
        <meta name="description" content="사진 한 장으로 식단을 기록하고 영양을 관리하는 앱" />
        <meta name="theme-color" content="#F6F4F1" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

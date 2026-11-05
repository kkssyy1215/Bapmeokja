import { Alert, AlertButton, Platform } from 'react-native';

// react-native-web의 Alert.alert는 아무 동작도 하지 않는다. 브라우저 확인창은 인앱 브라우저나
// 내장 웹뷰에서 뜨지 않고 바로 취소로 처리될 수 있어 앱 안에 직접 그린다.
const COLOR = { ink: '#2C2926', muted: '#6A645E', fill: '#EEEBE6', accent: '#B05C48', danger: '#AE4A42' };

function showDialog(title: string, message: string | undefined, buttons: AlertButton[]) {
  const previousFocus = document.activeElement as HTMLElement | null;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(30,25,20,.45);font-family:inherit';
  const box = document.createElement('div');
  box.setAttribute('role', 'alertdialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', title);
  box.style.cssText = 'width:100%;max-width:320px;box-sizing:border-box;background:#fff;border-radius:20px;padding:22px 20px 18px;box-shadow:0 12px 40px rgba(40,30,20,.25)';

  const heading = document.createElement('div');
  heading.textContent = title;
  heading.style.cssText = `color:${COLOR.ink};font-size:17px;font-weight:600;line-height:24px;word-break:keep-all`;
  box.append(heading);
  if (message) {
    const body = document.createElement('div');
    body.textContent = message;
    body.style.cssText = `color:${COLOR.muted};font-size:14px;line-height:20px;margin-top:6px;word-break:keep-all;white-space:pre-line`;
    box.append(body);
  }

  const close = (button?: AlertButton) => {
    document.removeEventListener('keydown', onKey);
    overlay.remove();
    previousFocus?.focus?.();
    button?.onPress?.();
  };
  const cancel = buttons.find((button) => button.style === 'cancel');
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') close(cancel);
  };
  document.addEventListener('keydown', onKey);

  const row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:8px;margin-top:18px';
  const primary = buttons.filter((button) => button !== cancel).at(-1);
  let primaryElement: HTMLButtonElement | undefined;
  for (const button of buttons) {
    const element = document.createElement('button');
    element.type = 'button';
    element.textContent = button.text ?? '확인';
    const isPrimary = button === primary;
    const background = isPrimary ? (button.style === 'destructive' ? COLOR.danger : COLOR.accent) : COLOR.fill;
    element.style.cssText = `flex:1;min-height:46px;border:0;border-radius:14px;cursor:pointer;font:inherit;font-size:15px;font-weight:500;background:${background};color:${isPrimary ? '#fff' : COLOR.ink}`;
    if (isPrimary) {
      element.dataset.testid = 'dialog-confirm';
      primaryElement = element;
    }
    element.addEventListener('click', () => close(button));
    row.append(element);
  }
  box.append(row);
  overlay.append(box);
  document.body.append(overlay);
  primaryElement?.focus();
}

if (Platform.OS === 'web') {
  Alert.alert = (title, message, buttons) => {
    showDialog(title, message, buttons?.length ? buttons : [{ text: '확인' }]);
  };
}

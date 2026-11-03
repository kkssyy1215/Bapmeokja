import { Alert, Platform } from 'react-native';

// react-native-web의 Alert.alert는 아무 동작도 하지 않아 브라우저 대화상자로 대신한다.
if (Platform.OS === 'web') {
  Alert.alert = (title, message, buttons) => {
    const text = [title, message].filter(Boolean).join('\n\n');
    const cancel = buttons?.find((button) => button.style === 'cancel');
    const confirm = buttons?.filter((button) => button !== cancel).at(-1);
    if (cancel && confirm) {
      (window.confirm(text) ? confirm : cancel).onPress?.();
      return;
    }
    window.alert(text);
    confirm?.onPress?.();
  };
}

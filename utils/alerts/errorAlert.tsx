import {Alert} from 'react-native';
import strings from '../../constants/lang';

export const errorAlert = (title: string, message: string): void => {
  Alert.alert(
    title,
    message,
    [{text: strings.DONE, onPress: () => {}, style: 'cancel'}],
    {
      cancelable: true,
      onDismiss: () => {},
    },
  );
};

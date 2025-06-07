import {Alert} from 'react-native';
import strings from '../../constants/lang';

export interface ConfirmAlertParams {
  params: any[];
  func: (...params: any[]) => void;
  title: string;
  message: string;
}

export const confirmAlert = ({
  params,
  func,
  title,
  message,
}: ConfirmAlertParams) => {
  Alert.alert(
    title,
    message,
    [
      {text: strings.CANCEL, style: 'cancel'},
      {
        text: strings.DONE,
        onPress: () => func(...params),
        style: 'destructive',
      },
    ],
    {cancelable: true, onDismiss: () => {}},
  );
};

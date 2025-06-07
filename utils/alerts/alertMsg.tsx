import {Alert} from 'react-native';
import strings from '../../constants/lang';

export const alertMsg = (
  title: string,
  message: string,
  callback?: (props: any) => void,
  props?: any,
) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: strings.DONE,
        onPress: () => callback && callback(props),
        style: 'cancel',
      },
    ],
    {
      cancelable: true,
      onDismiss: () => {},
    },
  );
};

// export const alertMsg = (title: string, message: string) => {
//   Alert.alert(
//     title,
//     message,
//     [{text: '확인', onPress: () => {}, style: 'cancel'}],
//     {
//       cancelable: true,
//       onDismiss: () => {},
//     },
//   );
// };

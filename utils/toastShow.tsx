import {RFPercentage} from 'react-native-responsive-fontsize';
import Toast from 'react-native-toast-message';

export const toastShow = (type: string, text: string): void => {
  Toast.show({
    topOffset: RFPercentage(10),
    autoHide: true,
    visibilityTime: 1500,
    type: type as any, // Assuming 'type' is a string, you might need to adjust this depending on the type definition of 'type' in react-native-toast-message
    text1: text,
    text2: '',
  });
};

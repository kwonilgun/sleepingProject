import AsyncStorage from '@react-native-async-storage/async-storage';

// 서버에서 받은 토큰 저장
export const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('userToken', token);
  } catch (error) {
    console.log('Error saving token:', error);
  }
};

// 저장된 토큰 불러오기
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return token;
  } catch (error) {
    console.log('Error getting token:', error);
  }
};

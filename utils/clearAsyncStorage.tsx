import AsyncStorage from '@react-native-async-storage/async-storage';

const clearAsyncStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
    console.log('AsyncStorage successfully cleared!');
  } catch (e) {
    console.error('Failed to clear AsyncStorage.', e);
  }
};

export default clearAsyncStorage;

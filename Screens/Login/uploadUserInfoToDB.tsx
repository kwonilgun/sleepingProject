import axios, {AxiosResponse} from 'axios';
import {UserFormInput} from '../model/interface/IAuthInfo';
import {getToken} from '../../utils/getSaveToken';
import {baseURL} from '../../assets/common/BaseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function uploadUserInfoToDB(
  info: UserFormInput,
  userInfo: UserFormInput,
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const token = await getToken();
      //헤드 정보를 만든다.
      const config = {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
      };
      const params = {
        name: info.name,
        phone: info.phoneNumber,
        bankName: '',
        bankNumber: '',
        user: userInfo.userId,
        // ozsId: info.ozsId,
      };
      const response: AxiosResponse = await axios.put(
        `${baseURL}users/${userInfo.userId}`,
        JSON.stringify(params),
        config,
      );
      if (response && response.status < 400) {
        console.log('response.data = ', response.data);

        // 2024-05-07 : 업로드 성공한 후에 ozsId를 로컬에 저장
        // console.log('uploadUserInfoToDB.tsx ozsId = ', info.ozsId!);
        // await AsyncStorage.setItem('ozsId', info.ozsId!);
        resolve('업로드 성공');
      }
    } catch (error) {
      reject('업로드 실패');
    }
  });
}

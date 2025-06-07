import axios, {AxiosResponse} from 'axios';
import {baseURL} from '../../assets/common/BaseUrl';
import DeviceInfo from 'react-native-device-info';
import {UserFormInput} from '../model/interface/IAuthInfo';
import {IAuthResult} from '../model/interface/IAuthInfo';

// 참조 사이트: https://yoo11052.tistory.com/155
/*
프로미스로 구현된 비동기 함수를 호출하는 측에서는 프로미스 객체의 후속 처리 메소드(then, catch)를 통해 비동기 처리 결과 또는 에러 메세지를 전달받아 처리합니다.


then

then 메소드는 두 개의 콜백 함수를 인자로 전달 받습니다.
첫 번째 콜백 함수는 성공(fulfilled, resolve 함수가 호출된 경우)시에 실행됩니다.
두 번째 콜백 함수는 실패(rejected, reject 함수가 호출된 경우)시에 실행됩니다.
then 메소드는 기본적으로 프로미스를 반환합니다.

catch

catch 메소드는 비동기 처리 혹은 then 메소드 실행 중 발생한 에러(예외)가 발생하면 호출됩니다.
catch 메소드 역시 프로미스를 반환합니다.
*/

export const getInfoOfPhoneNumberFromDb = (
  user: UserFormInput,
): Promise<IAuthResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      console.log('Device ID:', deviceId);

      const deviceUser = {...user, deviceId: deviceId};
      const response: AxiosResponse = await axios.post(
        `${baseURL}users/phonelogin`,
        JSON.stringify(deviceUser),
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      // console.log('response = ', response);
      if (response && response.data) {
        const login = {
          status: response.status,
          data: response.data,
        };
        resolve(login);
      }
    } catch (error) {
      console.log('useLogin error = ', error);
      reject(error);
    }
  });
};

export const getInfoOfEmailFromDb = (
  user: UserFormInput,
): Promise<IAuthResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      // console.log('Device ID:', deviceId);

      const deviceUser = {...user, deviceId: deviceId};
      const response: AxiosResponse = await axios.post(
        `${baseURL}users/email-login`,
        JSON.stringify(deviceUser),
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      // console.log('response = ', response);
      if (response && response.data) {
        console.log('useLogin response.data = ', response.data);
        const login = {
          status: response.status,
          data: response.data,
        };
        resolve(login);
      }
    } catch (error) {
      console.log('email 로그인 에러 error=', error);
      reject(error);
    }
  });
};

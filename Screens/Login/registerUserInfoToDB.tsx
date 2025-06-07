import axios, {AxiosResponse} from 'axios';
import DeviceInfo from 'react-native-device-info';
// import {IAuthFormInput} from './Authorize.Screen';
import {IAuthVerify} from '../model/interface/IAuthInfo';
import {baseURL} from '../../assets/common/BaseUrl';

// IAuthFormInput을 확장하여 verify를 추가

export const registerUserInfoToDB = (
  data: IAuthVerify,
): Promise<{status: number}> => {
  console.log('registerUserInfoToDB.tsx data', data);

  return new Promise(async (resolve, reject) => {
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      const params = {
        phoneNum: data?.phoneNumber,
        email: data?.name,
        password: data.password,
        verifycode: data.verify,
        deviceId: deviceId,
        deviceToken: '',

        // 2024-05-07 : 제품 serial number 등록한다. 같은 제품 번호 등록을 방지하기 위해서
        // ozsId: data?.ozsId,
      };

      const response: AxiosResponse = await axios.post(
        `${baseURL}sms/verifycode`,
        JSON.stringify(params),
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
      console.log(
        'registerUserInfoDB.tsx : response',
        response.data,
        response.status,
      );
      if (response && response.status) {
        resolve({status: response.status});
      }
    } catch (error) {
      console.log('registerUserInfoDB.tsx : error', error);
      reject({status: 500});
    }
  });
};

import axios, {AxiosResponse} from 'axios';
import {baseURL} from '../../assets/common/BaseUrl';
import {IAuth, UserFormInput} from '../model/interface/IAuthInfo';

interface Response {
  status: number;
}

export const getCodeFromServer = (data: IAuth): Promise<Response> => {
  console.log('getCodeFromServer.tsx data = ', data);
  return new Promise(async (resolve, reject) => {
    try {
      const response: AxiosResponse = await axios.post(
        `${baseURL}sms/phonenum`,
        JSON.stringify({phoneNum: data.phoneNumber}),
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
      console.log(
        'getCodeFromServer.tsx response :',
        response.data,
        response.status,
      );
      if (response && response.status) {
        resolve({status: response.status});
      }
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

//2024-11-13 : email로 확인 번호를 받는다.
export const getCodeFromEmail = (data: UserFormInput): Promise<Response> => {
  console.log('getCodeFromServer.tsx data = ', data);
  return new Promise(async (resolve, reject) => {
    try {
      const response: AxiosResponse = await axios.post(
        `${baseURL}sms/email`,
        JSON.stringify({email: data.name, password: data.password}),
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
      console.log(
        'getCodeFromServer.tsx response :',
        response.data,
        response.status,
      );
      if (response && response.status) {
        resolve({status: response.status});
      }
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

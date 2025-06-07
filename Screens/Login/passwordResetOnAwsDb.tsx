import axios, {AxiosResponse} from 'axios';
import {baseURL} from '../../assets/common/BaseUrl';
import {IEmail, IEmailResult} from './PasswordReset.Screen';

export function passwordResetOnAwsDb(data: IEmail): Promise<IEmailResult> {
  return new Promise(async (resolve, reject) => {
    try {
      const config = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      };
      const params = {
        email: data.email,
      };
      const response: AxiosResponse = await axios.post(
        `${baseURL}users/reset-password`,
        JSON.stringify(params),
        config,
      );
      if (response && response.status < 400) {
        console.log('response.data = ', response.data);
        const result = {
          status: response.status,
          data: response.data,
        };
        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  });
}

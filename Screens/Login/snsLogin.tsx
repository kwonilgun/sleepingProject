/* eslint-disable react/jsx-no-undef */
/*
 * File: Membership.Screen.tsx
 * Project: market_2024_12_13
 * File Created: Thursday, 19th December 2024 7:34:29 am
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * -----
 * Last Modified: Thursday, 19th December 2024 8:03:43 am
 * Modified By: Kwonilgun(권일근) (kwonilgun@naver.com>)
 * -----
 * Copyright <<projectCreationYear>> - 2024 루트원 AI, 루트원 AI
 * 2024-12-19 : 코드 생성
 */

/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */



import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../../assets/common/BaseUrl';


import { appleAuth } from '@invertase/react-native-apple-authentication';
import { AuthAction } from '../../context/store/Auth.Login';
import { saveToken } from '../../utils/getSaveToken';
import { OAuthResponse } from './Login.Screen';
import { jwtDecode } from 'jwt-decode';
import { UserFormInput } from '../model/interface/IAuthInfo';

/**
 * Starts the Sign In flow.
 */
export async function appleLogin() : Promise<{ success: boolean; data?: any; error?: any }> {
  console.warn('Beginning Apple Authentication');

  // start a login request
  try {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    console.log('appleAuthRequestResponse', appleAuthRequestResponse);

    // const {
    //   user: newUser,
    //   email,
    //   fullName,
    //   identityToken,
    //   nonce,
    //   realUserStatus /* etc */,
    // } = appleAuthRequestResponse;

    // 인증 상태 확인
    const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

    console.log('credentialState = ', credentialState);

    // 인증 성공 시
    // if (credentialState === appleAuth.State.AUTHORIZED) {
      const { identityToken, email } = appleAuthRequestResponse;

      if (!identityToken) {
        throw new Error('Apple Sign-In failed - no identify token returned');
      }

      console.log('identityToken =', identityToken);
      console.log('email =', email);

      // 백엔드로 토큰 전송
      const response: AxiosResponse = await axios.post(
        `${baseURL}users/apple`,
        JSON.stringify({
        token: identityToken,
        email: email}),
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      // await AsyncStorage.setItem('token', res.data.token);
      // axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      // setUser(res.data.user);
      console.log('Apple Login Success:', response.data);

      return { success: true, data: response.data };
    // } else {
    //   throw new Error('Apple Sign-In failed - user not authorized');
    // }

  } catch (err: any) {
    return { success: false, error: err.message || 'Apple login failed' };
  }
}

export const appleLogout = async (): Promise<void> => {
  try {
    await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGOUT,
    });
    console.log('Apple sign out 성공');
  } catch (error) {
    console.log('Apple Sign-Out Error: ', error);
  }
};

export const googleLogin = async (): Promise<{ success: boolean; data?: any; error?: any }> => {
  console.log('Google Login');

  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const tokenId = userInfo.data?.idToken;
    const token = { token: tokenId };
    console.log('token = ', token);

    const response: AxiosResponse = await axios.post(
      `${baseURL}users/google`,
      JSON.stringify(token),
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Google Login Success:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Google Login Failed:', error);
    return { success: false, error };
  }
};


export const googleLogout = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut();
    // Perform additional cleanup and logout operations.
    console.log('google sign out 성공');
  } catch (error) {
    console.log('Google Sign-Out Error: ', error);
  }
};


export const loginBySns = (data: OAuthResponse , dispatch: React.Dispatch<AuthAction>) => {
  console.log('loginBySns...  ');
  saveToken(data.token);

  try {
    const decoded:UserFormInput = jwtDecode(data.token);
    console.log('loginBySns decode = ', decoded);
    const userData: UserFormInput = {
          email: decoded.email,
          phoneNumber: decoded.phoneNumber,
          userId: decoded.userId === null || undefined ? '' : decoded.userId,
          isAdmin: decoded.isAdmin,
        };
    dispatch({type: 'LOGIN', payload: userData});
  } catch (error){
    console.error('snsLogin, decoded error =', error);
  }

};


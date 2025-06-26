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
import { Alert } from 'react-native';

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

export const handleAppleLogoutAndRevoke = async (): Promise<void> => {
  try {
    // 1. 사용자에게 계정 해제 의사 확인 (선택 사항)
    // 실제 프로덕션에서는 사용자에게 계정 연동을 해제할 것인지 다시 한 번 묻는 것이 좋습니다.
    // const confirm = async () => { Alert.alert(
    //   '계정 연결 해제',
    //   'Apple ID와의 연결을 정말로 해제하시겠습니까? 다시 로그인하려면 Apple ID로 로그인해야 합니다.',
    //   [{ text: "취소" }, { text: '확인', onPress: () => true }]
    // );};
    // const result = confirm();
    // if (!result) {
    //   return;
    // }

    // 2. Apple로부터 authorizationCode 획득
    // 기존 세션의 authorizationCode를 얻기 위해 REFRESH 오퍼레이션을 사용합니다.
    // REVOKE를 직접 사용할 수도 있으나, REFRESH를 통해 코드를 얻어 백엔드로 보내는 것이 일반적입니다.
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.REFRESH, // authorizationCode를 얻기 위함
    });

    const { authorizationCode } = appleAuthRequestResponse;

    if (authorizationCode) {
      console.log('Obtained authorizationCode for revocation:', authorizationCode);

      // 3. authorizationCode를 백엔드 서버로 전송하여 Revoke 요청
      // const response = await fetch('apple/revoke', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     // 필요한 경우 Authorization 헤더에 사용자 세션 토큰 포함
      //     // 'Authorization': `Bearer ${yourAppSessionToken}`,
      //   },
      //   body: JSON.stringify({ authorizationCode }),
      // });

      // 백엔드로 토큰 전송
      const response: AxiosResponse = await axios.post(
        `${baseURL}users/apple/revoke`,
        JSON.stringify({
        token: authorizationCode,
        }),
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200) {
        console.log('Apple Sign-In 연동이 성공적으로 해제되었습니다.');
        // 앱 내에서 사용자 로그인 상태를 초기화합니다.
        // 예: 로컬 스토리지에서 사용자 토큰 삭제, UI를 로그인 화면으로 전환
        // await AsyncStorage.removeItem('userToken');
        // navigateToLoginScreen();
        Alert.alert('Apple ID와의 연결이 해제되었습니다.');
      } else {
        const errorData = await response.data;
        console.error('백엔드에서 Apple Sign-In 연동 해제 실패:', errorData);
        Alert.alert(`Apple ID 연결 해제 실패: ${errorData.message || '알 수 없는 오류'}`);
      }
    } else {
      console.warn('authorizationCode를 얻을 수 없습니다. Apple ID 연동 해제를 진행할 수 없습니다.');
      Alert.alert('Apple ID 연결 해제에 필요한 정보를 얻지 못했습니다.');
    }
  } catch (error) {
    console.error('Apple Sign-Out (Revoke) 클라이언트 에러:', error);
    Alert.alert(`Apple ID 연결 해제 중 예상치 못한 오류 발생: ${error}`);
    // if (error.code === appleAuth.Error.CANCELED) {
    //   console.log('사용자가 Apple ID 연동 해제 요청을 취소했습니다.');
    // } else {
    //   alert(`Apple ID 연결 해제 중 예상치 못한 오류 발생: ${error.message}`);
    // }
  }
};
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


export const loginBySns = (data: OAuthResponse , dispatch: React.Dispatch<AuthAction>, method: 'apple' | 'google' | 'kakao' | 'email' | null) => {
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
    dispatch({type: 'LOGIN', payload: {user: userData, loginMethod: method!}});
  } catch (error){
    console.error('snsLogin, decoded error =', error);
  }

};


import { KakaoOAuthToken, KakaoProfile, login, logout, unlink } from '@react-native-seoul/kakao-login';
import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../../assets/common/BaseUrl';
import { AuthAction } from '../../context/store/Auth.Login';
import { loginBySns } from './snsLogin';
// import { useState } from 'react';

export const handleKakaoLogin = async (dispatch: React.Dispatch<AuthAction>) => {
  try {
    const token: KakaoOAuthToken = await login();
    console.log('Kakao OAuth Token:', token);
    // 서버로 액세스 토큰 또는 인증 코드를 전송하는 로직 구현
    const response = await sendTokenToServer(token.accessToken); // 또는 token.idToken (정책에 따라 선택)
    if(response.success){
      console.log('kakao login success data =', response.data);
      loginBySns(response.data, dispatch);

    }
  } catch (error) {
     console.error('카카오 로그인 실패:', error);
    // if (error.code === 'E_CANCELLED_OPERATION') {
    //   console.log('카카오 로그인 취소');
    // } else {
    //   console.error('카카오 로그인 실패:', error);
    // }
  }
};

const sendTokenToServer = async (accessToken: string) :Promise<{ success: boolean; data?: any; error?: any }>  => {
  try {

    const token = {token: accessToken};

    const response: AxiosResponse = await axios.post(
      `${baseURL}users/kakao`,
      JSON.stringify(token),
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Kakao Login success = ', response.data);
    return { success: true, data: response.data };
    // const response = await fetch('YOUR_SERVER_AUTH_ENDPOINT', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ token: accessToken, provider: 'kakao' }),
    // });
    // const data = await response.json();
    // console.log('Server Response:', data);
    // 서버로부터 받은 인증 결과 처리 (예: 로그인 상태 업데이트)
  } catch (error) {
    console.error('서버 통신 실패:', error);
    return { success: false, error };
  }
};

// 로그아웃 및 연결 끊기 예시 (필요한 경우 구현)
export const handleKakaoLogout = async () => {
  try {
    const message = await logout();
    console.log('Kakao Logout:', message);
    // 로그아웃 후 처리
  } catch (error) {
    console.error('카카오 로그아웃 실패:', error);
  }
};

export const handleKakaoUnlink = async () => {
  try {
    const message = await unlink();
    console.log('Kakao Unlink:', message);
    // 연결 끊기 후 처리
  } catch (error) {
    console.error('카카오 연결 끊기 실패:', error);
  }
};
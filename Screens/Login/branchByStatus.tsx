/*
 * File: branchByStatus.tsx
 * Project: market_2024_12_13
 * File Created: Thursday, 19th December 2024 9:29:34 am
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * -----
 * Last Modified: Thursday, 19th December 2024 9:31:44 am
 * Modified By: Kwonilgun(권일근) (kwonilgun@naver.com>)
 * -----
 * Copyright <<projectCreationYear>> - 2024 루트원 AI, 루트원 AI
 * 2024-12-19 : 최초 생성
 */

/*
참조 사이트: https://stackoverflow.com/questions/77481263/jwtdecode-invalidtokenerror-invalid-token-specified-invalid-base64-for-part,
jwtDecode - InvalidTokenError: Invalid token specified: invalid base64 for part #2 (Property ‘atob’ doesn’t exist)], jwtDecode의 typescript에서 에러 발생 시 - Fix
*/

import React from 'react';
import 'core-js/stable/atob'; // <- polyfill here
import {jwtDecode} from 'jwt-decode';
import {
  confirmAlert,
  ConfirmAlertParams,
} from '../../utils/alerts/confirmAlert';
import {EmailLoginScreenProps, LoginScreenProps} from '../model/types/TUserNavigator';
import {saveToken} from '../../utils/getSaveToken';
import {IAuthInfo} from '../model/interface/IAuthInfo';
import {IAuthResult} from '../model/interface/IAuthInfo';
import {UserFormInput} from '../model/interface/IAuthInfo';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import isEmpty from '../../utils/isEmpty';
// import {uploadMacInfoToDB} from './uploadUserInfoToDB';
import {AuthAction} from '../../context/store/Auth.Login';
// import {isValidMacAddress} from '../../utils/checkMacAddress';
import strings from '../../constants/lang';

export const AuthStatus = {
  FIRST_DEVICE_LOGIN: 200,
  OTHER_DEVICE_LOGIN: 201,
  SAME_DEVICE_LOGIN: 202,
};

export const branchByStatus = async (
  navigation: EmailLoginScreenProps,
  // element: IAuthInfo,
  element: IAuthResult,
  dispatch: React.Dispatch<AuthAction>,
): Promise<void> => {
  // 2023-05-17 : user 추가
  if (element.status === AuthStatus.FIRST_DEVICE_LOGIN) {
    // LOG.info('Auth.action.jsx:loginUser', '최초 디바이스');
    console.log(
      'Utils.tsx branchByStatus: FIRST_DEVICE_LOGIN : element = ',
      element,
    );
  }
  //다른 디바이스 로그인
  else if (element.status === AuthStatus.OTHER_DEVICE_LOGIN) {
    console.log(
      'Utils.tsx branchByStatus: OTHER_DEVICE_LOGIN : element =',
      element,
    );

    const params: IAuthInfo = {
      status: element.status,
      message: element.data.message,
      email: element.data.nickName,
      phoneNumber: element.data.phoneNumber,
    };

    const param: ConfirmAlertParams = {
      title: strings.USER_AUTH_REQUEST,
      message: element.data.message,
      // eslint-disable-next-line @typescript-eslint/no-shadow
      func: ({navigation}: LoginScreenProps, element: IAuthInfo) => {
        console.log('param2 = ', element);
        navigation.navigate('AuthorizeScreen', {authInfo: params});
      },
      params: [navigation, element],
    };

    confirmAlert(param);
  }
  // 같은 디바이스 로그인
  else if (element.status === AuthStatus.SAME_DEVICE_LOGIN) {
    // console.log('branchByStatus : SAME_DEVICE_LOGIN:  element = ', element);

    saveToken(element.data.token);

    try {
      // await initializeSettings();

      const decoded = jwtDecode(element.data.token) as UserFormInput;
      console.log('branchByStatus decoded = ', decoded);

      makeUserDataAndDispatch(decoded);

      // const macAddress = await AsyncStorage.getItem('macAddress');

      // if (isEmpty(decoded.ozsId)) {
      //   await handleEmptyOzsId(decoded, macAddress);
      // } else {
      //   await handleNonEmptyOzsId(decoded, macAddress);
      // }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  function makeUserDataAndDispatch(decoded: UserFormInput) {
    const userData: UserFormInput = {
      email: decoded.email,
      phoneNumber: decoded.phoneNumber,
      userId: decoded.userId === null || undefined ? '' : decoded.userId,
      isAdmin: decoded.isAdmin,
    };

    console.log('branchByStatus/makeUserDataAndDispatch userData', userData);

    dispatch({type: 'LOGIN', payload: userData});
  }
};

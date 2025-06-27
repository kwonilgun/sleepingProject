/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext, useCallback, useEffect } from 'react';
import {
  Platform,
  ScrollView, View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LoginScreenProps } from '../model/types/TUserNavigator';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import strings from '../../constants/lang';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  LanguageContext,
  useLanguage,
} from '../../context/store/LanguageContext';
// import {height} from '../../styles/responsiveSize';
import GlobalStyles from '../../styles/GlobalStyles';
import { appleAuth, AppleButton } from '@invertase/react-native-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { GOOGLE_WEB_CLIENTID, width } from '../../assets/common/BaseValue';
import { appleLogin, appleLogout, googleLogin, googleLogout, loginBySns } from './snsLogin';
import { useAuth } from '../../context/store/Context.Manager';
// import axios, { AxiosResponse } from 'axios';
// import { baseURL } from '../../assets/common/BaseUrl';
// import { getPromiseFcmToken } from '../Chat/notification/services';
// import { getToken } from '../../utils/getSaveToken';
import { alertMsg } from '../../utils/alerts/alertMsg';
import { handleKakaoLogin, handleKakaoLogout } from './kakaoLogin';
import { useSleepTimer } from '../../context/store/SleepTimerContext';

export interface OAuthResponse {
  token : string;
  email : string;
}

const SLEEP_DELAY_KEY = 'sleepTimerInitialDelay'; // Key for AsyncStorage


const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {

  const {state, dispatch} = useAuth();
  const {setInitialSleepDelay } = useSleepTimer(); // Context 훅 사용

  const [localLanguage, setLocalLanguage] = useState<string>('');
  const {changeLanguage} = useContext(LanguageContext);
  const {language} = useLanguage();
  // const [isAutoLogin, setIsAutoLogin] = useState<boolean>(false);
  /*
  useEffect의 첫 번째 인자는 컴포넌트가 마운트(mount)될 때 실행되는 함수입니다. 두 번째 인자는 의존성 배열이며, 배열에 포함된 값들이 변경될 때만 함수가 재실행됩니다. 빈 배열을 전달하면 컴포넌트가 처음 마운트될 때만 실행되고, 컴포넌트가 언마운트될 때 클린업(clean-up) 함수가 호출됩니다
  */

  useFocusEffect(
    useCallback(() => {
      console.log('Login.screen useFocus language = ', language);

      // 2024-11-20 : 한글/영여 toggling 문제 해결
      loginSetLanguage(language);

      GoogleSignin.configure({

        // 2025-05-06 15:35:40, Google cloud에서 웹 애플리케이션을 지정해야 한다. 
            webClientId: GOOGLE_WEB_CLIENTID,
            // iosClientId: GOOGLE_IOS_CLIENT_ID,
            offlineAccess: true, // 필요에 따라 설정

            scopes: ['profile', 'email'],
          });

      if (!appleAuth.isSupported) {
        console.log('애플 auth 지원하지 않음');
        return;
      }

      return () => {
      };
    }, []),
  );

  useEffect(() => {
    console.log(
      'Login.Screen : useEffect : isAuthenticated  = ',
      state.isAuthenticated,
    );
    if (state.isAuthenticated) {
      // updateFcmTokenOnChatUser();
      loginLocalSaveAndGoToProduct();
    } else {
      // Check the login method to determine which logout function to call
      console.log('LoginScreen, state.loginMethod = ', state.loginMethod);
      if (state.loginMethod === 'google') {
        console.log('LoginScreen, google log out');
        googleLogout();
      } else if (state.loginMethod === 'apple') {
        console.log('LoginScreen, apple log out');
        appleLogout();
        // handleAppleLogoutAndRevoke();
      } else if (state.loginMethod === 'kakao') {
        console.log('LoginScreen, kakao log out');
        // Assuming you have a handleKakaoLogout function
        handleKakaoLogout();
      } else{
        // 2025-06-27 10:26:31, 자동 로그인 구현....
        if(Platform.OS === 'ios'){
          console.log('Login.Screen: useEffect,  인증 안되었고, 상태는 초기 상태, 플랫폼은 apple ios ');
          checkAppleLogin();
        } else{
           console.log('Login.Screen: useEffect,  인증 안되었고, 상태는 초기 상태, 플랫폼은 android ios ');
        }

      }
      // No logout needed for 'email' or if loginMethod is null/undefined
    }
  }, [state.isAuthenticated, state.loginMethod]);


   // 2024-05-26 : 자동 로그인을 위해서 추가,
   const loginLocalSaveAndGoToProduct = async () => {
    try {
      // 2024-06-14 : 로그인 후에 home 메뉴로 간다.
      const storedValue = await AsyncStorage.getItem(SLEEP_DELAY_KEY);
      console.log('Login.Screen, loginLocalSaveAndGoToProduct storeValue', storedValue);
      if (storedValue !== null) {
        // If a value is found, parse it and set it
        const parsedValue = parseFloat(storedValue);
        setInitialSleepDelay(parsedValue);
      } else {
        // If no value is found, set the default to 0.1

        setInitialSleepDelay(0.1);
        // Also save this default value to storage immediately
        await AsyncStorage.setItem(SLEEP_DELAY_KEY, '0.1');
      }

      navigation.navigate('Home', {
        screen: 'PlaylistScreen',
      });

      // 2025-06-24 14:34:45, SleepTimer 세팅을 한다. 
    } catch (error) {
      console.log('phoneNumber save to local error = ', error);
    }
  };


  const loginSetLanguage = async (value: string) => {
    // const value = await AsyncStorage.getItem('language');
    console.log('Login.screen language value = ', value);

    if (language === 'kr' || value === null) {
      strings.setLanguage('kr');
      // setLocalLanguage('한국어');
      changeLanguage('kr');
      await AsyncStorage.setItem('language', 'kr');
    } else {
      // setLocalLanguage('English');
      strings.setLanguage('en');
      changeLanguage('en');
      await AsyncStorage.setItem('language', 'en');
      // changeLanguage('en');
    }
  };

  const selectLanguage = async () => {
    console.log('select language click');
    if (language === 'en') {
      console.log('현재 언어 == 영어, 한글로 변경');
      setLocalLanguage('한국어');
      changeLanguage('kr');
      // await AsyncStorage.setItem('language', 'kr');
    } else {
      console.log('현재 언어 == 한글, 영어로 변경');
      setLocalLanguage('English');
      changeLanguage('en');
      // await AsyncStorage.setItem('language', 'en');
    }
  };

  const onPressRight = () => {
    console.log('Login.Screen right  click');
    selectLanguage();
  };

  const RightCustomComponent = () => {
      return (
        <TouchableOpacity onPress={onPressRight}>
        <View
          style={{
            width: RFPercentage(5),
            height: RFPercentage(5),
            borderColor: 'black',
            borderWidth: 2,
            borderRadius: RFPercentage(5) / 2, // 원형
            // backgroundColor: 'blue', // 배경색
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: RFPercentage(2), color: 'black', fontWeight: 'bold' }}>
            한/A
          </Text>
        </View>
      </TouchableOpacity>
      );
    };

  const checkGoogleLogin = async () => {

    try {
      const response = await googleLogin();

      if(response.success){
        console.log('google login success data = ', response.data);
        loginBySns(response.data, dispatch, 'google');
      }
    } catch (error) {
      alertMsg('에러', '구글 로그인 에러, 네트웍이 연결이 되어있는지 체크해보세요')
      console.log('google login error ', error);
    }

  };

  const checkAppleLogin = async () => {

    try {
      const response = await appleLogin();

      if(response.success){
        console.log('google login success data = ', response.data);
        loginBySns(response.data, dispatch, 'apple');
      }
    } catch (error) {
      alertMsg('에러', '애플 로그인 에러, 네트웍이 연결이 되어있는지 체크해보세요')

      console.log('google login error ', error);
    }

  };

  const checkKakaoLogin = () => {
        handleKakaoLogin(dispatch);
  };

  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        isCenterView={false}
        centerText={strings.LOGIN}
        // centerCustomView={CenterCustomComponent}
        rightText={''}
        // rightTextStyle={{color: colors.lightBlue}}
        // onPressRight={() => {}}
        isRightView={false}
        rightCustomView={RightCustomComponent}
      />

          <ScrollView style={GlobalStyles.scrollView}>
            <View >
              {/* <View style={GlobalStyles.HStack_LOGO}>
                <View>
                  <Image
                    source={require('../../assets/images/sleeping.png')} // 로컬 이미지 경로 사용
                    style={GlobalStyles.logo} // 스타일을 통해 크기 조정
                    resizeMode="contain" // 이미지가 영역에 맞게 조정되도록 설정
                  />
                </View>
              </View> */}
              <View
                  style={{
                    flex: 1,
                    marginTop: RFPercentage(3),
                    justifyContent: 'center', // 수직 중앙 정렬
                    alignItems: 'center',     // 수평 중앙 정렬
                    // backgroundColor: 'white', // (선택) 배경 확인용
                  }}
                >

                  <View
                      style={{
                        width: RFPercentage(15),
                        height: RFPercentage(15),
                        borderColor: 'black',
                        borderWidth: RFPercentage(0.5),
                        borderRadius: RFPercentage(15) / 2, // 원형
                        // backgroundColor: 'blue', // 배경색
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: RFPercentage(2), color: 'black', fontWeight: 'bold' }}>
                        Sleeping
                      </Text>
                  </View>
                </View>

              <TouchableOpacity
                  style= {{
                    width: width * 0.8,
                    marginTop: RFPercentage(5),
                    height: RFPercentage(5),
                    borderWidth: 1,
                    borderColor: 'black',
                    backgroundColor: 'black',
                    justifyContent: 'center',
                    alignSelf: 'center',
                  }}
                  onPress={() => {
                    console.log(' 이메일 click');
                    navigation.navigate('EmailLoginScreen');
                    // displayNotificationNoParams();
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: RFPercentage(2),
                      fontWeight: 'bold',
                      textAlign: 'center',

                    }}>
                     {strings.EMAIL}
                  </Text>
              </TouchableOpacity>
              {Platform.OS === 'ios' ? (
                    <AppleButton
                      style={styles.appleButton}
                      cornerRadius={5}
                      buttonStyle={AppleButton.Style.BLACK}
                      buttonType={AppleButton.Type.SIGN_IN}
                      onPress={ async () => {
                        console.log('apple sign in click');
                        checkAppleLogin();
                      }}
                    />
                  ) : (
                    <TouchableOpacity
                      style={styles.appleButton} // 동일한 스타일 적용
                      onPress={async () => {
                        console.log('google sign in click');
                        checkGoogleLogin();
                      }}>
                      <Text style={styles.appleButtonText}>구글 로그인</Text>
                    </TouchableOpacity>
                  )}

              {/* <TouchableOpacity
                      style={styles.appleButton} // 동일한 스타일 적용
                      onPress={async () => {
                        console.log('카카오 로그인  click');
                       checkKakaoLogin();
                      }}>
                      <Text style={styles.appleButtonText}>카카오 로그인</Text>
                    </TouchableOpacity> */}
            </View>
          </ScrollView>


    </WrapperContainer>
  );
};


const styles = StyleSheet.create({
  appleButton: {
    width: width * 0.8,
    height: RFPercentage(5),
    marginTop: RFPercentage(4),
    alignSelf: 'center',
    backgroundColor: 'black', // 애플 버튼과 동일한 배경색
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  appleButtonText: {
    color: 'white',
    fontSize: RFPercentage(2),
    fontWeight: 'bold',
  },
  header: {
    margin: 10,
    marginTop: 30,
    fontSize: 18,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'pink',
  },
  horizontal: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },

  inputTitle: {
    fontWeight: 'bold',
    fontSize: RFPercentage(2.0),
    marginTop: RFPercentage(1),
    color: 'black',
    // borderColor: 'black',
    // borderWidth: 2,
  },
  errorMessage: {
    color: 'red',
    margin: RFPercentage(1),
    fontSize: RFPercentage(2.6),
    fontWeight: 'bold',
  },
});

export default LoginScreen;

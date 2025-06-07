/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView, View,
  Text,
  TouchableOpacity
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/store/Context.Manager';

import { useForm, SubmitHandler } from 'react-hook-form';
import { branchByStatus } from './branchByStatus';

import { UserFormInput } from '../model/interface/IAuthInfo';
import { EmailLoginScreenProps } from '../model/types/TUserNavigator';
import InputField from '../../utils/InputField';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import strings from '../../constants/lang';
import { alertMsg } from '../../utils/alerts/alertMsg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingWheel from '../../utils/loading/LoadingWheel';
import { RFPercentage } from 'react-native-responsive-fontsize';
import {
  useLanguage
} from '../../context/store/LanguageContext';
import Icon from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getInfoOfEmailFromDb } from './useLogin';
import {
  LOGIN_NO_EXIST_EMAIL,
  LOGIN_PASSWORD_ERROR,
  width,
} from '../../assets/common/BaseValue';
// import {Checkbox} from 'react-native-paper';
import GlobalStyles from '../../styles/GlobalStyles';
import colors from '../../styles/colors';
// import { getToken } from '../../utils/getSaveToken';
// import { getPromiseFcmToken } from '../Chat/notification/services';
// import axios, { AxiosResponse } from 'axios';
// import { baseURL } from '../../assets/common/BaseUrl';

const EmailLoginScreen: React.FC<EmailLoginScreenProps> = ({navigation}) => {
  // const [username, setUsername] = useState('');
  const {state, dispatch} = useAuth();

  // 2024-05-26 : 자동 로그인 시에 로그인 화면 안 보이게 하기 위해서
  const [loading, setLoading] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const {language} = useLanguage();
  const [isAutoLogin, setIsAutoLogin] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<UserFormInput>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useFocusEffect(
    useCallback(() => {
      console.log('Login.screen useFocus language = ', language);

      // // 2024-11-20 : 한글/영여 toggling 문제 해결
      // loginSetLanguage(language);
      // // 2024-11-14 : email로 변경

      checkAutoLogin();

      setLoading(false);

      return () => {
        setLoading(true);
      };
    }, []),
  );

  useEffect(() => {
      console.log(
        'EmailLogin.Screen : useEffect : isAuthenticated  = ',
        state.isAuthenticated,
      );
      if (state.isAuthenticated) {
        // updateFcmTokenOnChatUser();
        loginLocalSaveAndGoToProduct();
      }
    }, [state.isAuthenticated]);



  // const updateFcmTokenOnChatUser = async () => {
  //   const userId = state.user?.userId;
  //   try {
  //     const token = await getToken();
  //     const config = {
  //       headers: {
  //         'Content-Type': 'application/json; charset=utf-8',
  //         Authorization: `Bearer ${token}`,
  //       },
  //     };
  //     const fcm = await getPromiseFcmToken();
  //     console.log('EmailLogin.Screen - userId , fcm ', userId, fcm);
  //     const params = {
  //       userId: userId,
  //       fcmToken: fcm,
  //     };
  //     const response: AxiosResponse = await axios.post(
  //       `${baseURL}messages/fcm-update`,
  //       JSON.stringify(params),
  //       config,
  //     );
  //     console.log('EmailLogin.Screen - updateFcmTokenOnChatUser: ', response.data, response.status);
  //     if(response.status === 200){
  //       console.log('EmailLogin.Screen fcm update 성공 ');
  //     }
  //     else if(response.status === 201){
  //       console.log('EmailLogin.Screen fcm 유지 성공 ');
  //     }
  //   } catch (error) {
  //     console.log('EmailLogin.Screen updateFcmTokenOnChatUser error', error);
  //   }

  // };

    // 2024-05-26 : 자동 로그인을 위해서 추가,
    const loginLocalSaveAndGoToProduct = async () => {

      navigation.navigate('Home', {
        screen: 'PlaylistScreen',
      });
  };


  const checkAutoLogin = async () => {
    try {
      const savedAutoLogin = await AsyncStorage.getItem('autoLogin');
      const savedEmail = await AsyncStorage.getItem('email');
      const savedPassword = await AsyncStorage.getItem('password');

      if (savedAutoLogin === 'true' && savedEmail && savedPassword) {
        console.log(
          'Login.Screen.tsx  auto login >>> savedEmail, savedPassword = ',
          savedEmail,
          savedPassword,
        );
        onSubmit({
          email: savedEmail,
          password: savedPassword,
          phoneNumber: '',
        });
        setLoading(false);
      } else {
        console.log(
          'Login.Screen.tsx 에러 savedEmail, savedPassword ',
          savedEmail,
          savedPassword,
        );
        setLoading(false);
      }
    } catch (error) {
      console.log('Error reading phone number from AsyncStorage:', error);
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<UserFormInput> = async data => {
    // 실제 로그인 로직을 여기에 구현하고, 성공 시 Redux 액션을 디스패치합니다.
    // 예를 들어, 서버 API 호출 및 인증 로직을 수행합니다.

    console.log('onSubmit, dispatch, loggedInUser = ', data);

    const savedAutoLogin = await AsyncStorage.getItem('autoLogin');
    if (
      (isAutoLogin || savedAutoLogin === 'true') &&
      data.email &&
      data.password
    ) {
      await AsyncStorage.setItem('autoLogin', 'true');
      await AsyncStorage.setItem('email', data.email);
      await AsyncStorage.setItem('password', data.password);
    } else {
      await AsyncStorage.removeItem('autoLogin');
      await AsyncStorage.removeItem('email');
      await AsyncStorage.removeItem('password');
    }

    //입력 값을 reset 한다.
    // reset();

    getInfoOfEmailFromDb(data)
      .then(element => {
        // console.log(element);
        const message: string =
          element.data.message === null || element.data.message === undefined
            ? 'no'
            : element.data.message;

        const koreanString =
          '디바이스 id가 틀림, 다른 디바이스에서 로그인 진행함';
        const englishString =
          'Device ID is incorrect, logged in from another device';

        if (message.includes(koreanString) && language === 'en') {
          element.data.message = englishString;
        } else {
          console.log('branchByStatus.tsx 메세지 없음');
        }

        branchByStatus({navigation}, element, dispatch);
      })
      .catch(error => {
        // 2024-11-17 : 이메일 로그인 에러 처리, 서버에서 에러를 보내는 경우 send와 json에 따라서 status가 달라진다.

        console.error(error);
        // 2024-11-17: 이메일 로그인 에러 처리 - 서버에서 반환하는 에러에 따라 적절한 상태 처리
        const {status} = error.response?.request || {};

        switch (status) {
          case LOGIN_PASSWORD_ERROR:
            console.log('패스워드 틀림');
            alertMsg(strings.ERROR, strings.PASSWORD_ERROR);
            break;

          case LOGIN_NO_EXIST_EMAIL:
            console.log('해당 이메일 없음');
            alertMsg(strings.ERROR, strings.NO_EXIST_EMAIL);
            break;

          default:
            console.log('알 수 없는 에러 또는 미등록 사용자');
            alertMsg(strings.ERROR, strings.NO_USER_AND_REGISTER_MEMBER);
            break;
        }
      });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handlePasswordReset = (navigation: any) => {
    console.log('click password reset');
    navigation.navigate('PasswordResetScreen');
  };

  const handleCheckboxChange = async (value: boolean) => {
    console.log('Before state update: isAutoLogin:', value);
    try {
      setIsAutoLogin(value);
      await AsyncStorage.setItem('autoLogin', value ? 'true' : 'false');
      console.log('Checkbox value saved successfully:', value);
    } catch (error) {
      console.error('Error saving checkbox value:', error);
    }
    console.log('After state update: isAutoLogin:', isAutoLogin);
  };

  const onPressLeft = () => {
      navigation.goBack();
    };
  
  const LeftCustomComponent = () => {
      return (
        <TouchableOpacity onPress={onPressLeft}>
          <>
            {/* <Text style={styles.leftTextStyle}>홈</Text> */}
            <FontAwesome
              style={{color: colors.black, fontSize: RFPercentage(5)}}
              name="arrow-left"
            />
          </>
        </TouchableOpacity>
      );
  };

  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        isCenterView={false}
        centerText= "이메일 로그인"
        isLeftView={true}
        leftCustomView={LeftCustomComponent}
        // centerCustomView={CenterCustomComponent}
        rightText={''}
        // rightTextStyle={{color: colors.lightBlue}}
        // onPressRight={() => {}}
        isRightView={false}
        // rightCustomView={RightCustomComponent}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={GlobalStyles.containerKey}>
        {loading ? (
          <>
            <LoadingWheel />
          </>
        ) : (
          <ScrollView style={GlobalStyles.scrollView}>
            <View style={[GlobalStyles.VStack, {marginTop: RFPercentage(5)}]}>

              <View style={{
                flex: 1,
                width: width * 0.9,
                height: 'auto',
                // borderColor: 'blue',
                // borderWidth: 1,
                alignItems: 'flex-end', // 내부 요소를 오른쪽으로 정렬
                padding: RFPercentage(2), // 패딩 추가 (선택 사항)
                marginTop: RFPercentage(1),
                }}>
                    <Text
                      style={{
                        color: 'black',
                        textDecorationLine: 'underline',
                        fontSize: RFPercentage(1.5),
                      }}
                      onPress={() => {
                        navigation.navigate('MembershipScreen');
                        console.log('회원가입 click');
                      }}>
                        {strings.MEMBERSHIP}
                    </Text>
              </View>

              <View style={{
                  flex: 1,
                  width: width * 0.9,
                  height: 'auto',
                  alignItems: 'flex-end', // 내부 요소를 오른쪽으로 정렬
                  marginVertical: RFPercentage(1),
                }} >
                <Text
                  style={{
                    color: 'black',
                    textDecorationLine: 'underline',
                    fontSize: RFPercentage(1.5),
                  }}
                  onPress={() => {
                    handlePasswordReset(navigation);
                  }}>
                  {strings.PASSWORD_FORGET}
                </Text>
              </View>


              {/* <Text style={GlobalStyles.inputTitle}>{strings.EMAIL}</Text> */}
              <View style={GlobalStyles.HStack}>
                <InputField
                  control={control}
                  rules={{
                    required: true,
                    minLength: 5,
                    // maxLength: 11,
                    pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                  }}
                  name="email"
                  placeholder={strings.PLEASE_ENTER_EMAIL}
                  keyboard="email-address" // 숫자 판으로 변경
                  // isEditable={false}
                />
                {errors.email && (
                  <Text style={GlobalStyles.errorMessage}>
                    {strings.EMAIL} {strings.ERROR}
                  </Text>
                )}
              </View>

              {/* <Text style={GlobalStyles.inputTitle}>
                {strings.PASSWORD_NUMBER}
              </Text> */}
              <View style={GlobalStyles.HStack}>
                <InputField
                  control={control}
                  rules={{
                    required: true,
                    minLength: 5,
                    maxLength: 20,
                  }}
                  name="password"
                  placeholder={strings.PLEASE_ENTER_PWD}
                  keyboard="default" // 숫자 판으로 변경
                  isPassword={!passwordVisible}
                  // isEditable={false}
                />
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={[GlobalStyles.icon]}>
                  <Icon
                    name={passwordVisible ? 'eyeo' : 'eye'}
                    size={RFPercentage(4)}
                    color="grey"
                  />
                </TouchableOpacity>
              </View>
              <View>
                {errors.password && (
                  <Text style={GlobalStyles.errorMessage}>
                    {strings.PASSWORD_NUMBER} {strings.ERROR}
                  </Text>
                )}
              </View>



              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: RFPercentage(5),
                marginHorizontal: RFPercentage(2),
                }}>
                <TouchableOpacity
                  style={{
                    height: RFPercentage(2.2),
                    width: RFPercentage(2.2),
                    borderWidth: 1,
                    borderColor: 'black',
                    backgroundColor: isAutoLogin
                      ? 'transparent'
                      : 'transparent',
                  }}
                  onPress={() => handleCheckboxChange(!isAutoLogin)}>
                  {isAutoLogin && (
                    <Text
                      style={{
                        textAlign: 'center',
                        color: Platform.OS === 'ios' ? 'white' : 'black',
                      }}>
                      ✔
                    </Text>
                  )}
                </TouchableOpacity>

                <Text style={{
                  fontSize: RFPercentage(1.5),
                  margin:RFPercentage(1),
                }}>
                  {strings.AUTO_LOGIN}
                </Text>
              </View>

              <View style={GlobalStyles.HStack_LOGIN}>
                <TouchableOpacity
                  onPress={handleSubmit(data => onSubmit(data))}>

                  <FontAwesome
                    style={{color: colors.black, fontSize: RFPercentage(6)}}
                    name="arrow-circle-right"
                  />
                  {/* <Text
                    style={{
                      height: RFPercentage(8),
                      width: RFPercentage(10),
                      color: 'black',
                      textDecorationLine: 'underline',
                      fontSize: RFPercentage(2.5),
                      fontWeight: 'bold',
                    }}>
                    {strings.LOGIN}
                  </Text> */}
                </TouchableOpacity>

              </View>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

export default EmailLoginScreen;

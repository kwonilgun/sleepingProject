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
import React, {useContext, useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useForm, Controller, SubmitHandler} from 'react-hook-form';

import {getCodeFromEmail} from './getCodeFromSever';
import {alertMsg} from '../../utils/alerts/alertMsg';
import isEmpty from '../../utils/isEmpty';
import ErrorText from '../../utils/Error/ErrorText';
import {registerUserInfoToDB} from './registerUserInfoToDB';

import {MembershipScreenProps} from './model/types/TUserNavigator';
import {UserFormInput} from './model/interface/IAuthInfo';
import Icon from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import strings from '../../constants/lang';
import colors from '../../styles/colors';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  height,
  LOGIN_ALREADY_EXIST_EMAIL,
  LOGIN_PASSWORD_ERROR,
} from '../../assets/common/BaseValue';
// import CheckBox from '@react-native-community/checkbox';
import {LanguageContext} from '../../context/store/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {ScrollView} from 'react-native-gesture-handler';
import InputField from '../../utils/InputField';
import GlobalStyles from '../../styles/GlobalStyles';

export const MEMBER_STATUS = {
  UPDATE_STATUS: 200,
  NEW_REGISTER_STATUS: 201,
};

const MembershipScreen: React.FC<MembershipScreenProps> = props => {
  // const authInfo: IAuthInfo = props.route.params.authInfo;
  // console.log('Authorize.Screen.tsx authInfo', authInfo);

  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [verifyNumber, setVerifyNumber] = useState('');
  const [error, setError] = useState('');
  const [authData, setAuthData] = useState<UserFormInput>();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false); // 개인정보 동의 여부 상태 추가

  const {changeLanguage} = useContext(LanguageContext);

  const {
    control,
    handleSubmit,
    formState: {errors},
    getValues,
    reset,
  } = useForm<UserFormInput>({
    defaultValues: {
      name: '',
      phoneNumber: '',
      password: '',
      // ozsId: '',
    },
  });

  useEffect(() => {
    return () => {
      // setIsCodeVerified(false);
    };
  }, []);

  const onSubmit: SubmitHandler<UserFormInput> = async data => {
    console.log('Membership.screen.tsx onSubmit = ', data);
    // empty guard
    if (isEmpty(data.name) || isEmpty(data.password)) {
      alertMsg(strings.ERROR, '모두 입력해 주세요!');
      return;
    }

    if (!isAgreed) {
      alertMsg(strings.ERROR, '개인정보 동의서에 동의해주세요.');
      return;
    }
    setError('');

    // reset();

    getCodeFromEmail(data)
      .then(element => {
        console.log(element);
        if (element.status < 400) {
          alertMsg(strings.CONFIRMATION, strings.SEND_CONFIRM_NUMBER);
          setIsCodeVerified(true);
          setVerifyNumber('');
          setAuthData(data);
        }
      })
      .catch(error => {
        console.log('Membershp.Screen.tsx error = ', error);
        const {status} = error.response?.request || {};

        switch (status) {
          case LOGIN_PASSWORD_ERROR:
            console.log('패스워드 틀림');
            alertMsg(strings.ERROR, strings.PASSWORD_ERROR);
            break;

          case LOGIN_ALREADY_EXIST_EMAIL:
            console.log('이미 등록된 이메일');
            alertMsg(strings.ERROR, strings.ALREADY_EMAIL_EXIST);
            break;

          default:
            console.log('알 수 없는 에러 또는 미등록 사용자');
            alertMsg(strings.ERROR, strings.NO_USER_AND_REGISTER_MEMBER);
            break;
        }
      });
  };

  const registerEmailAndPassword = async () => {
    console.log(
      'Membership.screen.tsx: registerEmailAndPassword verify number = ',
      verifyNumber,
    );
    if (isEmpty(verifyNumber)) {
      setError('인증번호가 없음');
      return;
    }
    const params = {...(authData as UserFormInput), verify: verifyNumber};

    registerUserInfoToDB(params)
      .then(res => {
        console.log('registerUserInfoToDB : res =', res);
        registerResult(res.status);
      })
      .catch(e => {
        console.log(e);
        alertMsg(strings.ERROR, strings.NETWORK_ERROR_NUMBER_WRONG);
      });
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const backToLogin = async (props: any) => {
    console.log('Membership.screen.tsx: backTo Login 함수 실행 \n');

    const value = await AsyncStorage.getItem('language');
    if (value === 'kr') {
      console.log('Membership.screen language=', value);
    } else {
      // changeLanguage('en');
      console.log('Membership.screen language=', value);
    }

    props.navigation.goBack();
  };

  function registerResult(status: number) {
    if (status === MEMBER_STATUS.UPDATE_STATUS) {
      alertMsg(
        strings.REGISTER,
        strings.UPDATE_REGISTER_NUMBER,
        backToLogin,
        props,
      );
      // navigation.goBack();
    } else if (status === MEMBER_STATUS.NEW_REGISTER_STATUS) {
      alertMsg(
        strings.REGISTER,
        strings.UPDATE_REGISTER_NUMBER,
        backToLogin,
        props,
      );
    }
  }

  const LeftCustomComponent = () => {
    return (
      <TouchableOpacity onPress={() => backToLogin(props)}>
        <>
          {/* <Text style={styles.leftTextStyle}>홈</Text> */}
          <FontAwesome
            style={{
              height: RFPercentage(8),
              width: RFPercentage(10),
              marginTop: RFPercentage(2),
              color: colors.black,
              fontSize: RFPercentage(5),
              fontWeight: 'bold',
              // transform: [{scaleX: 1.5}], // 폭을 1.5배 넓힘
            }}
            name="arrow-left"
          />
        </>
      </TouchableOpacity>
    );
  };

  // 모든 필드가 입력되었는지 확인하여 버튼 활성화/비활성화 관리
  const isFormValid = () => {
    return (
      !isEmpty(getValues('name')) &&
      !isEmpty(getValues('phoneNumber')) &&
      !isEmpty(getValues('password'))
    );
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const goToUsageTerm = (props: any) => {
    console.log('Membership.screen: goToUsageTerm');
    props.navigation.navigate('MembershipUsageTermScreen');
  };

  const goToPrivatePolicy = (props: any) => {
    console.log('Membership.screen: goToPrivatePolicy');
    props.navigation.navigate('MembershipPrivacyPolicyScreen');
  };

  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        isLeftView={true}
        leftCustomView={LeftCustomComponent}
        centerText={strings.MEMBERSHIP}
        containerStyle={{paddingHorizontal: 8}}
        isRight={false}
        // rightText={'       '}
        // rightTextStyle={{color: colors.lightBlue}}
        // onPressRight={() => {}}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={GlobalStyles.containerKey}>
        <ScrollView style={GlobalStyles.scrollView}>
          <View style={[GlobalStyles.VStack, {marginTop: RFPercentage(5)}]}>
            <Text style={GlobalStyles.inputTitle}>{strings.EMAIL}</Text>
            <View style={GlobalStyles.HStack}>
              <InputField
                control={control}
                rules={{
                  required: true,
                  minLength: 5,
                  // maxLength: 11,
                  pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                }}
                name="nickName"
                placeholder={strings.PLEASE_ENTER_EMAIL}
                keyboard="email-address" // 숫자 판으로 변경
                // isEditable={false}
              />
              {errors.name && (
                <Text style={GlobalStyles.errorMessage}>
                  {errors.name.message ||
                    `${strings.EMAIL} ${strings.ERROR}`}
                </Text>
              )}
            </View>
            <Text style={GlobalStyles.inputTitle}>
              {strings.PASSWORD_NUMBER}
            </Text>
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

            {/* 개인정보 동의 섹션 */}
            <View style={GlobalStyles.privacyCheckBoxSection}>
              <TouchableOpacity
                style={{
                  height: 24,
                  width: 24,
                  borderWidth: 1,
                  borderColor: 'black',
                  backgroundColor: isAgreed ? 'transparent' : 'transparent',
                }}
                onPress={() => setIsAgreed(!isAgreed)}>
                {isAgreed && (
                  <Text
                    style={{
                      textAlign: 'center',
                      color: Platform.OS === 'ios' ? 'white' : 'black',
                    }}>
                    ✔
                  </Text>
                )}
              </TouchableOpacity>

              <Text style={GlobalStyles.privacyCheckBoxText}>
                {strings.AGREE_TO_PRIVACY_POLICY}
              </Text>
            </View>
            {error && <ErrorText message={error} />}

            <Text
              style={GlobalStyles.usageText}
              onPress={() => {
                goToUsageTerm(props);
              }}>
              1.{strings.TERMS_OF_SERVICE}
            </Text>
            <Text
              onPress={() => {
                goToPrivatePolicy(props);
              }}
              style={GlobalStyles.privacyText}>
              2.{strings.PRIVACY_POLICY}
            </Text>

            {isCodeVerified === true ? (
              <Text style={GlobalStyles.inputTitle}>
                {strings.VERIFICATION_NUMBER}
              </Text>
            ) : null}
            <View style={GlobalStyles.HStack}>
              {isCodeVerified === true ? (
                <TextInput
                  id="verifyNumber"
                  style={styles.verifyInput}
                  placeholder={strings.PLEASE_ENTER_VERIFICATION}
                  placeholderTextColor="gray" // 적당한 색상 설정
                  // keyboardType="numeric"
                  onChangeText={text => {
                    setVerifyNumber(text.toLowerCase());
                  }}
                  value={verifyNumber}
                />
              ) : null}

              {error ? <ErrorText message={error} /> : null}
            </View>
            <View style={GlobalStyles.buttonStyle}>
              {isCodeVerified === true ? (
                <TouchableOpacity
                  onPress={() => {
                    console.log('Profile:비밀 번호 재 설정');
                    registerEmailAndPassword();
                  }}>
                  <View style={GlobalStyles.buttonViewText}>
                    <Text style={GlobalStyles.buttonTextStyle}>
                      {strings.REGISTER}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    console.log('Profile:비밀 번호 재 설정');
                    handleSubmit(data => onSubmit(data))();
                  }}>
                  <View style={GlobalStyles.buttonViewText}>
                    <Text style={GlobalStyles.buttonTextStyle}>
                      {strings.VERIFICATION_NUMBER}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   paddingTop: StatusBar.currentHeight,
  // },
  // containerKey: {
  //   flex: 1,
  //   backgroundColor: 'white',
  // },

  // scrollView: {
  //   backgroundColor: 'white',
  //   // backgroundColor: 'gainsboro',
  //   // marginHorizontal: 20,
  // },

  // VStack: {
  //   // flex: 1,
  //   flexDirection: 'column',
  //   margin: 20,
  //   padding: 10,
  //   justifyContent: 'flex-start',
  //   // alignItems: 'center',
  //   // borderColor: 'blue',
  //   // borderWidth: 2,
  //   // borderRadius: 5,
  // },
  // HStack: {
  //   // marginTop: RFPercentage(2),
  //   marginBottom: RFPercentage(2),
  // },

  verifyInput: {
    height: Platform.OS === 'android' ? height * 0.07 : height * 0.05,
    width: 'auto',
    margin: 5,
    borderWidth: 1,
    padding: 10,
    borderColor: 'blue',
    borderRadius: 5,
    // fontWeight: 'bold',
    fontSize: RFPercentage(1.8),
    color: 'black',
  },
  totalInput: {
    margin: 10,
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
  icon: {
    position: 'absolute',
    right: -20,
    top: '40%',
    transform: [
      {
        translateY:
          Platform.OS === 'android'
            ? -((height * 0.04) / 2)
            : -((height * 0.05) / 2),
      },
    ], // TextInput 높이에 따라 중앙 정렬
  },

  privacyText: {
    margin: RFPercentage(1),
    fontSize: RFPercentage(2),
    color: 'black',
  },
  privacySection: {flexDirection: 'row', alignItems: 'center', marginTop: 10},
  iosCheckbox: {
    width: RFPercentage(3), // 원하는 체크박스 너비
    height: RFPercentage(3), // 원하는 체크박스 높이
    // margin: RFPercentage(1),
  },
  androidCheckbox: {
    transform: [{scale: 1.6}], // 크기 확대/축소 (1.5배 확대)
  },
});

export default MembershipScreen;

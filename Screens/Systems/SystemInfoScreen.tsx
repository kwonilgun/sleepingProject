/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useCallback, useContext, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../../styles/colors';
import { SystemInfoScreenProps } from '../model/types/TUserNavigator';
import strings from '../../constants/lang';
import { useFocusEffect } from '@react-navigation/native';
import {
  LanguageContext,
  useLanguage,
} from '../../context/store/LanguageContext';
import DeviceInfo from 'react-native-device-info';
import { useAuth } from '../../context/store/Context.Manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  confirmAlert,
  ConfirmAlertParams,
} from '../../utils/alerts/confirmAlert';
import GlobalStyles from '../../styles/GlobalStyles';
import { SubmitHandler, useForm } from 'react-hook-form';
import { getToken } from '../../utils/getSaveToken';
import { jwtDecode } from 'jwt-decode';
import { IUserAtDB, UserFormInput } from '../model/interface/IAuthInfo';
import axios, { AxiosResponse } from 'axios';
import { baseURL } from '../../assets/common/BaseUrl';
import { alertMsg } from '../../utils/alerts/alertMsg';
import { width } from '../../styles/responsiveSize';
import InputField from '../../utils/InputField';
import { areJsonEqual } from '../../utils/etc/areJsonEqual';
import { errorAlert } from '../../utils/alerts/errorAlert';
import isEmpty from '../../utils/isEmpty';
import { appleLogout, googleLogout } from '../Login/snsLogin';
import { handleKakaoLogout } from '../Login/kakaoLogin';

interface IUserInfo {
  nickName: string;
  phone: string;
  email: string;
}

const SystemInfoScreen: React.FC<SystemInfoScreenProps> = props => {
  const {state, dispatch} = useAuth();

  const [localLanguage, setLocalLanguage] = useState<string>('');
  const [versionNum, setVersionNum] = useState<string>('');
  const [buildNum, setBuildNum] = useState<string>('');
  const {language} = useLanguage();
  const {changeLanguage} = useContext(LanguageContext);
  const [userProfile, setUserProfile] = useState<IUserAtDB | null>(null);
  

  const userIdRef = useRef<string>('');
  const userOriginalInfo = useRef<IUserInfo | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  

  const {
      control,
      setValue,
      getValues,
      handleSubmit,
      formState: {errors},
      reset,
    } = useForm<IUserInfo>({
      defaultValues: {
        phone: '',
        nickName: '',
        email: '',
      },
    });

  useFocusEffect(
    useCallback(() => {
      console.log('SystemInfoScreen : useFocusEffect [] language = ', language);

      if (language === 'kr') {
        setLocalLanguage('한국어');
      } else {
        setLocalLanguage('English');
      }

      const version = DeviceInfo.getVersion(); // "1.0.0"과 같은 형식의 버전 문자열
      const buildNumber = DeviceInfo.getBuildNumber(); // "1"과 같은 형식의 빌드 번호 문자열

      setVersionNum(version);
      setBuildNum(buildNumber);

      console.log(`App Version: ${version}`);
      console.log(`Build Number: ${buildNumber}`);

      return () => {};
    }, []),
  );


  const fetchUserProfile = async () => {
    const token = await getToken();
    const decoded = jwtDecode(token!) as UserFormInput;
    const userId = decoded.userId;
    console.log('userProfile userId= ', userId);
    userIdRef.current = userId!;

    try {
      const response: AxiosResponse = await axios.get(
        `${baseURL}users/${userId}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      if (response.status === 200) {
        // console.log('ProfileScreen 사용자 데이터 = ', response.data);
        const userData: IUserInfo = {
          phone: response.data.phone,
          nickName: response.data.nickName,
          email: response.data.email,
        };
        reset(userData);
        userOriginalInfo.current = userData;
        console.log('SystemInfoScreen fetchUserProfile response.data', response.data);
        setUserProfile(response.data);

        // getUserProfile이 완료된 후에 checkOrderList 호출
        // await checkOrderList();
        // await fetchDeliveryCompleteList();

      } else {
        alertMsg(strings.ERROR, '사용자 정보 가져오지 못함');
      }
    } catch (error) {
      console.log('ProfileScreen get user error = ', error);
      alertMsg(strings.ERROR, '사용자 정보 가져오지 못함...');
    }
  };

  const checkAndLogout = async (props: any) => {
    console.log('로그 아웃 ......');

    // 2024-05-26 : 로그 아웃 시에 동작이 되면 중단을 한다.

    try {
      await AsyncStorage.removeItem('phoneNumber');

      await AsyncStorage.removeItem('autoLogin');
      await AsyncStorage.removeItem('email');
      await AsyncStorage.removeItem('password');

      await AsyncStorage.setItem('language', language);
    } catch (error) {
      console.log('logout error = ', error);
    } finally {

      dispatch({type: 'LOGOUT'});

      // 2025-03-28 15:15:48, googl sign out 추가
      
      // props.navigation.navigate('UserMain', {screen: 'LoginScreen'});
    }
  };

  const handleLogout = (props: any) => {
    // 로그아웃 처리 로직은 여기에 구현

    const param: ConfirmAlertParams = {
      title: strings.CONFIRMATION,
      message: strings.LOGOUT_STOP_OPERATION,
      // eslint-disable-next-line @typescript-eslint/no-shadow
      func: (data: any) => {
        console.log('Profile.tsx: handleLogout');

        checkAndLogout(data);
      },
      params: [props],
    };

    confirmAlert(param);
  };
  const onPressLeft = () => {
    props.navigation.navigate('UserMain', {screen: 'ProfileScreen'});
  };

  const selectLanguage = async () => {
    // const value = await AsyncStorage.getItem('language');
    console.log('select language click value =', language);
    if (language === 'en') {
      setLocalLanguage('한국어');
      // strings.setLanguage('kr');
      changeLanguage('kr');
      // await AsyncStorage.setItem('language', 'kr');
    } else {
      setLocalLanguage('English');
      // strings.setLanguage('en');
      changeLanguage('en');
      // await AsyncStorage.setItem('language', 'en');
    }
  };

  const handlePrivacyPolicy = (props: any) => {
    console.log('SystemInfoScreen : handlePrivacyPolicy');
    props.navigation.navigate('PrivacyPolicyScreen');
  };

  const handleUsageTerm = (props: any) => {
    console.log('SystemInfoScreen : handleUsageTerm');
    props.navigation.navigate('UsageTermScreen');
  };

  const LeftCustomComponent = () => {
    return (
      <TouchableOpacity onPress={onPressLeft}>
        <>
          {/* <Text style={styles.leftTextStyle}>홈</Text> */}
          <Icon
            style={{color: colors.lightBlue, fontSize: RFPercentage(5)}}
            name="arrow-left"
          />
        </>
      </TouchableOpacity>
    );
  };
  const onPressRight = () => {
    console.log('Login.Screen right  click');
    selectLanguage();
  };


  const isVacancy = () => {
    const currentValues = getValues();
    // 여기에서 변경 여부를 확인하고 필요한 로직을 수행
    console.log('currentValues = ', currentValues);

    const isVacant: boolean =
      isEmpty(currentValues.phone) || isEmpty(currentValues.nickName);

    console.log('isVacant = ', isVacant);
    return isVacant;
  };

  const confirmUpload: SubmitHandler<IUserInfo> = async data => {
    console.log('업로드 사용자 주소 data = ', data);

    const token = await getToken();
    const decoded = jwtDecode(token!) as UserFormInput;
    //헤드 정보를 만든다.
    const config = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${token}`,
      },
    };

    //2023-02-16 : await 로 변경함. 그리고 에러 발생 처리
    try {
      const response: AxiosResponse = await axios.put(
        `${baseURL}users/update/${decoded.userId}`,
        JSON.stringify(data),
        config,
      );
      if (response.status === 200 || response.status === 201) {
        alertMsg(strings.SUCCESS, strings.UPLOAD_SUCCESS);
      }
    } catch (error) {
      alertMsg(strings.ERROR, strings.UPLOAD_FAIL);
    }
  };



  const uploadUserInfo = () => {
    console.log('사용자 정보 업로드');
    if (!isVacancy()) {
      console.log('데이타가 변경되었습니다. ');
      const currentValues = getValues();
      if (!areJsonEqual(currentValues, userOriginalInfo.current!)) {
        handleSubmit(confirmUpload)();
      } else {
        errorAlert(strings.ERROR, strings.NO_CHANGE_DATA);
      }
    } else {
      errorAlert(strings.ERROR, strings.VACANT_DATA);
    }
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


  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        //    isCenterView={true}
        centerText={strings.SYSINFO}
        containerStyle={{paddingHorizontal: 8}}
        isLeftView={true}
        leftCustomView={LeftCustomComponent}
        rightText={''}
        rightTextStyle={{color: colors.lightBlue}}
        onPressRight={() => {}}
        isRightView={false   }
        rightCustomView={RightCustomComponent}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={GlobalStyles.containerKey}>
        <ScrollView style={GlobalStyles.scrollView}>
          <View style={GlobalStyles.VStack}>
            <View style={styles.HSStack}>
              <View>
                <Text style={styles.inputTitle}>
                  {strings.VERSION}: {versionNum}
                </Text>
              </View>
            </View>

            <View >
                    <Text
                      style={styles.HeadTitleText}
                      onPress={ () => {
                        console.log('사용자 정보 click');
                        fetchUserProfile();
                        setIsExpanded(!isExpanded);
                      }}
                    >사용자 정보
                     {isExpanded ? '  🔼' : '  🔽'} {/* 인디케이터 추가 */}
                    </Text>

            </View>

                  {isExpanded && (
                    <>

                        <View style={styles.UserInfoBorderBox}>
                          <View style ={styles.userContainer}>
                              <Text style={GlobalStyles.inputTitle}>
                              {strings.EMAIL}
                              </Text>
                              <TouchableOpacity
                                onPress={() => {
                                    uploadUserInfo();
                              }}
                              >
                                  <Text style={styles.buttonTextStyle}>{strings.UPLOAD}</Text>
                              </TouchableOpacity>

                          </View>
                          <View style={GlobalStyles.HStack}>
                            <InputField
                              control={control}
                              rules={{
                                required: true,
                                minLength: 2,
                              }}
                              name="email"
                              placeholder={strings.PLEASE_ENTER_NAME}
                              keyboard="name-phone-pad" // 숫자 판으로 변경
                              isEditable={false}
                            />
                            {errors.email && (
                              <Text style={GlobalStyles.errorMessage}>
                                {strings.EMAIL} {strings.ERROR}
                              </Text>
                            )}
                          </View>
                          <Text style={GlobalStyles.inputTitle}>{strings.PHONE}</Text>
                          <View style={GlobalStyles.HStack}>
                            <InputField
                              control={control}
                              rules={{
                                required: true,
                                minLength: 11,
                                maxLength: 11,
                                pattern: /^01(?:0)\d{4}\d{4}$/,
                              }}
                              name="phone"
                              placeholder={strings.PLEASE_ENTER_TEL}
                              keyboard="phone-pad" // 숫자 판으로 변경
                              isEditable={true}
                            />
                            {errors.phone && (
                              <Text style={GlobalStyles.errorMessage}>
                                전화번호 에러.
                              </Text>
                            )}
                          </View>
                        </View>
                    </>


                  )}

            <Text
              style={styles.HeadTitleText}
              onPress={() => {
                console.log('회원 탈퇴 클릭');
                //  handleExitMember(props);
              }}>
                {strings.EXIT_MEMBER}{'  ▶️ ' } {/* 인디케이터 추가 */}
            </Text>

            <Text
              style={styles.HeadTitleText}
              onPress={() => {
                console.log('SystemInfoScreen: 로그 아웃 클릭');
                handleLogout(props);
              }}>
              {strings.LOGOUT}{'  ▶️ ' } {/* 인디케이터 추가 */}
            </Text>
            <Text
              style={styles.HeadTitleText}
              onPress={() => {
                console.log('Profile: 이용약관');
                handleUsageTerm(props);
              }}>

                  {strings.TERMS_OF_SERVICE}{'  ▶️ ' } {/* 인디케이터 추가 */}
            </Text>
            <Text
              style={styles.HeadTitleText}
              onPress={() => {
                console.log('Profile: 개인정보처리');
                handlePrivacyPolicy(props);
              }}>
              {strings.PRIVACY_POLICY}{'  ▶️ ' } {/* 인디케이터 추가 */}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
  scrollInnerView: {
    marginTop: RFPercentage(1),
    borderColor: 'blue',
  },

  VSStack: {
    flexDirection: 'column',
    height: RFPercentage(40),
    margin: RFPercentage(3),
    borderColor: 'blue',
    borderWidth: 2,
    borderRadius: 5,
  },
  HeadTitleText: {
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    fontSize: RFPercentage(2),
    marginTop: RFPercentage(2),
    borderColor: 'blue',
    borderBottomWidth: 1,
  },

  userContainer:{
      flex: 1,
      flexDirection: 'row',
      width: width * 0.8,
      justifyContent: 'space-between',
      alignContent: 'center',
      alignItems: 'center',
  
    },
  UserInfoBorderBox: {
      marginVertical: RFPercentage(1),
      padding: RFPercentage(1),
      borderColor: 'black',
      borderWidth: 2,
      borderRadius: RFPercentage(2),
    },
  buttonTextStyle: {
      width: width * 0.2,
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: RFPercentage(2), // Adjust the percentage based on your design
      padding: RFPercentage(0.5),
      color: 'black',
      borderColor: 'blue',
      borderWidth: 1,
      borderRadius: RFPercentage(1),
      // alignItems: 'center',
  },

  HSStack: {
    padding: RFPercentage(1),
    height: RFPercentage(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: 'blue',
    borderBottomWidth: 2,
  },

  HIStack: {
    //2024-10-31 : height : 8->7로 조정
    height: RFPercentage(7),
    padding: RFPercentage(2),

    // 2024-10-31 : 2->1 로 조정
    marginVertical: RFPercentage(1),
    marginHorizontal: RFPercentage(3),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: colors.lightBlue,
  },
  HUStack: {
    padding: 10,
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: colors.lightBlue,
  },

  statusText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: RFPercentage(2.0),
    marginTop: 5,
    marginLeft: 20,
  },

  consumeTitleText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: RFPercentage(2.0),
    marginTop: 5,
    marginLeft: 20,
  },

  consumeText: {
    // fontWeight: 'bold',
    color: 'black',
    fontSize: RFPercentage(2.0),
    marginTop: 5,
    marginLeft: 40,
  },

  inputTitle: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: RFPercentage(2.2),
  },

  buttonText: {
    fontWeight: 'bold',
    fontSize: RFPercentage(2),
    color: colors.white,
  },
});

export default SystemInfoScreen;

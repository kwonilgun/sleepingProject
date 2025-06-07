/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, {useCallback} from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import WrapperContainer from '../../utils/basicForm/WrapperContainer';
import HeaderComponent from '../../utils/basicForm/HeaderComponents';
import strings from '../../constants/lang';
import colors from '../../styles/colors';
import {PasswordResetScreenProps} from '../model/types/TUserNavigator';
import {useFocusEffect} from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {useForm, SubmitHandler} from 'react-hook-form';
import InputField from '../../utils/InputField';
import {passwordResetOnAwsDb} from './passwordResetOnAwsDb';
import {
  LOGIN_NO_EXIST_EMAIL,
  LOGIN_PASSWORD_ERROR,
} from '../../assets/common/BaseValue';
import {alertMsg} from '../../utils/alerts/alertMsg';
import {
  confirmAlert,
  ConfirmAlertParams,
} from '../../utils/alerts/confirmAlert';

import GlobalStyles from '../../styles/GlobalStyles';

export interface IEmail {
  email: string;
}
export interface IEmailResult {
  status: number;
  data: any;
}

const PasswordResetScreen: React.FC<PasswordResetScreenProps> = props => {
  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<IEmail>({
    defaultValues: {
      email: '',
    },
  });
  useFocusEffect(
    useCallback(() => {
      return () => {
        //    setContents(undefined);
        //    setReady(false);
      };
    }, []),
  );

  // upload data to database
  const confirmUpload: SubmitHandler<IEmail> = async data => {
    console.log('confirmUpload: 업로드 사용자 정보 data = ', data);

    const param: ConfirmAlertParams = {
      title: strings.CONFIRMATION,
      message: strings.PASSWORD_RESET,
      // eslint-disable-next-line @typescript-eslint/no-shadow
      func: (data: IEmail) => {
        console.log('password reset, data = ', data);

        //입력 값을 reset 한다.
        reset();

        passwordResetOnAwsDb(data)
          .then(element => {
            console.log('PasswordResetScreen onSubmit', element);
            if (element.status < 400) {
              alertMsg(strings.CONFIRMATION, strings.SEND_NEW_PASSWORD);
            }
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
      },
      params: [data],
    };

    confirmAlert(param);
  };

  const onSubmit: SubmitHandler<IEmail> = async data => {
    // 실제 로그인 로직을 여기에 구현하고, 성공 시 Redux 액션을 디스패치합니다.
    // 예를 들어, 서버 API 호출 및 인증 로직을 수행합니다.

    console.log('onSubmit, password reset = ', data);

    //입력 값을 reset 한다.
    reset();

    passwordResetOnAwsDb(data)
      .then(element => {
        console.log('PasswordResetScreen onSubmit', element);
        if (element.status < 400) {
          alertMsg(strings.CONFIRMATION, strings.SEND_NEW_PASSWORD);
        }
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

  const onPressLeft = () => {
    console.log('PasswordReset.Screen.tsx: onPressLeft');
    props.navigation.goBack();
  };

  const LeftCustomComponent = () => {
    return (
      <TouchableOpacity onPress={onPressLeft}>
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
      </TouchableOpacity>
    );
  };

  return (
    <WrapperContainer containerStyle={{paddingHorizontal: 0}}>
      <HeaderComponent
        rightPressActive={false}
        centerText={strings.PASSWORD_FORGET}
        isLeftView={true}
        leftCustomView={LeftCustomComponent}
        containerStyle={{paddingHorizontal: 8}}
        isRight={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={GlobalStyles.containerKey}>
        <View style={GlobalStyles.VStack}>
          <Text style={styles.Title}>{strings.PASSWORD_RESET}</Text>
          <Text style={styles.subTitle}>{strings.PASSWORD_RX_EMAIL}</Text>

          <View style={GlobalStyles.totalInput}>
            <Text style={GlobalStyles.inputTitle}>{strings.EMAIL}</Text>
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

          <TouchableOpacity onPress={handleSubmit(confirmUpload)}>
            <View style={GlobalStyles.buttonViewText}>
              <FontAwesome
                style={{
                  fontSize: RFPercentage(3),
                  color: colors.white,
                }}
                name="envelope-o"
              />
              <Text style={GlobalStyles.buttonTextStyle}>send</Text>
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </WrapperContainer>
  );
};

const styles = StyleSheet.create({
  Title: {
    marginTop: RFPercentage(10),
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: RFPercentage(3),
  },

  subTitle: {
    marginTop: RFPercentage(1),
    marginBottom: RFPercentage(5),
    marginHorizontal: RFPercentage(2),
    padding: RFPercentage(1),
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'black',
    fontSize: RFPercentage(1.8),
  },
});
export default PasswordResetScreen;

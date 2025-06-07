import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import {RootStackParamList} from '../Screens/model/types/TUserNavigator';
import LoginScreen from '../Screens/Login/Login.Screen';
import {useAuth} from '../context/store/Context.Manager';
import ProfileScreen from '../Screens/Login/ProfileScreen';
import MembershipScreen from '../Screens/Login/Membership.Screen';
import PasswordResetScreen from '../Screens/Login/PasswordReset.Screen';
// import ProductMainScreen from '../Screen/Products/ProductMainScreen';
import SystemInfoScreen from '../Screens/Systems/SystemInfoScreen';
import PrivacyPolicyScreen from '../Screens/TermsAndConditions/PrivacyPolicyScreen';
import UsageTermScreen from '../Screens/TermsAndConditions/UsageTermScreen';
import MembershipUsageTermScreen from '../Screens/TermsAndConditions/MembershipUsageTermScreen';
import MembershipPrivacyPolicyScreen from '../Screens/TermsAndConditions/MembershipPrivacyPolicyScreen';
// import OrderListScreen from '../Screen/Orders/OrderListScreen';
// import OrderDetailScreen from '../Screen/Orders/OrderDetailScreen';
// import ChatMainScreen from '../Screen/Chat/ChatMainScreen';
// import ChatRegisterScreen from '../Screen/Chat/ChatRegisterScreen';
// import NaverLoginScreen from '../Screen/Login/NaverLoginScreen';
// import OrderHistoryScreen from '../Screen/Orders/OrderHistoryScreen';
import EmailLoginScreen from '../Screens/Login/EmailLoginScreen';

// 2024-02-14 : 버그 Fix, RootStackParamList 를 추가함. 타입을 지정
const Stack = createStackNavigator<RootStackParamList>();

function MyStack() {
  const {state} = useAuth();

  return (
    <Stack.Navigator
      initialRouteName="LoginScreen"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#e6efd0',
          height: 30,
        },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: {
          // fontWeight: "bold",
          color: 'black',
        },
      }}>
      {/* 2024-05-02 : 하단 탭 메뉴에서 로그인 탭을 눌러도 그대로 있도록 하기 위해서 로그인 상태를 체크해서, 로그인 상태이면 ProfileScreen을 유지 */}

      {state.isAuthenticated ? (
        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={({navigation, route}) => ({
            headerShown: false,
            headerLeft: () => null,
            title: '사용자',
            // headerTitle: props => (
            //   <LogoTitle title="루트원 마켓" navigation={navigation} />
            // ),
          })}
        />
      ) : (
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={({navigation, route}) => ({
            headerShown: false,
            headerLeft: () => null,
            title: '로그인',
            // headerTitle: props => (
            //   <LogoTitle title="루트원 마켓" navigation={navigation} />
            // ),
          })}
        />
      )}

      {state.isAuthenticated ? (
        <Stack.Screen
          name="SystemInfoScreen"
          component={SystemInfoScreen}
          options={({navigation, route}) => ({
            headerShown: false,
            headerLeft: () => null,
            title: '시스템 정보',
            // headerTitle: props => (
            //   <LogoTitle title="루트원 마켓" navigation={navigation} />
            // ),
          })}
        />
      ) : null}

      {state.isAuthenticated ? null : (
        <Stack.Screen
          name="EmailLoginScreen"
          component={EmailLoginScreen}
          options={({navigation, route}) => ({
            headerShown: false,
            headerLeft: () => null,
            title: '이메일 ',
            // headerTitle: props => (
            //   <LogoTitle title="루트원 마켓" navigation={navigation} />
            // ),
          })}
        />
      )}


      {state.isAuthenticated ? null : (
        <Stack.Screen
          name="MembershipScreen"
          component={MembershipScreen}
          options={({navigation, route}) => ({
            headerShown: false,
            headerLeft: () => null,
            title: '회원 가입',
            // headerTitle: props => (
            //   <LogoTitle title="루트원 마켓" navigation={navigation} />
            // ),
          })}
        />
      )}

      {/* {state.isAuthenticated ? null : (
        <Stack.Screen
          name="NaverLoginScreen"
          component={NaverLoginScreen}
          options={({navigation, route}) => ({
            headerShown: false,
            headerLeft: () => null,
            title: '회원 가입',
            // headerTitle: props => (
            //   <LogoTitle title="루트원 마켓" navigation={navigation} />
            // ),
          })}
        />
      )} */}

      {state.isAuthenticated ? null : (
        <Stack.Screen
          name="PasswordResetScreen"
          component={PasswordResetScreen}
          options={({navigation, route}) => ({
            headerShown: false,
            headerLeft: () => null,
            title: '패스워드리셋',
            // headerTitle: props => (
            //   <LogoTitle title="루트원 마켓" navigation={navigation} />
            // ),
          })}
        />
      )}

      {/* <Stack.Screen
        name="ProductMainScreen"
        component={ProductMainScreen}
        options={({navigation, route}) => ({
          headerShown: false,
          headerLeft: () => null,
          title: '회원 가입',
          // headerTitle: props => (
          //   <LogoTitle title="루트원 마켓" navigation={navigation} />
          // ),
        })}
      /> */}

      {state.isAuthenticated ? (
        <Stack.Screen
          name="PrivacyPolicyScreen"
          component={PrivacyPolicyScreen}
          options={({navigation, route}) => ({
            headerShown: false,
            headerLeft: () => null,
            title: '개인정보',
            // headerTitle: props => (
            //   <LogoTitle title="루트원 마켓" navigation={navigation} />
            // ),
          })}
        />
      ) : null}

      {state.isAuthenticated ? (
        <Stack.Screen
          name="UsageTermScreen"
          component={UsageTermScreen}
          options={({navigation, route}) => ({
            headerShown: false,
            headerLeft: () => null,
            title: '개인정보',
            // headerTitle: props => (
            //   <LogoTitle title="루트원 마켓" navigation={navigation} />
            // ),
          })}
        />
      ) : null}

      {state.isAuthenticated ? null : (
        <Stack.Screen
          name="MembershipPrivacyPolicyScreen"
          component={MembershipPrivacyPolicyScreen}
          options={({navigation, route}) => ({
            headerShown: false,
            headerLeft: () => null,
            title: '개인정보',
            // headerTitle: props => (
            //   <LogoTitle title="루트원 마켓" navigation={navigation} />
            // ),
          })}
        />
      )}

      {state.isAuthenticated ? null : (
        <Stack.Screen
          name="MembershipUsageTermScreen"
          component={MembershipUsageTermScreen}
          options={({navigation, route}) => ({
            headerShown: false,
            headerLeft: () => null,
            title: '개인정보',
            // headerTitle: props => (
            //   <LogoTitle title="루트원 마켓" navigation={navigation} />
            // ),
          })}
        />
      )}

      {/* {state.isAuthenticated ? (
        <Stack.Screen
          name="OrderListScreen"
          component={OrderListScreen}
          options={({navigation, route}) => ({
            headerShown: false,
            headerLeft: () => null,
            title: '개인정보',
            // headerTitle: props => (
            //   <LogoTitle title="루트원 마켓" navigation={navigation} />
            // ),
          })}
        />
      ) : null}

      {state.isAuthenticated ? (
        <Stack.Screen
          name="OrderHistoryScreen"
          component={OrderHistoryScreen}
          options={({navigation, route}) => ({
            headerShown: false,
            headerLeft: () => null,
            title: '개인정보',
            // headerTitle: props => (
            //   <LogoTitle title="루트원 마켓" navigation={navigation} />
            // ),
          })}
        />
      ) : null}

      {state.isAuthenticated ? (
        <Stack.Screen
          name="OrderDetailScreen"
          component={OrderDetailScreen}
          options={({navigation, route}) => ({
            headerShown: false,
            headerLeft: () => null,
            title: '개인정보',
            // headerTitle: props => (
            //   <LogoTitle title="루트원 마켓" navigation={navigation} />
            // ),
          })}
        />
      ) : null}


      {state.isAuthenticated ? (
        <Stack.Screen
          name="ChatMainScreen"
          component={ChatMainScreen}
          options={({navigation, route}) => ({
            headerShown: false,
            headerLeft: () => null,
            title: '채팅방',
            // headerTitle: props => (
            //   <LogoTitle title="루트원 마켓" navigation={navigation} />
            // ),
          })}
        />
      ) : null}

      {state.isAuthenticated ? (
        <Stack.Screen
          name="ChatRegisterScreen"
          component={ChatRegisterScreen}
          options={({navigation, route}) => ({
            headerShown: false,
            headerLeft: () => null,
            title: '채팅방',
            // headerTitle: props => (
            //   <LogoTitle title="루트원 마켓" navigation={navigation} />
            // ),
          })}
        />
      ) : null} */}
    </Stack.Navigator>
  );
}

export default function UserNavigator() {
  return <MyStack />;
}

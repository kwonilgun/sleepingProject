/*
 * File: HomeNavigator.tsx
 * Project: rootone0216
 * File Created: Friday, 14th June 2024 7:36:17 am
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * -----
 * Last Modified: Friday, 14th June 2024 8:21:16 am
 * Modified By: Kwonilgun(권일근) (kwonilgun@naver.com>)
 * -----
 * Copyright <<projectCreationYear>> - 2024 루트원 AI, 루트원 AI
 * 2024-06-14 : 홈 메뉴 추가
 */

import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import {RootStackParamList} from '../Screens/model/types/TUserNavigator';
import PlaylistScreen from '../Screens/Player/PlaylistScreen';
import PlayerScreen from '../Screens/Player/PlayerScreen';
// import ProductMainScreen from '../Screen/Products/ProductMainScreen';
// import ProductDetailScreen from '../Screen/Products/ProductDetailScreen';
// import HomeAiScreen from '../Screen/Products/HomeAiScreen';

// 2024-02-14 : 버그 Fix, RootStackParamList 를 추가함. 타입을 지정
const Stack = createStackNavigator<RootStackParamList>();

function MyStack() {
  //   const {state} = useAuth();
  console.log('HomeNavigator....')

  return (
    <Stack.Navigator
      initialRouteName="PlaylistScreen"
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
      <Stack.Screen
        name="PlaylistScreen"
        component={PlaylistScreen}
        options={({navigation, route}) => ({
          headerShown: false,
          headerLeft: () => null,
          title: '와이파이',
          // headerTitle: props => (
          //   <LogoTitle title="루트원 마켓" navigation={navigation} />
          // ),
        })}
      />

      <Stack.Screen
        name="PlayerScreen"
        component={PlayerScreen}
        options={({navigation, route}) => ({
          headerShown: false,
          headerLeft: () => null,
          title: '와이파이',
          // headerTitle: props => (
          //   <LogoTitle title="루트원 마켓" navigation={navigation} />
          // ),
        })}
      />
      {/* <Stack.Screen
        name="ProductDetailScreen"
        component={ProductDetailScreen}
        options={({navigation, route}) => ({
          headerShown: false,
          headerLeft: () => null,
          title: '제품 상세',
          // headerTitle: props => (
          //   <LogoTitle title="루트원 마켓" navigation={navigation} />
          // ),
        })}
      /> */}
    </Stack.Navigator>
  );
}

export default function HomeNavigator() {
  return <MyStack />;
}

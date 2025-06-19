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
import FavoriteScreen from '../Screens/Player/FavoriteScreen';
// import PlaylistScreen from '../Screens/Player/PlaylistScreen';
// import PlayerScreen from '../Screens/Player/PlayerScreen';


// 2024-02-14 : 버그 Fix, RootStackParamList 를 추가함. 타입을 지정
const Stack = createStackNavigator<RootStackParamList>();

function MyStack() {
  
  console.log('FavoriteNavigator....')

  return (
    <Stack.Navigator
      initialRouteName="FavoriteScreen"
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
        name="FavoriteScreen"
        component={FavoriteScreen}
        options={({navigation, route}) => ({
          headerShown: false,
          headerLeft: () => null,
          title: '즐겨찾기',
          // headerTitle: props => (
          //   <LogoTitle title="루트원 마켓" navigation={navigation} />
          // ),
        })}
      />

      
    </Stack.Navigator>
  );
}

export default function FavoriteNavigator() {
  return <MyStack />;
}

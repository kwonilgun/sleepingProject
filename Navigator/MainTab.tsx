/* eslint-disable react/no-unstable-nested-components */
import React, { useCallback, useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/store/Context.Manager';
import HomeNavigator from './HomeNavigator';
import UserNavigator from './UserNavigator';
// import CartNavigator from './CartNavigator';
// import ShippingNavigator from './ShippingNavigator';
// import PaymentNavigator from './PaymentNavigator';
// import EditNavigator from './Admin/EditNavigator';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RFPercentage } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Linking, Platform } from 'react-native';
import notifee from '@notifee/react-native';
// import AdminOrderNavigator from './Admin/AdminOrderNavigator';
// import SalesNavigator from './Admin/SalesNavigator';
import { useFocusEffect } from '@react-navigation/native';
import PlayerNavigator from './PlayerNavigator';
import FavoriteNavigator from './FavoriteNavigator';



const Tab = createBottomTabNavigator<RootTabParamList>();

type RootTabParamList = {
  Home: undefined;
  Player: undefined;
  Favorite: undefined;
  UserMain: undefined;
  Admin: undefined;
  ShoppingCart: undefined;
  ShippingNavigator: undefined;
  PaymentNavigator: undefined;
  EditManager:undefined;
  AdminOrder: undefined;
  Sales: undefined;
};

const getTabIconStyle = () => ({
  color: undefined,
  height: Platform.OS === 'ios' ? RFPercentage(6) : RFPercentage(7),
  width: Platform.OS === 'ios' ? RFPercentage(6) : RFPercentage(7),
  marginTop: Platform.OS === 'ios' ? RFPercentage(1) : RFPercentage(2),
  padding: RFPercentage(1),
  fontSize: Platform.OS === 'ios' ? RFPercentage(4) : RFPercentage(4),
});

const TabIcon = ({name, color}: {name: string; color: string}) => (
  <FontAwesome style={{...getTabIconStyle(), color}} name={name} />
);

const MainTab: React.FC<{initialUrl: string | null}> = ({initialUrl}) => {
  const {state, badgeCountState, badgeCountDispatch} = useAuth();
  const [badgeCount, setBadgeCount] = useState<number>(0);
  // const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  // const [status, setStatus] = useState<string>("정상 상태");

  const isAuthenticated = state.isAuthenticated;
  const isAdmin = Boolean(state.user?.isAdmin);

  console.log('MainTab, isAuthenticated =', isAuthenticated);
  console.log('MainTab: isAdmin = ', isAdmin);



  return (
    <Tab.Navigator
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: '#e91e63',
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          display: 'flex',
          backgroundColor: 'white',
          alignItems: 'center',
          height: RFPercentage(8),
          borderTopWidth: 4,
          borderTopColor: 'black',
        },
      }}>
      {isAuthenticated && (
        <Tab.Screen
          name="Home"
          component={HomeNavigator}
          options={{
            tabBarIcon: ({color}) => <TabIcon name="home" color={color} />,
          }}
        />
      )}

      {isAuthenticated && (
        <Tab.Screen
          name="Player"
          component={PlayerNavigator}
          options={{
            tabBarIcon: ({color}) => <TabIcon name="music" color={color} />,
          }}
        />
      )}

      {isAuthenticated && (
        <Tab.Screen
          name="Favorite"
          component={FavoriteNavigator}
          options={{
            tabBarIcon: ({color}) => <TabIcon name="heart" color={color} />,
          }}
        />
      )}



      {/* {(isAuthenticated && !isAdmin) && (
        <>
          <Tab.Screen
            name="ShoppingCart"
            component={CartNavigator}
            options={{
              tabBarIcon: ({color}) => (
                <TabIcon name="shopping-cart" color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="ShippingNavigator"
            component={ShippingNavigator}
            options={{
              tabBarIcon: ({color}) => <TabIcon name="truck" color={color} />,
            }}
          />
          <Tab.Screen
            name="PaymentNavigator"
            component={PaymentNavigator}
            options={{
              tabBarIcon: ({color}) => <TabIcon name="krw" color={color} />,
            }}
          />
        </>
      )} */}

      {/* {(isAuthenticated && isAdmin ) && (
        <>
        <Tab.Screen
                name="EditManager"
                component={EditNavigator}
                options={{
                  tabBarIcon: ({color}) => <TabIcon name="edit" color={color} />,
                }}
              />
        <Tab.Screen
                name="AdminOrder"
                component={AdminOrderNavigator}
                options={{
                  tabBarIcon: ({color}) => <TabIcon name="list" color={color} />,
                }}
              />
        <Tab.Screen
                name="Sales"
                component={SalesNavigator}
                options={{
                  tabBarIcon: ({color}) => <TabIcon name="line-chart" color={color} />,
                }}
              />
        </>

      )} */}

    {isAuthenticated && (
        <Tab.Screen
          name="UserMain"
          component={UserNavigator}
          listeners={{
            tabPress: () => {
              console.log('사용자 tab pressed');
              // setBadgeCount(0); // Chat 탭을 누르면 뱃지 초기화
              // cancelNotifications();
            },
          }}
          options={{
            tabBarIcon: ({color}) => <TabIcon name="user" color={color} />,
            tabBarBadge: badgeCount > 0 ? badgeCount : undefined,
          }}
        />
      )}
      {!isAuthenticated && (
        <Tab.Screen
          name="UserMain"
          component={UserNavigator}
          options={{
            tabBarIcon: ({color}) => <TabIcon name="user" color={color} />,
          }}
        />
      )}


    </Tab.Navigator>
  );
};

export default MainTab;

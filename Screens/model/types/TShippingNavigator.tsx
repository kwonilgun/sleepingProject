/*
 * File: THomeNavigator.tsx
 * Project: rootone0216
 * File Created: Tuesday, 2024-02-20
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * Copyright <<projectCreationYear>> - 2024 루트원 AI, 루트원 AI
 */

import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {CartItem} from '../../../Redux/Cart/Reducers/cartItems';

export type ShippingStackParamList = {
  Home: {screen: string};
  PaymentNavigator: {screen: string};
  ShippingNavigator: {screen: string};
  ShippingMainScreen: undefined;
  ShippingRegisterScreen: undefined;
  ShippingPostScreen: undefined;
  DeliveryModifyScreen: undefined;
};

export type ShippingMainScreenProps = {
  cart: CartItem[];
  route: RouteProp<ShippingStackParamList, 'ShippingMainScreen'>;
  navigation: StackNavigationProp<ShippingStackParamList, 'ShippingMainScreen'>;
};

export type ShippingRegisterScreenProps = {
  route: RouteProp<ShippingStackParamList, 'ShippingRegisterScreen'>;
  navigation: StackNavigationProp<
    ShippingStackParamList,
    'ShippingRegisterScreen'
  >;
};

export type ShippingPostScreenProps = {
  route: RouteProp<ShippingStackParamList, 'ShippingPostScreen'>;
  navigation: StackNavigationProp<ShippingStackParamList, 'ShippingPostScreen'>;
};

export type DeliveryModifyScreenProps = {
  route: RouteProp<ShippingStackParamList, 'DeliveryModifyScreen'>;
  navigation: StackNavigationProp<
    ShippingStackParamList,
    'DeliveryModifyScreen'
  >;
};

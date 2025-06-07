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

export type PaymentStackParamList = {
  Home: {screen: string};
  UserMain: {screen: string};
  PaymentMainScreen: undefined;
};

export type PaymentMainScreenProps = {
  cart: CartItem[];
  route: RouteProp<PaymentStackParamList, 'PaymentMainScreen'>;
  navigation: StackNavigationProp<PaymentStackParamList, 'PaymentMainScreen'>;
  clearCart: () => void;
  removeFromCart: (item: CartItem) => void;
};

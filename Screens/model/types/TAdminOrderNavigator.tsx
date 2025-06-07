/*
 * File: THomeNavigator.tsx
 * Project: rootone0216
 * File Created: Tuesday, 2024-02-20
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * Copyright <<projectCreationYear>> - 2024 루트원 AI, 루트원 AI
 */

import {StackNavigationProp} from '@react-navigation/stack';
import { IOrderInfo } from '../interface/IOrderInfo';
import { DataList } from '../../Orders/makeExpandable';
import { RootStackParamList } from './TUserNavigator';
import { RouteProp } from '@react-navigation/native';

export type AdminOrderStackParamList = {
  // EditManager: {screen: 'EditMainScreen'};
  AdminOrderMainScreen: undefined;
  // EditProductScreen: {item: IProduct}
  OrderStatusScreen: undefined;
  OrderRxScreen: undefined;
  PaymentCompleteScreen: undefined;
  OrderDetailScreen: {
      item: IOrderInfo;
      actionFt: (id: string, props: any) => void;
      orders: DataList;
    };
  OrderChangeScreen: {
      item: IOrderInfo;
      actionFt: (id: string, props: any) => void;
      orders: DataList;
    };
  OrderTotalChangeScreen:undefined
  PrepareDeliveryScreen: undefined;
  FindOrderNumberScreen: undefined;
  OrderAIScreen: undefined;
  DuringDeliveryScreen: undefined;
  CompleteDeliveryScreen: undefined;
  RequestReturnScreen: undefined;
  CompleteReturnScreen: undefined;
};

export type AdminOrderMainScreenProps = {
  navigation: StackNavigationProp<AdminOrderStackParamList, 'AdminOrderMainScreen'>;
};

export type OrderStatusScreenProps = {
  navigation: StackNavigationProp<AdminOrderStackParamList, 'OrderStatusScreen'>;
};

export type OrderRxScreenProps = {
  navigation: StackNavigationProp<AdminOrderStackParamList, 'OrderRxScreen'>;
};

export type PaymentCompleteScreenProps = {
  navigation: StackNavigationProp<AdminOrderStackParamList, 'PaymentCompleteScreen'>;
};

export type OrderDetailScreenProps = {
  // items: DataList | null;
  route: RouteProp<RootStackParamList, 'OrderDetailScreen'>;
  navigation: StackNavigationProp<RootStackParamList, 'OrderDetailScreen'>;
};

export type OrderChangeScreenProps = {
  // items: DataList | null;
  route: RouteProp<RootStackParamList, 'OrderChangeScreen'>;
  navigation: StackNavigationProp<RootStackParamList, 'OrderChangeScreen'>;
};
export type OrderTotalChangeScreenProps = {
  // items: DataList | null;
  route: RouteProp<RootStackParamList, 'OrderTotalChangeScreen'>;
  navigation: StackNavigationProp<RootStackParamList, 'OrderTotalChangeScreen'>;
};

export type PrepareDeliveryScreenProps = {
  navigation: StackNavigationProp<AdminOrderStackParamList, 'PrepareDeliveryScreen'>;
};

export type FindOrderNumberScreenProps = {
  navigation: StackNavigationProp<AdminOrderStackParamList, 'FindOrderNumberScreen'>;
};

export type OrderAIScreenProps = {
  navigation: StackNavigationProp<AdminOrderStackParamList, 'OrderAIScreen'>;
};

export type DuringDeliveryScreenProps = {
  navigation: StackNavigationProp<AdminOrderStackParamList, 'DuringDeliveryScreen'>;
};

export type CompleteDeliveryScreenProps = {
  navigation: StackNavigationProp<AdminOrderStackParamList, 'CompleteDeliveryScreen'>;
};

export type RequestReturnScreenProps = {
  navigation: StackNavigationProp<AdminOrderStackParamList, 'RequestReturnScreen'>;
};
export type CompleteReturnScreenProps = {
  navigation: StackNavigationProp<AdminOrderStackParamList, 'CompleteReturnScreen'>;
};
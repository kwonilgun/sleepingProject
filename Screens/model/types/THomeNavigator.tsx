/*
 * File: THomeNavigator.tsx
 * Project: rootone0216
 * File Created: Tuesday, 2024-02-20
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * Copyright <<projectCreationYear>> - 2024 루트원 AI, 루트원 AI
 */

import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {IProduct} from '../interface/IProductInfo';

export type HomeStackParamList = {
  ProductsScreen: undefined;
  ProductDetailScreen: {productInfo: IProduct};
  CartScreen: undefined;
};

export type ProductsScreenProps = {
  navigation: StackNavigationProp<HomeStackParamList, 'ProductsScreen'>;
};

export type ProductDetailScreenProps = {
  route: RouteProp<HomeStackParamList, 'ProductDetailScreen'>;
  navigation: StackNavigationProp<HomeStackParamList, 'ProductDetailScreen'>;
};

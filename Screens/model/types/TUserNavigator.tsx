/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * File: TNavigator.tsx
 * Project: root_project
 * File Created: Thursday, 15th February 2024The navigation method (likely navigate() or push())
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * Copyright <<projectCreationYear>> - 2024 루트원 AI, 루트원 AI
 */

import {StackNavigationProp} from '@react-navigation/stack';
import {IAuthInfo} from '../interface/IAuthInfo';
import {RouteProp} from '@react-navigation/native';
import {UserFormInput} from '../interface/IAuthInfo';
import {IProduct} from '../interface/IProductInfo';
import {ICompany} from '../interface/ICompany';
import {CartItem} from '../../../Redux/Cart/Reducers/cartItems';
import {DataList} from '../../Orders/makeExpandable';
import {IOrderInfo} from '../interface/IOrderInfo';
import {SocketItem} from '../../../Redux/Cart/Reducers/socketItems';
// import { ISProduct } from '../../Admin/AddProductScreen';

export type RootStackParamList = {
  /* 💇‍♀️2024-12-21 :
  The TypeScript error you're encountering indicates a type mismatch when trying to pass an array ["Home", { screen: string }] to a function or property expecting a specific structure for navigation parameters. This typically happens in a React Native project using a navigation library like React Navigation.

  Root Cause
  The navigation method (likely navigate() or push()) expects specific screen names and parameter types, but "Home" with { screen: string } does not match any of the expected types.
  */
  Home: {screen: string};

  UserMain: {screen: string};
  ShippingNavigator: {screen: string};

  AdminScreen: undefined;
  EditUsageTermScreen: undefined;
  EditPrivatePolicyScreen: undefined;
  LoginScreen: undefined;
  EmailLoginScreen: undefined;
  PasswordResetScreen: undefined;
  ChangePasswordScreen: undefined;
  ProfileScreen: {userInfo: UserFormInput};
  AuthorizeScreen: {authInfo: IAuthInfo};
  // OrderListsScreen: {orderInfo: IOrderInfo[]};
  // OrderDetailScreen: {detailInfo: IOrderInfo};
  SystemInfoScreen: undefined;
  MembershipUsageTermScreen: undefined;
  UsageTermScreen: undefined;
  MembershipPrivacyPolicyScreen: undefined;
  PrivacyPolicyScreen: undefined;
  MembershipScreen: undefined;
  PlaylistScreen: undefined;
  PlayerScreen: undefined;
  // NaverLoginScreen: undefined;
  // ProductMainScreen: undefined;
  // HomeAiScreen: undefined;
  // ProductDetailScreen: undefined;
  // CartMainScreen: undefined;
  // OrderListScreen: {items: DataList};
  // OrderHistoryScreen: {items: DataList};
  // OrderDetailScreen: {
  //   item: IOrderInfo;
  //   actionFt: (id: string, props: any) => void;
  //   orders: DataList;
  // };
  // OrderChangeScreen: {
  //   item: IOrderInfo;
  //   actionFt: (id: string, props: any) => void;
  //   orders: DataList;
  // };
  // OrderTotalChangeScreen: undefined;
  // ChatMainScreen: undefined;
  // ChatRegisterScreen: undefined;
};

// 2024-11-16 : Admin 추가
export type AdminScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'AdminScreen'>;
};

export type PasswordResetScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'PasswordResetScreen'>;
};

export type EditUsageTermScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditUsageTermScreen'>;
};

export type EditPrivatePolicyScreenProps = {
  navigation: StackNavigationProp<
    RootStackParamList,
    'EditPrivatePolicyScreen'
  >;
};

export type LoginScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'LoginScreen'>;
};

export type PlaylistScreenProps = {
  navigation: StackNavigationProp<
    RootStackParamList,
    'PlaylistScreen'
  >;
};

export type PlayerScreenProps = {
  navigation: StackNavigationProp<
    RootStackParamList,
    'PlayerScreen'
  >;
};



export type EmailLoginScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EmailLoginScreen'>;
};

export type ChangePasswordScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'ChangePasswordScreen'>;
};

export type SystemInfoScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'SystemInfoScreen'>;
};

export type MembershipUsageTermScreenProps = {
  navigation: StackNavigationProp<
    RootStackParamList,
    'MembershipUsageTermScreen'
  >;
};

export type UsageTermScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'UsageTermScreen'>;
};

export type MembershipPrivacyPolicyScreenProps = {
  navigation: StackNavigationProp<
    RootStackParamList,
    'MembershipPrivacyPolicyScreen'
  >;
};

export type PrivacyPolicyScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'PrivacyPolicyScreen'>;
};

export type AuthorizeScreenProps = {
  route: RouteProp<RootStackParamList, 'AuthorizeScreen'>;
};

export type MembershipScreenProps = {
  route: RouteProp<RootStackParamList, 'MembershipScreen'>;
};

export type ProfileScreenProps = {
  route: RouteProp<RootStackParamList, 'ProfileScreen'>;
  navigation: StackNavigationProp<RootStackParamList, 'ProfileScreen'>;
};

// export type OrderListScreenProps = {
//   // items: DataList | null;
//   route: RouteProp<RootStackParamList, 'OrderListScreen'>;
//   navigation: StackNavigationProp<RootStackParamList, 'OrderListScreen'>;
// };

// export type OrderHistoryScreenProps = {
//   // items: DataList | null;
//   route: RouteProp<RootStackParamList, 'OrderHistoryScreen'>;
//   navigation: StackNavigationProp<RootStackParamList, 'OrderHistoryScreen'>;
// };

// export type OrderDetailScreenProps = {
//   // items: DataList | null;
//   route: RouteProp<RootStackParamList, 'OrderDetailScreen'>;
//   navigation: StackNavigationProp<RootStackParamList, 'OrderDetailScreen'>;
// };

// export type OrderChangeScreenProps = {
//   // items: DataList | null;
//   route: RouteProp<RootStackParamList, 'OrderChangeScreen'>;
//   navigation: StackNavigationProp<RootStackParamList, 'OrderChangeScreen'>;
// };

// export type OrderTotalChangeScreenProps = {
//   // items: DataList | null;
//   route: RouteProp<RootStackParamList, 'OrderTotalChangeScreen'>;
//   navigation: StackNavigationProp<RootStackParamList, 'OrderTotalChangeScreen'>;
// };



// export type ProductMainScreenProps = {
//   navigation: any;
//   route: RouteProp<RootStackParamList, 'ProductMainScreen'>;
// };

// export type HomeAiScreenProps = {
//   navigation: StackNavigationProp<RootStackParamList, 'HomeAiScreen'>;
//   route: {
//     params: {
//       productNames: string[] | null;
//     }
//   };
// };

// export type ProductCardProps = {
//   items: ISProduct;
//   onLoadingChange : (isLoading: boolean) => void;
//   navigation: StackNavigationProp<any, any>; // Update types based on your navigation stack
//   addItemToCart: (cart: CartItem) => void;
// };

// export type ProductDetailScreenProps = {
//   navigation: StackNavigationProp<RootStackParamList, 'ProductDetailScreen'>;
//   route: {
//     params: {
//       item: ISProduct;
//       companyInform: ICompany;
//     };
//   };
//   // items: IProduct;
//   // companyInform: ICompany;
//   addItemToCart: (product: {quantity: number; product: IProduct}) => void;
//   // cartItems: any[];
// };

// export type CartMainScreenProps = {
//   cart: CartItem[];
//   navigation: StackNavigationProp<RootStackParamList, 'CartMainScreen'>;
//   route: RouteProp<RootStackParamList, 'CartMainScreen'>;
//   clearCart: () => void;
//   removeFromCart: (item: CartItem) => void;
// };

// export type ChatMainScreenProps = {
//   socketItem: SocketItem[];
//   navigation: StackNavigationProp<RootStackParamList, 'ChatMainScreen'>;
//   route: RouteProp<RootStackParamList, 'ChatMainScreen'>;
//   clearSocket: () => void;
//   removeFromSocket: (item: SocketItem) => void;
//   addToSocket: (item: SocketItem) => void;
// };

// export type ChatRegisterScreenProps = {
//   navigation: StackNavigationProp<RootStackParamList, 'ChatMainScreen'>;
//   route: RouteProp<RootStackParamList, 'ChatMainScreen'>;
// };

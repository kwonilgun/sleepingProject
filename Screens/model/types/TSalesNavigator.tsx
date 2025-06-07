/*
 * File: THomeNavigator.tsx
 * Project: rootone0216
 * File Created: Tuesday, 2024-02-20
 * Author: Kwonilgun(권일근) (kwonilgun@naver.com)
 * Copyright <<projectCreationYear>> - 2024 루트원 AI, 루트원 AI
 */

import {StackNavigationProp} from '@react-navigation/stack';

export type SalesStackParamList = {
  // EditManager: {screen: 'EditMainScreen'};
  SalesMainScreen: undefined;
  SalesChartScreen: undefined;
  SalesMonthlyScreen: undefined;
  ProfitMonthlyScreen: undefined;
};

export type SalesMainScreenProps = {
  navigation: StackNavigationProp<SalesStackParamList, 'SalesMainScreen'>;
};
export type SalesChartScreenProps = {
  navigation: StackNavigationProp<SalesStackParamList, 'SalesChartScreen'>;
};
export type SalesMonthlyScreenProps = {
  navigation: StackNavigationProp<SalesStackParamList, 'SalesMonthlyScreen'>;
};
export type ProfitMonthlyScreenProps = {
  navigation: StackNavigationProp<SalesStackParamList, 'ProfitMonthlyScreen'>;
};



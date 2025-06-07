/* eslint-disable react-native/no-inline-styles */
//import libraries
import React, {ReactNode} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  StatusBarStyle,
} from 'react-native';
import colors from '../../styles/colors';
import { RFPercentage } from 'react-native-responsive-fontsize';

// define prop types
interface WrapperContainerProps {
  statusBarColor?: string;
  barStyle?: StatusBarStyle;
  containerStyle?: object;
  children: ReactNode;
}

// create a component
const WrapperContainer: React.FC<WrapperContainerProps> = ({
  statusBarColor = colors.white,
  barStyle = 'dark-content',
  containerStyle = {},
  children,
}: WrapperContainerProps) => {
  return (
    <View style={{...styles.container, ...containerStyle}}>
      <StatusBar backgroundColor={statusBarColor} barStyle={barStyle} />
      <SafeAreaView style={{flex: 1}}>{children}</SafeAreaView>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    marginTop: RFPercentage(3),
    paddingHorizontal: RFPercentage(2),
    paddingTop: RFPercentage(1),
  },
});

// make this component available to the app
export default WrapperContainer;

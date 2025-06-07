/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, StyleProp, ViewStyle} from 'react-native';

export interface BadgeIconProps {
  width: number;
  top: number;
  right: number;
  msg: string;
  style?: StyleProp<ViewStyle>;
}

const BadgeIcon: React.FC<BadgeIconProps> = ({
  width,
  top,
  right,
  msg,
  style,
}) => {
  return (
    <View
      style={[
        {
          position: 'absolute',
          justifyContent: 'center',
          alignItems: 'center',
          alignContent: 'center',
          backgroundColor: 'blue',
          borderRadius: 50,
        },
        {width, top, right},
        style,
      ]}>
      <Text style={{color: 'white', fontSize: 10}}>{msg}</Text>
    </View>
  );
};

export default BadgeIcon;

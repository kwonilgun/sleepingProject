// import libraries
import React, {FunctionComponent} from 'react';
import {View, ViewStyle, StyleSheet} from 'react-native';
import colors from '../../styles/colors';

// define props interface
interface HorizontalLineProps {
  lineStyle?: ViewStyle;
}

// create a component
const HorizontalLine: FunctionComponent<HorizontalLineProps> = ({
  lineStyle = {},
}) => {
  return <View style={{...styles.lineStyle, ...lineStyle}} />;
};

// define styles
const styles = StyleSheet.create({
  lineStyle: {
    borderBottomWidth: 0.6,
    borderBottomColor: colors.grey,
    height: 1,
  },
});

// make this component available to the app
export default HorizontalLine;

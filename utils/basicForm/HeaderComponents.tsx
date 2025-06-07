//import liraries
import React, {ReactNode, FC} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StyleProp,
  ViewStyle,
  ImageSourcePropType,
  TextStyle,
} from 'react-native';
import strings from '../../constants/lang';
import colors from '../../styles/colors';
import fontFamily from '../../styles/fontFamily';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {height} from '../../styles/responsiveSize';

// Define types for props
interface HeaderComponentProps {
  centerText?: string;
  rightText?: string;
  leftCustomView?: () => ReactNode;
  isLeftView?: boolean;
  rightCustomView?: () => ReactNode;
  isRightView?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  rightTextStyle?: StyleProp<TextStyle>;
  onPressRight?: () => void;
  isRight?: boolean;
  rightPressActive?: boolean;
  rightImg?: ImageSourcePropType;
  isCenterView?: boolean;
  centerCustomView?: () => ReactNode;
}

//create a component
const HeaderComponent: FC<HeaderComponentProps> = ({
  centerText = '',
  rightText = strings.DONE,
  leftCustomView = () => null,
  isLeftView = false,
  containerStyle = {},
  rightTextStyle = {},
  onPressRight = () => {},
  isRightView = false,
  rightCustomView = () => null,
  isRight = true,
  rightPressActive = true,
  rightImg,
  isCenterView = false,
  centerCustomView = () => null,
}) => {
  return (
    <View
      style={{
        ...styles.container,
      }}>
      {isLeftView ? (
        leftCustomView()
      ) : (
        <Text style={styles.centerTextStyle}>{''}</Text>
      )}

      {isCenterView ? (
        centerCustomView()
      ) : (
        <Text style={styles.centerTextStyle}>{centerText}</Text>
      )}

      {isRightView ? (
        rightCustomView()
      ) : (
        <>
          {isRight ? (
            <TouchableOpacity
              disabled={rightPressActive}
              onPress={onPressRight}>
              {rightImg ? (
                <Image source={rightImg as ImageSourcePropType} />
              ) : (
                <>
                  <Text style={rightTextStyle}>{rightText}</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </>
      )}
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: RFPercentage(6.5),
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderColor: 'black',
    paddingHorizontal: height * 0.02,
    // paddingVertical: height * 0.008,
  },
  centerTextStyle: {
    color: 'black',
    fontFamily: fontFamily.bold,
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
  },
  rightTextStyle: {
    color: colors.grey,
    fontFamily: fontFamily.regular,
    fontSize: RFPercentage(2.0),
    fontWeight: 'bold',
  },
});

//make this component available to the app
export default HeaderComponent;

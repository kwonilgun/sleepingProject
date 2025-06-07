/* eslint-disable react-native/no-inline-styles */
// Import libraries
import React from 'react';
import {
  ViewStyle,
  TextStyle,
  ImageStyle,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import colors from '../../styles/colors';
import fontFamily from '../../styles/fontFamily';
// import { moderateScale, textScale } from '../../styles/responsiveSize';
import {moderateScale, textScale} from '../../styles/responsiveSize';

// Define prop types for the component
interface RoundImageProps {
  image?: string; // Image URL or local static image path
  size?: number; // Size of the image (width and height)
  onPress?: (event: GestureResponderEvent) => void; // Function to handle press events
  isStatic?: boolean; // Flag to indicate if the image is static
  imageStyle?: ViewStyle | TextStyle | ImageStyle; // Additional styles for the image
}

// Create the component
const RoundImage: React.FC<RoundImageProps> = ({
  image = '',
  size = 80,
  onPress = () => {},
  isStatic = false,
  imageStyle,
}) => {
  const compImg = isStatic ? image : {uri: image};

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        height: moderateScale(size),
        width: moderateScale(size),
        borderRadius: moderateScale(size / 2),
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.grey,
        ...imageStyle,
      }}>
      {image ? (
        <Image
          style={{
            height: moderateScale(size),
            width: moderateScale(size),
            borderRadius: moderateScale(size / 2),
          }}
          source={compImg as any} // "as any" is used to accommodate both string and { uri: string }
        />
      ) : (
        <Text style={styles.textStyle}>add photo</Text>
      )}
    </TouchableOpacity>
  );
};

// Define styles
const styles = StyleSheet.create({
  textStyle: {
    fontSize: textScale(12),
    fontFamily: fontFamily.blackFont,
    color: colors.lightBlue,
  },
});

// Export the component
export default RoundImage;

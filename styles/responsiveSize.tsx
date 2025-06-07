import {Dimensions, Platform, StatusBar} from 'react-native';
import {width, height} from '../assets/common/BaseValue';

interface ScaleFunctions {
  scale(size: number): number;
  verticalScale(size: number): number;
  moderateScale(size: number, factor?: number): number;
  moderateScaleVertical(size: number, factor?: number): number;
  textScale(percent: number): number;
}

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale: ScaleFunctions['scale'] = size =>
  (width / guidelineBaseWidth) * size;
const verticalScale: ScaleFunctions['verticalScale'] = size =>
  (height / guidelineBaseHeight) * size;
const moderateScale: ScaleFunctions['moderateScale'] = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;
const moderateScaleVertical: ScaleFunctions['moderateScaleVertical'] = (
  size,
  factor = 0.5,
) => size + (verticalScale(size) - size) * factor;
const textScale: ScaleFunctions['textScale'] = percent => {
  const screenHeight = Dimensions.get('window').height;
  // calculate absolute ratio for bigger screens 18.5:9 requiring smaller scaling
  const ratio =
    Dimensions.get('window').height / Dimensions.get('window').width;
  // Guideline sizes are based on a standard ~5″ screen mobile device
  const deviceHeight = 375
    ? screenHeight * (ratio > 1.8 ? 0.126 : 0.15) // Set guideline depending on absolute ratio
    : Platform.OS === 'android'
    ? screenHeight - StatusBar.currentHeight!
    : screenHeight;

  const heightPercent = (percent * deviceHeight) / 100;
  return Math.round(heightPercent);
};

export {
  scale,
  verticalScale,
  textScale,
  moderateScale,
  moderateScaleVertical,
  width,
  height,
};

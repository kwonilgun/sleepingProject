import React from 'react';
import {View, StyleSheet} from 'react-native';

const Divider = () => {
  return <View style={styles.divider} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1, // Divider의 높이 조절
    backgroundColor: 'black', // Divider의 색상 설정
    marginVertical: 10, // 필요에 따라 상하 여백 조절
  },
});

export default Divider;

import React from 'react';
import {Text, View, StyleSheet} from 'react-native';

export function badgeStyle(buttonName: string, width: number) {
  return (
    <View style={[styles.badge, {width: width}]}>
      <Text style={styles.text}>{buttonName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    marginTop: 8,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#63b3ed', // blue.300 색상 코드
    backgroundColor: '#2a4365', // darkBlue 색상 코드
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  text: {
    fontWeight: 'bold',
    color: '#fff', // 텍스트 색상을 흰색으로 설정
  },
});

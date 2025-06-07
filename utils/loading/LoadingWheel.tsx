import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export const LoadingWheel = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00ffff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingWheel;

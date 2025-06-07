import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {width} from '../../assets/common/BaseValue';

export function TouchButton(name: string, actionFt: () => void) {
  return (
    <View>
      <TouchableOpacity onPress={() => actionFt()} style={styles.roundedButton}>
        <Text style={styles.buttonText}>{name}</Text>
      </TouchableOpacity>
    </View>
  );
}

export const styles = StyleSheet.create({
  buttonText: {
    color: 'white', // Set the text color as needed
    textAlign: 'center',
    padding: 10,
  },
  roundedButton: {
    width: 'auto',
    borderRadius: 10, // Adjust the value based on your preference
    overflow: 'hidden', // Ensures the border radius is applied
    backgroundColor: 'lightseagreen', // Set the background color as needed
  },
});

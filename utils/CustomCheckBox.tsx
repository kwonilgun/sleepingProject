import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';

interface CustomCheckBoxProps {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
}

const CustomCheckBox: React.FC<CustomCheckBoxProps> = ({ value, onValueChange }) => {
  return (
    <TouchableOpacity
      style={[styles.checkboxBase, value && styles.checkboxChecked]}
      onPress={() => onValueChange(!value)}
    >
      {value && <View style={styles.checkmark} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxBase: {
    width: RFPercentage(3),
    height: RFPercentage(3),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'grey',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  checkmark: {
    width: RFPercentage(1.5),
    height: RFPercentage(0.8),
    borderColor: 'white',
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '-45deg' }],
    marginBottom: RFPercentage(0.4),
  },
});

export default CustomCheckBox;
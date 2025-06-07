import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

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
      {value && <View style={styles.checkboxInner} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxBase: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
});

export default CustomCheckBox;
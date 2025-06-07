import React, {FC} from 'react';
import {Text, StyleSheet} from 'react-native'; // Make sure to replace 'your-text-library' with the actual library you are using for Text component
// import {styles} from '../TestExam/ZodLogin/LoginScreen';
interface ErrorProps {
  message: string;
}

const ErrorText: FC<ErrorProps> = props => {
  return <Text style={styles.errorMessage}>{props.message}</Text>;
};

const styles = StyleSheet.create({
  errorMessage: {
    color: 'red',
    marginTop: 0,
    marginBottom: 5,
  },
});
export default ErrorText;

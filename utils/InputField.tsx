import React from 'react';
import {Controller} from 'react-hook-form';
import {
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  Platform,
} from 'react-native';
import GlobalStyles from '../styles/GlobalStyles';

interface InputFieldProps {
  control: any; // You can replace 'any' with the appropriate type for your control
  rules: {
    required?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: RegExp;
  };
  name: string;
  placeholder: string;
  keyboard: KeyboardTypeOptions;
  isEditable?: boolean;
  isPassword?: boolean;
  defaultValue?: string;
  multiline?: boolean; // 추가: multiline 지원
  numberOfLines?: number; // 추가: numberOfLines 지원
}

const InputField = ({
  control,
  rules,
  name,
  placeholder,
  keyboard,
  isEditable = true,
  isPassword = false,
  multiline = false, // 기본값 설정
  numberOfLines = 1, // 기본값 설정
}: InputFieldProps) => {
  return (
    <>
      <Controller
        control={control}
        rules={rules}
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            style={[
              GlobalStyles.textInputField,
              multiline && styles.multilineInput, // 멀티라인 스타일 추가
            ]}
            placeholder={placeholder}
            placeholderTextColor={'grey'}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType={keyboard}
            editable={isEditable}
            secureTextEntry={isPassword}
            multiline={multiline} // 멀티라인 활성화
            numberOfLines={numberOfLines} // 줄 수 지정
          />
        )}
        name={name}
      />
    </>
  );
};

const styles = StyleSheet.create({
  multilineInput: {
    textAlignVertical: 'top', // 텍스트의 수직 정렬을 상단으로
    paddingVertical: 10, // 위아래 패딩 추가
  },
});

export default InputField;

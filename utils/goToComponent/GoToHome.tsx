import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
// import {styles} from './CartScreen';
import {width} from '../../assets/common/BaseValue';

export const GoToHome: React.FC<any> = props => {
  const gotoHomeMenu = () => {
    props.navigation.navigate('home', {screen: 'ProductsScreen'});
  };
  return (
    <View style={styles.container}>
      <Text style={styles.textLogin}>{props.name}</Text>

      <View style={styles.button}>
        <TouchableOpacity
          onPress={() => gotoHomeMenu()}
          style={styles.roundedButton}>
          <Text style={styles.buttonText}>상품 선택</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const GoToLogin: React.FC<any> = props => {
  const gotoLoginMenu = () => {
    props.navigation.navigate('UserMain', {screen: 'LoginScreen'});
  };
  return (
    <View style={styles.containerLogin}>
      <Text style={styles.textLogin}>로그인이 필요합니다. </Text>

      <View style={styles.button}>
        <TouchableOpacity
          onPress={() => gotoLoginMenu()}
          style={styles.roundedButton}>
          <Text style={styles.buttonText}>로그인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const GoToShipAddress: React.FC<any> = props => {
  const gotoShipAddress = () => {
    props.navigation.navigate('Shipping', {screen: 'ShippingScreen'});
  };
  return (
    <View style={styles.containerLogin}>
      <Text style={styles.textLogin}>배송주소가 필요합니다. </Text>

      <View style={styles.button}>
        <TouchableOpacity
          onPress={() => gotoShipAddress()}
          style={styles.roundedButton}>
          <Text style={styles.buttonText}>배송 주소</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: StatusBar.currentHeight,
    justifyContent: 'center', // 수직 방향으로 중앙 정렬
    alignItems: 'center', // 수평 방향으로 중앙 정렬
  },
  containerLogin: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    justifyContent: 'center', // 수직 방향으로 중앙 정렬
    alignItems: 'center', // 수평 방향으로 중앙 정렬
  },
  textLogin: {
    margin: 20,
  },
  button: {
    // Add specific button styles here
    flex: 1,
    height: width * 0.1,
    alignItems: 'flex-end',
    marginRight: 10,
  },
  buttonText: {
    color: 'white', // Set the text color as needed
    textAlign: 'center',
    padding: 10,
  },
  roundedButton: {
    borderRadius: 10, // Adjust the value based on your preference
    overflow: 'hidden', // Ensures the border radius is applied
    backgroundColor: 'lightseagreen', // Set the background color as needed
  },
});

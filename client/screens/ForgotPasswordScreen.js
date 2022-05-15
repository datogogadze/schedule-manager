import React from 'react';
import {
  View,
  Text,
  StyleSheet
} from 'react-native';

const logo = require('../assets/logo.png');

const ForgotPasswordScreen = ({ navigation }) => {
  console.log(navigation);
  console.log(logo);
  return (
    <View style={styles.container}>
      <Text>This is ForgotPasswordScreen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ForgotPasswordScreen;

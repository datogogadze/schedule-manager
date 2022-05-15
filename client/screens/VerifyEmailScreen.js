import React from 'react';
import {
  View,
  Text,
  StyleSheet
} from 'react-native';

const logo = require('../assets/logo.png');

const VerifyEmailScreen = ({ navigation }) => {
  console.log(navigation);
  console.log(logo);
  return (
    <View style={styles.container}>
      <Text>This is VerifyEmailScreen</Text>
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

export default VerifyEmailScreen;

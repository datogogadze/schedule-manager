import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <Text
        onPress={async () => {
          // if (Constants.platform.ios) {
          //   await WebBrowser.openAuthSessionAsync(
          //     'http://192.168.1.106:3000/auth/google'
          //   );
          //   // WebBrowser.dismissBrowser();
          // } else {
          //   await WebBrowser.openBrowserAsync(
          //     'http://192.168.1.106:3000/auth/google'
          //   );
          // }
          Linking.openURL('http://192.168.1.106:3000/auth/google');
        }}
      >
        Log In With Google
      </Text>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

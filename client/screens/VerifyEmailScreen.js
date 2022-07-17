import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

import { Button, Text } from '@ui-kitten/components';

import Toast from 'react-native-toast-message';
import { resendConfirmationMail } from '../utils/api-calls';

import Header from '../components/Header';

const VerifyEmailScreen = ({ navigation, route }) => {
  const [loading, setLoading] = React.useState(false);
  const email = route.params.email;
  const handleSubmit = () => {
    setLoading(true);

    resendConfirmationMail(email)
      .then((res) => {
        setLoading(false);
        const { success, message } = res.data;
        const type = success ? 'success' : 'error';
        const text1 = success ? 'Success' : 'Error';

        Toast.show({
          type,
          text1,
          text2: message,
        });
      })
      .catch((e) => {
        setLoading(false);
        const { message } = e.response.data;

        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: message,
        });
      });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Header text="Verify Email" />
        <Text category="h6">
          We sent you verification mail. Please check your inbox
        </Text>

        <Button
          size="large"
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          Resend Verification Mail
        </Button>

        <Button
          size="small"
          appearance="ghost"
          status="primary"
          onPress={() => navigation.navigate('Login')}
        >
          Go to login page
        </Button>
        <Toast />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 30,
  },
  safe: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  header: {
    marginBottom: 30,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
  },
  logo: {
    width: 140,
    resizeMode: 'contain',
  },
  textInput: {
    marginBottom: 20,
  },
  button: {
    marginTop: 40,
    marginBottom: 10,
  },
});

export default VerifyEmailScreen;

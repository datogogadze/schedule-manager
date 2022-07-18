import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

import {
  Input,
  Button,
} from '@ui-kitten/components';

import Toast from 'react-native-toast-message';
import { sendResetPasswordMail } from '../utils/api-calls';

import Header from '../components/Header';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);


  const handleSubmit = () => {
    setLoading(true);

    sendResetPasswordMail(email).then((res) => {
      setLoading(false);
      const { success, message} = res.data;
      const type = success ? 'success' : 'error';
      const text1 = success ? 'წარმატება' : 'შეცდომა';

      Toast.show({
        type,
        text1,
        text2: message,
      });
    }).catch((e) => {
      setLoading(false);
      const { message } = e.response.data;

      Toast.show({
        type: 'error',
        text1: 'შეცდომა',
        text2: message,
      });
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Header text="პაროლის აღდგენა" />
        <Input
          value={email}
          label="მეილი"
          placeholder="მეილი"
          status='basic'
          onChangeText={setEmail}
          keyboardType='email-address'
          style={styles.textInput}
          size="large"
        />
        <Button
          size="large"
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          აღდგენის მეილის გაგზავნა
        </Button>

        <Button size="small" appearance="ghost" status="primary" onPress={() => navigation.navigate('Login')}>
          ავტორიზაციის გვერდზე გადასვლა
        </Button>
        <Toast/>
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
  }
});

export default ForgotPasswordScreen;

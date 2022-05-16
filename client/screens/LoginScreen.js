import React, { useRef, useEffect } from 'react';
import {
  TouchableWithoutFeedback,
  StyleSheet,
  View,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Text, Icon, Input, Button } from '@ui-kitten/components';
import * as Linking from 'expo-linking';

import OverlaySpinner from '../components/OverlaySpinner';
import { Formik } from 'formik';
import { LoginSchema } from '../utils/formik-schemas';
import { login } from '../utils/api-calls';

// eslint-disable-next-line import/no-unresolved
import { SERVER_ADDRESS } from '@env';

const logo = require('../assets/logo.png');

const LoginScreen = ({ navigation }) => {
  const [secureTextEntry, setSecureTextEntry] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const refPasswordInput = useRef();

  const handleDeepLink = async (event) => {
    let data = Linking.parse(event.url);
    let id = data.queryParams.id;
    navigation.navigate('Home', {
      id,
    });
  };

  useEffect(() => {
    Linking.addEventListener('url', handleDeepLink);
  }, []);

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const renderIcon = (props) => (
    <TouchableWithoutFeedback onPress={toggleSecureEntry}>
      <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );

  const handleLogin = (values) => {
    const {
      email,
      password
    } = values;

    setLoading(true);

    login(email, password).then((res) => {
      setLoading(false);

      const { success, message, id } = res.data;
      if (success) {
        navigation.navigate('Home', {
          id,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Whoops',
          text2: message,
        });
      }
    }).catch((e) => {
      setLoading(false);
      const { message } = e.response.data;

      console.log(e.response);

      Toast.show({
        type: 'error',
        text1: 'Whoops',
        text2: message,
      });
    });
  };

  const handleGoogleLogin = async () => {
    Linking.openURL(`${SERVER_ADDRESS}/auth/google`);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior='position'
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={styles.imageContainer}>
          <Image style={styles.logo} source={logo} />
        </View>

        <Text style={styles.header} category="h1">
          Log In
        </Text>

        <Formik
          initialValues={{
            email: '',
            password: '',
          }}
          validationSchema={LoginSchema}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={values => {
            handleLogin(values);
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors}) => (
            <>
              <Input
                value={values.email}
                label="Email"
                placeholder="Email"
                status={errors.email ? 'danger' : 'basic'}
                caption={errors.email || ' '}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                keyboardType='email-address'
                style={styles.textInput}
                onSubmitEditing={() => refPasswordInput.current.focus()}
                size="large"
              />

              <Input
                value={values.password}
                label="Password"
                placeholder="Password"
                status={errors.password ? 'danger' : 'basic'}
                caption={errors.password || ' '}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                accessoryRight={renderIcon}
                style={styles.textInput}
                ref={refPasswordInput}
                secureTextEntry={secureTextEntry}
                size="large"
              />

              <Button
                size="small"
                appearance="ghost"
                status="primary"
                onPress={() => navigation.navigate('SignUp')}
              >
                Don't have an account? Sign up here.
              </Button>
            
              <Button
                size="small"
                appearance="ghost"
                status="primary"
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotPassowordButton}
              >
                Forgot Password? Click here.
              </Button>

              <Button
                size="large"
                style={styles.loginButton}
                onPress={handleSubmit}
                disabled={loading}
              >
                Log In
              </Button>
            </>
          )}
        </Formik>
      </KeyboardAvoidingView>

      <Button
        size="large"
        status="basic"
        onPress={handleGoogleLogin}
        disabled={loading}
        accessoryLeft={
          <Icon style={styles.icon} fill="#8F9BB3" name="google-outline" />
        }
      >
        Log In With Google
      </Button>

      <Toast />

      <OverlaySpinner visible={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 30,
  },
  captionContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  captionIcon: {
    width: 10,
    height: 10,
    marginRight: 5,
  },
  captionText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'opensans-regular',
    color: '#8F9BB3',
  },
  textInput: {
    marginBottom: 20,
  },
  forgotPassowordButton: {
    marginTop: 10
  },
  loginButton: {
    marginTop: 40,
    marginBottom: 10,
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
});

export default LoginScreen;

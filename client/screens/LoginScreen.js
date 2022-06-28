import React, { useRef, useEffect } from 'react';
import {
  TouchableWithoutFeedback,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Icon, Input, Button } from '@ui-kitten/components';

import OverlaySpinner from '../components/OverlaySpinner';
import Header from '../components/Header';

import { Formik } from 'formik';
import { LoginSchema } from '../utils/formik-schemas';
import { basicLogin, getUserData, oAuthLogin } from '../utils/api-calls';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
// eslint-disable-next-line import/no-unresolved
import { GOOGLE_CLIENT_ID } from '@env';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      getUserData(authentication.accessToken)
        .then((result) => {
          setLoading(true);
          const profile = { external_type: 'google', ...result.data };
          oAuthLogin(profile)
            .then((res) => {
              setLoading(false);
              const { success, message, id } = res.data;
              if (success) {
                navigation.navigate('Boards', {
                  id,
                });
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Whoops',
                  text2: 'Login error',
                });
              }
            })
            .catch((e) => {
              console.log(e);
              setLoading(false);
              Toast.show({
                type: 'error',
                text1: 'Whoops',
                text2: 'Login error',
              });
            });
        })
        .catch((e) => {
          console.log(e);
          setLoading(false);
          Toast.show({
            type: 'error',
            text1: 'Whoops',
            text2: 'Login error',
          });
        });
    } else {
      setLoading(false);
      if (response) {
        Toast.show({
          type: 'error',
          text1: 'Whoops',
          text2: 'Login error',
        });
      }
    }
  }, [response]);

  const [secureTextEntry, setSecureTextEntry] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const refPasswordInput = useRef();
  const refForm = useRef();

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const renderIcon = (props) => (
    <TouchableWithoutFeedback onPress={toggleSecureEntry}>
      <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );

  const handleSubmit = () => {
    if (refForm.current) {
      refForm.current.handleSubmit();
    }
  };

  const handleLogin = (values) => {
    const { email, password } = values;

    setLoading(true);

    basicLogin(email, password)
      .then((res) => {
        setLoading(false);

        const { success, message, id } = res.data;
        if (success) {
          navigation.navigate('Boards', {
            id,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Whoops',
            text2: message,
          });
        }
      })
      .catch((e) => {
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior="position"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <Header text="Log In" />
          <Formik
            innerRef={refForm}
            initialValues={{
              email: '',
              password: '',
            }}
            validationSchema={LoginSchema}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={(values) => {
              handleLogin(values);
            }}
          >
            {({ handleChange, handleBlur, values, errors }) => (
              <>
                <Input
                  value={values.email}
                  label="Email"
                  placeholder="Email"
                  status={errors.email ? 'danger' : 'basic'}
                  caption={errors.email || ' '}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  style={styles.textInput}
                  onSubmitEditing={() => refPasswordInput.current.focus()}
                  autoCapitalize="none"
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
              </>
            )}
          </Formik>
        </KeyboardAvoidingView>

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

        <Button
          size="large"
          status="basic"
          style={styles.googleLoginButton}
          disabled={!request}
          accessoryLeft={
            <Icon style={styles.icon} fill="#8F9BB3" name="google-outline" />
          }
          onPress={() => {
            promptAsync();
          }}
        >
          Log In With Google
        </Button>

        <Button
          size="large"
          appearance="outline"
          onPress={() => navigation.navigate('SignUp')}
          disabled={loading}
        >
          Sign Up
        </Button>

        <Toast />

        <OverlaySpinner visible={loading} />
      </View>
    </TouchableWithoutFeedback>
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
    marginBottom: 10,
  },
  forgotPassowordButton: {
    marginTop: -20,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  loginButton: {
    marginTop: '35%',
    marginBottom: 10,
  },
  googleLoginButton: {
    marginBottom: 10,
  },
});

export default LoginScreen;

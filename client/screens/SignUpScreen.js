import React, { useRef } from 'react';
import {
  StyleSheet, View, Image,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import {
  Text, Input, Button,
} from '@ui-kitten/components';
import { Formik } from 'formik';
import Toast from 'react-native-toast-message';

import { SignupSchema } from '../utils/formik-schemas';
import OverlaySpinner from '../components/OverlaySpinner';
import { signUp } from '../utils/api-calls';


const logo = require('../assets/logo.png');

const SignUpScreen = ({ navigation }) => {
  const [loading, setLoading] = React.useState(false);

  const refs = {
    email: useRef(),
    firstName: useRef(),
    lastName: useRef(),
    password: useRef(),
    confirmPassword: useRef(),
    submitButton: useRef()
  };

  const handleSignUp = (values) => {
    const {
      email,
      firstName,
      lastName,
      password,
      confirmPassword
    } = values;

    setLoading(true);

    signUp(
      email,
      firstName,
      lastName,
      password,
      confirmPassword 
    ).then((res) => {
      setLoading(false);

      const { success, message, id } = res.data;

      if (success) {
        navigation.navigate('VerifyEmail', {
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

      Toast.show({
        type: 'error',
        text1: 'Whoops',
        text2: message,
      });
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image style={styles.logo} source={logo} />
      </View>

      <Text style={styles.header} category="h1">Sign Up</Text>

      <KeyboardAwareScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Formik
          initialValues={{
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={SignupSchema}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={values => {
            handleSignUp(values);
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
                style={styles.textInput}
                onSubmitEditing={() => refs.firstName.current.focus()}
                keyboardType="email-address"
                size="large"
              />

              <Input
                value={values.firstName}
                label="First Name"
                placeholder="First Name"
                status={errors.firstName ? 'danger' : 'basic'}
                caption={errors.firstName || ' '}
                onChangeText={handleChange('firstName')}
                onBlur={handleBlur('firstName')}
                style={styles.textInput}
                onSubmitEditing={() => refs.lastName.current.focus()}
                size="large"
                ref={refs.firstName}
              />

              <Input
                value={values.lastName}
                label="Last Name"
                placeholder="Last Name"
                status={errors.lastName ? 'danger' : 'basic'}
                caption={errors.lastName || ' '}
                onChangeText={handleChange('lastName')}
                onBlur={handleBlur('lastName')}
                style={styles.textInput}
                onSubmitEditing={() => refs.password.current.focus()}
                size="large"
                ref={refs.lastName}
              />

              <Input
                value={values.password}
                label="Password"
                placeholder="Password"
                status={errors.password ? 'danger' : 'basic'}
                caption={errors.password || ' '}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                style={styles.textInput}
                onSubmitEditing={() => refs.confirmPassword.current.focus()}
                size="large"
                secureTextEntry
                ref={refs.password}
              />

              <Input
                value={values.confirmPassword}
                label="Confirm Password"
                placeholder="Confirm Password"
                status={errors.confirmPassword ? 'danger' : 'basic'}
                caption={errors.confirmPassword || ' '}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                style={styles.textInput}
                ref={refs.confirmPassword}
                size="large"
                secureTextEntry
              />

              <Button size="small" appearance="ghost" status="primary" onPress={() => navigation.navigate('Login')}>
                Already have an account? Log In here.
              </Button>

              <Button size="large" style={styles.loginButton} onPress={handleSubmit}>
                Sign Up
              </Button>
            </>
          )}
          
        </Formik>
        
      </KeyboardAwareScrollView>

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
  loginButton: {
    marginTop: 70,
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
  scrollView: {
    marginBottom: 140,
  },
});

export default SignUpScreen;

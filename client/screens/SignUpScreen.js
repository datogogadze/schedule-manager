import React, { useRef, useEffect } from 'react';
import { TouchableWithoutFeedback, StyleSheet, View, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Icon, Input, Button } from '@ui-kitten/components';
import * as Linking from 'expo-linking';

import { validateEmail, validatePassword } from '../utils/formValidators'


const logo = require('../assets/logo.png');

export default Screen = ({ navigation }) => {

  const [emailInput, setEmailInput] = React.useState({ value: '', errorMessage: '' });
  const [passwordInput, setPasswordInput] = React.useState({ value: '', errorMessage: '' });
  const [confirmPasswordInput, setConfirmPasswordInput] = React.useState({ value: '', errorMessage: '' });


  const refPasswordInput = useRef();
  const refConfimPasswordInput = useRef();

  const handleSignUp = () => {
    const emailValidation = validateEmail(emailInput.value);
    const passwordValidation = validatePassword(passwordInput.value);
  
    let formValid = true;

    if (emailValidation.valid) {
      setEmailInput({
        ...emailInput,
        errorMessage: ''
      })
    } else {
      formValid = false
      setEmailInput({
        ...emailInput,
        errorMessage: emailValidation.message
      })
    }

    if (passwordValidation.valid) {
      setPasswordInput({
        ...passwordInput,
        errorMessage: ''
      })
    } else {
      formValid = false
      setPasswordInput({
        ...passwordInput,
        errorMessage: passwordValidation.message
      })
    }

    if (formValid) {
      navigation.navigate('Home')
    }
  }


  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior='position'
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={styles.imageContainer}>
            <Image style={styles.logo} source={logo} />
        </View>

        <Text style={styles.header} category='h1'>Sign Up</Text>
      
        <Input
          value={emailInput.value}
          label='Email'
          placeholder='Email'
          status={ emailInput.errorMessage ? 'danger' : 'basic' }
          caption={emailInput.errorMessage || ' '}
          onChangeText={nextValue => setEmailInput({ ...emailInput, value: nextValue })}
          style={styles.textInput} 
          onSubmitEditing={() => refPasswordInput.current.focus()}
          size='large'
        />

        <Input
          value={passwordInput.value}
          label='Password'
          placeholder='Password'
          status={ passwordInput.errorMessage ? 'danger' : 'basic' }
          caption={passwordInput.errorMessage || 'Should contain at least 8 symbols'}
          secureTextEntry
          onChangeText={nextValue => setPasswordInput({ ...passwordInput, value: nextValue })}
          style={styles.textInput}
          ref={refPasswordInput}
          onSubmitEditing={() => refConfimPasswordInput.current.focus()}
          size='large'
        />

        <Input
          value={confirmPasswordInput.value}
          label='Confirm Password'
          placeholder='Confirm Password'
          status={ confirmPasswordInput.errorMessage ? 'danger' : 'basic' }
          caption={confirmPasswordInput.errorMessage || 'Please confirm the password'}
          secureTextEntry
          onChangeText={nextValue => setConfirmPasswordInput({ ...confirmPasswordInput, value: nextValue })}
          style={styles.textInput}
          ref={refConfimPasswordInput}
          size='large'
        />
      </KeyboardAvoidingView>

      <Button size='small' appearance='ghost' status='primary' onPress={() => navigation.navigate('Login') }>
        Already have an account? Log In here.
      </Button>
      
      <Button size='large' style={styles.loginButton} onPress={handleSignUp}>
        Sign Up
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 30
  },
  captionContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  captionIcon: {
    width: 10,
    height: 10,
    marginRight: 5
  },
  captionText: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "opensans-regular",
    color: "#8F9BB3",
  },
  textInput: {
    marginBottom: 20,
  },
  loginButton: {
    marginTop: 70,
    marginBottom: 10,
  },
  header: {
    marginBottom: 30
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 80
  },
  logo: {
    width: 140,
    resizeMode: 'contain'
  }
});

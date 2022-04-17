import React, { useRef, useEffect } from 'react';
import { TouchableWithoutFeedback, StyleSheet, View, Image } from 'react-native';
import { Text, Icon, Input, Button } from '@ui-kitten/components';
import * as Linking from 'expo-linking';


const logo = require('../assets/logo.png');

const AlertIcon = (props) => (
  <Icon {...props} name='alert-circle-outline'/>
);

export default LoginScreen = ({ navigation }) => {

  const [emailValue, setEmailValue] = React.useState('');
  const [passwordValue, setPasswordValue] = React.useState('');
  const [secureTextEntry, setSecureTextEntry] = React.useState(true);

  const refPasswordInput = useRef();

  handleDeepLink = async (event) => {
    let data = Linking.parse(event.url);
    let id = data.queryParams.id;
    console.log('id', id);
  }

  useEffect(() => {
    Linking.addEventListener('url', handleDeepLink);
  }, []);

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const renderIcon = (props) => (
    <TouchableWithoutFeedback onPress={toggleSecureEntry}>
      <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'}/>
    </TouchableWithoutFeedback>
  );

  const renderCaption = (text = '') => {
    return (
      <View style={styles.captionContainer}>
        {AlertIcon(styles.captionIcon)}
        <Text style={styles.captionText}>{text}</Text>
      </View>
    )
  }

  const handleLogin = () => {
    navigation.navigate('Home')
  }

  const handleGoogleLogin = async () => {
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
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
          <Image style={styles.logo} source={logo} />
      </View>

      <Text style={styles.header} category='h1'>Log In</Text>
      
      <Input
        value={emailValue}
        label='Email'
        placeholder='Email'
        onChangeText={nextValue => setEmailValue(nextValue)}
        style={styles.textInput} 
        onSubmitEditing={() => refPasswordInput.current.focus()}
        size='large'
      />

      <Input
        value={passwordValue}
        label='Password'
        placeholder='Password'
        caption={() => renderCaption('Should contain at least 8 symbols')}
        accessoryRight={renderIcon}
        secureTextEntry={secureTextEntry}
        onChangeText={nextValue => setPasswordValue(nextValue)}
        style={styles.textInput}
        ref={refPasswordInput}
        size='large'
      />

      <Button size='small' appearance='ghost' status='primary'>
        Don't have an account? Sign up here.
      </Button>
      
      <Button size='large' style={styles.loginButton} onPress={handleLogin}>
        Log In
      </Button>

      <Button
        size='large'
        status='basic'
        onPress={handleGoogleLogin}
        accessoryLeft={
          <Icon
            style={styles.icon}
            fill='#8F9BB3'
            name='google-outline'
          />
        }
      >
        Log In With Google
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

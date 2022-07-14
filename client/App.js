import React, { useEffect, useState } from 'react';
import * as eva from '@eva-design/eva';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';

import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import MainScreen from './screens/MainScreen';
import VerifyEmailScreen from './screens/VerifyEmailScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import BoardsScreen from './screens/BoardsScreen';
import SelectedBoardScreen from './screens/SelectedBoardScreen';
import { checkLogin } from './utils/api-calls';
import { setUser } from './utils/auth';
import ProfileScreen from './screens/ProfileScreen';

const prefix = Linking.createURL('/');

const Stack = createStackNavigator();

const linking = {
  prefixes: [prefix],
  config: {
    screens: {
      Login: 'login',
      Home: 'home',
    },
  },
};

const App = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [initialRouteName, setInitialRouteName] = useState('Boards');

  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while we fetch resources
        await SplashScreen.preventAutoHideAsync();
        // Artificially delay for two seconds to simulate a slow loading
        // experience. Please remove this if you copy and paste the code!
        checkLogin()
          .then(async (res) => {
            const { user } = res.data;
            console.log('User is logged in!');
            await setUser(user);
          })
          .catch((e) => {
            const { status } = e.response;

            if (status === 401) {
              setInitialRouteName('Login');
            }
          })
          .finally(() => {
            setAppIsReady(true);
          });
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  useEffect(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <>
      {/* <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      onLayout={onLayoutRootView}> */}
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <NavigationContainer linking={linking}>
          <Stack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#fff' },
              gestureEnabled: false,
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen}></Stack.Screen>
            <Stack.Screen name="SignUp" component={SignUpScreen}></Stack.Screen>
            <Stack.Screen name="Main" component={MainScreen}></Stack.Screen>
            <Stack.Screen name="Profile" component={ProfileScreen}></Stack.Screen>
            <Stack.Screen
              name="VerifyEmail"
              component={VerifyEmailScreen}
            ></Stack.Screen>
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            ></Stack.Screen>
            <Stack.Screen name="Boards" component={BoardsScreen}></Stack.Screen>
            <Stack.Screen
              name="SelectedBoard"
              component={SelectedBoardScreen}
            ></Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </ApplicationProvider>
      {/* </View> */}
    </>
  );
};

export default App;

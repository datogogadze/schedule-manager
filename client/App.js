import React from 'react';
import * as eva from '@eva-design/eva';
import * as Linking from 'expo-linking';
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

const App = () => (
  <>
    <IconRegistry icons={EvaIconsPack} />
    <ApplicationProvider {...eva} theme={eva.light}>
      <NavigationContainer linking={linking} >
        <Stack.Navigator
          initialRouteName="Boards"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#fff' },
            gestureEnabled: false,
          }}>
          <Stack.Screen name='Login' component={LoginScreen}></Stack.Screen>
          <Stack.Screen name='SignUp' component={SignUpScreen}></Stack.Screen>
          <Stack.Screen name='Main' component={MainScreen}></Stack.Screen>
          <Stack.Screen name='VerifyEmail' component={VerifyEmailScreen}></Stack.Screen>
          <Stack.Screen name='ForgotPassword' component={ForgotPasswordScreen}></Stack.Screen>
          <Stack.Screen name='Boards' component={BoardsScreen}></Stack.Screen>
          <Stack.Screen name='SelectedBoard' component={SelectedBoardScreen }></Stack.Screen>
          
        </Stack.Navigator>
      </NavigationContainer>
    </ApplicationProvider>
  </>
);

export default App;

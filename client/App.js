import React from 'react';
import * as eva from '@eva-design/eva';
import * as Linking from 'expo-linking';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';


import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';

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

export default () => (
  <>
    <IconRegistry icons={EvaIconsPack} />
    <ApplicationProvider {...eva} theme={eva.light}>
      <NavigationContainer linking={linking} >
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#fff' }
          }}>
          <Stack.Screen name='Login' component={LoginScreen}></Stack.Screen>
          <Stack.Screen name='Home' component={HomeScreen}></Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
     </ApplicationProvider>
  </>
);

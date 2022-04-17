import { StyleSheet, View, Text } from 'react-native';
import * as Linking from 'expo-linking';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';

const prefix = Linking.createURL('/');

const Stack = createStackNavigator();

export default function App() {
  const [id, setId] = useState(null);

  async function handleDeepLink(event) {
    let data = Linking.parse(event.url);
    let id = data.queryParams.id;
    setId(id);
  }

  useEffect(() => {
    Linking.addEventListener('url', handleDeepLink);
  }, []);

  const linking = {
    prefixes: [prefix],
    config: {
      screens: {
        Login: 'login',
        Home: 'home',
      },
    },
  };

  return (
    // <NavigationContainer linking={linking}>
    //   <Stack.Navigator>
    //     <Stack.Screen name='Login' component={LoginScreen}></Stack.Screen>
    //     <Stack.Screen name='Home' component={HomeScreen}></Stack.Screen>
    //   </Stack.Navigator>
    // </NavigationContainer>
    <>{id ? <HomeScreen id={id} /> : <LoginScreen />}</>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

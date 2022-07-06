import { AsyncStorage } from 'react-native';

export const setUser = async (user) => {
  const currentUser = await AsyncStorage.setItem('user', JSON.stringify(user));
  return currentUser;
};

export const getUser = async () => {
  const currentUser = JSON.parse(await AsyncStorage.getItem('user'));
  return currentUser;
};

export const removeUser = async () => {
  const currentUser = await AsyncStorage.removeItem('user');
  return currentUser;
};
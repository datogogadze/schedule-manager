import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const setDeviceToken = async (token) => {
  const currentToken = await AsyncStorage.setItem('device_token', token);
  return currentToken;
};

export const getDeviceToken = async () => {
  const currentToken = await AsyncStorage.getItem('device_token');
  return currentToken;
};

export const removeDeviceToken = async () => {
  const currentToken = await AsyncStorage.removeItem('device_token');
  return currentToken;
};

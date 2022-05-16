import axios from 'axios';
// eslint-disable-next-line import/no-unresolved
import { SERVER_ADDRESS } from '@env';

export const login = (email, password) => axios.post(`${SERVER_ADDRESS}/auth/local`, {
  email,
  password,
});

export const signUp = (
  email,
  firstName,
  lastName,
  password,
  passwordConfirmation
) => axios.post(`${SERVER_ADDRESS}/auth/register`, {
  email,
  firstName,
  lastName,
  password,
  passwordConfirmation
});

export const sendResetPasswordMail = (email) => axios.post(`${SERVER_ADDRESS}/auth/password/reset/send`, {
  email
});
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

export const resendConfirmationMail= (email) => axios.post(`${SERVER_ADDRESS}/auth/confirm/resend`, {
  email
});

export const getUserBoards = () => axios.get(`${SERVER_ADDRESS}/user/boards`);

export const createBoard = (name, role) => axios.post(`${SERVER_ADDRESS}/board`, {
  name,
  role
});

export const joinBoard = (code, role) => axios.post(`${SERVER_ADDRESS}/board/add-user`, {
  code,
  role
});

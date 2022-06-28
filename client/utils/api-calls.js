import axios from 'axios';
// eslint-disable-next-line import/no-unresolved
import { SERVER_ADDRESS, GOOGLE_API } from '@env';

export const basicLogin = (email, password) =>
  axios.post(`${SERVER_ADDRESS}/auth/basic`, {
    email,
    password,
  });

export const oAuthLogin = (profile) =>
  axios.post(`${SERVER_ADDRESS}/auth/oauth`, {
    email: profile.email,
    password: 'DUMMY_PASSWORD',
    profile,
  });

export const signUp = (
  email,
  firstName,
  lastName,
  password,
  passwordConfirmation
) =>
  axios.post(`${SERVER_ADDRESS}/auth/register`, {
    email,
    firstName,
    lastName,
    password,
    passwordConfirmation,
  });

export const sendResetPasswordMail = (email) =>
  axios.post(`${SERVER_ADDRESS}/auth/password/reset/send`, {
    email,
  });

export const resendConfirmationMail = (email) =>
  axios.post(`${SERVER_ADDRESS}/auth/confirm/resend`, {
    email,
  });

export const getUserBoards = () => axios.get(`${SERVER_ADDRESS}/user/boards`);

export const getUserData = (accessToken) =>
  axios.get(`${GOOGLE_API}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const createBoard = (name, role) =>
  axios.post(`${SERVER_ADDRESS}/board`, {
    name,
    role,
  });

export const joinBoard = (code, role) =>
  axios.post(`${SERVER_ADDRESS}/board/add-user`, {
    code,
    role,
  });

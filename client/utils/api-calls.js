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

export const checkLogin = () => axios.get(`${SERVER_ADDRESS}/user/me`);

export const logout = () => axios.get(`${SERVER_ADDRESS}/auth/logout`);

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

export const getEvents = (boardId, startDate, endDate) =>
  axios.post(`${SERVER_ADDRESS}/board/events`, {
    board_id: boardId,
    start_date: startDate,
    end_date: endDate,
  });

export const createEvent = (
  boardId,
  kidId,
  name,
  description,
  startDate,
  endDate = null,
  duration,
  frequency = null,
  interval = null,
  count = null
) => axios.post(`${SERVER_ADDRESS}/event`, {
  board_id: boardId,
  kid_id: kidId,
  name,
  description,
  start_date: startDate,
  end_date: endDate,
  duration,
  frequency,
  interval,
  count
});

export const updateEventSingle = (
  eventId,
  currentEventTimestamp,
  event,
) => axios.put(`${SERVER_ADDRESS}/event/single`, {
  event_id: eventId,
  current_event_timestamp: currentEventTimestamp,
  event
});

export const updateEventFuture = (
  eventId,
  currentEventTimestamp,
  event,
) => axios.put(`${SERVER_ADDRESS}/event/future`, {
  event_id: eventId,
  current_event_timestamp: currentEventTimestamp,
  event
});

export const updateEventAll = (
  eventId,
  currentEventTimestamp,
  event,
) => axios.put(`${SERVER_ADDRESS}/event/all`, {
  event_id: eventId,
  current_event_timestamp: currentEventTimestamp,
  event
});
